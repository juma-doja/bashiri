"use client";

import { useState, useRef, useEffect, useLayoutEffect, useCallback } from "react";
import { ArrowUp } from "lucide-react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface AIComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onHeightChange?: (height: number) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function AIComposer({ 
  value, 
  onChange, 
  onSend, 
  onHeightChange,
  isLoading = false, 
  disabled = false
}: AIComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const composerRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const resizeTextarea = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    const maxHeight = 200;
    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
    textarea.style.overflowY = textarea.scrollHeight > maxHeight ? "auto" : "hidden";
  }, []);

  useLayoutEffect(() => {
    resizeTextarea();
  }, [resizeTextarea, value]);

  useEffect(() => {
    window.addEventListener("resize", resizeTextarea);
    window.visualViewport?.addEventListener("resize", resizeTextarea);
    return () => {
      window.removeEventListener("resize", resizeTextarea);
      window.visualViewport?.removeEventListener("resize", resizeTextarea);
    };
  }, [resizeTextarea]);

  useEffect(() => {
    const composer = composerRef.current;
    if (!composer || !onHeightChange) return;

    const observer = new ResizeObserver(() => onHeightChange(composer.offsetHeight));
    observer.observe(composer);
    onHeightChange(composer.offsetHeight);
    return () => observer.disconnect();
  }, [onHeightChange]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const canSend = value.trim().length > 0 && !isLoading && !disabled;

  return (
    <div 
      ref={composerRef}
      className="mx-auto w-full max-w-3xl"
      style={{
        padding: "10px 16px calc(env(safe-area-inset-bottom, 0px) + 12px)",
        background: "linear-gradient(180deg, transparent, var(--background) 18%)",
      }}
    >
      <div
        className="flex min-w-0 items-end gap-2 rounded-[28px] px-3 py-2 transition-colors"
        style={{
          background: "var(--surface)",
          border: `1px solid ${isFocused ? "rgba(212, 175, 55, 0.45)" : "var(--border)"}`,
          boxShadow: isFocused ? "0 0 0 2px rgba(212, 175, 55, 0.08)" : "0 2px 8px rgba(0, 0, 0, 0.2)",
        }}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Uliza kuhusu mechi, prediction au kutumia Bashiri..."
          disabled={disabled}
          enterKeyHint="send"
          rows={1}
          className="min-w-0 flex-1 resize-none overflow-x-hidden bg-transparent py-2 leading-6 outline-none placeholder:text-white/40"
          style={{
            color: "var(--text-primary)",
            fontSize: "15px",
            minHeight: "40px",
            maxHeight: "200px",
            overflowWrap: "anywhere",
          }}
          aria-label="Andika ujumbe kwa Bashiri AI"
        />

        <motion.button
          onClick={onSend}
          disabled={!canSend}
          whileTap={{ scale: 0.92 }}
          className="mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors"
          style={{
            background: canSend ? "var(--brand-primary)" : "var(--surface-alt)",
            color: canSend ? "#000" : "var(--text-muted)",
            opacity: canSend ? 1 : 0.65,
            cursor: canSend ? "pointer" : "not-allowed",
          }}
          aria-label="Tuma ujumbe"
        >
          {isLoading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <ArrowUp size={19} strokeWidth={2.5} />
          )}
        </motion.button>
      </div>
    </div>
  );
}
