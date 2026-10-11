"use client";

import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface AIComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function AIComposer({ 
  value, 
  onChange, 
  onSend, 
  isLoading = false, 
  disabled = false
}: AIComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const canSend = value.trim().length > 0 && !isLoading && !disabled;

  return (
    <div 
      style={{
        paddingTop: '12px',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)',
        paddingLeft: '20px',
        paddingRight: '20px',
      }}
    >
      <div
        className="flex items-end gap-3 rounded-2xl px-3 py-2 transition-all duration-300"
        style={{
          background: "var(--surface)",
          border: `1px solid ${isFocused ? "rgba(212, 175, 55, 0.25)" : "var(--border)"}`,
          boxShadow: isFocused 
            ? "0 4px 20px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(212, 175, 55, 0.1)" 
            : "0 2px 8px rgba(0, 0, 0, 0.2)",
          backdropFilter: "blur(20px)",
          marginBottom: "8px",
        }}
      >
        {/* Text Input */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Uliza kuhusu mechi, prediction au kutumia Bashiri..."
          disabled={disabled}
          rows={1}
          className="flex-1 bg-transparent resize-none outline-none leading-relaxed py-1.5"
          style={{
            color: "var(--text-primary)",
            fontSize: "15px",
            minHeight: "36px",
            maxHeight: "120px",
          }}
        />

        {/* Send Button */}
        <motion.button
          onClick={onSend}
          disabled={!canSend}
          whileTap={{ scale: 0.92 }}
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
          style={{
            background: canSend ? "var(--gradient-gold)" : "var(--surface)",
            color: canSend ? "#000" : "var(--text-muted)",
            opacity: canSend ? 1 : 0.5,
            cursor: canSend ? "pointer" : "not-allowed",
            boxShadow: canSend 
              ? "0 4px 12px rgba(212, 175, 55, 0.3)" 
              : "0 2px 4px rgba(0, 0, 0, 0.1)",
            border: canSend 
              ? "none" 
              : "1px solid var(--border)",
          }}
          aria-label="Send message"
        >
          {isLoading ? (
            <Loader2 size={20} className="animate-spin" style={{ color: canSend ? "#000" : "var(--text-muted)" }} />
          ) : (
            <Send size={20} style={{ color: canSend ? "#000" : "var(--text-muted)" }} />
          )}
        </motion.button>
      </div>
    </div>
  );
}
