import type { Preview } from "@storybook/nextjs-vite";
import { Inter, Inter_Tight } from "next/font/google";
import "../app/globals.css";
import "../design-tokens/tokens.css";
import { cofrinhoTheme } from "./theme";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const interTight = Inter_Tight({ subsets: ["latin"], variable: "--font-inter-tight", display: "swap" });

const preview: Preview = {
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className={`${inter.variable} ${interTight.variable} font-sans text-esk-text antialiased`}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: "centered",
    controls: { expanded: true, matchers: { color: /(background|color)$/i } },
    docs: { theme: cofrinhoTheme },
    backgrounds: {
      options: {
        canvas: { name: "Canvas (color/bg/canvas)", value: "#0A0A0A" },
        panel: { name: "Painel (color/bg/panel)", value: "#121212" },
        paper: { name: "Papel (color/bg/paper)", value: "#F5F5F3" },
      },
    },
    viewport: {
      options: {
        mobile: { name: "Mobile · 390", styles: { width: "390px", height: "844px" }, type: "mobile" },
        tablet: { name: "Tablet · 800", styles: { width: "800px", height: "1024px" }, type: "tablet" },
        desktop: { name: "Desktop · 1440", styles: { width: "1440px", height: "900px" }, type: "desktop" },
      },
    },
    a11y: { test: "todo" },
    options: {
      storySort: { order: ["Introdução", "Fundamentos", ["Tokens", "Iconografia"], "Componentes", "Aplicação", ["Telas", "Folhas (sheets)"]] },
    },
  },
  initialGlobals: { backgrounds: { value: "canvas" } },
};

export default preview;
