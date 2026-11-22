"use client";

import { Icon } from "@/components/Icon";
import { BackTitle, Bar, CardArt, CircleButton, Empty, Hero, Main, Money, Panel, Pill, Ring, Row, SectionHead, Ticks, TopBar, cx } from "@/components/ui";
import { Tile } from "@/components/Tile";
import { CATEGORIES } from "@/lib/data";
import { brl, brlShort } from "@/lib/format";
import { useStore } from "@/lib/store";
import { goalPct } from "./Objetivos";

/** Uma tela para o mês (tetos) e para o que a pessoa está guardando. */
export function Metas() {
  const { state, d, go, openSheet, plus } = useStore();
  const [featured, ...others] = state.goals;
  const hasCap = state.monthCap > 0;
  const usedPct = hasCap ? Math.round((d.monthTotal / state.monthCap) * 100) : 0;

  // Insight (estágio 2): as 2 assinaturas mais caras do mês
  const top2 = [...d.subscriptions].sort((a, b) => b.amount - a.amount).slice(0, 2);
  const insightValue = top2.reduce((s, t) => s + t.amount, 0);

  return (
    <>
      <Hero className="gap-5">
        <TopBar
          left={<BackTitle title="Metas" />}
          right={<CircleButton icon="calendar" label="Ajustar teto do mês" onClick={() => openSheet({ kind: "tetoMes" })} />}
        />
        {hasCap ? (
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:gap-12">
            <div className="md:flex-1">
              <p className="mb-1.5 text-sm text-esk-paper-muted">{d.leftToSpend >= 0 ? "Ainda pode gastar" : "Passou do teto em"}</p>
              <p className="num text-[44px] leading-none md:text-[clamp(56px,6vw,88px)]"><Money value={Math.abs(d.leftToSpend)} fromZero /></p>
              <p className="mt-2 text-[13px] text-esk-paper-muted md:text-sm">de {brlShort(state.monthCap)} · faltam {d.daysLeft} dias</p>
            </div>
            <div className="flex flex-col gap-2.5 md:flex-1">
              <div className="flex text-sm"><span className="text-esk-paper-muted">Usado do teto</span><span className="ml-auto font-semibold">{Math.min(999, usedPct)}%</span></div>
              <Ticks pct={usedPct} />
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => openSheet({ kind: "tetoMes" })} className="flex flex-col items-start gap-2 rounded-[28px] border-2 border-dashed border-esk-ink/25 p-5 text-left transition hover:border-esk-ink md:max-w-[560px]">
            <span className="display text-lg font-semibold">Defina o teto do mês</span>
            <span className="text-sm text-esk-paper-muted">Quanto você quer gastar, no total? Gasto até agora: {brl(d.monthTotal)}.</span>
          </button>
        )}
      </Hero>

      <Main className="flex flex-col gap-9 md:gap-6">
        <section className="flex flex-col gap-3.5">
          <SectionHead title="Este mês" />
          <div className="stagger grid grid-cols-2 gap-3 md:grid-cols-[repeat(auto-fit,minmax(220px,1fr))] md:gap-3.5">
            {d.budgets.map((b) => (
              <button
                key={b.category}
                type="button"
                onClick={() => openSheet({ kind: "teto", category: b.category })}
                aria-label={b.cap ? `${CATEGORIES[b.category].label}: ${b.pct}% do teto. Ajustar teto` : `Definir teto de ${CATEGORIES[b.category].label}`}
                className="flex flex-col gap-4 rounded-[24px] border border-[#1e1e1e] bg-esk-panel p-4 text-left transition hover:border-[#333] md:p-[18px]"
              >
                <span className="flex w-full items-center">
                  <Tile icon={CATEGORIES[b.category].icon} tone={CATEGORIES[b.category].ink} size={44} />
                  {b.cap ? (
                    <span className="num ml-auto text-xl md:text-2xl">{b.pct}%</span>
                  ) : (
                    <span className="ml-auto rounded-full border border-white/25 px-2.5 py-1 text-xs">Definir</span>
                  )}
                </span>
                <span className="text-sm md:text-[15px]">{CATEGORIES[b.category].label}</span>
                <Bar pct={b.pct} color={CATEGORIES[b.category].color} />
              </button>
            ))}
          </div>
        </section>

        <div className="flex flex-col gap-9 md:flex-row md:flex-wrap md:items-stretch md:gap-6">
          <Panel className="gap-4 md:flex-[1.2_1_460px] md:gap-5">
            <SectionHead title="Guardando" action={state.goals.length ? { label: "Ver objetivos", onClick: () => go("objetivos") } : undefined} />
            {featured ? (
              <>
                <button type="button" onClick={() => go("objetivos")} className="rounded-[26px] text-left transition duration-300 hover:-translate-y-1">
                  <CardArt color="lima" className="rounded-[26px]">
                    <span className="flex flex-col gap-3 px-5 py-[18px] md:px-6 md:py-[22px]">
                      <span className="flex w-full text-[15px]">
                        <span className="font-medium">{featured.name}</span>
                        {featured.due && <span className="ml-auto text-[13px]">{featured.due}</span>}
                      </span>
                      <span className="flex w-full items-center gap-3">
                        <span className="min-w-0 flex-1">
                          <span className="block text-[13px]">Já guardado</span>
                          <span className="num block text-[32px] leading-tight md:text-[40px]"><Money value={featured.saved} /></span>
                          <span className="mt-0.5 block text-xs">de {brlShort(featured.target)}</span>
                        </span>
                        <Ring pct={goalPct(featured)} />
                      </span>
                    </span>
                  </CardArt>
                </button>
                <div className="flex flex-wrap gap-2.5">
                  <Pill tone="dark" primary icon="plus" label="Guardar R$ 500" onClick={() => openSheet({ kind: "guardar", goalId: featured.id, mode: "guardar" })} />
                  <Pill tone="dark" icon="downRight" label="Retirar" onClick={() => openSheet({ kind: "guardar", goalId: featured.id, mode: "retirar" })} />
                  <Pill tone="dark" icon="target" ariaLabel="Nova meta" onClick={() => openSheet({ kind: "meta" })} />
                </div>
              </>
            ) : (
              <Empty icon="target" text="Você ainda não está guardando para nada." action={{ label: "Criar meta", onClick: () => openSheet({ kind: "meta" }) }} />
            )}
          </Panel>

          <div className="flex flex-col gap-9 md:flex-[1_1_380px] md:gap-6">
            {others.length > 0 && (
              <Panel className="gap-1">
                <SectionHead title="Outros objetivos" action={{ label: "Ver todas", onClick: () => go("objetivos") }} />
                {others.slice(0, 3).map((g) => (
                  <Row key={g.id} icon={g.icon} title={g.name} sub={`${brlShort(g.saved)} de ${brlShort(g.target)}`} value={`${goalPct(g)}%`}
                    onClick={() => openSheet({ kind: "guardar", goalId: g.id })} />
                ))}
              </Panel>
            )}

            {plus && top2.length >= 2 && (
              <button type="button" onClick={() => go("assistente")} className="rounded-[28px] text-left transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(0,0,0,.45)]">
                <CardArt color="ciano" className="rounded-[28px]">
                  <span className="flex flex-col gap-3.5 p-5 md:p-6">
                    <span className="flex w-full items-center gap-2.5">
                      <Icon name="sparkles" size={18} />
                      <span className="text-[13px] font-semibold tracking-[.06em]">ASSISTENTE COFRINHO</span>
                      <span className="ml-auto flex size-11 items-center justify-center rounded-full bg-esk-lima text-esk-ink">
                        <Icon name="upRight" size={20} />
                      </span>
                    </span>
                    <span className="display text-[22px] font-semibold leading-tight">
                      Cancelando 2 assinaturas, você guarda {brlShort(insightValue)} a mais.
                    </span>
                    <span className="text-sm opacity-90">{top2.map((t) => t.name).join(" e ")} · toque para conversar</span>
                  </span>
                </CardArt>
              </button>
            )}
          </div>
        </div>
      </Main>
    </>
  );
}
