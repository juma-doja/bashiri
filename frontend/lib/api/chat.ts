import { apiClient } from "./client";

export interface ChatHistoryMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  created_at: string;
  tool_result?: {
    tool_name: string;
    data: Record<string, unknown>;
  };
}

export function getChatHistory(sessionKey?: string) {
  const query = sessionKey ? `?session_key=${encodeURIComponent(sessionKey)}` : "";
  return apiClient<{
    messages: ChatHistoryMessage[];
    remaining_today: number;
    session_key?: string;
  }>(`/chat/${query}`);
}

export function sendChatMessage(message: string, sessionKey?: string) {
  return apiClient<{ 
    reply: string; 
    remaining_today: number;
    session_key?: string;
    message_id: number;
    tool_result?: {
      tool_name: string;
      data: Record<string, unknown>;
    };
  }>("/chat/", {
    method: "POST",
    body: JSON.stringify({ message, session_key: sessionKey }),
  });
}

export function sendChatFeedback(
  messageId: number,
  feedback: "positive" | "negative",
  sessionKey?: string,
) {
  return apiClient<{ success: boolean; ai_agreement_score: number | null }>("/chat/feedback/", {
    method: "POST",
    body: JSON.stringify({ message_id: messageId, feedback, session_key: sessionKey }),
  });
}