"use client";

import { useState, type FormEvent } from "react";
import { ArrowUp } from "lucide-react";

import { Bilingual } from "@/components/ui/bilingual";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { copy } from "@/config/i18n";

export function AiAssistantPanel() {
  const [value, setValue] = useState("");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const prompt = value.trim();
    if (!prompt) return;
    // Prompt is collected for future Aura AI wire-up; no mock responses.
    setValue("");
  }

  return (
    <aside className="flex h-svh w-[320px] shrink-0 flex-col border-l border-white/[0.06] bg-[#0a0a0b]/95 backdrop-blur-xl">
      <div className="flex h-14 items-center px-5">
        <Bilingual
          text={copy.aiTitle}
          compact
          zhClassName="text-white"
          enClassName="text-white/40"
        />
      </div>

      <div className="flex flex-1 flex-col justify-end gap-4 px-4 pb-4">
        <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-6">
          <Bilingual
            text={copy.emptyTitle}
            compact
            className="items-start"
            zhClassName="text-white/70"
            enClassName="text-white/35"
          />
          <p className="mt-2 text-[11px] leading-relaxed text-white/30">
            {copy.aiPlaceholder.zh}
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-white/25">
            {copy.aiPlaceholder.en}
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-2">
          <label className="sr-only" htmlFor="aura-ai-input">
            {copy.aiInputLabel.zh} / {copy.aiInputLabel.en}
          </label>
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-2 shadow-[0_0_0_1px_rgba(255,255,255,0.02)_inset]">
            <Textarea
              id="aura-ai-input"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={`${copy.aiInputLabel.zh}\n${copy.aiPlaceholder.zh}`}
              className="min-h-[88px] resize-none border-0 bg-transparent px-2 py-2 text-sm text-white shadow-none placeholder:text-white/30 focus-visible:ring-0"
            />
            <div className="flex items-center justify-between px-1 pb-1">
              <span className="text-[10px] text-white/25">{copy.aiInputLabel.en}</span>
              <Button
                type="submit"
                size="icon"
                disabled={!value.trim()}
                className="size-8 rounded-full bg-white text-black hover:bg-white/90 disabled:opacity-30"
              >
                <ArrowUp className="size-4" />
                <span className="sr-only">{copy.send.zh}</span>
              </Button>
            </div>
          </div>
        </form>
      </div>
    </aside>
  );
}
