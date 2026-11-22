"use client";

import { useState } from "react";
import { Icon } from "@/components/Icon";
import { BackTitle, Bar, CardArt, CircleButton, Empty, Hero, Main, Money, Panel, Pill, Ring, Row, SectionHead, TopBar, cx } from "@/components/ui";
import { brl, brlShort, relativeDay } from "@/lib/format";
import { useStore } from "@/lib/store";

export const goalPct = (g: { saved: number; target: number }) => (g.target ? Math.min(100, Math.round((g.saved / g.target) * 100)) : 0);

/** O que a pessoa está guardando: destaque + lista. Abre a partir de Metas. */
export function Objetivos() {
  const { state, d, openSheet } = useStore();
  const [selected, setSelected] = useState<string | null>(null);
  const featured = state.goals.find((g) => g.id === selected) ?? state.goals[0];
  const others = state.goals.filter((g) => g.id !== featured?.id);
  const totalTarget = state.goals.reduce((s, g) => s + g.target, 0);
  const moves = featured ? state.goalMoves.filter((m) => m.goalId === featured.id).sort((a, b) => +new Date(b.date) - +new Date(a.date)) : [];

  return (
    <>
      <Hero>
        <TopBar
          left={<BackTitle title="Objetivos" />}
          right={<CircleButton icon="plus" label="Nova meta" onClick={() => openSheet({ kind: "meta" })} />}
        />

        {!featured ? (
          <button
            type="button"
            onClick={() => openSheet({ kind: "meta" })}
            className="flex min-h-[170px] w-full flex-col items-start justify-between gap-4 rounded-[28px] border-2 border-dashed border-esk-ink/25 p-5 text-left transition hover:border-esk-ink md:max-w-[560px]"
          >
            <span className="flex size-11 items-center justify-center rounded-full bg-esk-ink text-esk-paper"><Icon name="target" /></span>
            <span>
              <span className="display block text-lg font-semibold">Para que você está guardando?</span>
              <span className="block text-sm text-esk-paper-muted">Crie uma meta: viagem, reserva, curso. Depois é só guardar.</span>
            </span>
          </button>
        ) : (
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:gap-12">
            <CardArt key={featured.id} color="lima" className="anim-pop rounded-[28px] md:max-w-[560px] md:flex-1">
              <span className="flex flex-col gap-3 px-5 py-[18px] md:gap-3.5 md:px-6 md:py-[22px]">
                <span className="flex items-center gap-3 text-[15px] md:text-base">
                  <span className="truncate font-medium">{featured.name}</span>
                  {featured.due && <span className="ml-auto text-[13px] md:text-sm">{featured.due}</span>}
                  <button
                    type="button"
                    onClick={() => openSheet({ kind: "meta", goalId: featured.id })}
                    aria-label={`Editar ${featured.name}`}
                    className={cx("flex h-8 items-center rounded-full bg-esk-ink/10 px-3 text-xs font-semibold transition hover:bg-esk-ink/20", !featured.due && "ml-auto")}
                  >
                    Editar
                  </button>
                </span>
                <span className="flex items-center gap-3 md:gap-4">
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] md:text-sm">Já guardado</span>
                    <span className="num block text-[32px] leading-[1.1] md:text-[44px]"><Money value={featured.saved} /></span>
                    <span className="mt-0.5 block text-xs md:text-[13px]">
                      de {brlShort(featured.target)} · faltam {brlShort(Math.max(0, featured.target - featured.saved))}
                    </span>
                  </span>
                  <Ring pct={goalPct(featured)} size={96} />
                </span>
              </span>
            </CardArt>
            <div className="flex flex-wrap gap-2.5">
              <Pill primary icon="plus" label="Guardar" onClick={() => openSheet({ kind: "guardar", goalId: featured.id, mode: "guardar" })} />
              <Pill icon="downRight" label="Retirar" onClick={() => openSheet({ kind: "guardar", goalId: featured.id, mode: "retirar" })} />
              <Pill icon="target" ariaLabel="Nova meta" onClick={() => openSheet({ kind: "meta" })} />
            </div>
          </div>
        )}
      </Hero>

      <Main className="grid gap-8 md:grid-cols-[repeat(auto-fit,minmax(400px,1fr))] md:items-start md:gap-6">
        <Panel className="gap-1">
          <SectionHead title="Outros objetivos" />
          {others.length === 0 ? (
            <Empty icon="target" text={featured ? "Só uma meta por enquanto." : "Nenhuma meta ainda."} action={{ label: "Criar meta", onClick: () => openSheet({ kind: "meta" }) }} />
          ) : (
            others.map((g) => (
              <div key={g.id} className="flex flex-col">
                <Row
                  icon={g.icon}
                  title={g.name}
                  sub={`${brlShort(g.saved)} de ${brlShort(g.target)}`}
                  value={`${goalPct(g)}%`}
                  onClick={() => { setSelected(g.id); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                />
                <span className="-mt-1 mb-2 pl-[64px]"><Bar pct={goalPct(g)} h="h-1" color="bg-esk-paper" /></span>
              </div>
            ))
          )}
        </Panel>

        {featured && (
          <Panel className="gap-1">
            <SectionHead title={`Movimentações · ${featured.name}`} />
            {moves.length === 0 ? (
              <Empty icon="plus" text="Nenhum movimento ainda. Guarde o primeiro valor." action={{ label: "Guardar", onClick: () => openSheet({ kind: "guardar", goalId: featured.id, mode: "guardar" }) }} />
            ) : (
              moves.map((m) => (
                <Row
                  key={m.id}
                  icon={m.amount > 0 ? "wallet" : "down"}
                  iconClass={m.amount > 0 ? "text-esk-lima" : undefined}
                  title={m.amount > 0 ? "Guardado" : "Retirado"}
                  sub={m.amount > 0 ? "Saiu do saldo para a meta" : "Voltou para o saldo"}
                  value={`${m.amount > 0 ? "+" : "−"}${brl(Math.abs(m.amount))}`}
                  valueClass={m.amount > 0 ? "text-esk-lima" : undefined}
                  meta={relativeDay(m.date, d.now)}
                  onClick={() => openSheet({ kind: "guardar", goalId: featured.id, moveId: m.id })}
                />
              ))
            )}
          </Panel>
        )}

        {state.goals.length > 0 && (
          <Panel className="gap-4">
            <SectionHead title="Resumo" />
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-[20px] bg-esk-surface p-4">
                <p className="text-[13px] text-esk-muted">Total guardado</p>
                <p className="num mt-1 text-2xl text-esk-lima"><Money value={d.totalSaved} /></p>
              </div>
              <div className="rounded-[20px] bg-esk-surface p-4">
                <p className="text-[13px] text-esk-muted">Soma das metas</p>
                <p className="num mt-1 text-2xl">{brlShort(totalTarget)}</p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex text-sm"><span className="text-esk-muted">Progresso geral</span><span className="ml-auto font-semibold">{totalTarget ? Math.round((d.totalSaved / totalTarget) * 100) : 0}%</span></div>
              <Bar pct={totalTarget ? (d.totalSaved / totalTarget) * 100 : 0} h="h-2" color="bg-esk-lima" />
            </div>
          </Panel>
        )}
      </Main>
    </>
  );
}
