"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";
import { Logo } from "@/components/Logo";
import { Field, PrimaryButton, cx, inputClass } from "@/components/ui";
import { getRemember, getSavedEmail, offerToSavePassword, setRemember } from "@/lib/remember";
import { useStore } from "@/lib/store";
import { AuthError, sbSignIn, sbSignUp, signIn, signUp } from "@/services/auth";

type Mode = "login" | "cadastro";
type Errors = Partial<Record<"name" | "email" | "password" | "confirm" | "form", string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function Auth() {
  const [mode, setMode] = useState<Mode>("login");
  return (
    <div className="min-h-dvh md:grid md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] 2xl:grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)] md:gap-6 md:p-6">
      <Brand />
      <div className="flex justify-center px-5 pb-12 pt-7 md:items-center md:px-10 md:py-0">
        <div className="flex w-full max-w-[420px] flex-col gap-7">
          {/* marca como no protótipo: porquinho + nome, centralizados */}
          <div className="flex flex-col items-center gap-2 text-esk-paper">
            <Logo size={56} tile="none" title="" className="anim-pop" />
            <span className="text-[15px] font-semibold">CoFrinho</span>
          </div>
          <Intro mode={mode} onMode={setMode} />
          <div id="auth-painel" role="tabpanel" aria-labelledby={`aba-${mode}`}>
            {mode === "login" ? <LoginForm /> : <SignupForm onSwitch={() => setMode("login")} />}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────── Foto da marca (Figma · Login desktop) ───────── */

function Brand() {
  return (
    <section className="relative flex h-[300px] flex-col justify-end overflow-hidden rounded-b-[32px] bg-esk-surface p-5 md:h-auto md:min-h-[calc(100dvh-48px)] md:rounded-[44px] md:p-12">
      {/* a foto já vem escurecida do Figma (véu preto 63%) */}
      <img src="/login-foto.jpg" alt="" className="absolute inset-0 size-full object-cover object-[50%_30%]" />
      <h1 className="relative ml-auto max-w-[11ch] text-right display text-[34px] font-semibold leading-[0.98] tracking-[-0.05em] text-esk-lima md:max-w-[460px] md:text-[clamp(48px,4.4vw,64px)] 2xl:text-[80px]">
        Seu assistente financeiro para grandes conquistas.
      </h1>
    </section>
  );
}

/* ───────── Título + abas Login / Cadastro ───────── */

const COPY: Record<Mode, string> = { login: "Entrar na sua conta", cadastro: "Criar sua conta" };

function Intro({ mode, onMode }: { mode: Mode; onMode: (m: Mode) => void }) {
  const tabs: { id: Mode; label: string }[] = [{ id: "login", label: "Login" }, { id: "cadastro", label: "Cadastro" }];
  function onKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      const next = mode === "login" ? "cadastro" : "login";
      onMode(next);
      document.getElementById(`aba-${next}`)?.focus();
    }
  }
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="display text-[32px] font-semibold leading-tight text-esk-paper">{COPY[mode]}</h2>
        <p className="mt-2 text-[15px] text-esk-muted">Organize o hoje. Conquiste o que vem depois.</p>
      </div>
      <div role="tablist" aria-label="Entrar ou criar conta" onKeyDown={onKey} className="grid grid-cols-2 gap-1 rounded-full bg-esk-surface p-1.5">
        {tabs.map((t) => (
          <button
            key={t.id}
            id={`aba-${t.id}`}
            type="button"
            role="tab"
            aria-selected={mode === t.id}
            aria-controls="auth-painel"
            tabIndex={mode === t.id ? 0 : -1}
            onClick={() => onMode(t.id)}
            className={cx(
              "h-12 rounded-full text-[15px] font-medium transition-colors",
              mode === t.id ? "bg-esk-lima text-esk-ink" : "text-esk-muted hover:text-white",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ───────── Marca do Google (botão só visual) ───────── */

function GoogleMark() {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

/* ───────── Salvar senha ───────── */

function RememberToggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center gap-3 text-[15px] text-esk-soft">
      <input type="checkbox" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span
        aria-hidden="true"
        className="flex size-6 shrink-0 items-center justify-center rounded-lg border border-[#3a3a3a] bg-esk-surface text-esk-ink transition peer-checked:border-esk-lima peer-checked:bg-esk-lima peer-focus-visible:ring-2 peer-focus-visible:ring-white"
      >
        {checked && <Icon name="check" size={16} />}
      </span>
      <span>
        Salvar senha neste aparelho
        <span className="block text-[13px] text-esk-muted">Você continua conectado ao voltar.</span>
      </span>
    </label>
  );
}

/* ───────── Senha com mostrar/ocultar ───────── */

function PasswordInput({ id, value, onChange, autoComplete, invalid }: { id: string; value: string; onChange: (v: string) => void; autoComplete: string; invalid?: boolean }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        name={id}
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

function LoginForm() {
  const { login, remote, toast } = useStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRememberState] = useState(true);
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);

  // lê a escolha anterior só no navegador (evita diferença com o HTML do servidor)
  useEffect(() => {
    setRememberState(getRemember());
    const saved = getSavedEmail();
    if (saved) setEmail(saved);
  }, []);

  // Acesso só com conta: e-mail e senha obrigatórios.
  async function submit() {
    setErrors({});
    const m = email.trim();
    const e: Errors = {};
    if (!EMAIL.test(m)) e.email = "Confira o e-mail.";
    if (!password) e.password = "Digite sua senha.";
    if (Object.keys(e).length) return setErrors(e);
    setBusy(true);
    setRemember(remember, m); // antes de entrar: decide onde a sessão fica guardada
    try {
      const user = remote ? await sbSignIn(m, password) : await signIn(m, password);
      if (remember) await offerToSavePassword(m, password, user.name);
      await login(user);
    } catch (err) {
      setErrors({ form: err instanceof AuthError ? err.message : "Não deu para entrar. Tente de novo." });
      setBusy(false);
    }
  }

  return (
    <form className="flex flex-col gap-5" noValidate onSubmit={(ev) => { ev.preventDefault(); submit(); }}>
      <FormError text={errors.form} />
      <Field label="E-mail" error={errors.email}>
        <input type="email" name="email" autoComplete="username" inputMode="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!errors.email} />
      </Field>
      <Field label="Senha" error={errors.password}>
        <PasswordInput id="senha" autoComplete="current-password" value={password} onChange={setPassword} invalid={!!errors.password} />
      </Field>
      <RememberToggle checked={remember} onChange={setRememberState} />
      <PrimaryButton type="submit" disabled={busy}>{busy ? "Entrando…" : "Entrar"}</PrimaryButton>
      {/* só visual por enquanto: o login com Google ainda não está ligado no Supabase */}
      <button
        type="button"
        onClick={() => toast("Entrar com Google chega em breve.")}
        className="flex h-14 w-full items-center justify-center gap-2.5 rounded-full border border-[#2a2a2a] text-[15px] font-medium text-esk-paper transition hover:border-[#3a3a3a] hover:bg-esk-surface"
      >
        <GoogleMark />
        Acessar com Google
      </button>
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
  const [remember, setRememberState] = useState(true);
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
    setRemember(remember, m);
    try {
      const { user } = remote ? await sbSignUp(n, m, password) : { user: await signUp(n, m, password) };
      if (remember) await offerToSavePassword(m, password, n);
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
      <FormError text={errors.form} />
      <Field label="Nome" error={errors.name}>
        <input autoComplete="given-name" className={inputClass} value={name} onChange={(e) => setName(e.target.value)} maxLength={40} aria-invalid={!!errors.name} />
      </Field>
      <Field label="E-mail" error={errors.email}>
        <input type="email" name="email" autoComplete="username" inputMode="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!errors.email} />
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
      <RememberToggle checked={remember} onChange={setRememberState} />
      <PrimaryButton type="submit" disabled={busy}>{busy ? "Criando conta…" : "Criar conta"}</PrimaryButton>
      <p className="text-center text-[15px] text-esk-muted">
        Já tem conta?{" "}
        <button type="button" onClick={onSwitch} className="font-semibold text-esk-link hover:text-[#7CF0A8]">Entrar</button>
      </p>
    </form>
  );
}
