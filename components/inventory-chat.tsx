"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Bot, Loader2, MessageCircle, Send, User2 } from "lucide-react";
import { askInventoryQuestion } from "@/app/actions/chat";

type ChatMessage = {
  role: "assistant" | "user";
  text: string;
};

const GREETING_MESSAGE = "Hi! I can help with stock levels, movement trends, and inventory value insights.";
const SUGGESTED_QUESTIONS = [
  "Which product has the most stock?",
  "What items are out of stock?",
  "Which product moves the most?",
  "What is the total inventory value?",
];

export function InventoryChat(): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", text: GREETING_MESSAGE },
  ]);
  const threadRef = useRef<HTMLDivElement | null>(null);

  const showSuggestions = useMemo(() => {
    return messages.length === 1 && messages[0]?.text === GREETING_MESSAGE;
  }, [messages]);

  useEffect(() => {
    if (!threadRef.current) return;
    threadRef.current.scrollTop = threadRef.current.scrollHeight;
  }, [messages, isLoading, isOpen]);

  async function sendMessage(text: string): Promise<void> {
    const question = text.trim();
    if (!question || isLoading) return;

    setMessages((prev) => [...prev, { role: "user", text: question }]);
    setInput("");
    setIsLoading(true);

    const result = await askInventoryQuestion(question);
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        text: result.success
          ? (result.answer ?? "I couldn't generate a response right now.")
          : (result.error ?? "Something went wrong while asking Gemini."),
      },
    ]);
    setIsLoading(false);
  }

  return (
    <>
      {isOpen ? (
        <div className="fixed bottom-24 right-6 z-50 flex h-[520px] w-[360px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl transition-all duration-200">
          <div className="flex items-center gap-3 bg-primary px-4 py-3 text-primary-foreground shadow-sm">
            <div className="rounded-full bg-primary-foreground/15 p-2">
              <Bot className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold">StockWise Assistant</p>
              <p className="text-xs text-primary-foreground/80">Powered by Gemini · Live data</p>
            </div>
          </div>

          <div ref={threadRef} className="flex-1 space-y-3 overflow-y-auto px-3 py-4 bg-background/50">
            {messages.map((message, index) => {
              const isUser = message.role === "user";
              return (
                <div key={`${message.role}-${index}`} className={`flex items-end gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
                  {!isUser ? (
                    <div className="rounded-full bg-muted p-1.5 text-muted-foreground border border-border">
                      <Bot className="h-3.5 w-3.5" />
                    </div>
                  ) : null}

                  <div
                    className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm shadow-xs ${
                      isUser
                        ? "rounded-br-sm bg-primary text-primary-foreground"
                        : "rounded-bl-sm border border-border bg-card text-foreground"
                    }`}
                  >
                    {message.text}
                  </div>

                  {isUser ? (
                    <div className="rounded-full bg-primary/15 p-1.5 text-primary border border-primary/20">
                      <User2 className="h-3.5 w-3.5" />
                    </div>
                  ) : null}
                </div>
              );
            })}

            {showSuggestions ? (
              <div className="space-y-2">
                {SUGGESTED_QUESTIONS.map((question) => (
                  <button
                    key={question}
                    type="button"
                    onClick={() => {
                      void sendMessage(question);
                    }}
                    className="w-full rounded-xl border border-border bg-muted/60 px-3 py-2 text-left text-xs font-medium text-foreground/80 transition hover:bg-muted hover:text-foreground active:scale-[0.99] duration-150"
                  >
                    {question}
                  </button>
                ))}
              </div>
            ) : null}

            {isLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
                <Loader2 className="h-4 w-4 animate-spin" />
                Thinking...
              </div>
            ) : null}
          </div>

          <div className="border-t border-border bg-card p-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    void sendMessage(input);
                  }
                }}
                placeholder="Ask about your inventory..."
                disabled={isLoading}
                className="h-10 flex-1 rounded-xl border border-input bg-muted px-3 text-sm text-foreground outline-none ring-primary/20 placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => {
                  void sendMessage(input);
                }}
                disabled={isLoading || !input.trim()}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground transition hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground border border-transparent disabled:border-border"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-6 right-6 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-2xl transition hover:scale-105 active:scale-95 duration-200 focus:outline-none focus:ring-2 focus:ring-primary/40"
        aria-label={isOpen ? "Close assistant" : "Open assistant"}
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    </>
  );
}
