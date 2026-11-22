import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { StoreInitial } from "@/lib/store";
import { AppStory, desktop, mobile, screenParams } from "../support";

/**
 * O app inteiro, navegável, começando em cada tela. Use a barra de viewport para
 * alternar Mobile 390 / Desktop 1440. Dados: conta demo fixa (sem localStorage).
 */
const meta: Meta<{ initial: StoreInitial }> = {
  title: "Aplicação/Telas",
  parameters: screenParams(),
  globals: mobile,
  render: ({ initial }) => <AppStory key={JSON.stringify(initial)} initial={initial} />,
};
export default meta;
type Story = StoryObj<typeof meta>;

const D = { globals: desktop, parameters: screenParams(900) };

export const Login: Story = { args: { initial: { session: null } } };
export const Home: Story = { args: { initial: { view: "home" } } };
export const HomeVazia: Story = { name: "Home · conta nova (vazia)", args: { initial: { view: "home", data: "empty" } } };
export const Cartoes: Story = { name: "Cartões", args: { initial: { view: "cartoes" } } };
export const Metas: Story = { args: { initial: { view: "metas" } } };
export const Objetivos: Story = { args: { initial: { view: "objetivos" } } };
export const Fatura: Story = { name: "Importar fatura", args: { initial: { view: "fatura" } } };
export const Assistente: Story = { args: { initial: { view: "assistente" } } };

export const LoginDesktop: Story = { ...D, name: "Login · desktop", args: Login.args };
export const HomeDesktop: Story = { ...D, name: "Home · desktop", args: Home.args };
export const CartoesDesktop: Story = { ...D, name: "Cartões · desktop", args: Cartoes.args };
export const MetasDesktop: Story = { ...D, name: "Metas · desktop", args: Metas.args };
export const ObjetivosDesktop: Story = { ...D, name: "Objetivos · desktop", args: Objetivos.args };
export const FaturaDesktop: Story = { ...D, name: "Importar fatura · desktop", args: Fatura.args };
export const AssistenteDesktop: Story = { ...D, name: "Assistente · desktop", args: Assistente.args };
