"use client";

import { useState } from "react";
import { Icon } from "@/components/Icon";
import { BackTitle, CARD_BG, CardArt, CardDots, CircleButton, Empty, Hero, Main, Money, Panel, Pill, Row, SectionHead, Ticks, TopBar, cx } from "@/components/ui";
import { MerchantIcon } from "@/components/Merchant";
import { CATEGORIES } from "@/lib/data";
import { brl, relativeDay } from "@/lib/format";
import { useStore } from "@/lib/store";

const STEP = 22;   // quanto cada cartão de trás sobe
const CARD_H = 214;

/** Carteira: pilha em baralho, limite em segmentos, próximas faturas e compras do cartão da frente. */
export function Cartoes() {
  const { state, d, go, openSheet } = useStore();
  const hidden = state.hidden;
  // ordem da pilha: último = cartão da frente
  const [order, setOrder] = useState<string[]>(() => d.cards.map((c) => c.id));
  const ids = [...order.filter((id) => d.cards.some((c) => c.id === id)), ...d.cards.filter((c) => !order.includes(c.id)).map((c) => c.id)];
  const all = ids.map((id) => d.cards.find((c) => c.id === id)!);
  const stack = all.slice(-3);
  const front = stack[stack.length - 1];
  const bringToFront = (id: string) => setOrder([...ids.filter((x) => x !== id), id]);

  const frontTxs = front ? d.recent.filter((t) => !t.income && t.method === front.id) : [];
  const due = [...d.cards].sort((a, b) => a.dueInDays - b.dueInDays);
  const totalFaturas = d.cards.reduce((s, c) => s + c.fatura, 0);

  return (
    <>
      <Hero className="gap-5">
        <TopBar
          left={<BackTitle title="Meus cartões" />}
          right={<CircleButton icon="plus" label="Novo cartão" onClick={() => openSheet({ kind: "cartao" })} />}
        />

        {!front ? (
          <button
            type="button"
            onClick={() => openSheet({ kind: "cartao" })}
            className="flex h-[214px] w-full flex-col items-start justify-between rounded-[28px] border-2 border-dashed border-esk-ink/25 p-5 text-left transition hover:border-esk-ink md:max-w-[460px]"
          >
            <span className="flex size-11 items-center justify-center rounded-full bg-esk-ink text-esk-paper"><Icon name="plus" /></span>
            <span>
              <span className="display block text-lg font-semibold">Cadastre seu primeiro cartão</span>
              <span className="block text-sm text-esk-paper-muted">Apelido, final e limite. A fatura você acompanha aqui.</span>
            </span>
          </button>
        ) : (
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:gap-12">
            <div className="w-full md:max-w-[460px]">
              <div className="relative" style={{ height: STEP * (stack.length - 1) + CARD_H }}>
                {stack.map((c, i) => {
                  const depth = stack.length - 1 - i; // 0 = frente
                  const isFront = depth === 0;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      aria-label={isFront ? `${c.nickname}, cartão da frente. Editar` : `Trazer ${c.nickname} para frente`}
                      onClick={() => (isFront ? openSheet({ kind: "cartao", cardId: c.id }) : bringToFront(c.id))}
                      className="absolute inset-x-0 origin-top rounded-[28px] text-left shadow-[0_-8px_24px_rgba(0,0,0,.12)] transition-[transform,opacity] duration-500 [transition-timing-function:cubic-bezier(.2,.8,.2,1)]"
                      style={{
                        top: STEP * (stack.length - 1),
                        height: CARD_H,
                        zIndex: i + 1,
                        transform: `translateY(${-depth * STEP}px) scale(${1 - depth * 0.06})`,
                        opacity: 1 - depth * 0.12,
                      }}
                    >
                      <CardArt color={c.color} last4={c.last4} className="h-full rounded-[28px]">
                        <span className="flex h-full flex-col justify-between px-5 py-[18px]">
                          <span className="flex items-center gap-2.5"><CardDots /><span className="text-[15px] font-medium">{c.nickname}</span></span>
                          <span className="flex items-end justify-between">
                            <span>
                              <span className="block text-xs opacity-85">Fatura atual</span>
                              <span className="num block text-[30px] leading-tight"><Money value={c.fatura} hidden={hidden} mask="R$ ••••" /></span>
                            </span>
                            <span className="text-xs opacity-85">Vence em {c.dueInDays} dias</span>
                          </span>
                        </span>
                      </CardArt>
                    </button>
                  );
                })}
              </div>
              {all.length > 1 && (
                <div className="mt-4 flex justify-center gap-1.5" aria-hidden="true">
                  {all.slice(-3).map((c) => (
                    <span key={c.id} className={cx("h-1.5 rounded-full transition-all duration-500", c.id === front.id ? "w-[22px] bg-esk-ink" : "w-1.5 bg-[#C9C9C6]")} />
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-1 flex-col gap-2.5">
              <div className="flex text-sm">
                <span className="text-esk-paper-muted">Limite usado</span>
                <span className="ml-auto font-semibold">{front.used}% · {front.nickname}</span>
              </div>
              <span role="progressbar" aria-label="Limite usado" aria-valuenow={front.used} aria-valuemin={0} aria-valuemax={100}>
                <Ticks key={front.id} pct={front.used} />
              </span>
              <p className="text-sm text-esk-paper-muted">
                {hidden ? "••••" : brl(front.fatura)} de {hidden ? "••••" : brl(front.limit)}
              </p>
              <div className="mt-1 flex flex-wrap gap-2.5">
                <Pill icon="card" label="Editar" ariaLabel="Editar cartão" onClick={() => openSheet({ kind: "cartao", cardId: front.id })} />
                <Pill icon="down" label="Importar fatura" onClick={() => go("fatura")} />
              </div>
            </div>
          </div>
        )}
      </Hero>

      <Main className="grid gap-9 md:grid-cols-[repeat(auto-fit,minmax(400px,1fr))] md:items-start md:gap-6">
        <Panel className="gap-1">
          <SectionHead title="Próximas faturas" />
          {due.length === 0 ? (
            <Empty icon="card" text="Nenhum cartão ainda." action={{ label: "Adicionar cartão", onClick: () => openSheet({ kind: "cartao" }) }} />
          ) : (
            <>
              {due.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => { bringToFront(c.id); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  className="-mx-2 flex w-[calc(100%+16px)] items-center gap-3.5 rounded-2xl px-2 py-2.5 text-left transition hover:bg-white/[.04] md:py-3"
                >
                  <span className={cx("size-11 flex-none rounded-xl", CARD_BG[c.color])} aria-hidden="true" />
                  <span className="min-w-0">
                    <span className="block truncate text-[15px]">{c.nickname}</span>
                    <span className="mt-0.5 block text-[13px] text-esk-muted">Vence em {c.dueInDays} dias · {c.used}%</span>
                  </span>
                  <span className="num ml-auto text-[15px]">{hidden ? "••••" : brl(c.fatura)}</span>
                </button>
              ))}
              <div className="mt-3 flex items-center border-t border-esk-border pt-4 text-[15px]">
                <span className="text-esk-muted">Total das faturas</span>
                <span className="num ml-auto text-xl text-esk-lima"><Money value={totalFaturas} hidden={hidden} mask="••••" /></span>
              </div>
            </>
          )}
        </Panel>

        {front && (
          <Panel className="gap-1">
            <SectionHead title={`Compras · ${front.nickname}`} />
            {frontTxs.length === 0 ? (
              <Empty icon="bag" text={`Nenhuma compra no ${front.nickname} ainda.`} action={{ label: "Adicionar gasto", onClick: () => openSheet({ kind: "adicionar" }) }} />
            ) : (
              frontTxs.slice(0, 6).map((t) => (
                <Row
                  key={t.id}
                  media={<MerchantIcon name={t.name} category={t.category} />}
                  title={t.name}
                  sub={`${CATEGORIES[t.category].label}${t.source === "fatura" ? " · da fatura" : ""}`}
                  value={hidden ? "••••" : `−${brl(t.amount)}`}
                  meta={relativeDay(t.date, d.now)}
                  onClick={() => openSheet({ kind: "adicionar", txId: t.id })}
                />
              ))
            )}
          </Panel>
        )}
      </Main>
    </>
  );
}
