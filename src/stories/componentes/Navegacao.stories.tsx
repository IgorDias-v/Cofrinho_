import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BottomNav, DesktopNav } from "@/components/ui";
import { mobile, onPaper, screenParams, withStore } from "../support";

/** Menus ligados à store (`go(view)`): clique para trocar o item ativo. */
const meta: Meta = { title: "Componentes/Navegação" };
export default meta;
type Story = StoryObj;

/** Barra flutuante do celular: vidro fosco, item ativo em círculo papel, Assistente em lima. */
export const NavInferior: Story = {
  name: "BottomNav · mobile",
  decorators: [withStore({ view: "home" })],
  globals: mobile,
  parameters: screenParams(200),
  render: () => <div className="h-[200px]"><BottomNav /></div>,
};

export const NavInferiorMetas: Story = {
  name: "BottomNav · Metas ativa",
  decorators: [withStore({ view: "metas" })],
  globals: mobile,
  parameters: screenParams(200),
  render: () => <div className="h-[200px]"><BottomNav /></div>,
};

/** Menu do desktop: pílula escura sobre o papel + botão do Assistente. */
export const MenuDesktop: Story = {
  name: "DesktopNav",
  decorators: [onPaper, withStore({ view: "cartoes" })],
  render: () => <DesktopNav />,
};
