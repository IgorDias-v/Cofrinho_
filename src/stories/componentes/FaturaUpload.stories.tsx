import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { fn } from "storybook/test";
import { CategoryFilter, InvoiceDropzone, summarizeCategories, type CategoryFilterValue } from "@/components/FaturaUpload";
import type { FaturaItem } from "@/lib/types";

const meta = {
  title: "Componentes/Importar fatura",
  component: InvoiceDropzone,
  parameters: {
    docs: {
      description: {
        component:
          "Área para soltar o PDF da fatura (ou tocar e escolher), com atalhos para tirar foto e usar um exemplo. Ao lado, `CategoryFilter` lista as categorias que a leitura encontrou e filtra os lançamentos.",
      },
    },
  },
  args: {
    phase: "escolher",
    pct: 0,
    maxMb: 15,
    onFile: fn(),
    onPickPdf: fn(),
    onTakePhoto: fn(),
    onSample: fn(),
    onCancel: fn(),
    onRetry: fn(),
  },
  argTypes: {
    phase: { control: "inline-radio", options: ["escolher", "lendo", "pronto", "erro"] },
    pct: { control: { type: "range", min: 0, max: 100 } },
  },
  decorators: [(Story) => <div className="max-w-[560px]"><Story /></div>],
} satisfies Meta<typeof InvoiceDropzone>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Escolher: Story = {};
export const Lendo: Story = { args: { phase: "lendo", pct: 46, fileName: "fatura-novembro.pdf" } };
export const Pronto: Story = { args: { phase: "pronto", pct: 100, fileName: "fatura-novembro.pdf" } };
export const Erro: Story = { args: { phase: "erro", error: "Arquivo acima de 15 MB." } };

const SAMPLE: FaturaItem[] = [
  { name: "Mercado Pão de Açúcar", amount: 212.4, category: "alimentacao" },
  { name: "iFood", amount: 48.9, category: "alimentacao" },
  { name: "Netflix", amount: 55.9, category: "assinaturas", subscription: true },
  { name: "Spotify", amount: 34.9, category: "assinaturas", subscription: true },
  { name: "Uber", amount: 27.4, category: "transporte" },
  { name: "Posto Shell", amount: 150, category: "transporte" },
  { name: "Cinema", amount: 56, category: "lazer" },
  { name: "Farmácia", amount: 64.3, category: "outros" },
];

/** Categorias encontradas: toque para filtrar; toque de novo para limpar. */
export const CategoriasEncontradas: StoryObj = {
  render: () => {
    const [value, setValue] = useState<CategoryFilterValue>("todas");
    return (
      <div className="max-w-[440px] rounded-[28px] border border-[#1e1e1e] bg-esk-panel p-5">
        <CategoryFilter categories={summarizeCategories(SAMPLE)} value={value} onChange={setValue} />
        <p className="mt-4 text-[13px] text-esk-muted">Filtro: {value}</p>
      </div>
    );
  },
};
