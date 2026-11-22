"use client";

import { useState } from "react";
import { Icon } from "@/components/Icon";
import { Tile } from "@/components/Tile";
import { cx } from "@/components/ui";
import { CATEGORIES, CATEGORY_ORDER } from "@/lib/data";
import { brl } from "@/lib/format";
import type { CategoryId, FaturaItem } from "@/lib/types";

export type UploadPhase = "escolher" | "lendo" | "pronto" | "erro";

/* ───────── Área de envio ───────── */

/**
 * Área tracejada para soltar o PDF (ou tocar e escolher), com atalhos para tirar foto
 * e usar uma fatura de exemplo. Mostra o progresso enquanto lê.
 */
export function InvoiceDropzone({
  phase, fileName, pct = 0, error, maxMb = 15,
  onFile, onPickPdf, onTakePhoto, onSample, onCancel, onRetry,
}: {
  phase: UploadPhase;
  fileName?: string;
  pct?: number;
  error?: string;
  maxMb?: number;
  /** Arquivo solto na área. */
  onFile: (f: File) => void;
  onPickPdf: () => void;
  onTakePhoto: () => void;
  onSample?: () => void;
  onCancel?: () => void;
  onRetry?: () => void;
}) {
  const [dragging, setDragging] = useState(false);
  const busy = phase === "lendo";
  const idle = phase === "escolher" || phase === "erro";

  const title = dragging
    ? "Pode soltar"
    : { escolher: "Envie sua fatura", lendo: "Lendo sua fatura", pronto: "Fatura lida", erro: "Não deu certo" }[phase];
  const sub = dragging
    ? "Solte o PDF ou a foto aqui."
    : {
        escolher: `PDF ou foto, até ${maxMb} MB`,
        lendo: "Separando compras, assinaturas e categorias…",
        pronto: fileName ?? "Confira ao lado o que encontramos.",
        erro: error ?? "Tente outro arquivo.",
      }[phase];

  return (
    <div className="flex flex-col gap-3">
      <div
        role="button"
        tabIndex={busy ? -1 : 0}
        aria-label="Enviar PDF da fatura"
        aria-disabled={busy}
        onClick={() => !busy && onPickPdf()}
        onKeyDown={(e) => { if (!busy && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); onPickPdf(); } }}
        onDragOver={(e) => { e.preventDefault(); if (!busy) setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const f = e.dataTransfer.files?.[0];
          if (f && !busy) onFile(f);
        }}
        className={cx(
          "group relative flex min-h-[236px] flex-col items-center justify-center gap-2 rounded-[28px] border-[1.5px] border-dashed px-6 py-8 text-center transition outline-none",
          "focus-visible:ring-2 focus-visible:ring-esk-lima focus-visible:ring-offset-2 focus-visible:ring-offset-esk-bg",
          dragging ? "scale-[1.01] border-esk-lima bg-esk-lima/10" : phase === "erro" ? "border-esk-coral/70 bg-esk-surface" : "border-esk-lima/70 bg-esk-surface",
          idle && "cursor-pointer hover:border-esk-lima hover:bg-esk-row",
        )}
      >
        <span
          aria-hidden="true"
          className={cx(
            "mb-2 flex size-16 items-center justify-center rounded-full text-esk-ink transition",
            phase === "erro" ? "bg-esk-coral text-white" : "bg-esk-lima",
            idle && "group-hover:-translate-y-0.5",
            dragging && "-translate-y-1",
          )}
        >
          {phase === "pronto" ? (
            <span className="anim-check"><Icon name="check" size={24} /></span>
          ) : phase === "erro" ? (
            <Icon name="alert" size={24} />
          ) : busy ? (
            <span className="num text-[15px] font-semibold">{pct}%</span>
          ) : (
            <Icon name="upload" size={24} />
          )}
        </span>
        <p className="display text-[22px] font-semibold text-white">{title}</p>
        <p aria-live="polite" className="max-w-[34ch] truncate text-sm text-esk-muted">{sub}</p>

        {(busy || phase === "pronto") && (
          <div role="progressbar" aria-label="Progresso da leitura" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} className="mt-3 h-1.5 w-full max-w-[280px] overflow-hidden rounded-full bg-esk-track">
            <div className="relative h-full overflow-hidden rounded-full bg-esk-lima transition-[width] duration-300" style={{ width: `${pct}%` }}>
              {busy && <span aria-hidden="true" className="shimmer absolute inset-0 opacity-40" />}
            </div>
          </div>
        )}
        {busy && onCancel && (
          <button type="button" onClick={(e) => { e.stopPropagation(); onCancel(); }} className="mt-2 text-sm font-semibold text-white underline underline-offset-4">
            Cancelar
          </button>
        )}
        {phase === "erro" && onRetry && (
          <button type="button" onClick={(e) => { e.stopPropagation(); onRetry(); }} className="mt-2 rounded-full bg-esk-paper px-4 py-2 text-sm font-semibold text-esk-ink">
            Tentar de novo
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <SecondaryAction icon="camera" label="Tirar foto" onClick={onTakePhoto} disabled={busy} />
        {onSample ? (
          <SecondaryAction icon="file" label="Usar exemplo" onClick={onSample} disabled={busy} />
        ) : (
          <SecondaryAction icon="upload" label="Escolher PDF" onClick={onPickPdf} disabled={busy} />
        )}
      </div>
    </div>
  );
}

function SecondaryAction({ icon, label, onClick, disabled }: { icon: string; label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex h-12 items-center justify-center gap-2 rounded-full border border-esk-active text-[15px] font-medium text-white transition hover:border-white hover:bg-white/5 disabled:pointer-events-none disabled:opacity-40"
    >
      <Icon name={icon} size={18} />
      {label}
    </button>
  );
}

/* ───────── Categorias encontradas ───────── */

export type CategoryFilterValue = CategoryId | "todas";

export type CategorySummary = { id: CategoryId; count: number; total: number };

/** Agrupa os itens da fatura por categoria (maior valor primeiro). */
export function summarizeCategories(items: Pick<FaturaItem, "category" | "amount">[]): CategorySummary[] {
  const map = new Map<CategoryId, CategorySummary>();
  for (const i of items) {
    const s = map.get(i.category) ?? { id: i.category, count: 0, total: 0 };
    s.count++;
    s.total += i.amount;
    map.set(i.category, s);
  }
  return [...map.values()].sort((a, b) => b.total - a.total || CATEGORY_ORDER.indexOf(a.id) - CATEGORY_ORDER.indexOf(b.id));
}

/**
 * Lista das categorias que a leitura encontrou, com quantidade, valor e participação.
 * Tocar numa categoria filtra os lançamentos; tocar de novo (ou em "Todas") limpa o filtro.
 */
export function CategoryFilter({
  categories, value, onChange,
}: {
  categories: CategorySummary[];
  value: CategoryFilterValue;
  onChange: (v: CategoryFilterValue) => void;
}) {
  const total = categories.reduce((s, c) => s + c.total, 0);
  const count = categories.reduce((s, c) => s + c.count, 0);

  return (
    <div role="group" aria-label="Filtrar por categoria" className="flex flex-col gap-1.5">
      <FilterRow
        active={value === "todas"}
        onClick={() => onChange("todas")}
        media={<Tile icon="sigma" size={40} />}
        label="Todas"
        sub={`${count} ${count === 1 ? "lançamento" : "lançamentos"}`}
        amount={total}
      />
      {categories.map((c) => {
        const cat = CATEGORIES[c.id];
        const share = total ? c.total / total : 0;
        return (
          <FilterRow
            key={c.id}
            active={value === c.id}
            onClick={() => onChange(value === c.id ? "todas" : c.id)}
            media={<Tile icon={cat.icon} tone={cat.ink} size={40} />}
            label={cat.label}
            sub={`${c.count} ${c.count === 1 ? "lançamento" : "lançamentos"} · ${Math.round(share * 100)}%`}
            amount={c.total}
            share={share}
            barClass={cat.color}
          />
        );
      })}
    </div>
  );
}

function FilterRow({
  active, onClick, media, label, sub, amount, share, barClass,
}: {
  active: boolean; onClick: () => void; media: React.ReactNode; label: string; sub: string; amount: number; share?: number; barClass?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cx(
        "flex w-full items-center gap-3.5 rounded-[18px] border px-3 py-2.5 text-left transition",
        active ? "border-esk-lima/60 bg-esk-lima/10" : "border-transparent hover:bg-esk-row",
      )}
    >
      {media}
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline gap-2">
          <span className="truncate text-[15px] text-white">{label}</span>
          <span className="ml-auto whitespace-nowrap text-[15px] font-semibold text-white">{brl(amount)}</span>
        </span>
        <span className="mt-0.5 block truncate text-[13px] text-esk-muted">{sub}</span>
        {share !== undefined && (
          <span aria-hidden="true" className="mt-2 block h-1 overflow-hidden rounded-full bg-esk-track">
            <span className={cx("block h-full rounded-full", barClass)} style={{ width: `${Math.max(3, share * 100)}%` }} />
          </span>
        )}
      </span>
    </button>
  );
}
