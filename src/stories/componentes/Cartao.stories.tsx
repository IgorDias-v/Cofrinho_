import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CardArt, CardDots } from "@/components/ui";

type Args = React.ComponentProps<typeof CardArt>;

/**
 * Arte do cartão: gradiente animado + véu de leitura + 4 dígitos finais em contorno.
 * `ciano` = Iris (Principal) · `menta` = Aurora escura (Salário) · `lima` = Lima (Viagem e metas).
 */
const meta: Meta<Args> = {
  title: "Componentes/CardArt",
  component: CardArt,
  args: { color: "ciano", last4: "4821", digits: "right" },
  argTypes: {
    color: { control: "inline-radio", options: ["ciano", "menta", "lima"] },
    digits: { control: "inline-radio", options: ["right", "left", false] },
    children: { control: false },
  },
  render: (a) => (
    <CardArt {...a} className="h-[220px] w-[340px] rounded-[26px]">
      <span className="flex h-full flex-col justify-between p-5">
        <span className="flex items-center justify-between text-[15px] font-medium">
          {a.color === "ciano" ? "Principal" : a.color === "menta" ? "Salário" : "Viagem"} <CardDots />
        </span>
        <span>
          <span className="block text-[13px] opacity-80">Fatura atual</span>
          <span className="num block text-[30px]">R$ 1.284,00</span>
        </span>
      </span>
    </CardArt>
  ),
};
export default meta;
type Story = StoryObj<Args>;

export const Iris: Story = { args: { color: "ciano" } };
export const AuroraEscura: Story = { name: "Aurora escura", args: { color: "menta", last4: "0932" } };
export const Lima: Story = { args: { color: "lima", last4: "7710" } };
export const Todos: Story = {
  render: () => (
    <div className="flex gap-4">
      {(["ciano", "menta", "lima"] as const).map((c) => (
        <CardArt key={c} color={c} last4="4821" className="h-[180px] w-[260px] rounded-[26px]">
          <span className="block p-4 text-sm font-medium">{c === "ciano" ? "Iris" : c === "menta" ? "Aurora escura" : "Lima"}</span>
        </CardArt>
      ))}
    </div>
  ),
};
