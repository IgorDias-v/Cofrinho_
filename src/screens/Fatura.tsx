"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/Icon";
import { BackTitle, Hero, Main, Panel, PrimaryButton, Row, SectionHead, TopBar, cx } from "@/components/ui";
import { CategoryFilter, InvoiceDropzone, summarizeCategories, type CategoryFilterValue, type UploadPhase } from "@/components/FaturaUpload";
import { MerchantIcon } from "@/components/Merchant";
import { CATEGORIES, CATEGORY_ORDER } from "@/lib/data";
import { brl } from "@/lib/format";
import { newId, useStore } from "@/lib/store";
import type { CategoryId, FaturaItem, FaturaResult } from "@/lib/types";
import { readInvoice } from "@/services/fatura";
import { importInvoice, saveInvoiceFile } from "@/services/db";

type Phase = UploadPhase;
type Item = FaturaItem & { keep: boolean };
const MAX_MB = 15;

/** Uma tela, três estados: escolher PDF/foto → lendo → encontramos (revisar e confirmar). */
export function Fatura() {
  const { dispatch, go, toast, state, remote, refresh } = useStore();
  const [saving, setSaving] = useState(false);
  const [phase, setPhase] = useState<Phase>("escolher");
  const [file, setFile] = useState<File | null>(null);
  const [pct, setPct] = useState(0);
  const [result, setResult] = useState<FaturaResult | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<CategoryFilterValue>("todas");
  const [cardId, setCardId] = useState(state.cards[state.cards.length - 1]?.id ?? "dinheiro");
  const pdfRef = useRef<HTMLInputElement>(null);
  const photoRef = useRef<HTMLInputElement>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const run = useRef(0);

  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);

  async function read(f: File) {
    if (!/pdf|image/.test(f.type)) return fail("Envie um PDF ou uma foto da fatura.");
    if (f.size > MAX_MB * 1024 * 1024) return fail(`Arquivo acima de ${MAX_MB} MB.`);
    const id = ++run.current;
    setFile(f);
    setPhase("lendo");
    setPct(4);
    setResult(null);
    setFilter("todas");
    if (timer.current) clearInterval(timer.current);
    // progresso suave enquanto lê (vai até 92% e espera a resposta)
    timer.current = setInterval(() => setPct((p) => (p < 92 ? p + Math.max(1, Math.round((92 - p) / 12)) : p)), 250);
    try {
      const r = await readInvoice(f);
      if (id !== run.current) return; // cancelado ou trocado
      setResult(r);
      setItems(r.items.map((i) => ({ ...i, keep: true })));
      setPct(100);
      setPhase("pronto");
    } catch (e) {
      if (id === run.current) fail(e instanceof Error ? e.message : "Não deu para ler a fatura.");
    } finally {
      if (id === run.current && timer.current) clearInterval(timer.current);
    }
  }

  function fail(msg: string) {
    setError(msg);
    setPhase("erro");
  }

  function cancel() {
    run.current++;
    if (timer.current) clearInterval(timer.current);
    setPhase("escolher");
    setFile(null);
    setPct(0);
  }

  const kept = items.filter((i) => i.keep);
  const keptTotal = kept.reduce((s, i) => s + i.amount, 0);
  const subs = kept.filter((i) => i.subscription).length;

  async function confirm() {
    if (!kept.length || saving) return;
    const now = new Date().toISOString();
    if (remote && state.user.id && file && result) {
      // Supabase: guarda o arquivo no storage e cria todos os lançamentos de uma vez
      setSaving(true);
      try {
        const importId = await saveInvoiceFile(file, state.user.id, { total: result.total, dueInDays: result.dueInDays });
        const n = await importInvoice(importId, kept.map(({ name, amount, category }) => ({ name, amount, category })), cardId === "dinheiro" ? null : cardId, now);
        await refresh();
        toast(`${n} lançamentos adicionados`);
        go("home");
      } catch (e) {
        toast(e instanceof Error && e.message ? e.message : "Não deu para importar. Tente de novo.");
        setSaving(false);
      }
      return;
    }
    dispatch({
      type: "tx/import",
      txs: kept.map((i) => ({ id: newId(), name: i.name, category: i.category, amount: i.amount, method: cardId, date: now, source: "fatura" as const })),
    });
    toast(`${kept.length} lançamentos adicionados`);
    go("home");
  }

  const setItem = (k: number, patch: Partial<Item>) => setItems((list) => list.map((it, i) => (i === k ? { ...it, ...patch } : it)));
  const allKept = kept.length === items.length;

  const categories = result ? summarizeCategories(kept) : [];
  const visible = items.map((it, k) => ({ it, k })).filter(({ it }) => filter === "todas" || it.category === filter);
  const ready = phase === "pronto" && result;

  return (
    <>
      <Hero>
        <TopBar left={<BackTitle title="Importar fatura" />} />
        <p className="-mt-2 max-w-[52ch] text-[15px] text-esk-paper-muted md:-mt-4">Envie o PDF ou uma foto. A IA separa compras e categorias, e você confirma antes de entrar.</p>
      </Hero>

      <Main className="grid gap-8 pb-36 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-start md:gap-6 md:pb-16">
        <div className="stagger flex min-w-0 flex-col gap-5">
          <InvoiceDropzone
            phase={phase}
            fileName={file?.name}
            pct={pct}
            error={error}
            maxMb={MAX_MB}
            onFile={read}
            onPickPdf={() => pdfRef.current?.click()}
            onTakePhoto={() => photoRef.current?.click()}
            onSample={() => read(new File(["%PDF-1.4"], "fatura-exemplo.pdf", { type: "application/pdf" }))}
            onCancel={cancel}
            onRetry={() => (file ? read(file) : cancel())}
          />
          <input ref={pdfRef} type="file" accept="application/pdf,image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) read(f); }} />
          <input ref={photoRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) read(f); }} />
          {ready && (
            <label className="flex flex-col gap-2">
              <span className="kicker !text-[13px]">Lançar no cartão</span>
              <select value={cardId} onChange={(e) => setCardId(e.target.value)} className="h-[52px] rounded-[14px] border border-[#2A2A2A] bg-esk-nav px-4 text-[15px] text-white">
                {[...state.cards].reverse().map((c) => (
                  <option key={c.id} value={c.id}>{c.nickname} · **** {c.last4}</option>
                ))}
                <option value="dinheiro">Sem cartão</option>
              </select>
            </label>
          )}
        </div>

        <Panel className="gap-2">
          <SectionHead title="Encontramos" />
          {phase === "lendo" ? (
            <div className="flex flex-col gap-5 pt-2" aria-label="Carregando resultados">
              {[50, 60, 45, 55].map((w, i) => (
                <div key={i} className="flex items-center gap-3.5">
                  <span className="size-10 animate-pulse rounded-[10px] bg-esk-row" />
                  <div className="flex flex-1 flex-col gap-2">
                    <span className="h-3.5 animate-pulse rounded-md bg-esk-row" style={{ width: `${w}%` }} />
                    <span className="h-3 animate-pulse rounded-md bg-esk-row" style={{ width: `${w - 20}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <Row icon="card" title="Compras" sub="Categorizadas automaticamente" value={ready ? kept.length : "—"} />
              <Row icon="repeat" title="Assinaturas" sub="Cobranças recorrentes" value={ready ? subs : "—"} />
              <Row
                icon="sigma"
                title="Total a lançar"
                sub={ready ? (result.dueInDays ? `Fatura de ${brl(result.total)} · vence em ${result.dueInDays} dias` : `Fatura de ${brl(result.total)}`) : "Valor que entra na home"}
                value={ready ? brl(keptTotal) : "—"}
                valueClass={ready ? "text-esk-lima" : "text-esk-muted"}
              />
              {ready ? (
                <div className="mt-5 flex flex-col gap-3">
                  <div className="flex items-center">
                    <h3 className="kicker !text-[13px]">Categorias encontradas</h3>
                    {filter !== "todas" && (
                      <button type="button" onClick={() => setFilter("todas")} className="ml-auto text-sm text-esk-link">Limpar filtro</button>
                    )}
                  </div>
                  <CategoryFilter categories={categories} value={filter} onChange={setFilter} />
                </div>
              ) : (
                <p className="mt-4 text-center text-[13px] text-esk-muted">Envie uma fatura para ver compras, assinaturas e categorias.</p>
              )}
            </>
          )}
        </Panel>

        {ready && (
          <Panel className="gap-1 md:col-span-2">
            <div className="mb-2 flex items-center gap-3">
              <h2 className="kicker">
                Lançamentos{filter !== "todas" && <> · {CATEGORIES[filter].label}</>}
              </h2>
              <span className="text-[13px] text-esk-muted">{visible.length}</span>
              <button type="button" onClick={() => setItems((l) => l.map((i) => ({ ...i, keep: !allKept })))} className="ml-auto text-sm text-esk-link hover:text-[#7CF0A8]">
                {allKept ? "Desmarcar todos" : "Marcar todos"}
              </button>
            </div>
            <ul className="max-h-[440px] overflow-y-auto pr-1 md:grid md:grid-cols-2 md:gap-x-8">
              {visible.map(({ it: i, k }) => (
                <li key={k} className={cx("anim-screen flex items-center gap-3 border-b border-esk-border py-2.5", !i.keep && "opacity-45")}>
                  <input
                    type="checkbox"
                    checked={i.keep}
                    onChange={(e) => setItem(k, { keep: e.target.checked })}
                    aria-label={`Lançar ${i.name}`}
                    className="size-5 flex-none accent-[#D9F59B]"
                  />
                  <MerchantIcon name={i.name} category={i.category} size={40} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] text-esk-soft">{i.name}</span>
                    <span className="mt-0.5 flex items-center gap-2 text-[13px] text-esk-muted">
                      <select
                        value={i.category}
                        onChange={(e) => setItem(k, { category: e.target.value as CategoryId })}
                        aria-label={`Categoria de ${i.name}`}
                        className="rounded-md bg-transparent py-0.5 text-[13px] text-esk-muted hover:text-white"
                      >
                        {CATEGORY_ORDER.map((c) => <option key={c} value={c}>{CATEGORIES[c].label}</option>)}
                      </select>
                      {i.subscription && <span className="rounded-md bg-esk-ciano/15 px-1.5 py-0.5 text-[11px] font-semibold text-esk-ciano">assinatura</span>}
                    </span>
                  </span>
                  <span className="whitespace-nowrap text-[15px] font-semibold">−{brl(i.amount)}</span>
                </li>
              ))}
            </ul>
          </Panel>
        )}
      </Main>

      <div className="fixed inset-x-6 bottom-6 z-30 md:static md:mx-auto md:max-w-[1200px] md:px-8 md:pb-12">
        <PrimaryButton disabled={phase !== "pronto" || kept.length === 0 || saving} onClick={confirm} className="md:max-w-[380px]">
          {saving ? "Salvando…" : phase === "pronto" ? `Confirmar ${kept.length} lançamentos` : "Confirmar lançamentos"}
          <Icon name="upRight" size={18} />
        </PrimaryButton>
      </div>
    </>
  );
}
