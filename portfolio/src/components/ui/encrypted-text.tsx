"use client";

import React, { useEffect, useState, useCallback } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";

function getRandomChar() {
  return CHARS[Math.floor(Math.random() * CHARS.length)];
}

interface EncryptedTextProps {
  text: string;
  encryptedClassName?: string;
  revealedClassName?: string;
  revealDelayMs?: number;
  scrambleSpeed?: number;
  onComplete?: () => void;
}

export function EncryptedText({
  text,
  encryptedClassName = "text-neutral-500",
  revealedClassName = "text-white",
  revealDelayMs = 50,
  scrambleSpeed = 50,
  onComplete,
}: EncryptedTextProps) {
  const [revealedCount, setRevealedCount] = useState(0);
  const [scrambled, setScrambled] = useState<string[]>(() =>
    text.split("").map((ch) => (ch === " " ? " " : getRandomChar()))
  );

  // Scramble unrevealed characters continuously
  useEffect(() => {
    if (revealedCount >= text.length) return;

    const interval = setInterval(() => {
      setScrambled((prev) =>
        prev.map((ch, i) => {
          if (i < revealedCount) return text[i];
          if (text[i] === " ") return " ";
          return getRandomChar();
        })
      );
    }, scrambleSpeed);

    return () => clearInterval(interval);
  }, [revealedCount, text, scrambleSpeed]);

  // Reveal characters one by one
  useEffect(() => {
    if (revealedCount >= text.length) {
      onComplete?.();
      return;
    }

    const timeout = setTimeout(() => {
      setRevealedCount((prev) => prev + 1);
    }, revealDelayMs);

    return () => clearTimeout(timeout);
  }, [revealedCount, text.length, revealDelayMs, onComplete]);

  return (
    <span className="font-mono text-2xl md:text-4xl tracking-tight">
      {scrambled.map((ch, i) => (
        <span
          key={i}
          className={
            i < revealedCount ? revealedClassName : encryptedClassName
          }
        >
          {ch}
        </span>
      ))}
      <span className="animate-pulse">_</span>
    </span>
  );
}
