"use client";

import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@/components/ui/Icon";
import { RichText } from "./RichText";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Why did our carbon score drop this quarter and which department is worst?",
  "Which department has the best ESG score and why?",
  "Summarize our top carbon anomalies and their likely cause.",
  "What are the most pressing open compliance issues?",
  "How is employee engagement tracking in the challenges?",
];

const suggestionVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 8 },
  show: (i: number) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { delay: 0.3 + i * 0.06, duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  }),
};

export function CopilotChat({ available }: { available: boolean }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streaming]);

  const ask = async (question: string) => {
    if (!question.trim() || streaming) return;
    const history = messages.slice(-6);
    setMessages((m) => [...m, { role: "user", content: question }, { role: "assistant", content: "" }]);
    setInput("");
    setStreaming(true);

    try {
      const res = await fetch("/api/copilot", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question, history }),
      });

      if (res.status === 503) {
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = {
            role: "assistant",
            content:
              "AI is currently unavailable. Start Ollama and pull the model with `ollama pull gpt-oss:120b-cloud`, then try again. Everything else in EcoSphere works without it.",
          };
          return copy;
        });
        setStreaming(false);
        return;
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: "assistant", content: acc };
          return copy;
        });
      }
    } catch {
      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = { role: "assistant", content: "Something went wrong reaching the Copilot. Please try again." };
        return copy;
      });
    } finally {
      setStreaming(false);
    }
  };

  return (
    <div className="card flex h-[calc(100vh-260px)] min-h-[460px] flex-col p-0 relative overflow-hidden">
      {/* Subtle gradient mesh background */}
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-[200px] h-[200px] rounded-full bg-gov/[0.06] blur-[60px] animate-float" />
        <div className="absolute bottom-0 right-0 w-[150px] h-[150px] rounded-full bg-env/[0.05] blur-[60px] animate-float" style={{ animationDelay: "3s" }} />
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="no-scrollbar relative z-10 flex-1 space-y-5 overflow-y-auto p-5">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            {/* Orbiting sparkles icon */}
            <div className="relative">
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 4 }}
                className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-gov/30 to-env/20 shadow-glow-gov"
              >
                <Icon name="Sparkles" className="h-8 w-8 text-gov-soft" />
              </motion.div>
              {/* Orbiting dots */}
              <motion.span
                className="absolute top-1/2 left-1/2 h-2 w-2 rounded-full bg-env/60"
                style={{ ["--orbit-r" as string]: "36px" }}
                animate={{ rotate: 360 }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              >
                <span className="block h-2 w-2 rounded-full bg-env/60" style={{ transform: "translateX(36px)" }} />
              </motion.span>
              <motion.span
                className="absolute top-1/2 left-1/2 h-1.5 w-1.5 rounded-full bg-gov/50"
                animate={{ rotate: -360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                <span className="block h-1.5 w-1.5 rounded-full bg-gov/50" style={{ transform: "translateX(28px)" }} />
              </motion.span>
            </div>

            <h3 className="mt-4 text-lg font-semibold text-white">Ask the ESG Copilot</h3>
            <p className="mt-1 max-w-sm text-sm text-slate-500">
              Grounded answers over your live ESG data, with citations to the exact records used.
            </p>
            <div className="mt-6 flex max-w-md flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s, i) => (
                <motion.button
                  key={s}
                  custom={i}
                  variants={suggestionVariants}
                  initial="hidden"
                  animate="show"
                  onClick={() => ask(s)}
                  disabled={!available}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-left text-xs text-slate-300 transition-all duration-300 hover:border-gov/40 hover:bg-white/[0.08] hover:text-white disabled:opacity-40"
                >
                  {s}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={m.role === "user" ? { opacity: 0, x: 20, scale: 0.95 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className={m.role === "user" ? "flex justify-end" : "flex gap-3"}
            >
              {m.role === "assistant" && (
                <div className="grid h-8 w-8 shrink-0 place-items-center self-start rounded-lg bg-gradient-to-br from-gov/30 to-env/20">
                  <Icon name="Sparkles" className="h-4 w-4 text-gov-soft" />
                </div>
              )}
              <div
                className={
                  m.role === "user"
                    ? "max-w-[80%] rounded-2xl rounded-br-sm bg-gradient-to-b from-env to-env-deep px-4 py-2.5 text-sm font-medium text-ink-950 shadow-glow"
                    : "max-w-[85%] rounded-2xl rounded-tl-sm border border-white/[0.06] bg-white/[0.02] px-4 py-3 backdrop-blur-sm"
                }
              >
                {m.role === "user" ? (
                  m.content
                ) : m.content ? (
                  <RichText text={m.content} />
                ) : (
                  <span className="flex items-center gap-2 text-sm text-slate-500">
                    <span className="flex gap-1">
                      <motion.span
                        className="h-2 w-2 rounded-full bg-gov/60"
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                      />
                      <motion.span
                        className="h-2 w-2 rounded-full bg-env/60"
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
                      />
                      <motion.span
                        className="h-2 w-2 rounded-full bg-social/60"
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
                      />
                    </span>
                    Analyzing ESG records...
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Composer */}
      <div className="relative z-10 border-t border-white/5 p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            ask(input);
          }}
          className="flex items-center gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={!available || streaming}
            placeholder={available ? "Ask about carbon, scores, challenges, compliance..." : "AI unavailable - start Ollama to enable"}
            className="input flex-1"
          />
          <button type="submit" disabled={!available || streaming || !input.trim()} className="btn-primary">
            {streaming ? <Icon name="Loader2" className="h-4 w-4 animate-spin" /> : <Icon name="Send" className="h-4 w-4" />}
          </button>
        </form>
      </div>
    </div>
  );
}
