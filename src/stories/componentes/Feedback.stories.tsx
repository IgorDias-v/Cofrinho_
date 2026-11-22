import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { Empty, Pill } from "@/components/ui";
import { useStore } from "@/lib/store";
import { withStore } from "../support";

/** Estados vazios e confirmações (toast). */
const meta: Meta = { title: "Componentes/Feedback" };
export default meta;

type EmptyArgs = React.ComponentProps<typeof Empty>;
/** Estado vazio com ação opcional. */
export const Vazio: StoryObj<EmptyArgs> = {
  name: "Empty",
  args: { icon: "card", text: "Nenhum cartão ainda. Cadastre o primeiro para acompanhar a fatura.", action: { label: "Adicionar cartão", onClick: fn() } },
  render: (a) => <div className="w-[380px]"><Empty {...a} /></div>,
};

function ToastDemo() {
  const { toast } = useStore();
  return <Pill tone="dark" primary icon="check" label="Disparar toast" onClick={() => toast("Gasto salvo")} />;
}
/** Toast no topo (aria-live), some em 2,6s. Clique no botão. */
export const Toast: StoryObj = {
  name: "Toasts",
  decorators: [withStore()],
  parameters: { layout: "fullscreen", docs: { story: { inline: false, iframeHeight: 240 } } },
  render: () => <div className="flex h-[240px] items-center justify-center"><ToastDemo /></div>,
};
