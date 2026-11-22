"use client";

import type { Decorator } from "@storybook/nextjs-vite";
import { BottomNav, Toasts } from "@/components/ui";
import { USER } from "@/lib/data";
import { StoreProvider, useStore, type StoreInitial } from "@/lib/store";
import { Assistente } from "@/screens/Assistente";
import { Auth } from "@/screens/Auth";
import { Cartoes } from "@/screens/Cartoes";
import { Fatura } from "@/screens/Fatura";
import { Home } from "@/screens/Home";
import { Metas } from "@/screens/Metas";
import { Objetivos } from "@/screens/Objetivos";
import { Sheets } from "@/sheets/Sheets";

/**
 * Store real do app com estado fixo (conta demo, sem localStorage).
 * Use em componentes que leem `useStore()` (navegação, folhas, toasts…).
 */
export const withStore =
  (initial: StoreInitial = {}): Decorator =>
  (Story) => (
    <StoreProvider initial={{ session: USER, data: "demo", ...initial }}>
      <Story />
      <Sheets />
      <Toasts />
    </StoreProvider>
  );

/** Reproduz o Shell do app: troca de tela pela navegação, nav inferior, folhas e toasts. */
function Shell() {
  const { view, session } = useStore();
  if (!session)
    return (
      <>
        <Auth />
        <Toasts />
      </>
    );
  return (
    <>
      <div key={view} className="anim-screen">
        {view === "home" && <Home />}
        {view === "cartoes" && <Cartoes />}
        {view === "metas" && <Metas />}
        {view === "objetivos" && <Objetivos />}
        {view === "fatura" && <Fatura />}
        {view === "assistente" && <Assistente />}
      </div>
      <BottomNav />
      <Sheets />
      <Toasts />
    </>
  );
}

/** App completo e navegável a partir de um estado inicial. */
export function AppStory({ initial }: { initial?: StoreInitial }) {
  return (
    <div className="min-h-dvh bg-esk-bg">
      <StoreProvider initial={{ session: USER, data: "demo", ...initial }}>
        <Shell />
      </StoreProvider>
    </div>
  );
}

/** Parâmetros comuns das telas: tela cheia e iframe próprio na página de docs. */
export const screenParams = (height = 844) => ({
  layout: "fullscreen" as const,
  docs: { story: { inline: false, iframeHeight: height } },
});

export const mobile = { viewport: { value: "mobile", isRotated: false } };
export const desktop = { viewport: { value: "desktop", isRotated: false } };

/** Superfície papel (color/bg/paper) atrás do componente — vale também na página de Docs. */
export const onPaper: Decorator = (Story) => (
  <div className="rounded-[28px] bg-esk-paper p-8 text-esk-ink">
    <Story />
  </div>
);
