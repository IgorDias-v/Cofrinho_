"use client";

import { useEffect, useRef, useState } from "react";
import { Logo } from "./Logo";
import { Icon } from "./Icon";
import { Tile } from "./Tile";
import { useStore } from "@/lib/store";
import { brl } from "@/lib/format";
import type { Card, View } from "@/lib/types";

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");
export { cx };

/** Superfície onde o componente está: "light" = topo papel, "dark" = conteúdo escuro. */
type Tone = "light" | "dark";

/* ───────── Botões ───────── */

/** Botão redondo com contorno (no topo claro) ou cinza (no escuro). */
export function CircleButton({
  icon, label, onClick, className, tone = "light",
}: { icon: string; label: string; onClick?: () => void; className?: string; tone?: Tone }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cx(
        "flex size-11 flex-none items-center justify-center rounded-full transition md:size-12",
        tone === "light"
          ? "border-[1.5px] border-esk-ink text-esk-ink hover:bg-esk-ink hover:text-esk-paper"
          : "bg-esk-surface text-white hover:bg-esk-active",
        className,
      )}
    >
      <Icon name={icon} size={20} />
    </button>
  );
}

/** Ação principal em pílula. No escuro: papel; no claro: tinta. */
export function PrimaryButton({ children, className, tone = "dark", ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & { tone?: Tone }) {
  return (
    <button
      {...p}
      className={cx(
        "flex h-14 w-full items-center justify-center gap-2.5 rounded-full text-base font-semibold transition hover:opacity-90 disabled:opacity-35",
        tone === "dark" ? "bg-esk-paper text-esk-ink" : "bg-esk-ink text-esk-paper",
        className,
      )}
    >
      {children}
    </button>
  );
}

/** Pílula com ícone (Adicionar, Fatura, Guardar…). `primary` = preenchida. Sem `label` = redonda. */
export function Pill({
  icon, label, onClick, primary, tone = "light", ariaLabel,
}: { icon: string; label?: string; onClick: () => void; primary?: boolean; tone?: Tone; ariaLabel?: string }) {
  const light = tone === "light";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel ?? label}
      className={cx(
        "flex h-12 flex-none items-center justify-center gap-2 rounded-full text-[15px] font-medium transition",
        label ? "px-5" : "w-12",
        light
          ? primary
            ? "bg-esk-ink text-esk-paper hover:opacity-85"
            : "border-[1.5px] border-esk-ink text-esk-ink hover:bg-esk-ink hover:text-esk-paper"
          : primary
            ? "bg-esk-paper text-esk-ink hover:opacity-90"
            : "border border-white/25 text-white hover:border-white hover:bg-white/5",
      )}
    >
      <Icon name={icon} size={18} />
      {label}
    </button>
  );
}

/** Compatibilidade: atalho antigo vira pílula. */
export function Shortcut({ icon, label, onClick, light, tone = "light" }: { icon: string; label: string; onClick: () => void; light?: boolean; tone?: Tone }) {
  return <Pill icon={icon} label={label} onClick={onClick} primary={light} tone={tone} />;
}

/* ───────── Estrutura ───────── */

/** Topo claro (papel) com cantos inferiores arredondados. */
export function Hero({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <header className="rounded-b-[36px] bg-esk-paper text-esk-ink md:rounded-b-[44px]">
      <div className={cx("mx-auto flex max-w-[1200px] flex-col gap-6 px-5 pb-7 pt-6 md:gap-9 md:px-8 md:pb-11 md:pt-7", className)}>
        {children}
      </div>
    </header>
  );
}

/** Linha do topo: esquerda + título, ação à direita. A navegação fica na barra de baixo (celular e desktop). */
export function TopBar({ left, title, right }: { left: React.ReactNode; title?: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3.5">
      {left}
      {title}
      <div className="ml-auto">{right}</div>
    </div>
  );
}

export function BackTitle({ title }: { title: string }) {
  const { back } = useStore();
  return (
    <>
      <CircleButton icon="back" label="Voltar" onClick={back} />
      <h1 className="display text-[22px] font-semibold md:text-[28px]">{title}</h1>
    </>
  );
}

export function Main({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <main className={cx("mx-auto max-w-[1200px] px-5 pb-36 pt-7 md:px-8 md:pb-36 md:pt-10", className)}>{children}</main>
  );
}

/** No mobile é só fundo escuro; no desktop vira painel. */
export function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={cx("stagger flex min-w-0 flex-col md:rounded-[28px] md:border md:border-[#1e1e1e] md:bg-esk-panel md:p-7", className)}>
      {children}
    </section>
  );
}

/** Título de seção no estilo "Transações →". */
export function SectionHead({ title, action }: { title: string; action?: { label: string; onClick: () => void } }) {
  return (
    <div className="mb-2 flex items-center">
      <h2 className="display flex items-center gap-2 text-xl font-semibold text-white">
        {title} <span aria-hidden="true" className="text-esk-muted">→</span>
      </h2>
      {action && (
        <button type="button" onClick={action.onClick} className="ml-auto text-sm text-esk-muted transition hover:text-white">
          {action.label}
        </button>
      )}
    </div>
  );
}

/**
 * Linha de lista: à esquerda um bloco escuro com ícone do Lucide (ou `media` próprio,
 * ex.: logo do estabelecimento), título + sub, e à direita o valor com uma linha pequena (ex.: data).
 * `iconClass` = cor do ícone (ex.: "text-esk-lima").
 */
export function Row({
  icon, letter, iconClass, media, title, sub, value, valueClass, meta, onClick,
}: {
  icon?: string; letter?: string; iconClass?: string; media?: React.ReactNode; title: string; sub?: string;
  value?: React.ReactNode; valueClass?: string; meta?: string; onClick?: () => void;
}) {
  const inner = (
    <>
      {media ?? <Tile icon={icon} letter={letter} tone={iconClass} />}
      <span className="min-w-0 text-left">
        <span className="block truncate text-[16px] leading-snug text-white md:text-[17px]">{title}</span>
        {sub && <span className="mt-1 block truncate text-[13px] text-esk-muted md:text-sm">{sub}</span>}
      </span>
      {value !== undefined && (
        <span className="ml-auto flex flex-col items-end pl-3">
          <span className={cx("num whitespace-nowrap text-[15px] md:text-base", valueClass ?? "text-white")}>{value}</span>
          {meta && <span className="mt-1 whitespace-nowrap text-xs text-[#6B6B6B]">{meta}</span>}
        </span>
      )}
    </>
  );
  return onClick ? (
    <button type="button" onClick={onClick} className={cx("-mx-2 flex w-[calc(100%+16px)] items-center rounded-2xl px-2 transition hover:bg-white/[.04]", "gap-4 py-3")}>
      {inner}
    </button>
  ) : (
    <div className="flex items-center gap-4 py-3">{inner}</div>
  );
}

/* ───────── Movimento ───────── */

/** true depois do primeiro quadro: usado para animar barras e anéis a partir do zero. */
function useMounted() {
  const [m, setM] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setM(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return m;
}

const reduceMotion = () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/** Valor em reais que "conta" até o número novo (600 ms, ease-out). */
export function Money({
  value, hidden, format = brl, fromZero, mask = "R$ ••••••",
}: { value: number; hidden?: boolean; format?: (v: number) => string; fromZero?: boolean; mask?: string }) {
  const [shown, setShown] = useState(fromZero ? 0 : value);
  const from = useRef(fromZero ? 0 : value);
  useEffect(() => {
    const a = from.current;
    const b = value;
    if (a === b || reduceMotion()) {
      from.current = b;
      setShown(b);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / 600);
      const e = 1 - Math.pow(1 - p, 3);
      setShown(a + (b - a) * e);
      if (p < 1) raf = requestAnimationFrame(tick);
      else from.current = b;
    };
    raf = requestAnimationFrame(tick);
    // garante o valor final mesmo se a aba estiver em segundo plano (rAF pausado)
    const done = setTimeout(() => {
      cancelAnimationFrame(raf);
      from.current = b;
      setShown(b);
    }, 650);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(done);
      from.current = b;
    };
  }, [value]);
  return <>{hidden ? mask : format(Math.round(shown * 100) / 100)}</>;
}

/** Saldo grande: dígitos sobem um a um ao abrir; oculto = desfocado. */
export function BigBalance({ value, hidden, className }: { value: number; hidden?: boolean; className?: string }) {
  const text = brl(value);
  return (
    <p
      aria-label={hidden ? "Saldo oculto" : text}
      className={cx("num leading-none transition-[filter,opacity] duration-300", hidden && "opacity-60 blur-[12px] select-none", className)}
    >
      <span aria-hidden="true">
        {text.split("").map((ch, i) => (
          <span key={`${i}-${ch}`} className="anim-digit" style={{ animationDelay: `${120 + i * 35}ms` }}>
            {ch}
          </span>
        ))}
      </span>
    </p>
  );
}

export function Bar({ pct, color = "bg-esk-paper", track = "bg-esk-track", h = "h-1.5" }: { pct: number; color?: string; track?: string; h?: string }) {
  const mounted = useMounted();
  return (
    <span className={cx("block w-full overflow-hidden rounded-full", h, track)}>
      <span
        className={cx("block h-full rounded-full transition-[width] duration-700 ease-out", color)}
        style={{ width: `${mounted ? Math.max(0, Math.min(100, pct)) : 0}%` }}
      />
    </span>
  );
}

/** Barra em segmentos (limite usado), preenche em sequência. */
export function Ticks({ pct, count = 20, on = "bg-esk-ink", off = "bg-esk-paper-2" }: { pct: number; count?: number; on?: string; off?: string }) {
  const mounted = useMounted();
  const filled = mounted ? Math.round((Math.max(0, Math.min(100, pct)) / 100) * count) : 0;
  return (
    <span className="grid gap-[3px]" style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className={cx("h-[22px] rounded-[5px] transition-colors duration-300", i < filled ? on : off)} style={{ transitionDelay: `${i * 18}ms` }} />
      ))}
    </span>
  );
}

export function Ring({ pct, size = 88, ink = "#0A0A0A" }: { pct: number; size?: number; ink?: string }) {
  const mounted = useMounted();
  pct = mounted ? pct : 0;
  const c = 2 * Math.PI * 40;
  return (
    <div className="relative flex-none" style={{ width: size, height: size, color: ink }}>
      <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label={`${pct}% guardado`}>
        <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeOpacity=".18" strokeWidth="10" />
        <circle
          cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round"
          strokeDasharray={`${(c * pct) / 100} ${c}`} transform="rotate(-90 50 50)"
          className="transition-[stroke-dasharray] duration-700"
        />
      </svg>
      <span className="num absolute inset-0 flex items-center justify-center text-lg md:text-[22px]">{pct}%</span>
    </div>
  );
}

export function CardDots() {
  return (
    <span className="flex" aria-hidden="true">
      <span className="size-[18px] rounded-full bg-current opacity-90" />
      <span className="-ml-[7px] size-[18px] rounded-full bg-current opacity-45" />
    </span>
  );
}

/** Arte de cada cor de cartão + cor do texto com contraste. */
export const CARD_ART: Record<Card["color"], { art: string; ink: string; veil: string; stroke?: string }> = {
  ciano: { art: "art-iris", ink: "text-white", veil: "bg-linear-to-t from-black/45 to-transparent" },
  menta: { art: "art-aurora", ink: "text-esk-paper", veil: "bg-linear-to-t from-black/35 to-transparent" },
  lima: { art: "art-lime", ink: "text-esk-ink", veil: "bg-linear-to-t from-white/40 to-transparent", stroke: "rgba(10,10,10,.55)" },
};
/** Compatibilidade: miniatura/ícone com a arte do cartão. */
export const CARD_BG: Record<Card["color"], string> = { ciano: "art-iris text-white", menta: "art-aurora text-esk-paper", lima: "art-lime text-esk-ink" };

/**
 * Arte "blobs" do protótipo (Figma · Home mobile 4016:4930): degradê de base + manchas desfocadas.
 * Posições em % de um cartão de 188×236; o tamanho segue a largura do cartão.
 */
const CARD_BLOBS: Record<Card["color"], { base: string; blobs: { x: number; y: number; w: number; c: string; o: number; blur: number }[] }> = {
  ciano: {
    base: "linear-gradient(135deg, #3b2dff, #8c5bff 50%, #21b3ff)",
    blobs: [
      { x: 9, y: 12, w: 142, c: "#c9b6ff", o: 1, blur: 40 },
      { x: 103, y: 24, w: 130, c: "#6ec8ff", o: 0.9, blur: 36 },
      { x: 38, y: 142, w: 142, c: "#ff8fd8", o: 0.9, blur: 40 },
    ],
  },
  menta: {
    base: "linear-gradient(135deg, #1c1c1e, #121212 50%, #0a0a0a)",
    blobs: [
      { x: 103, y: -12, w: 130, c: "#d9f59b", o: 1, blur: 36 },
      { x: -19, y: 130, w: 153, c: "#8c5bff", o: 1, blur: 43 },
    ],
  },
  lima: {
    base: "linear-gradient(135deg, #d9f59b, #9be36b 50%, #2e7d5b)",
    blobs: [
      { x: 94, y: -12, w: 118, c: "#f4ffd6", o: 0.9, blur: 33 },
      { x: -9, y: 106, w: 142, c: "#62f2bc", o: 1, blur: 40 },
    ],
  },
};

function BlobArt({ color, blurScale = 1, still }: { color: Card["color"]; blurScale?: number; still?: boolean }) {
  const a = CARD_BLOBS[color];
  return (
    <span aria-hidden="true" className="absolute inset-0" style={{ background: a.base }}>
      {a.blobs.map((b, i) => (
        <span
          key={i}
          className={cx("absolute aspect-square rounded-full", !still && "anim-blob")}
          style={{
            left: `${(b.x / 188) * 100}%`,
            top: `${(b.y / 236) * 100}%`,
            width: `${(b.w / 188) * 100}%`,
            background: b.c,
            opacity: b.o,
            filter: `blur(${b.blur * blurScale}px)`,
            animationDelay: `${i * -3}s`,
          }}
        />
      ))}
    </span>
  );
}

/** Miniatura com a arte do cartão (listas, seletor de cor). */
export function CardSwatch({ color, className }: { color: Card["color"]; className?: string }) {
  return (
    <span aria-hidden="true" className={cx("relative block overflow-hidden", className)}>
      <BlobArt color={color} blurScale={0.25} still />
    </span>
  );
}

/** Fundo de arte + véu para leitura + dígitos finais em contorno. `art="blobs"` usa a arte do protótipo, sem véu. */
export function CardArt({ color, last4, digits = "right", art = "flow", className, children }: { color: Card["color"]; last4?: string; digits?: "right" | "left" | false; art?: "flow" | "blobs"; className?: string; children: React.ReactNode }) {
  const a = CARD_ART[color];
  if (art === "blobs")
    return (
      <span className={cx("relative block overflow-hidden", a.ink, className)}>
        <BlobArt color={color} />
        <span className="relative block h-full">{children}</span>
      </span>
    );
  return (
    <span className={cx("relative block overflow-hidden", a.ink, className)}>
      <span aria-hidden="true" className={cx("absolute inset-0", a.art)} />
      {digits && last4 && (
        <span
          aria-hidden="true"
          className={cx("outline-digits absolute text-[64px] md:text-[72px]", digits === "right" ? "right-4 top-12" : "left-4 top-14")}
          style={a.stroke ? { WebkitTextStrokeColor: a.stroke } : undefined}
        >
          {last4}
        </span>
      )}
      <span aria-hidden="true" className={cx("absolute inset-0", a.veil)} />
      <span className="relative block h-full">{children}</span>
    </span>
  );
}

export function Empty({ icon, text, action }: { icon: string; text: string; action?: { label: string; onClick: () => void } }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-[28px] border border-dashed border-esk-track px-6 py-10 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-esk-row text-esk-muted"><Icon name={icon} /></span>
      <p className="text-[15px] text-esk-muted">{text}</p>
      {action && (
        <button type="button" onClick={action.onClick} className="rounded-full border border-white/25 px-4 py-2 text-sm font-medium text-white transition hover:border-white">
          {action.label}
        </button>
      )}
    </div>
  );
}

/* ───────── Navegação ───────── */

const NAV: { view: View; icon: string; label: string; plus?: boolean }[] = [
  { view: "home", icon: "home", label: "Início" },
  { view: "fatura", icon: "file", label: "Fatura", plus: true },
  { view: "cartoes", icon: "card", label: "Cartões" },
  { view: "metas", icon: "target", label: "Metas" },
];

/** Objetivos é uma tela de Metas: a aba Metas fica ativa nas duas. */
const navActive = (view: View): View => (view === "objetivos" ? "metas" : view);

/**
 * Barra flutuante, fixa embaixo (Figma · Home mobile 4016:4896 e desktop 4016:5938).
 * Celular: só ícones, ocupa a largura. Desktop: pílula centralizada com rótulos.
 * Item ativo em papel, Assistente em lima.
 */
export function BottomNav() {
  const { view: raw, go, plus } = useStore();
  const view = navActive(raw);
  if (view === "assistente" || view === "fatura") return null;
  return (
    <nav
      aria-label="Principal"
      className="fixed inset-x-5 bottom-5 z-30 flex items-center gap-2.5 md:inset-x-auto md:bottom-6 md:left-1/2 md:-translate-x-1/2"
    >
      <div className="flex h-16 flex-1 items-center justify-around rounded-full border border-esk-track bg-[rgba(24,24,24,.88)] px-2 shadow-[0_12px_36px_rgba(0,0,0,.55)] backdrop-blur-xl md:h-14 md:flex-none md:justify-start md:gap-1 md:px-1.5">
        {NAV.filter((n) => plus || !n.plus).map((n) => (
          <button
            key={n.view}
            type="button"
            aria-label={n.label}
            aria-current={view === n.view ? "page" : undefined}
            onClick={() => go(n.view)}
            className={cx(
              "flex size-12 items-center justify-center gap-2 rounded-full transition duration-300 md:h-11 md:w-auto md:px-4 md:text-[15px]",
              view === n.view ? "bg-esk-paper text-esk-ink" : "text-esk-muted hover:text-white",
            )}
          >
            <Icon name={n.icon} size={20} />
            <span className="hidden md:inline">{n.label}</span>
          </button>
        ))}
      </div>
      {plus && (
        <button
          type="button"
          aria-label="Assistente"
          onClick={() => go("assistente")}
          className="flex size-16 items-center justify-center rounded-full bg-esk-lima text-esk-ink shadow-[0_10px_30px_rgba(217,245,155,.25)] transition hover:scale-105 md:size-14"
        >
          <Icon name="sparkles" size={24} />
        </button>
      )}
    </nav>
  );
}

/** Marca no topo: porquinho em traço + nome, como no protótipo. */
export function BrandMark({ className }: { className?: string }) {
  return (
    // o desenho tem ~8px de respiro dentro do próprio SVG: sem gap, o espaço visível até o texto fica em 8px
    <span className={cx("flex items-center gap-0 text-esk-ink", className)}>
      <Logo size={52} tile="none" ink="#0A0A0A" title="" />
      <span className="text-[15px] font-semibold">CoFrinho</span>
    </span>
  );
}

/** Menu do desktop: pílula escura sobre o topo claro. */
export function DesktopNav() {
  const { view: raw, go, plus } = useStore();
  const view = navActive(raw);
  return (
    <nav aria-label="Principal" className="flex items-center gap-2.5">
      <div className="flex gap-1 rounded-full bg-esk-ink p-1.5">
        {NAV.filter((n) => plus || !n.plus).map((n) => (
          <button
            key={n.view}
            type="button"
            aria-current={view === n.view ? "page" : undefined}
            onClick={() => go(n.view)}
            className={cx(
              "flex h-11 items-center gap-2 rounded-full px-4 text-sm transition duration-300",
              view === n.view ? "bg-esk-paper text-esk-ink" : "text-[#BDBDBD] hover:text-white",
            )}
          >
            <Icon name={n.icon} size={18} />
            {n.label}
          </button>
        ))}
      </div>
      {plus && (
        <button
          type="button"
          aria-label="Assistente"
          aria-current={view === "assistente" ? "page" : undefined}
          onClick={() => go("assistente")}
          className={cx(
            "flex size-14 items-center justify-center rounded-full bg-esk-lima text-esk-ink transition hover:scale-105",
            view === "assistente" && "ring-2 ring-esk-ink ring-offset-2 ring-offset-esk-paper",
          )}
        >
          <Icon name="sparkles" size={22} />
        </button>
      )}
    </nav>
  );
}

/* ───────── Folha (sheet) ───────── */

export function SheetFrame({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  const { sheetClosing } = useStore();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    const root = ref.current;
    (root?.querySelector<HTMLElement>("input:not([type=checkbox])") ?? root?.querySelector<HTMLElement>("button:not([data-close])"))?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      prev?.focus();
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-6">
      <div className={cx("absolute inset-0 bg-black/70 backdrop-blur-[2px]", sheetClosing ? "anim-fade-out" : "anim-fade")} onClick={onClose} aria-hidden="true" />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cx(
          sheetClosing ? "anim-sheet-out" : "anim-sheet",
          "relative flex max-h-[92dvh] w-full flex-col gap-5 overflow-y-auto rounded-t-[32px] border-t border-esk-border bg-esk-sheet px-5 pb-7 pt-3 md:max-w-[480px] md:rounded-[32px] md:border md:p-8",
        )}
      >
        <span aria-hidden="true" className="mx-auto h-[5px] w-11 rounded-full bg-[#3A3A3E] md:hidden" />
        <div className="flex items-center">
          <h2 className="display text-[22px] font-semibold">{title}</h2>
          <button
            type="button"
            data-close
            onClick={onClose}
            aria-label="Fechar"
            className="ml-auto flex size-11 items-center justify-center rounded-full bg-esk-surface text-white hover:bg-esk-active"
          >
            <Icon name="close" size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="kicker">{label}</span>
      {children}
      {error && (
        <span role="alert" className="flex items-center gap-1.5 text-[13px] text-[#FF9E9E]">
          <Icon name="alert" size={14} />
          {error}
        </span>
      )}
    </label>
  );
}

export const inputClass =
  "h-[52px] w-full rounded-2xl border border-[#262626] bg-esk-surface px-4 text-[15px] text-white placeholder:text-[#6E6E6E] outline-none transition focus:border-white";

export function Chips<T extends string>({
  options, value, onChange, label,
}: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void; label: string }) {
  return (
    <fieldset className="flex flex-col gap-2.5">
      <legend className="kicker mb-2.5">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            aria-pressed={value === o.value}
            onClick={() => onChange(o.value)}
            className={cx(
              "h-10 rounded-full border px-4 text-sm transition",
              value === o.value ? "border-esk-paper bg-esk-paper text-esk-ink" : "border-[#2A2A2A] bg-esk-surface text-[#E6E6E6] hover:border-[#555]",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

/* ───────── Toast ───────── */

export function Toasts() {
  const { toasts } = useStore();
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 top-5 z-[60] flex flex-col items-center gap-2 px-6">
      {toasts.map((t) => (
        <div key={t.id} className="anim-pop flex items-center gap-2.5 rounded-full bg-esk-paper py-2 pl-2 pr-5 text-sm font-medium text-esk-ink shadow-[0_10px_30px_rgba(0,0,0,.5)]">
          <span className="flex size-7 items-center justify-center rounded-full bg-esk-lima"><Icon name="check" size={16} /></span>
          {t.text}
        </div>
      ))}
    </div>
  );
}
