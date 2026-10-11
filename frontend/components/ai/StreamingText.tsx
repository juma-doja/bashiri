"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface StreamingTextProps {
  text: string;
  speed?: number; // characters per second
  onComplete?: () => void;
  isComplete?: boolean;
}

export function StreamingText({ 
  text, 
  speed = 30, 
  onComplete,
  isComplete = false 
}: StreamingTextProps) {
  const [streamProgress, setStreamProgress] = useState({ text: "", index: 0 });
  const textCharacters = Array.from(text);
  const displayedText = isComplete
    ? text
    : streamProgress.text === text
      ? textCharacters.slice(0, streamProgress.index).join("")
      : "";
  const isStreaming = !isComplete && textCharacters.length > 0 && displayedText.length < text.length;

  useEffect(() => {
    let index = 0;
    if (isComplete || !text) return;
    const characters = Array.from(text);

    const interval = setInterval(() => {
      if (index < characters.length) {
        index += 1;
        setStreamProgress({ text, index });
      } else {
        clearInterval(interval);
        onComplete?.();
      }
    }, 1000 / speed);

    return () => clearInterval(interval);
  }, [text, speed, isComplete, onComplete]);

  return (
    <span className="break-words overflow-wrap-anywhere">
      {displayedText}
      {isStreaming && (
        <motion.span
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 0.8, repeat: Infinity }}
          className="inline-block w-2 h-4 ml-1 flex-shrink-0"
          style={{ background: "var(--brand-primary)" }}
        />
      )}
    </span>
  );
}
