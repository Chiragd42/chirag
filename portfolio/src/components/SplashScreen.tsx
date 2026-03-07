"use client";

import React, { useState, useCallback } from "react";
import { EncryptedText } from "@/components/ui/encrypted-text";

export function SplashScreen({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<"animating" | "fading" | "done">("animating");

  const handleComplete = useCallback(() => {
    // Wait a beat after text is revealed, then fade out
    setTimeout(() => setPhase("fading"), 800);
    // Remove splash entirely after fade animation
    setTimeout(() => setPhase("done"), 1600);
  }, []);

  if (phase === "done") {
    return <>{children}</>;
  }

  return (
    <>
      {/* Splash overlay */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center bg-black transition-opacity duration-700 ${
          phase === "fading" ? "opacity-0" : "opacity-100"
        }`}
      >
        <div className="text-center px-6">
          <EncryptedText
            text="Welcome to the Matrix, Neo."
            encryptedClassName="text-neutral-500"
            revealedClassName="text-white"
            revealDelayMs={50}
            scrambleSpeed={40}
            onComplete={handleComplete}
          />
          <p
            className={`mt-6 text-sm text-neutral-500 font-mono transition-opacity duration-500 ${
              phase === "animating" ? "opacity-100" : "opacity-0"
            }`}
          >
            loading...
          </p>
        </div>
      </div>

      {/* Main content behind (preloaded but hidden) */}
      <div className="opacity-0">{children}</div>
    </>
  );
}
