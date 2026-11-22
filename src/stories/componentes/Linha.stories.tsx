import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { MerchantIcon } from "@/components/Merchant";
import { GLYPHS } from "@/components/Tile";
import { Row } from "@/components/ui";

type Args = React.ComponentProps<typeof Row>;

/**
 * Linha de lista: tile/logo à esquerda, título + sub, valor + meta à direita.
 * Com `onClick` vira botão (hover sutil). Espaçamento: gap 16, padding vertical 12.
 */
const meta: Meta<Args> = {
  title: "Componentes/Row",
  component: Row,
  args: { icon: "bag", iconClass: "text-esk-lima", title: "Mercado", sub: "Alimentação · Principal", value: "−R$ 182,40", meta: "Hoje, 10:40" },
  argTypes: {
    icon: { control: "select", options: Object.keys(GLYPHS) },
    iconClass: { control: "select", options: ["text-white", "text-esk-lima", "text-esk-ciano", "text-esk-orange", "text-[#A98BFF]", "text-[#FF6A52]"] },
    media: { control: false },
  },
  decorators: [(S) => <div className="w-[420px]"><S /></div>],
};
export default meta;
type Story = StoryObj<Args>;

export const Padrao: Story = { name: "Com tile" };
export const Clicavel: Story = { name: "Clicável", args: { onClick: fn() } };
export const Entrada: Story = { args: { icon: "wallet", iconClass: "text-white", title: "Salário", sub: "Entrada · Pix", value: "+R$ 6.200,00", valueClass: "text-[#7CF0A8]", meta: "1 nov" } };
export const ComLogo: Story = {
  name: "Com logo do estabelecimento",
  args: { media: <MerchantIcon name="Netflix" category="assinaturas" />, title: "Netflix", sub: "Assinaturas · Principal", value: "−R$ 55,90", meta: "Ontem" },
};
export const SemValor: Story = { name: "Sem valor", args: { value: undefined, meta: undefined, icon: "target", title: "Viagem ao Japão", sub: "Dez 2027" } };

export const Lista: Story = {
  render: () => (
    <div>
      <Row media={<MerchantIcon name="Mercado Pão de Açúcar" category="alimentacao" />} title="Mercado" sub="Alimentação · Principal" value="−R$ 182,40" meta="Hoje" onClick={fn()} />
      <Row media={<MerchantIcon name="Netflix" category="assinaturas" />} title="Netflix" sub="Assinaturas · Principal" value="−R$ 55,90" meta="Ontem" onClick={fn()} />
      <Row media={<MerchantIcon name="Uber" category="transporte" />} title="Uber" sub="Transporte · Salário" value="−R$ 32,00" meta="19 nov" onClick={fn()} />
      <Row media={<MerchantIcon name="Salário" category="outros" income />} title="Salário" sub="Entrada · Pix" value="+R$ 6.200,00" valueClass="text-[#7CF0A8]" meta="1 nov" onClick={fn()} />
    </div>
  ),
};
