"use client";

import { useState } from "react";
import { Icon } from "@/components/Icon";
import { Chips, Field, PrimaryButton, SheetFrame, cx, inputClass } from "@/components/ui";
import { CATEGORIES, CATEGORY_ORDER } from "@/lib/data";
import { brl, money, parseMoney, toDateInput } from "@/lib/format";
import { newId, useStore } from "@/lib/store";
import type { CategoryId, Goal } from "@/lib/types";
import { isDemo } from "@/services/auth";

/** Roteia a folha aberta. */
export function Sheets() {
  const { sheet, closeSheet } = useStore();
  if (!sheet) return null;
  switch (sheet.kind) {
    case "adicionar":
      return <AdicionarSheet key={sheet.txId ?? "new"} txId={sheet.txId} onClose={closeSheet} />;
    case "conta":
      return <ContaSheet onClose={closeSheet} />;
    case "cartao":
      return <CartaoSheet key={sheet.cardId ?? "new"} cardId={sheet.cardId} onClose={closeSheet} />;
    case "teto":
      return <TetoSheet category={sheet.category} onClose={closeSheet} />;
    case "tetoMes":
      return <TetoMesSheet onClose={closeSheet} />;
    case "guardar":
      return <GuardarSheet key={sheet.moveId ?? "new"} goalId={sheet.goalId} moveId={sheet.moveId} initialMode={sheet.mode} onClose={closeSheet} />;
    case "meta":
      return <MetaSheet key={sheet.goalId ?? "new"} goalId={sheet.goalId} onClose={closeSheet} />;
  }
}

/* ───────── Peças comuns ───────── */

function MoneyInput({ id, label, value, onChange, error }: { id: string; label: string; value: string; onChange: (v: string) => void; error?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm text-[#BDBDBD]">{label}</label>
      <div className={cx("flex items-baseline gap-1.5 border-b-2 pb-2 transition-colors", error ? "border-[#FF9E9E]" : "border-esk-lima")}>
        <span className="num text-[28px] text-esk-lima/55">R$</span>
        <input
          id={id}
          inputMode="decimal"
          placeholder="0,00"
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/[^\d,.]/g, ""))}
          aria-invalid={!!error}
          className="num w-full bg-transparent p-0 text-[52px] text-esk-lima caret-esk-lima outline-none placeholder:text-[#3A3A3E]"
        />
      </div>
      {error && (
        <span role="alert" className="flex items-center gap-1.5 text-[13px] text-[#FF9E9E]"><Icon name="alert" size={14} />{error}</span>
      )}
    </div>
  );
}

function Segmented<T extends string>({ value, onChange, options, label }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[]; label: string }) {
  return (
    <div className="flex gap-1 self-start rounded-full bg-esk-surface p-1" role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o.value} type="button" aria-pressed={value === o.value} onClick={() => onChange(o.value)}
          className={cx("h-9 rounded-full px-4 text-sm transition", value === o.value ? "bg-esk-paper text-esk-ink" : "text-esk-muted hover:text-white")}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Botão de apagar com confirmação em linha. */
function DeleteButton({ label, question, onConfirm }: { label: string; question: string; onConfirm: () => void }) {
  const [ask, setAsk] = useState(false);
  return ask ? (
    <div className="flex items-center gap-3 rounded-2xl bg-[#2a1416] p-3 text-sm">
      <span className="flex-1 text-[#FFB4B4]">{question}</span>
      <button type="button" onClick={() => setAsk(false)} className="h-10 rounded-xl px-3 text-esk-muted hover:text-white">Cancelar</button>
      <button type="button" onClick={onConfirm} className="h-10 rounded-xl bg-[#FF9E9E] px-4 font-semibold text-esk-ink">Apagar</button>
    </div>
  ) : (
    <button type="button" onClick={() => setAsk(true)} className="flex h-12 items-center justify-center gap-2 text-sm text-[#FF9E9E] hover:text-[#FFC4C4]">
      <Icon name="trash" size={18} /> {label}
    </button>
  );
}

/* ───────── Adicionar / editar gasto ───────── */

function AdicionarSheet({ txId, onClose }: { txId?: string; onClose: () => void }) {
  const { state, dispatch, toast } = useStore();
  const editing = state.txs.find((t) => t.id === txId);
  const [value, setValue] = useState(editing ? money(editing.amount) : "");
  const [name, setName] = useState(editing?.name ?? "");
  const [category, setCategory] = useState<CategoryId>(editing?.category ?? "alimentacao");
  const [method, setMethod] = useState(editing?.method ?? state.cards[state.cards.length - 1]?.id ?? "pix");
  const [date, setDate] = useState(toDateInput(editing?.date ?? new Date().toISOString()));
  const [kind, setKind] = useState<"gasto" | "entrada">(editing?.income ? "entrada" : "gasto");
  const [error, setError] = useState("");
  const income = kind === "entrada";

  function save() {
    const amount = parseMoney(value);
    if (!amount || amount <= 0) return setError(income ? "Digite o valor recebido." : "Digite o valor da compra.");
    if (amount > 1_000_000) return setError("Valor muito alto. Confira os dígitos.");
    const [y, m, d] = date.split("-").map(Number);
    const now = new Date();
    const when = new Date(y, m - 1, d, now.getHours(), now.getMinutes());
    dispatch({
      type: "tx/save",
      tx: {
        id: editing?.id ?? newId(),
        name: name.trim() || (income ? "Entrada" : CATEGORIES[category].label),
        category: income ? "outros" : category,
        method,
        date: when.toISOString(),
        amount,
        income,
        source: editing?.source ?? "manual",
      },
    });
    toast(editing ? "Lançamento atualizado" : income ? "Entrada adicionada" : "Gasto adicionado");
    onClose();
  }

  return (
    <SheetFrame title={editing ? "Editar lançamento" : "Adicionar gasto"} onClose={onClose}>
      <form className="flex flex-col gap-5" onSubmit={(e) => { e.preventDefault(); save(); }}>
        <MoneyInput id="valor" label={income ? "Valor recebido" : "Valor da compra"} value={value} onChange={(v) => { setValue(v); setError(""); }} error={error} />
        <Segmented label="Tipo" value={kind} onChange={(k) => { setKind(k); if (k === "entrada" && !["pix", "dinheiro"].includes(method)) setMethod("pix"); }}
          options={[{ value: "gasto", label: "Gasto" }, { value: "entrada", label: "Entrada" }]} />
        <Field label="Descrição (opcional)">
          <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder={income ? "Salário, freela…" : "Mercado, Uber, Netflix…"} maxLength={40} />
        </Field>
        {!income && (
          <Chips label="Categoria" value={category} onChange={setCategory}
            options={CATEGORY_ORDER.map((c) => ({ value: c, label: CATEGORIES[c].label }))} />
        )}
        <Chips label={income ? "Recebido em" : "Pagamento"} value={method} onChange={setMethod}
          options={[
            ...(income ? [] : [...state.cards].reverse().map((c) => ({ value: c.id, label: c.nickname }))),
            { value: "pix", label: "Pix" },
            { value: "dinheiro", label: "Dinheiro" },
          ]} />
        <Field label="Data">
          <input type="date" className={cx(inputClass, "[color-scheme:dark]")} value={date} onChange={(e) => setDate(e.target.value)} required />
        </Field>
        <PrimaryButton type="submit">{editing ? "Salvar alterações" : income ? "Salvar entrada" : "Salvar gasto"}</PrimaryButton>
        {editing && (
          <DeleteButton label="Apagar lançamento" question={`Apagar “${editing.name}”?`}
            onConfirm={() => { dispatch({ type: "tx/delete", id: editing.id }); toast("Lançamento apagado"); onClose(); }} />
        )}
      </form>
    </SheetFrame>
  );
}

/* ───────── Conta ───────── */

function ContaSheet({ onClose }: { onClose: () => void }) {
  const { state, dispatch, logout, rename, deleteAccount, toast, remote } = useStore();
  const [confirm, setConfirm] = useState(false);
  const [name, setName] = useState(state.user.name);
  const [nameError, setNameError] = useState("");
  const changed = name.trim() !== state.user.name;
  const demo = isDemo(state.user.email);

  return (
    <SheetFrame title="Conta" onClose={onClose}>
      <div className="flex items-center gap-4">
        <span className="flex size-14 items-center justify-center rounded-full bg-esk-lima text-2xl font-extrabold text-esk-ink">{(name.trim() || state.user.name)[0]?.toUpperCase()}</span>
        <div className="min-w-0">
          <p className="text-lg font-bold">{state.user.name}</p>
          <p className="truncate text-sm text-esk-muted">{state.user.email}</p>
        </div>
      </div>
      <form className="flex flex-col gap-3" noValidate onSubmit={(e) => {
        e.preventDefault();
        if (!name.trim()) return setNameError("Digite seu nome.");
        rename(name.trim());
        toast("Nome atualizado");
      }}>
        <Field label="Nome" error={nameError}>
          <input className={inputClass} value={name} onChange={(e) => { setName(e.target.value); setNameError(""); }} maxLength={40} autoComplete="name" />
        </Field>
        {changed && <PrimaryButton type="submit">Salvar nome</PrimaryButton>}
      </form>
      <label className="flex h-14 cursor-pointer items-center justify-between rounded-2xl bg-esk-nav px-4 text-[15px]">
        Ocultar saldo
        <input type="checkbox" role="switch" checked={state.hidden} onChange={() => dispatch({ type: "hidden/toggle" })} className="sr-only" />
        <span aria-hidden="true" className={cx("relative h-7 w-12 rounded-full transition", state.hidden ? "bg-esk-lima" : "bg-esk-track")}>
          <span className={cx("absolute top-1 size-5 rounded-full transition-all", state.hidden ? "left-6 bg-esk-ink" : "left-1 bg-white")} />
        </span>
      </label>
      {demo && !remote && (
        <button type="button" onClick={() => { dispatch({ type: "reset" }); toast("Dados de exemplo restaurados"); onClose(); }} className="h-12 rounded-2xl text-sm text-esk-muted hover:text-white">
          Restaurar dados de exemplo
        </button>
      )}
      {confirm ? (
        <div className="flex flex-col gap-3 rounded-2xl bg-esk-nav p-4">
          <p className="text-[15px]">Deseja sair?</p>
          <div className="flex gap-2">
            <button type="button" onClick={() => setConfirm(false)} className="h-12 flex-1 rounded-xl bg-esk-active text-sm">Cancelar</button>
            <button type="button" onClick={logout} className="h-12 flex-1 rounded-xl bg-white text-sm font-bold text-esk-ink">Sair</button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => setConfirm(true)} className="flex h-14 items-center justify-center gap-2 rounded-2xl border border-esk-track text-[15px] font-semibold hover:bg-white/5">
          <Icon name="logout" size={18} /> Sair
        </button>
      )}
      {!demo && (
        <DeleteButton label="Apagar conta e dados" question="Apagar a conta? Cartões, lançamentos e metas somem e não dá para desfazer."
          onConfirm={() => { deleteAccount(); }} />
      )}
    </SheetFrame>
  );
}

/* ───────── Novo / editar cartão ───────── */

function CartaoSheet({ cardId, onClose }: { cardId?: string; onClose: () => void }) {
  const { state, dispatch, toast } = useStore();
  const editing = state.cards.find((c) => c.id === cardId);
  const [nickname, setNickname] = useState(editing?.nickname ?? "");
  const [last4, setLast4] = useState(editing?.last4 ?? "");
  const [limit, setLimit] = useState(editing ? money(editing.limit) : "");
  const [fatura, setFatura] = useState(editing ? money(editing.faturaBase) : "");
  const [due, setDue] = useState(String(editing?.dueInDays ?? 10));
  const [color, setColor] = useState<"ciano" | "lima" | "menta">(editing?.color ?? "lima");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function save() {
    const e: Record<string, string> = {};
    const nick = nickname.trim();
    if (!nick) e.nickname = "Dê um apelido ao cartão.";
    else if (state.cards.some((c) => c.id !== editing?.id && c.nickname.toLowerCase() === nick.toLowerCase())) e.nickname = "Já existe um cartão com esse apelido.";
    if (!/^\d{4}$/.test(last4)) e.last4 = "Digite os 4 últimos números.";
    const lim = parseMoney(limit);
    if (!lim || lim <= 0) e.limit = "Digite o limite.";
    const base = fatura ? parseMoney(fatura) : 0;
    if (Number.isNaN(base) || base < 0) e.fatura = "Valor inválido.";
    const dueN = Number(due);
    if (!dueN || dueN < 1 || dueN > 60) e.due = "Entre 1 e 60 dias.";
    setErrors(e);
    if (Object.keys(e).length) return;
    dispatch({
      type: "card/save",
      card: { id: editing?.id ?? newId(), nickname: nick, last4, color, limit: lim, faturaBase: base, dueInDays: dueN },
    });
    toast(editing ? "Cartão atualizado" : "Cartão adicionado");
    onClose();
  }

  return (
    <SheetFrame title={editing ? "Editar cartão" : "Novo cartão"} onClose={onClose}>
      <form className="flex flex-col gap-5" noValidate onSubmit={(ev) => { ev.preventDefault(); save(); }}>
        <Field label="Apelido" error={errors.nickname}>
          <input className={inputClass} value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="Principal, Viagem…" maxLength={20} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Final" error={errors.last4}>
            <input className={inputClass} inputMode="numeric" value={last4} onChange={(e) => setLast4(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="0000" />
          </Field>
          <Field label="Vence em (dias)" error={errors.due}>
            <input className={inputClass} inputMode="numeric" value={due} onChange={(e) => setDue(e.target.value.replace(/\D/g, "").slice(0, 2))} />
          </Field>
        </div>
        <Field label="Limite (R$)" error={errors.limit}>
          <input className={inputClass} inputMode="decimal" value={limit} onChange={(e) => setLimit(e.target.value)} placeholder="3.000,00" />
        </Field>
        <Field label="Fatura já aberta, fora do app (R$)" error={errors.fatura}>
          <input className={inputClass} inputMode="decimal" value={fatura} onChange={(e) => setFatura(e.target.value)} placeholder="0,00" />
        </Field>
        <fieldset className="flex flex-col gap-2.5">
          <legend className="kicker mb-2.5 !text-[13px]">Cor</legend>
          <div className="flex gap-3">
            {(["lima", "ciano", "menta"] as const).map((c) => (
              <button key={c} type="button" aria-label={{ lima: "Arte lima", ciano: "Arte iridescente", menta: "Arte aurora" }[c]} aria-pressed={color === c} onClick={() => setColor(c)}
                className={cx("size-12 rounded-full ring-offset-2 ring-offset-esk-sheet transition", { lima: "art-lime", ciano: "art-iris", menta: "art-aurora" }[c], color === c && "ring-2 ring-white")} />
            ))}
          </div>
        </fieldset>
        <PrimaryButton type="submit">{editing ? "Salvar alterações" : "Salvar cartão"}</PrimaryButton>
        {editing && (
          <DeleteButton label="Apagar cartão" question={`Apagar o ${editing.nickname}? As compras ficam no histórico.`}
            onConfirm={() => { dispatch({ type: "card/delete", id: editing.id }); toast("Cartão apagado"); onClose(); }} />
        )}
      </form>
    </SheetFrame>
  );
}

/* ───────── Teto da categoria e do mês ───────── */

function TetoSheet({ category, onClose }: { category: CategoryId; onClose: () => void }) {
  const { d, dispatch, toast } = useStore();
  const b = d.budgets.find((x) => x.category === category);
  const [value, setValue] = useState(b?.cap ? money(b.cap) : "");
  const [error, setError] = useState("");
  return (
    <SheetFrame title={`Teto · ${CATEGORIES[category].label}`} onClose={onClose}>
      <form className="flex flex-col gap-5" onSubmit={(e) => {
        e.preventDefault();
        const cap = parseMoney(value);
        if (!cap || cap <= 0) return setError("Digite um teto maior que zero.");
        dispatch({ type: "budget/set", category, cap });
        toast("Teto atualizado");
        onClose();
      }}>
        <MoneyInput id="teto" label="Teto do mês para a categoria" value={value} onChange={(v) => { setValue(v); setError(""); }} error={error} />
        <p className="text-sm text-esk-muted">Gasto até agora: <span className="text-white">{brl(b?.spent ?? 0)}</span></p>
        <PrimaryButton type="submit">Salvar teto</PrimaryButton>
        {!!b?.cap && (
          <DeleteButton label="Remover teto" question={`Remover o teto de ${CATEGORIES[category].label}?`}
            onConfirm={() => { dispatch({ type: "budget/set", category, cap: 0 }); toast("Teto removido"); onClose(); }} />
        )}
      </form>
    </SheetFrame>
  );
}

function TetoMesSheet({ onClose }: { onClose: () => void }) {
  const { state, d, dispatch, toast } = useStore();
  const [value, setValue] = useState(state.monthCap ? money(state.monthCap) : "");
  const [error, setError] = useState("");
  return (
    <SheetFrame title="Teto do mês" onClose={onClose}>
      <form className="flex flex-col gap-5" onSubmit={(e) => {
        e.preventDefault();
        const cap = parseMoney(value);
        if (!cap || cap <= 0) return setError("Digite um teto maior que zero.");
        dispatch({ type: "monthCap/set", cap });
        toast("Teto do mês salvo");
        onClose();
      }}>
        <MoneyInput id="teto-mes" label="Quanto quer gastar no mês, no total" value={value} onChange={(v) => { setValue(v); setError(""); }} error={error} />
        <p className="text-sm text-esk-muted">Gasto até agora: <span className="text-white">{brl(d.monthTotal)}</span></p>
        <PrimaryButton type="submit">Salvar teto</PrimaryButton>
        {!!state.monthCap && (
          <DeleteButton label="Remover teto do mês" question="Remover o teto do mês?"
            onConfirm={() => { dispatch({ type: "monthCap/set", cap: 0 }); toast("Teto do mês removido"); onClose(); }} />
        )}
      </form>
    </SheetFrame>
  );
}

/* ───────── Guardar / retirar ───────── */

function GuardarSheet({ goalId, moveId, initialMode = "guardar", onClose }: { goalId: string; moveId?: string; initialMode?: "guardar" | "retirar"; onClose: () => void }) {
  const { state, d, dispatch, toast } = useStore();
  const goal = state.goals.find((g) => g.id === goalId);
  const editing = state.goalMoves.find((m) => m.id === moveId);
  const [mode, setMode] = useState<"guardar" | "retirar">(editing ? (editing.amount < 0 ? "retirar" : "guardar") : initialMode);
  const [value, setValue] = useState(editing ? money(Math.abs(editing.amount)) : "500,00");
  const [date, setDate] = useState(toDateInput(editing?.date ?? new Date().toISOString()));
  const [error, setError] = useState("");
  if (!goal) return null;

  function save() {
    const amount = parseMoney(value);
    if (!amount || amount <= 0) return setError("Digite um valor.");
    const signed = mode === "guardar" ? amount : -amount;
    const delta = signed - (editing?.amount ?? 0);
    // limites considerando o que este movimento já tinha feito
    if (goal!.saved + delta < 0) return setError(`Você tem ${brl(goal!.saved - (editing?.amount ?? 0))} para retirar.`);
    if (delta > d.balance) return setError(`Seu saldo é ${brl(d.balance)}.`);
    const [y, m, dd] = date.split("-").map(Number);
    const now = new Date();
    dispatch({
      type: "move/save",
      move: { id: editing?.id ?? newId(), goalId: goal!.id, amount: signed, date: new Date(y, m - 1, dd, now.getHours(), now.getMinutes()).toISOString() },
    });
    toast(editing ? "Movimento atualizado" : mode === "guardar" ? `${brl(amount)} guardado em ${goal!.name}` : `${brl(amount)} voltou para o saldo`);
    onClose();
  }

  return (
    <SheetFrame title={editing ? `Editar movimento · ${goal.name}` : goal.name} onClose={onClose}>
      <form className="flex flex-col gap-5" onSubmit={(e) => { e.preventDefault(); save(); }}>
        <MoneyInput id="guardar" label={mode === "guardar" ? "Quanto guardar" : "Quanto retirar"} value={value} onChange={(v) => { setValue(v); setError(""); }} error={error} />
        <Segmented label="Ação" value={mode} onChange={(m) => { setMode(m); setError(""); }}
          options={[{ value: "guardar", label: "Guardar" }, { value: "retirar", label: "Retirar" }]} />
        {!editing && (
          <div className="flex flex-wrap gap-2">
            {[100, 250, 500, 1000].map((v) => (
              <button key={v} type="button" onClick={() => { setValue(money(v)); setError(""); }} className="h-10 rounded-xl border border-[#2A2A2A] bg-esk-nav px-3.5 text-sm text-[#E6E6E6] hover:border-[#444]">
                {brl(v).replace(",00", "")}
              </button>
            ))}
          </div>
        )}
        <Field label="Data">
          <input type="date" className={cx(inputClass, "[color-scheme:dark]")} value={date} onChange={(e) => setDate(e.target.value)} required />
        </Field>
        <p className="text-sm text-esk-muted">Já guardado: <span className="text-white">{brl(goal.saved)}</span> de {brl(goal.target)}</p>
        <PrimaryButton type="submit">{editing ? "Salvar alterações" : mode === "guardar" ? "Guardar" : "Retirar"}</PrimaryButton>
        {editing && (
          <DeleteButton label="Apagar movimento" question={editing.amount > 0 ? `Apagar? ${brl(editing.amount)} volta para o saldo.` : `Apagar? ${brl(-editing.amount)} volta para a meta.`}
            onConfirm={() => { dispatch({ type: "move/delete", id: editing.id }); toast("Movimento apagado"); onClose(); }} />
        )}
      </form>
    </SheetFrame>
  );
}

/* ───────── Nova / editar meta ───────── */

const GOAL_ICONS: { value: Goal["icon"]; label: string }[] = [
  { value: "plane", label: "Viagem" },
  { value: "shield", label: "Reserva" },
  { value: "book", label: "Estudo" },
  { value: "car", label: "Carro" },
  { value: "target", label: "Outro" },
];

function MetaSheet({ goalId, onClose }: { goalId?: string; onClose: () => void }) {
  const { state, dispatch, toast } = useStore();
  const editing = state.goals.find((g) => g.id === goalId);
  const [name, setName] = useState(editing?.name ?? "");
  const [target, setTarget] = useState(editing ? money(editing.target) : "");
  const [due, setDue] = useState(editing?.due ?? "");
  const [icon, setIcon] = useState<Goal["icon"]>(editing?.icon ?? "target");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function save() {
    const e: Record<string, string> = {};
    const t = parseMoney(target);
    if (!name.trim()) e.name = "Dê um nome para a meta.";
    if (!t || t <= 0) e.target = "Digite quanto quer juntar.";
    setErrors(e);
    if (Object.keys(e).length) return;
    dispatch({
      type: "goal/save",
      goal: { id: editing?.id ?? newId(), name: name.trim(), saved: editing?.saved ?? 0, target: t, due: due.trim() || undefined, icon },
    });
    toast(editing ? "Meta atualizada" : "Meta criada");
    onClose();
  }

  return (
    <SheetFrame title={editing ? "Editar meta" : "Nova meta"} onClose={onClose}>
      <form className="flex flex-col gap-5" noValidate onSubmit={(ev) => { ev.preventDefault(); save(); }}>
        <Field label="Nome" error={errors.name}>
          <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="Viagem, reserva, curso…" maxLength={30} />
        </Field>
        <Field label="Valor alvo (R$)" error={errors.target}>
          <input className={inputClass} inputMode="decimal" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="10.000,00" />
        </Field>
        <Field label="Até quando (opcional)">
          <input className={inputClass} value={due} onChange={(e) => setDue(e.target.value)} placeholder="Dez 2027" maxLength={20} />
        </Field>
        <fieldset className="flex flex-col gap-2.5">
          <legend className="kicker mb-2.5 !text-[13px]">Ícone</legend>
          <div className="flex flex-wrap gap-2">
            {GOAL_ICONS.map((o) => (
              <button key={o.value} type="button" aria-label={o.label} aria-pressed={icon === o.value} onClick={() => setIcon(o.value)}
                className={cx("flex size-12 items-center justify-center rounded-full border transition", icon === o.value ? "border-esk-paper bg-esk-paper text-esk-ink" : "border-[#2A2A2A] bg-esk-nav text-[#BDBDBD] hover:border-[#444]")}>
                <Icon name={o.value} size={20} />
              </button>
            ))}
          </div>
        </fieldset>
        <PrimaryButton type="submit">{editing ? "Salvar alterações" : "Criar meta"}</PrimaryButton>
        {editing && (
          <DeleteButton label="Apagar meta" question={`Apagar “${editing.name}”? ${editing.saved ? `${brl(editing.saved)} volta para o saldo.` : ""}`}
            onConfirm={() => { dispatch({ type: "goal/delete", id: editing.id }); toast("Meta apagada"); onClose(); }} />
        )}
      </form>
    </SheetFrame>
  );
}
