"use client";

import { useState } from "react";
import { Icon } from "@/components/Icon";
import { Logo } from "@/components/Logo";
import { CardDots, Field, PrimaryButton, cx, inputClass } from "@/components/ui";
import { useStore } from "@/lib/store";
import { AuthError, sbSignIn, sbSignUp, signIn, signUp } from "@/services/auth";

type Mode = "login" | "cadastro";
type Errors = Partial<Record<"name" | "email" | "password" | "confirm" | "form", string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function Auth() {
  const [mode, setMode] = useState<Mode>("login");
  return (
    <div className="min-h-dvh md:grid md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:gap-6 md:p-6">
      <Brand />
      <div className="flex justify-center px-6 pb-12 pt-8 md:items-center md:px-10 md:py-0">
        <div className="w-full max-w-[420px]">
          {mode === "login" ? <LoginForm onSwitch={() => setMode("cadastro")} /> : <SignupForm onSwitch={() => setMode("login")} />}
        </div>
      </div>
    </div>
  );
}

/* ───────── Lado da marca ───────── */

function Brand() {
  return (
    <section className="relative flex flex-col gap-6 overflow-hidden rounded-b-[36px] bg-esk-paper px-6 pb-9 pt-12 text-esk-ink md:justify-between md:rounded-[44px] md:p-12">
      <div className="flex items-center gap-3">
        <Logo size={48} title="" className="anim-pop" />
        <span className="display text-xl font-semibold">Cofrinho</span>
      </div>
      <h1 className="max-w-[13ch] display text-[38px] font-semibold leading-[1.02] tracking-[-0.04em] md:text-[clamp(44px,4.6vw,68px)]">
        Seu assistente financeiro para grandes conquistas.
      </h1>
      {/* prévia do app, só decorativa */}
      <div aria-hidden="true" className="hidden flex-col gap-3 md:flex">
        <div className="flex max-w-[460px] gap-3">
          <div className="flex h-[120px] flex-1 flex-col rounded-3xl art-iris p-4 text-white">
            <CardDots />
            <span className="mt-auto text-xs">Fatura aberta</span>
            <span className="num text-2xl">1.284,00</span>
          </div>
          <div className="flex h-[120px] flex-1 flex-col rounded-3xl art-aurora p-4 text-esk-paper">
            <CardDots />
            <span className="mt-auto text-xs">Fatura aberta</span>
            <span className="num text-2xl">640,00</span>
          </div>
        </div>
        <div className="flex max-w-[460px] items-center gap-4 rounded-3xl art-lime p-4 text-esk-ink">
          <span className="flex-1">
            <span className="block text-xs">Viagem ao Japão</span>
            <span className="num block text-2xl">R$ 13.600,00</span>
          </span>
          <span className="num flex size-14 items-center justify-center rounded-full border-[6px] border-esk-ink text-sm">68%</span>
        </div>
      </div>
    </section>
  );
}

/* ───────── Senha com mostrar/ocultar ───────── */

function PasswordInput({ id, value, onChange, autoComplete, invalid }: { id: string; value: string; onChange: (v: string) => void; autoComplete: string; invalid?: boolean }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        type={show ? "text" : "password"}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={invalid}
        className={cx(inputClass, "pr-14")}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        aria-label={show ? "Ocultar senha" : "Mostrar senha"}
        className="absolute right-1.5 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-xl text-esk-muted hover:text-white"
      >
        <Icon name={show ? "eyeOff" : "eye"} size={20} />
      </button>
    </div>
  );
}

function FormError({ text }: { text?: string }) {
  if (!text) return null;
  return (
    <p role="alert" className="flex items-center gap-2 rounded-2xl bg-[#2a1416] px-4 py-3 text-sm text-[#FFB4B4]">
      <Icon name="alert" size={16} />
      {text}
    </p>
  );
}

/* ───────── Login ───────── */

function LoginForm({ onSwitch }: { onSwitch: () => void }) {
  const { login, remote } = useStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);

  // Acesso só com conta: e-mail e senha obrigatórios.
  async function submit() {
    setErrors({});
    const m = email.trim();
    const e: Errors = {};
    if (!EMAIL.test(m)) e.email = "Confira o e-mail.";
    if (!password) e.password = "Digite sua senha.";
    if (Object.keys(e).length) return setErrors(e);
    setBusy(true);
    try {
      await login(remote ? await sbSignIn(m, password) : await signIn(m, password));
    } catch (err) {
      setErrors({ form: err instanceof AuthError ? err.message : "Não deu para entrar. Tente de novo." });
      setBusy(false);
    }
  }

  return (
    <form className="flex flex-col gap-5" noValidate onSubmit={(ev) => { ev.preventDefault(); submit(); }}>
      <div>
        <h2 className="display text-[28px] font-semibold">Entrar</h2>
        <p className="mt-1 text-[15px] text-esk-muted">Use seu e-mail e senha.</p>
      </div>
      <FormError text={errors.form} />
      <Field label="E-mail" error={errors.email}>
        <input type="email" autoComplete="email" inputMode="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!errors.email} />
      </Field>
      <Field label="Senha" error={errors.password}>
        <PasswordInput id="senha" autoComplete="current-password" value={password} onChange={setPassword} invalid={!!errors.password} />
      </Field>
      <PrimaryButton type="submit" disabled={busy}>{busy ? "Entrando…" : "Entrar"}</PrimaryButton>
      <p className="text-center text-[15px] text-esk-muted">
        Ainda não tem conta?{" "}
        <button type="button" onClick={onSwitch} className="font-semibold text-esk-link hover:text-[#7CF0A8]">Criar conta</button>
      </p>
    </form>
  );
}

/* ───────── Cadastro ───────── */

function strength(p: string) {
  let s = 0;
  if (p.length >= 8) s++;
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
  if (/\d/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p) || p.length >= 12) s++;
  return s; // 0–4
}
const STRENGTH = ["Muito fraca", "Fraca", "Razoável", "Boa", "Forte"];

function SignupForm({ onSwitch }: { onSwitch: () => void }) {
  const { login, toast, remote } = useStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const s = strength(password);

  // Cadastro obrigatório: nome, e-mail e senha.
  async function submit() {
    setErrors({});
    const n = name.trim();
    const m = email.trim();
    const e: Errors = {};
    if (!n) e.name = "Digite seu nome.";
    if (!EMAIL.test(m)) e.email = "Confira o e-mail.";
    if (password.length < 6) e.password = "Use pelo menos 6 caracteres.";
    else if (confirm !== password) e.confirm = "As senhas não são iguais.";
    if (Object.keys(e).length) return setErrors(e);
    setBusy(true);
    try {
      const { user } = remote ? await sbSignUp(n, m, password) : { user: await signUp(n, m, password) };
      if (user) {
        await login(user);
        toast("Conta criada. Boas-vindas!");
      } else {
        toast(`Enviamos um link de confirmação para ${m}`);
        setBusy(false);
        onSwitch();
      }
    } catch (err) {
      setErrors({ form: err instanceof AuthError ? err.message : "Não deu para criar a conta. Tente de novo." });
      setBusy(false);
    }
  }

  return (
    <form className="flex flex-col gap-5" noValidate onSubmit={(ev) => { ev.preventDefault(); submit(); }}>
      <div>
        <h2 className="display text-[28px] font-semibold">Criar conta</h2>
        <p className="mt-1 text-[15px] text-esk-muted">Leva menos de um minuto.</p>
      </div>
      <FormError text={errors.form} />
      <Field label="Nome" error={errors.name}>
        <input autoComplete="given-name" className={inputClass} value={name} onChange={(e) => setName(e.target.value)} maxLength={40} aria-invalid={!!errors.name} />
      </Field>
      <Field label="E-mail" error={errors.email}>
        <input type="email" autoComplete="email" inputMode="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!errors.email} />
      </Field>
      <Field label="Senha" error={errors.password}>
        <PasswordInput id="nova-senha" autoComplete="new-password" value={password} onChange={setPassword} invalid={!!errors.password} />
      </Field>
      {password && (
        <div className="-mt-2 flex items-center gap-3" aria-live="polite">
          <div className="flex flex-1 gap-1">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className={cx("h-1.5 flex-1 rounded", i < s ? (s >= 3 ? "bg-esk-lima" : "bg-esk-ciano") : "bg-esk-track")} />
            ))}
          </div>
          <span className="text-xs text-esk-muted">{STRENGTH[s]}</span>
        </div>
      )}
      <Field label="Confirmar senha" error={errors.confirm}>
        <PasswordInput id="confirmar" autoComplete="new-password" value={confirm} onChange={setConfirm} invalid={!!errors.confirm} />
      </Field>
      <PrimaryButton type="submit" disabled={busy}>{busy ? "Criando conta…" : "Criar conta"}</PrimaryButton>
      <p className="text-center text-[15px] text-esk-muted">
        Já tem conta?{" "}
        <button type="button" onClick={onSwitch} className="font-semibold text-esk-link hover:text-[#7CF0A8]">Entrar</button>
      </p>
    </form>
  );
}
