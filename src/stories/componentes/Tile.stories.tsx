import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { MerchantIcon } from "@/components/Merchant";
import { GLYPHS, Tile } from "@/components/Tile";
import { CATEGORY_ORDER } from "@/lib/data";

/** Bloco escuro (#1C1C1E, raio 16) com ícone do Lucide. Base de todas as linhas de lista. */
const meta: Meta<React.ComponentProps<typeof Tile>> = {
  title: "Componentes/Tile",
  component: Tile,
  args: { icon: "bag", tone: "text-esk-lima", size: 48 },
  argTypes: {
    icon: { control: "select", options: Object.keys(GLYPHS) },
    tone: { control: "select", options: ["text-white", "text-esk-lima", "text-esk-ciano", "text-esk-orange", "text-[#A98BFF]", "text-[#FF6A52]"] },
    size: { control: { type: "range", min: 32, max: 72, step: 4 } },
  },
};
export default meta;

export const Padrao: StoryObj<typeof meta> = { name: "Tile" };

type MArgs = React.ComponentProps<typeof MerchantIcon>;
/** Logo do estabelecimento: marca (Netflix, Uber) → ícone por nome → ícone da categoria. */
export const Estabelecimento: StoryObj<MArgs> = {
  name: "MerchantIcon",
  args: { name: "Netflix", category: "assinaturas", income: false, size: 48 },
  argTypes: { category: { control: "select", options: CATEGORY_ORDER } },
  render: (a) => <MerchantIcon {...a} />,
};
