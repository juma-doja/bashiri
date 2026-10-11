"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { getChatHistory, sendChatFeedback, sendChatMessage } from "@/lib/api/chat";
import { AIHeader } from "./AIHeader";
import { MessageList, Message } from "./MessageList";
import { AIComposer } from "./AIComposer";
import { EmptyState } from "./EmptyState";
import { X } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";

export function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadedHistoryScope, setLoadedHistoryScope] = useState<string | null>(null);
  const [historyError, setHistoryError] = useState("");
  const [remaining, setRemaining] = useState<number | null>(null);
  const [sessionKey, setSessionKey] = useState<string | undefined>();
  const [lastMatchContext, setLastMatchContext] = useState<{id: number, label: string} | null>(null);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const access = useAuthStore((state) => state.access);
  const userId = useAuthStore((state) => state.user?.id);
  const sessionReady = !!access || !!sessionKey;
  const historyScope = access ? `user:${userId ?? "authenticated"}` : sessionKey ? `guest:${sessionKey}` : null;
  const historyReady = historyScope !== null && loadedHistoryScope === historyScope;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    });
  }, []);

  useEffect(() => {
    if (access) return;
    try {
      const storedSession = window.localStorage.getItem("bashiri-ai-session");
      const key = storedSession || crypto.randomUUID();
      if (!storedSession) window.localStorage.setItem("bashiri-ai-session", key);
      setSessionKey(key);
    } catch (error) {
      console.error("Could not persist the Bashiri AI guest session:", error);
      setSessionKey(crypto.randomUUID());
    }
  }, [access]);

  useEffect(() => {
    if (!historyScope) return;
    let active = true;
    getChatHistory(sessionKey)
      .then((data) => {
        if (!active) return;
        if (data.session_key && !access) {
          setSessionKey(data.session_key);
          try {
            window.localStorage.setItem("bashiri-ai-session", data.session_key);
          } catch (error) {
            console.error("Could not persist the Bashiri AI guest session:", error);
          }
        }
        setMessages(data.messages.map((message) => ({
          ...message,
          toolResult: message.tool_result,
          timestamp: new Date(message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        })));
        setRemaining(data.remaining_today);
        setHistoryError("");
      })
      .catch((error: unknown) => {
        if (active) setHistoryError(error instanceof Error ? error.message : "Historia ya mazungumzo halikupatikana.");
      })
      .finally(() => {
        if (active) setLoadedHistoryScope(historyScope);
      });
    return () => {
      active = false;
    };
  }, [access, historyScope, sessionKey]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, scrollToBottom]);

  // Keyboard detection
  useEffect(() => {
    const handleResize = () => {
      const visualHeight = window.visualViewport?.height ?? window.innerHeight;
      setIsKeyboardOpen(window.innerHeight - visualHeight > 140);
      if (messages.length > 0) {
        scrollToBottom();
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    window.visualViewport?.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      window.visualViewport?.removeEventListener("resize", handleResize);
    };
  }, [messages.length, scrollToBottom]);

  async function handleSend(messageText = input) {
    const trimmedMessage = messageText.trim();
    if (!trimmedMessage || loading || !sessionReady || !historyReady) return;
    
    const userMessage: Message = {
      role: "user",
      content: trimmedMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    if (messageText === input) setInput("");
    setLoading(true);
    
    try {
      const data = await sendChatMessage(trimmedMessage, sessionKey);
      if (data.session_key && !access) {
        setSessionKey(data.session_key);
        try {
          window.localStorage.setItem("bashiri-ai-session", data.session_key);
        } catch (error) {
          console.error("Could not persist the Bashiri AI guest session:", error);
        }
      }
      const aiMessage: Message = {
        role: "assistant",
        content: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        toolResult: data.tool_result,
        id: data.message_id,
      };
      setMessages((prev) => [...prev, aiMessage]);
      setRemaining(data.remaining_today);
      
      // Update context if tool_result contains match info
      if (data.tool_result && data.tool_result.tool_name === "predict_fixture" && (data.tool_result.data as any)?.data?.match_id) {
        setLastMatchContext({
          id: (data.tool_result.data as any).data.match_id,
          label: `${(data.tool_result.data as any).data.home_team} vs ${(data.tool_result.data as any).data.away_team}`,
        });
      } else if (data.tool_result && data.tool_result.tool_name === "search_matches" && (data.tool_result.data as any)?.data?.matches?.length > 0) {
        const firstMatch = (data.tool_result.data as any).data.matches[0];
        setLastMatchContext({
          id: firstMatch.id,
          label: `${firstMatch.home_team} vs ${firstMatch.away_team}`,
        });
      } else if (data.tool_result?.tool_name === "app_help") {
        setLastMatchContext(null);
      }
    } catch (e: unknown) {
      const errorMessage: Message = {
        role: "assistant",
        content: e instanceof Error ? e.message : "Imeshindikana kupata jibu. Tafadhali jaribu tena.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    void handleSend(suggestion);
  };

  const handleHelpful = async (messageId: number) => {
    try {
      await sendChatFeedback(messageId, "positive", sessionKey);
    } catch (e) {
      console.error("Failed to submit feedback", e);
    }
  };

  const handleNotHelpful = async (messageId: number) => {
    try {
      await sendChatFeedback(messageId, "negative", sessionKey);
    } catch (e) {
      console.error("Failed to submit feedback", e);
    }
  };

  return (
    <div 
      className="min-h-dvh flex flex-col"
      style={{ background: "var(--background)" }}
    >
      {/* Header */}
      <AIHeader remaining={remaining} />

      {/* Messages Area */}
      <div 
        ref={messagesContainerRef}
        className="min-h-0 flex-1 overflow-y-auto scroll-smooth"
        style={{
          paddingTop: '16px',
          paddingBottom: isKeyboardOpen ? '140px' : '100px',
          paddingLeft: '16px',
          paddingRight: '16px',
        }}
      >
        {historyError && <p role="status" className="mx-auto mb-4 max-w-3xl rounded-xl border border-amber-300/15 bg-amber-300/[0.05] px-4 py-3 text-xs text-amber-100/70">{historyError}</p>}
        {!historyReady ? (
          <p role="status" className="py-8 text-center text-xs text-white/45">Inapakia mazungumzo yako…</p>
        ) : messages.length === 0 ? (
          <EmptyState onSuggestionClick={handleSuggestionClick} />
        ) : (
          <>
            <MessageList 
              messages={messages} 
              isLoading={loading} 
              onHelpful={handleHelpful}
              onNotHelpful={handleNotHelpful}
            />
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Composer Container */}
      <div className="fixed bottom-0 left-0 right-0 z-[100]" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        {/* Context Chips */}
        {lastMatchContext && (
          <div className="px-4 pb-2">
            <div 
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs"
              style={{
                background: "var(--surface-alt)",
                border: "1px solid var(--border)",
              }}
            >
              <span style={{ color: "var(--text-secondary)" }}>💬 Sasa: {lastMatchContext.label}</span>
              <button
                onClick={() => setLastMatchContext(null)}
                className="hover:opacity-70 transition-opacity"
                style={{ color: "var(--text-muted)" }}
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}
        <AIComposer
          value={input}
          onChange={setInput}
          onSend={() => void handleSend()}
          isLoading={loading}
          disabled={loading || !historyReady}
        />
      </div>
    </div>
  );
}
