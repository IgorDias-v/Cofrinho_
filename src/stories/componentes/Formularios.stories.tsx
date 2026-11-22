import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { fn } from "storybook/test";
import { Chips, Field, PrimaryButton, SheetFrame, inputClass } from "@/components/ui";
import { screenParams, withStore } from "../support";

/** Campos, chips de escolha e a moldura das folhas (bottom sheet no mobile, modal no desktop). */
const meta: Meta = { title: "Componentes/Formulários", decorators: [withStore()] };
export default meta;
type Story = StoryObj;

/** Campo com label (kicker) e mensagem de erro com role="alert". */
export const Campo: StoryObj<{ label: string; error: string; placeholder: string }> = {
  name: "Field + inputClass",
  args: { label: "Descrição (opcional)", error: "", placeholder: "Ex.: Mercado" },
  render: ({ label, error, placeholder }) => (
    <div className="w-[360px]">
      <Field label={label} error={error || undefined}>
        <input className={inputClass} placeholder={placeholder} />
      </Field>
    </div>
  ),
};
export const CampoComErro: typeof Campo = { ...Campo, name: "Field · com erro", args: { ...Campo.args, label: "E-mail", error: "Digite um e-mail válido.", placeholder: "voce@email.com" } };

/** Escolha única em chips (aria-pressed). Interativo. */
export const Escolha: Story = {
  name: "Chips",
  render: function Render() {
    const [v, setV] = useState<"principal" | "salario" | "viagem" | "pix" | "dinheiro">("principal");
    return (
      <div className="w-[360px]">
        <Chips
          label="Pagamento"
          value={v}
          onChange={setV}
          options={[
            { value: "principal", label: "Principal" },
            { value: "salario", label: "Salário" },
            { value: "viagem", label: "Viagem" },
            { value: "pix", label: "Pix" },
            { value: "dinheiro", label: "Dinheiro" },
          ]}
        />
      </div>
    );
  },
};

/** Moldura de folha: foco no primeiro campo, Esc fecha, trava o scroll do fundo. */
export const Folha: Story = {
  name: "SheetFrame",
  parameters: screenParams(640),
  render: () => (
    <SheetFrame title="Novo cartão" onClose={fn()}>
      <Field label="Apelido">
        <input className={inputClass} defaultValue="Principal" />
      </Field>
      <Field label="Final do cartão">
        <input className={inputClass} defaultValue="4821" inputMode="numeric" />
      </Field>
      <PrimaryButton>Salvar cartão</PrimaryButton>
    </SheetFrame>
  ),
};
