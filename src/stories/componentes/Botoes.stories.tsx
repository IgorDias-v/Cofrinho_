import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { ICON_NAMES } from "@/components/Icon";
import { CircleButton, Pill, PrimaryButton } from "@/components/ui";
import { onPaper } from "../support";

/** Botões do app. `tone` diz a superfície: "light" = papel, "dark" = canvas escuro. */
const meta: Meta = { title: "Componentes/Botões" };
export default meta;

const icon = { control: "select" as const, options: ICON_NAMES };
const tone = { control: "inline-radio" as const, options: ["light", "dark"] };

type PillArgs = React.ComponentProps<typeof Pill>;
/** Pílula com ícone. Sem `label` vira botão redondo. `primary` = preenchida (uma por grupo). */
export const Pilula: StoryObj<PillArgs> = {
  name: "Pill",
  args: { icon: "plus", label: "Adicionar", primary: true, tone: "light", onClick: fn() },
  argTypes: { icon, tone },
  decorators: [onPaper],
  render: (a) => <Pill {...a} />,
};

export const PilulasNoPapel: StoryObj = {
  name: "Pill · grupo no papel",
  decorators: [onPaper],
  render: () => (
    <div className="flex gap-2.5">
      <Pill icon="plus" label="Adicionar" primary onClick={fn()} />
      <Pill icon="file" label="Fatura" onClick={fn()} />
      <Pill icon="target" ariaLabel="Metas" onClick={fn()} />
    </div>
  ),
};

export const PilulasNoEscuro: StoryObj = {
  name: "Pill · grupo no escuro",
  render: () => (
    <div className="flex gap-2.5">
      <Pill tone="dark" icon="plus" label="Guardar R$ 500" primary onClick={fn()} />
      <Pill tone="dark" icon="down" label="Retirar" onClick={fn()} />
      <Pill tone="dark" icon="target" ariaLabel="Nova meta" onClick={fn()} />
    </div>
  ),
};

type CircleArgs = React.ComponentProps<typeof CircleButton>;
/** Botão redondo só com ícone. `label` vira o nome acessível (aria-label). */
export const BotaoCircular: StoryObj<CircleArgs> = {
  name: "CircleButton",
  args: { icon: "back", label: "Voltar", tone: "light", onClick: fn() },
  argTypes: { icon, tone },
  decorators: [onPaper],
  render: (a) => <CircleButton {...a} />,
};

export const BotaoCircularEscuro: StoryObj<CircleArgs> = {
  name: "CircleButton · escuro",
  args: { icon: "close", label: "Fechar", tone: "dark", onClick: fn() },
  argTypes: { icon, tone },
  render: (a) => <CircleButton {...a} />,
};

type PrimaryArgs = React.ComponentProps<typeof PrimaryButton> & { label: string };
/** CTA de largura total (salvar, entrar, confirmar). */
export const BotaoPrimario: StoryObj<PrimaryArgs> = {
  name: "PrimaryButton",
  args: { label: "Salvar gasto", tone: "dark", disabled: false, onClick: fn() },
  argTypes: { tone },
  render: ({ label, ...a }) => (
    <div className="w-[360px]">
      <PrimaryButton {...a}>{label}</PrimaryButton>
    </div>
  ),
};
