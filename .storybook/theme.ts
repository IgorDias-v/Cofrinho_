import { create } from "storybook/theming";

/** Tema do Storybook com a identidade do Cofrinho (tokens semânticos). */
export const cofrinhoTheme = create({
  base: "dark",
  brandTitle: "Cofrinho · Design System",
  brandUrl: "/",
  brandImage: "/brand-storybook.svg",
  colorPrimary: "#D9F59B",
  colorSecondary: "#D9F59B",
  appBg: "#0A0A0A",
  appContentBg: "#121212",
  appPreviewBg: "#0A0A0A",
  appBorderColor: "#222222",
  appBorderRadius: 16,
  textColor: "#FFFFFF",
  textMutedColor: "#8A8A8A",
  textInverseColor: "#0A0A0A",
  barBg: "#121212",
  barTextColor: "#8A8A8A",
  barSelectedColor: "#D9F59B",
  barHoverColor: "#FFFFFF",
  inputBg: "#161616",
  inputBorder: "#262626",
  inputTextColor: "#FFFFFF",
  inputBorderRadius: 16,
  fontBase: '"Inter", system-ui, sans-serif',
  fontCode: 'ui-monospace, "SF Mono", Menlo, monospace',
});
