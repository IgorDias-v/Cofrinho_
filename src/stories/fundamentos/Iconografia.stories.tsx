import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Icon, ICON_NAMES } from "@/components/Icon";
import { Logo } from "@/components/Logo";
import { MerchantIcon } from "@/components/Merchant";
import { GLYPHS, Tile } from "@/components/Tile";
import { CATEGORIES, CATEGORY_ORDER } from "@/lib/data";
import { onPaper } from "../support";

const meta: Meta = { title: "Fundamentos/Iconografia", parameters: { layout: "padded" } };
export default meta;
type Story = StoryObj;

const Label = ({ children }: { children: React.ReactNode }) => <span className="mt-2 block text-center text-xs text-esk-muted">{children}</span>;

/** Ícones de interface (`<Icon name>`): traço 2px, `currentColor`. */
export const IconesDeInterface: Story = {
  name: "Ícones de interface",
  render: () => (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-3">
      {ICON_NAMES.map((n) => (
        <div key={n} className="flex flex-col items-center rounded-2xl border border-esk-border bg-esk-panel p-4 text-white">
          <Icon name={n} />
          <Label>{n}</Label>
        </div>
      ))}
    </div>
  ),
};

/** Tiles de lista (`<Tile icon>`): Lucide sobre bloco #1C1C1E, raio 16. */
export const Tiles: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap gap-4">
        {Object.keys(GLYPHS).map((n) => (
          <div key={n} className="w-20">
            <Tile icon={n} />
            <Label>{n}</Label>
          </div>
        ))}
      </div>
      <div>
        <p className="kicker mb-3">Por categoria (cor = token color/category/*)</p>
        <div className="flex flex-wrap gap-4">
          {CATEGORY_ORDER.map((c) => (
            <div key={c} className="w-24">
              <Tile icon={CATEGORIES[c].icon} tone={CATEGORIES[c].ink} />
              <Label>{CATEGORIES[c].label}</Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
};

/** Logos de estabelecimentos (`<MerchantIcon>`): marcas em texto + Lucide por nome/categoria. */
export const Estabelecimentos: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      {[
        ["Netflix", "assinaturas"], ["Uber", "transporte"], ["Mercado Pão de Açúcar", "alimentacao"], ["Salário", "outros"],
        ["Aluguel", "moradia"], ["Posto Shell · combustível", "transporte"], ["Cinema", "lazer"], ["Academia", "assinaturas"],
        ["iCloud", "assinaturas"], ["Spotify", "assinaturas"], ["iFood", "alimentacao"], ["Farmácia", "outros"], ["Amazon", "outros"],
      ].map(([name, cat]) => (
        <div key={name} className="w-24">
          <MerchantIcon name={name} category={cat as never} income={name === "Salário"} />
          <Label>{name}</Label>
        </div>
      ))}
    </div>
  ),
};

type LogoArgs = React.ComponentProps<typeof Logo>;
/** Marca do Cofrinho (Figma W5, nó 4013:3881). */
export const Marca: StoryObj<LogoArgs> = {
  args: { size: 96, tile: "#0A0A0A", ink: "#F5F5F3", title: "Cofrinho" },
  argTypes: { tile: { control: "color" }, ink: { control: "color" } },
  decorators: [onPaper],
  render: (a) => (
    <div className="flex items-center gap-6">
      <Logo {...a} />
      <Logo size={64} tile="#D9F59B" ink="#0A0A0A" />
      <Logo size={48} tile="none" ink="#0A0A0A" />
    </div>
  ),
};
