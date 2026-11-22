import {
  ArrowDownLeft,
  BookOpen,
  Bus,
  CarFront,
  CreditCard,
  Gamepad2,
  House,
  Plane,
  Receipt,
  Repeat,
  Shield,
  ShoppingBag,
  Sigma,
  Target,
  Wallet,
  type LucideIcon,
} from "lucide-react";

/** Nomes usados no app → ícones do Lucide. */
export const GLYPHS: Record<string, LucideIcon> = {
  home: House,
  bag: ShoppingBag,
  bus: Bus,
  game: Gamepad2,
  repeat: Repeat,
  card: CreditCard,
  shield: Shield,
  book: BookOpen,
  car: CarFront,
  plane: Plane,
  target: Target,
  sigma: Sigma,
  down: ArrowDownLeft,
  wallet: Wallet,
  receipt: Receipt,
};

/**
 * Bloco escuro arredondado com ícone do Lucide (ou letra).
 * `tone` é a classe de cor do ícone (ex.: "text-esk-lima"); padrão branco.
 */
export function Tile({
  icon,
  letter,
  tone,
  size = 48,
  className,
}: {
  icon?: string;
  letter?: string;
  tone?: string;
  size?: number;
  className?: string;
}) {
  const Icon = GLYPHS[icon ?? ""] ?? Receipt;
  return (
    <span
      aria-hidden="true"
      className={["flex flex-none items-center justify-center rounded-2xl bg-[#1C1C1E]", tone ?? "text-white", className].filter(Boolean).join(" ")}
      style={{ width: size, height: size }}
    >
      {letter ? <span className="text-base font-semibold">{letter}</span> : <Icon size={Math.round(size * 0.46)} strokeWidth={1.75} />}
    </span>
  );
}
