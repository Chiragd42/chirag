"use client";

import { EncryptedText } from "@/components/ui/encrypted-text";

export function MatrixIntro() {
  return (
    <section className="flex items-center justify-center border-t border-neutral-800 py-24 px-6">
      <p className="mx-auto max-w-lg text-left">
        <EncryptedText
          text="Welcome to the Matrix, Neo."
          encryptedClassName="text-neutral-500"
          revealedClassName="text-white"
          revealDelayMs={50}
        />
      </p>
    </section>
  );
}
