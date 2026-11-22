"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/Icon";
import { BigBalance, CardArt, CardDots, Empty, Hero, Main, Money, Panel, Pill, Row, SectionHead, TopBar, cx } from "@/components/ui";
import { MerchantIcon } from "@/components/Merchant";
import { CATEGORIES } from "@/lib/data";
import { brl, money, monthLong, relativeDay } from "@/lib/format";
import { useStore } from "@/lib/store";

const DAYS = ["S", "T", "Q", "Q", "S", "S", "D"];
const DAYS_FULL = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

const greeting = (h: number) => (h < 12 ? "Bom dia," : h < 18 ? "Boa tarde," : "Boa noite,");

/** Ghost icon button no topo claro. */
function IconGhost({ icon, label, onClick, className }: { icon: string; label: string; onClick: () => void; className?: string }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} className={cx("flex size-10 items-center justify-center rounded-full text-esk-ink transition hover:bg-esk-ink/[.07]", className)}>
      <Icon name={icon} size={20} />
    </button>
  );
}

export function Home() {
  const { state, d, dispatch, go, openSheet, plus } = useStore();
  const [all, setAll] = useState(false);
  const hidden = state.hidden;
  const month = d.now.getMonth();
  const txs = all ? d.recent : d.recent.slice(0, 5);
  const methodLabel = (m: string) => state.cards.find((c) => c.id === m)?.nickname ?? (m === "pix" ? "Pix" : "Dinheiro");
  const pctVs = d.vsLast === null ? 0 : Math.round(Math.abs(d.vsLast) * 100);

  // Gastos da semana atual (segunda a domingo)
  const todayIdx = (d.now.getDay() + 6) % 7;
  const week = useMemo(() => {
    const monday = new Date(d.now);
    monday.setHours(0, 0, 0, 0);
    monday.setDate(monday.getDate() - todayIdx);
    return Array.from({ length: 7 }, (_, i) => {
      const s = new Date(monday);
      s.setDate(monday.getDate() + i);
      const e = new Date(s);
      e.setDate(s.getDate() + 1);
      const v = state.txs.filter((t) => !t.income && new Date(t.date) >= s && new Date(t.date) < e).reduce((sum, t) => sum + t.amount, 0);
      return { v, future: i > todayIdx };
    });
  }, [state.txs, d.now, todayIdx]);
  const [day, setDay] = useState(todayIdx);
  const maxWeek = Math.max(...week.map((w) => w.v), 1);

  // Assinaturas do mês, sem repetir o mesmo serviço
  const subs = useMemo(() => {
    const seen = new Map<string, number>();
    d.subscriptions.forEach((t) => seen.set(t.name, t.amount));
    return [...seen.entries()].sort((a, b) => b[1] - a[1]);
  }, [d.subscriptions]);

  const cards = [...d.cards].reverse();

  return (
    <>
      <Hero className="gap-[22px]">
        <TopBar
          left={
            <button type="button" onClick={() => openSheet({ kind: "conta" })} className="flex items-center gap-3 text-left" aria-label="Abrir conta">
              <span className="flex size-[42px] items-center justify-center rounded-full bg-esk-ink text-base font-bold text-esk-lima">
                {state.user.name[0]?.toUpperCase()}
              </span>
              <span className="leading-tight">
                <span className="block text-[13px] text-esk-paper-muted">{greeting(d.now.getHours())}</span>
                <span className="block text-[15px] font-semibold">{state.user.name}</span>
              </span>
            </button>
          }
          right={
            <div className="flex gap-0.5">
              <IconGhost icon={hidden ? "eyeOff" : "eye"} label={hidden ? "Mostrar saldo" : "Ocultar saldo"} onClick={() => dispatch({ type: "hidden/toggle" })} />
              {plus && <IconGhost icon="sparkles" label="Abrir assistente" onClick={() => go("assistente")} className="md:hidden" />}
            </div>
          }
        />

        <div className="flex flex-col gap-[22px] md:flex-row md:items-end md:justify-between md:gap-10">
          <div>
            <p className="mb-1.5 text-sm text-esk-paper-muted">Saldo total</p>
            <BigBalance value={d.balance} hidden={hidden} className="text-[44px] md:text-[clamp(56px,6vw,88px)]" />
          </div>
          <nav aria-label="Atalhos" className="anim-screen flex flex-wrap gap-2.5" style={{ animationDelay: "420ms" }}>
            <Pill icon="plus" label="Adicionar" onClick={() => openSheet({ kind: "adicionar" })} />
            {plus && <Pill icon="down" label="Fatura" onClick={() => go("fatura")} />}
            <Pill icon="target" ariaLabel="Metas" onClick={() => go("metas")} />
          </nav>
        </div>
      </Hero>

      <Main className="flex flex-col gap-9 md:gap-6">
        {/* Faturas abertas — cartões com arte */}
        <section className="anim-screen flex flex-col gap-4" style={{ animationDelay: "520ms" }}>
          <SectionHead title="Faturas abertas" action={{ label: "Cartões", onClick: () => go("cartoes") }} />
          <div className="-mx-5 flex snap-x scroll-px-5 gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] md:mx-0 md:px-0">
            {cards.length === 0 && (
              <button
                type="button"
                onClick={() => openSheet({ kind: "cartao" })}
                className="flex h-[236px] w-[188px] flex-none snap-start flex-col justify-between rounded-[26px] border-2 border-dashed border-esk-track p-4 text-left transition hover:border-white"
              >
                <span className="flex size-10 items-center justify-center rounded-full bg-esk-surface"><Icon name="plus" size={18} /></span>
                <span className="text-[15px] font-medium">Cadastrar cartão</span>
              </button>
            )}
            {cards.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => go("cartoes")}
                className="h-[236px] w-[188px] flex-none snap-start rounded-[26px] text-left transition duration-300 hover:-translate-y-1.5 hover:-rotate-1 hover:shadow-[0_18px_40px_rgba(0,0,0,.45)] md:h-[220px] md:w-auto md:min-w-[220px] md:flex-1"
              >
                <CardArt color={c.color} last4={c.last4} digits="left" className="h-full rounded-[26px]">
                  <span className="flex h-full flex-col justify-between p-4">
                    <span className="flex items-center gap-2"><CardDots /><span className="text-sm font-medium">{c.nickname}</span></span>
                    <span className="flex items-end justify-between">
                      <span>
                        <span className="block text-xs opacity-85">Fatura aberta</span>
                        <span className="num block text-[22px]"><Money value={c.fatura} hidden={hidden} format={(v) => `R$ ${money(v)}`} mask="R$ ••••" /></span>
                      </span>
                      <span className="text-[11px] opacity-85">{c.dueInDays} dias</span>
                    </span>
                  </span>
                </CardArt>
              </button>
            ))}
          </div>
        </section>

        <div className="grid gap-9 md:grid-cols-[repeat(auto-fit,minmax(400px,1fr))] md:items-start md:gap-6">
          <Panel className="gap-4">
            <SectionHead title="Este mês" action={{ label: "Metas", onClick: () => go("metas") }} />
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-sm text-esk-muted">Total em {monthLong[month]}</p>
                <p className="num text-[34px] leading-tight text-esk-lima md:text-[40px]"><Money value={d.monthTotal} /></p>
              </div>
              {d.vsLast !== null && (
                <span className={cx("flex h-8 items-center gap-1.5 rounded-full bg-esk-surface px-3 text-[13px]", d.vsLast <= 0 ? "text-esk-lima" : "text-esk-orange")}>
                  <Icon name={d.vsLast <= 0 ? "trendDown" : "trendUp"} size={14} />
                  {pctVs}% vs {monthLong[(month + 11) % 12]}
                </span>
              )}
            </div>

            <div className="rounded-[26px] border border-[#1e1e1e] bg-esk-panel p-4 md:bg-esk-bg">
              <div className="mb-3 flex justify-between text-[13px] text-esk-muted">
                <span>Gastos da semana</span>
                <span className="text-white">{DAYS_FULL[day]} · {brl(week[day].v)}</span>
              </div>
              <div className="grid h-[120px] grid-cols-7 items-end gap-2.5">
                {week.map((w, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setDay(i)}
                    aria-label={`${DAYS_FULL[i]}: ${brl(w.v)}`}
                    aria-pressed={day === i}
                    className="flex h-full items-end"
                  >
                    <span
                      className={cx("anim-grow block w-full rounded-lg transition-colors duration-300", day === i ? "bg-esk-lima" : w.future ? "bg-esk-track" : "bg-esk-paper")}
                      style={{ height: `${Math.max(5, (w.v / maxWeek) * 100)}%`, animationDelay: `${600 + i * 60}ms` }}
                    />
                  </button>
                ))}
              </div>
              <div className="mt-2 grid grid-cols-7 gap-2.5 text-center text-xs">
                {DAYS.map((l, i) => (
                  <span key={i} className={day === i ? "font-semibold text-white" : "text-[#6B6B6B]"}>{l}</span>
                ))}
              </div>
            </div>

            <div>
              {d.byCategory.length === 0 ? (
                <Empty icon="bag" text="Nenhum gasto neste mês." action={{ label: "Adicionar gasto", onClick: () => openSheet({ kind: "adicionar" }) }} />
              ) : (
                d.byCategory.slice(0, 3).map((c) => (
                  <Row
                    key={c.category}
                    icon={CATEGORIES[c.category].icon}
                    iconClass={CATEGORIES[c.category].ink}
                    title={CATEGORIES[c.category].label}
                    sub={`${Math.round(c.share * 100)}% dos gastos`}
                    value={brl(c.spent)}
                  />
                ))
              )}
            </div>
          </Panel>

          <div className="flex min-w-0 flex-col gap-9 md:gap-6">
            {subs.length > 0 && (
              <Panel className="gap-3.5">
                <SectionHead title="Assinaturas" />
                <div className="-mx-5 flex gap-2.5 overflow-x-auto px-5 [scrollbar-width:none] md:mx-0 md:flex-wrap md:px-0">
                  {subs.map(([name, amount]) => (
                    <span key={name} className="flex h-14 flex-none items-center gap-2.5 rounded-2xl border border-esk-border bg-esk-surface pl-1.5 pr-[18px]">
                      <MerchantIcon name={name} category="assinaturas" size={42} />
                      <span className="leading-tight">
                        <span className="block text-sm">{name}</span>
                        <span className="block text-xs text-esk-muted">{brl(amount)}/mês</span>
                      </span>
                    </span>
                  ))}
                </div>
              </Panel>
            )}

            <Panel className="gap-1">
              <SectionHead
                title="Transações"
                action={d.recent.length > 5 ? { label: all ? "Ver menos" : "Ver todas", onClick: () => setAll(!all) } : undefined}
              />
              {txs.length === 0 ? (
                <Empty icon="plus" text="Nenhum gasto ainda. Fez uma compra? Digite o valor." action={{ label: "Adicionar gasto", onClick: () => openSheet({ kind: "adicionar" }) }} />
              ) : (
                txs.map((t) => (
                  <Row
                    key={t.id}
                    onClick={() => openSheet({ kind: "adicionar", txId: t.id })}
                    media={<MerchantIcon name={t.name} category={t.category} income={t.income} />}
                    title={t.name}
                    sub={`${t.income ? "Entrada" : CATEGORIES[t.category].label} · ${methodLabel(t.method)}`}
                    value={hidden ? "••••" : `${t.income ? "+" : "−"}${brl(t.amount)}`}
                    valueClass={t.income ? "text-esk-lima" : undefined}
                    meta={relativeDay(t.date, d.now)}
                  />
                ))
              )}
              <div className="mt-3 hidden md:block">
                <button
                  type="button"
                  onClick={() => openSheet({ kind: "adicionar" })}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-white/25 text-[15px] font-medium transition hover:border-white hover:bg-white/5"
                >
                  <Icon name="plus" size={18} />
                  Adicionar gasto
                </button>
              </div>
            </Panel>
          </div>
        </div>
      </Main>
    </>
  );
}
