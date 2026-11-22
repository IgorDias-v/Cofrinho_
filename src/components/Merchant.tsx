import {
  BookOpen,
  CarFront,
  Clapperboard,
  Cloud,
  Dumbbell,
  Fuel,
  House,
  Music,
  Package,
  Pill,
  Popcorn,
  Receipt,
  Repeat,
  ShoppingBag,
  Tv,
  UtensilsCrossed,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { CategoryId } from "@/lib/types";

/** Marcas com logo próprio (desenhado em texto, sem imagem). */
const BRANDS: Record<string, React.ReactNode> = {
  netflix: <span className="display inline-block scale-x-[.72] text-[30px] font-bold leading-none text-[#C9B6FF]">N</span>,
  uber: <span className="text-[13px] font-medium tracking-[-0.02em] text-white">Uber</span>,
};

/** Nome do estabelecimento → ícone do Lucide. A ordem importa (primeiro que casar). */
const BY_NAME: [RegExp, LucideIcon][] = [
  [/salario|entrada|freela|pix recebido/, Wallet],
  [/mercado|pao de acucar|padaria|hortifruti/, ShoppingBag],
  [/aluguel|condominio|luz|agua|internet/, House],
  [/combustivel|posto|shell|ipiranga/, Fuel],
  [/cinema|ingresso/, Clapperboard],
  [/academia|smart ?fit/, Dumbbell],
  [/icloud|google one|drive/, Cloud],
  [/spotify|deezer/, Music],
  [/youtube|disney|hbo|prime video|globoplay/, Tv],
  [/ifood|rappi|restaurante|lanche|delivery/, UtensilsCrossed],
  [/farmacia|drogaria/, Pill],
  [/livraria|livro/, BookOpen],
  [/amazon|mercado livre|shopee/, Package],
  [/99|taxi|estacionamento/, CarFront],
];

/** Sem nome reconhecido: ícone pela categoria. */
const BY_CATEGORY: Record<CategoryId, LucideIcon> = {
  moradia: House,
  alimentacao: ShoppingBag,
  transporte: CarFront,
  lazer: Popcorn,
  assinaturas: Repeat,
  outros: Receipt,
};

const normalize = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/** Bloco arredondado escuro com o logo da marca ou um ícone do Lucide. */
export function MerchantIcon({ name, category, income, size = 48 }: { name: string; category: CategoryId; income?: boolean; size?: number }) {
  const key = normalize(name).trim();
  const brand = Object.keys(BRANDS).find((b) => key.includes(b));
  const Icon = income ? Wallet : (BY_NAME.find(([re]) => re.test(key))?.[1] ?? BY_CATEGORY[category]);

  return (
    <span
      aria-hidden="true"
      className="flex flex-none items-center justify-center rounded-2xl bg-[#1C1C1E] text-white"
      style={{ width: size, height: size }}
    >
      {brand ? BRANDS[brand] : <Icon size={Math.round(size * 0.46)} strokeWidth={1.75} />}
    </span>
  );
}
