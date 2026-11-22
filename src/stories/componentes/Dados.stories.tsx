import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Bar, BigBalance, Money, Ring, Ticks } from "@/components/ui";
import { onPaper } from "../support";

/** Números e progresso. Todos animam a partir do zero ao montar (respeitam reduced-motion). */
const meta: Meta = { title: "Componentes/Dados e progresso" };
export default meta;

type BigArgs = React.ComponentProps<typeof BigBalance>;
/** Saldo grande: dígitos sobem em sequência; `hidden` desfoca. */
export const Saldo: StoryObj<BigArgs> = {
  name: "BigBalance",
  args: { value: 14500, hidden: false, className: "text-[46px] text-esk-ink" },
  decorators: [onPaper],
  render: (a) => <BigBalance key={a.value} {...a} />,
};

type MoneyArgs = React.ComponentProps<typeof Money>;
/** Valor em reais que conta até o novo número (600ms). Mude `value` para ver a animação. */
export const Dinheiro: StoryObj<MoneyArgs> = {
  name: "Money",
  args: { value: 2340, hidden: false, fromZero: true },
  render: (a) => <span className="num text-[34px] text-esk-lima"><Money {...a} /></span>,
};

type BarArgs = React.ComponentProps<typeof Bar>;
/** Barra fina de progresso (categoria, meta). */
export const Barra: StoryObj<BarArgs> = {
  name: "Bar",
  args: { pct: 62, color: "bg-esk-lima", track: "bg-esk-track", h: "h-1.5" },
  argTypes: {
    pct: { control: { type: "range", min: 0, max: 100 } },
    color: { control: "select", options: ["bg-esk-lima", "bg-esk-paper", "bg-esk-violet", "bg-esk-ciano", "bg-esk-orange", "bg-esk-coral"] },
  },
  render: (a) => <div className="w-[320px]"><Bar key={a.pct} {...a} /></div>,
};

type TicksArgs = React.ComponentProps<typeof Ticks>;
/** Limite usado em segmentos (topo de Metas e Cartões). */
export const Segmentos: StoryObj<TicksArgs> = {
  name: "Ticks",
  args: { pct: 73, count: 20 },
  argTypes: { pct: { control: { type: "range", min: 0, max: 100 } }, count: { control: { type: "range", min: 5, max: 30 } } },
  decorators: [onPaper],
  render: (a) => <div className="w-[360px]"><Ticks key={`${a.pct}-${a.count}`} {...a} /></div>,
};

type RingArgs = React.ComponentProps<typeof Ring>;
/** Anel de progresso da meta (sobre a arte lima). */
export const Anel: StoryObj<RingArgs> = {
  name: "Ring",
  args: { pct: 68, size: 110, ink: "#0A0A0A" },
  argTypes: { pct: { control: { type: "range", min: 0, max: 100 } }, ink: { control: "color" } },
  render: (a) => (
    <div className="art-lime flex size-[180px] items-center justify-center rounded-[26px] text-esk-ink">
      <Ring key={a.pct} {...a} />
    </div>
  ),
};
