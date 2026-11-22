import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { BackTitle, BigBalance, CircleButton, Hero, Main, Panel, Pill, Row, SectionHead, TopBar } from "@/components/ui";
import { mobile, onPaper, screenParams, withStore } from "../support";

/** Blocos de página: topo papel (Hero), barra superior, conteúdo, painel e título de seção. */
const meta: Meta = { title: "Componentes/Estrutura", decorators: [withStore()] };
export default meta;
type Story = StoryObj;

/** Topo claro com cantos inferiores 36/44. No desktop, a TopBar mostra o menu em pílula. */
export const TopoPapel: Story = {
  name: "Hero + TopBar",
  parameters: screenParams(420),
  render: () => (
    <Hero>
      <TopBar
        left={<span className="flex size-11 items-center justify-center rounded-full bg-esk-ink text-sm font-semibold text-esk-paper">L</span>}
        title={<span className="text-[15px] leading-tight"><span className="block text-esk-paper-muted">Bom dia,</span>Lucas</span>}
        right={<CircleButton icon="eye" label="Ocultar saldo" />}
      />
      <div>
        <p className="text-sm text-esk-paper-muted">Saldo total</p>
        <BigBalance value={14500} className="mt-2 text-[46px] md:text-[84px]" />
      </div>
      <div className="flex gap-2.5">
        <Pill icon="plus" label="Adicionar" primary onClick={fn()} />
        <Pill icon="file" label="Fatura" onClick={fn()} />
      </div>
    </Hero>
  ),
};

export const TopoPapelMobile: Story = { ...TopoPapel, name: "Hero + TopBar · mobile", globals: mobile };

/** Título com botão voltar (usa `back()` da store). */
export const VoltarETitulo: Story = {
  name: "BackTitle",
  decorators: [onPaper],
  render: () => (
    <div className="flex items-center gap-3.5 text-esk-ink">
      <BackTitle title="Meus cartões" />
    </div>
  ),
};

/** Título de seção "Título →" com ação opcional à direita. */
export const TituloDeSecao: StoryObj<React.ComponentProps<typeof SectionHead>> = {
  name: "SectionHead",
  args: { title: "Transações", action: { label: "Ver todas", onClick: fn() } },
  render: (a) => (
    <div className="w-[420px]">
      <SectionHead {...a} />
    </div>
  ),
};

/** No mobile é só o fundo; a partir de 800px vira painel (#121212, borda, raio 28). */
export const Painel: Story = {
  name: "Panel + Main",
  parameters: screenParams(520),
  render: () => (
    <Main className="pb-10">
      <Panel>
        <SectionHead title="Outros objetivos" action={{ label: "Ver todas", onClick: fn() }} />
        <Row icon="shield" title="Reserva" sub="R$ 7.200 de R$ 10.000" value="72%" />
        <Row icon="book" title="Curso" sub="R$ 2.700 de R$ 3.000" value="90%" />
        <Row icon="car" title="Carro novo" sub="R$ 9.600 de R$ 40.000" value="24%" />
      </Panel>
    </Main>
  ),
};
