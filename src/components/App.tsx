"use client";

import { Assistente } from "@/screens/Assistente";
import { Auth } from "@/screens/Auth";
import { Cartoes } from "@/screens/Cartoes";
import { Fatura } from "@/screens/Fatura";
import { Home } from "@/screens/Home";
import { Metas } from "@/screens/Metas";
import { Objetivos } from "@/screens/Objetivos";
import { Sheets } from "@/sheets/Sheets";
import { StoreProvider, useStore } from "@/lib/store";
import { BottomNav, Toasts } from "./ui";
import { Logo } from "./Logo";

export function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}

function Shell() {
  const { view, ready, session } = useStore();
  if (!ready) return <Loading />;
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

/** Esqueleto enquanto a sessão carrega. */
function Loading() {
  return (
    <div aria-busy="true" aria-label="Carregando" className="min-h-dvh">
      <div className="flex h-[360px] items-center justify-center rounded-b-[36px] bg-esk-paper md:rounded-b-[44px]">
        <Logo size={72} title="Carregando Cofrinho" className="anim-orb" />
      </div>
      <div className="mx-auto flex max-w-[1200px] flex-col gap-4 px-6 pt-8 md:px-8">
        {[60, 80, 70].map((w, i) => (
          <div key={i} className="h-14 animate-pulse rounded-2xl bg-esk-row" style={{ width: `${w}%` }} />
        ))}
      </div>
    </div>
  );
}
