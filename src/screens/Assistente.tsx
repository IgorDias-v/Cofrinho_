"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/Icon";
import { BackTitle, Hero, TopBar, cx } from "@/components/ui";
import { useStore } from "@/lib/store";
import { buildContext } from "@/lib/context";
import type { Insight } from "@/lib/types";
import { askAssistant } from "@/services/assistente";

type Msg = { id: number; role: "user" | "assistant"; text: string; insight?: Insight; error?: boolean };

const SUGGESTIONS = [
  "Quanto gastei com delivery este mês?",
  "Como guardo mais para a viagem?",
  "Qual cartão está mais perto do limite?",
  "Quanto pago de assinaturas?",
];
const MAX = 300;
const KEY = "cofrinho:chat";

/** Chat "Pergunte sobre seu dinheiro". A conversa dura a sessão do navegador. */
export function Assistente() {
  const { state, d } = useStore();
  const [msgs, setMsgs] = useState<Msg[]>(() => {
    try {
      return JSON.parse(sessionStorage.getItem(`${KEY}:${state.user.email}`) ?? "[]");
    } catch {
      return [];
    }
  });
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const nextId = useRef(msgs.reduce((m, x) => Math.max(m, x.id), 0) + 1);

  useEffect(() => {
    try {
      sessionStorage.setItem(`${KEY}:${state.user.email}`, JSON.stringify(msgs));
    } catch {}
  }, [msgs, state.user.email]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [msgs, busy]);

  useEffect(() => {
    if (window.matchMedia("(min-width: 50rem)").matches) inputRef.current?.focus();
  }, []);

  async function ask(history: Msg[]) {
    setBusy(true);
    try {
      const reply = await askAssistant(
        history.filter((m) => !m.error).map((m) => ({ role: m.role, content: m.text })),
        buildContext(state, d),
      );
      setMsgs((m) => [...m, { id: nextId.current++, role: "assistant", text: reply.text, insight: reply.insight }]);
    } catch (e) {
      setMsgs((m) => [...m, { id: nextId.current++, role: "assistant", text: e instanceof Error && e.message ? e.message : "Não consegui responder agora.", error: true }]);
    } finally {
      setBusy(false);
    }
  }

  function send(q: string) {
    const question = q.trim().slice(0, MAX);
    if (!question || busy) return;
    const next = [...msgs, { id: nextId.current++, role: "user" as const, text: question }];
    setMsgs(next);
    setText("");
    ask(next);
  }

  function retry() {
    // remove o erro e pergunta de novo a última mensagem
    const clean = msgs.filter((m, i) => !(m.error && i === msgs.length - 1));
    setMsgs(clean);
    ask(clean);
  }

  const last = msgs[msgs.length - 1];
  const asked = new Set(msgs.filter((m) => m.role === "user").map((m) => m.text));
  const followUps = SUGGESTIONS.filter((s) => !asked.has(s)).slice(0, 2);

  return (
    <>
      <Hero className="gap-[22px] md:gap-7">
        <TopBar
          left={<BackTitle title="Assistente" />}
          right={
            msgs.length > 0 ? (
              <button
                type="button"
                onClick={() => setMsgs([])}
                disabled={busy}
                aria-label="Nova conversa"
                title="Nova conversa"
                className="flex h-11 min-w-11 items-center justify-center gap-2 whitespace-nowrap rounded-full border-[1.5px] border-esk-ink px-3.5 text-sm font-medium transition hover:bg-esk-ink hover:text-esk-paper disabled:opacity-50 md:h-12"
              >
                <Icon name="plus" size={18} /> <span className="hidden md:inline">Nova conversa</span>
              </button>
            ) : (
              <span className="flex size-11 items-center justify-center rounded-full border-[1.5px] border-esk-ink md:size-12" aria-hidden="true"><Icon name="sparkles" size={20} /></span>
            )
          }
        />
        <div className="flex items-center gap-3.5">
          <span aria-hidden="true" className="art-iris anim-orb size-12 flex-none rounded-full" />
          <div>
          <p className="display text-xl font-semibold">Pergunte sobre seu dinheiro</p>
          <p className="mt-0.5 text-[13px] text-esk-paper-muted md:text-sm">Respostas com os seus gastos, cartões e metas.</p>
          </div>
        </div>
      </Hero>

      <main className="mx-auto flex max-w-[760px] flex-col gap-4 px-6 pb-40 pt-7 md:pt-10" aria-live="polite" aria-busy={busy}>
        {msgs.length === 0 && (
          <div className="stagger flex flex-col gap-3">
            <p className="kicker">Experimente</p>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => send(s)}
                className="flex items-center gap-3 rounded-full border border-esk-track bg-esk-panel px-5 py-3.5 text-left text-[15px] text-esk-soft transition hover:border-esk-lima hover:text-white"
              >
                <Icon name="sparkles" size={16} className="flex-none text-esk-lima" />
                {s}
              </button>
            ))}
          </div>
        )}

        {msgs.map((m) =>
          m.role === "user" ? (
            <p key={m.id} className="anim-pop max-w-[78%] self-end break-words rounded-[22px_22px_6px_22px] bg-esk-paper px-4 py-3 text-[15px] leading-snug text-esk-ink">
              {m.text}
            </p>
          ) : m.error ? (
            <div key={m.id} role="alert" className="anim-pop flex max-w-[85%] flex-col gap-2.5 self-start rounded-[18px_18px_18px_6px] bg-[#2a1416] px-4 py-3 text-[#FFB4B4]">
              <span className="flex items-center gap-2 text-[15px]"><Icon name="alert" size={16} />{m.text}</span>
              {m === last && (
                <button type="button" onClick={retry} disabled={busy} className="self-start rounded-xl bg-[#FFB4B4] px-3 py-1.5 text-sm font-semibold text-esk-ink disabled:opacity-50">
                  Tentar de novo
                </button>
              )}
            </div>
          ) : (
            <div key={m.id} className="anim-pop flex flex-col gap-2 self-stretch">
              {m.insight && (
                <div className="relative flex flex-col gap-1.5 overflow-hidden rounded-[26px] px-5 py-[18px] text-white md:max-w-[560px]">
                  <span aria-hidden="true" className="art-iris absolute inset-0" />
                  <span className="relative text-sm opacity-90">{m.insight.context}</span>
                  <span className="num relative text-[34px] leading-[1.05]">{m.insight.value}</span>
                  <span className="relative text-sm opacity-90">{m.insight.consequence}</span>
                </div>
              )}
              {m.text && (
                <p className="max-w-[78%] self-start whitespace-pre-line rounded-[22px_22px_22px_6px] border border-esk-border bg-esk-surface px-4 py-3 text-[15px] leading-snug text-white">
                  {m.text}
                </p>
              )}
            </div>
          ),
        )}

        {busy && (
          <div aria-label="Assistente digitando" className="anim-pop flex items-center gap-1.5 self-start rounded-[18px] bg-esk-nav px-4 py-3.5">
            {[0, 1, 2].map((k) => (
              <span key={k} className="dot-blink size-[7px] rounded-full bg-esk-muted" style={{ animationDelay: `${k * 0.15}s` }} />
            ))}
          </div>
        )}

        {!busy && last?.role === "assistant" && !last.error && followUps.length > 0 && (
          <div className="anim-pop flex flex-wrap gap-2 pt-1">
            {followUps.map((s) => (
              <button key={s} type="button" onClick={() => send(s)} className="rounded-full border border-esk-track px-3.5 py-2 text-[13px] text-esk-soft transition hover:border-esk-lima hover:text-white">
                {s}
              </button>
            ))}
          </div>
        )}
        <div ref={endRef} />
      </main>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(text);
        }}
        className="fixed inset-x-6 bottom-6 z-30 mx-auto max-w-[712px]"
      >
        <div className={cx("flex h-16 items-center gap-2.5 rounded-full border border-esk-track bg-[rgba(24,24,24,.9)] pl-6 pr-2 shadow-[0_12px_36px_rgba(0,0,0,.55)] ring-1 backdrop-blur-xl transition", text ? "ring-esk-lima/40" : "ring-transparent")}>
          <label htmlFor="q" className="sr-only">Pergunta</label>
          <input
            ref={inputRef}
            id="q"
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, MAX))}
            placeholder={busy ? "Pensando…" : "Pergunte sobre seu dinheiro"}
            autoComplete="off"
            maxLength={MAX}
            className="min-w-0 flex-1 bg-transparent text-[15px] text-white outline-none placeholder:text-[#8C8C8C]"
          />
          {text.length > MAX - 60 && <span className="text-xs text-esk-muted" aria-live="polite">{MAX - text.length}</span>}
          <button
            type="submit"
            aria-label="Enviar"
            disabled={!text.trim() || busy}
            className="flex size-12 items-center justify-center rounded-full bg-esk-lima text-esk-ink transition hover:scale-105 disabled:opacity-35"
          >
            <Icon name="up" size={20} />
          </button>
        </div>
      </form>
    </>
  );
}
