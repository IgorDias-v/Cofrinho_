import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { Sheet } from "@/lib/types";
import { AppStory, desktop, mobile, screenParams } from "../support";

/**
 * Cada folha (`src/sheets/Sheets.tsx`) aberta sobre a Home com a conta demo.
 * São interativas: salvar altera os dados da história (não toca no app real).
 */
const meta: Meta<{ sheet: Sheet }> = {
  title: "Aplicação/Folhas (sheets)",
  parameters: screenParams(),
  globals: mobile,
  render: ({ sheet }) => <AppStory key={JSON.stringify(sheet)} initial={{ view: "home", sheet }} />,
};
export default meta;
type Story = StoryObj<typeof meta>;

export const AdicionarGasto: Story = { name: "Adicionar gasto", args: { sheet: { kind: "adicionar" } } };
export const EditarGasto: Story = { name: "Editar gasto", args: { sheet: { kind: "adicionar", txId: "merc" } } };
export const NovoCartao: Story = { name: "Novo cartão", args: { sheet: { kind: "cartao" } } };
export const EditarCartao: Story = { name: "Editar cartão", args: { sheet: { kind: "cartao", cardId: "principal" } } };
export const TetoCategoria: Story = { name: "Teto da categoria", args: { sheet: { kind: "teto", category: "alimentacao" } } };
export const TetoMes: Story = { name: "Teto do mês", args: { sheet: { kind: "tetoMes" } } };
export const Guardar: Story = { args: { sheet: { kind: "guardar", goalId: "japao" } } };
export const Retirar: Story = { args: { sheet: { kind: "guardar", goalId: "japao", mode: "retirar" } } };
export const EditarMovimento: Story = { name: "Editar movimento da meta", args: { sheet: { kind: "guardar", goalId: "japao", moveId: "m1" } } };
export const NovaMeta: Story = { name: "Nova meta", args: { sheet: { kind: "meta" } } };
export const EditarMeta: Story = { name: "Editar meta", args: { sheet: { kind: "meta", goalId: "reserva" } } };
export const Conta: Story = { args: { sheet: { kind: "conta" } } };
export const AdicionarDesktop: Story = { name: "Adicionar gasto · desktop", args: { sheet: { kind: "adicionar" } }, globals: desktop, parameters: screenParams(900) };
