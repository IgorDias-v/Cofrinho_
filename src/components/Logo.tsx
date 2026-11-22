import { useId } from "react";

/**
 * Marca do Cofrinho (porquinho em traço). Original no Figma: arquivo W5, nó 4013:3881.
 * `tile` = cor do bloco arredondado ("none" para só o traço); `ink` = cor do traço.
 */
export function Logo({
  size = 44,
  tile = "#0A0A0A",
  ink = "#F5F5F3",
  className,
  title = "Cofrinho",
}: {
  size?: number;
  tile?: string;
  ink?: string;
  className?: string;
  title?: string;
}) {
  // ids únicos: a marca pode aparecer mais de uma vez na mesma tela
  const uid = useId().replace(/:/g, "");
  const m0 = `snout-${uid}`;
  const m1 = `head-${uid}`;
  const snout =
    "M251.75 287.474C239.986 307.85 205.12 309.745 173.876 291.706C142.632 273.668 126.84 242.526 138.605 222.149C150.369 201.772 185.235 199.877 216.479 217.916C247.723 235.955 263.514 267.097 251.75 287.474Z";
  const head =
    "M211.619 60.0457C220.572 60.6831 226.563 79.0132 225.002 100.989C224.777 104.156 224.402 107.225 223.908 110.158C239.291 110.597 255.049 112.849 270.827 117.077C282.955 120.326 294.488 124.582 305.324 129.697C307.987 126.034 311.149 122.319 314.745 118.722C330.323 103.144 348.097 95.66 354.444 102.006C360.791 108.353 353.307 126.127 337.728 141.706C336.276 143.158 334.804 144.539 333.325 145.846C386.877 183.001 415.179 243.389 399.804 300.77C379.212 377.618 288.083 419.969 196.26 395.365C104.437 370.761 46.6924 288.519 67.2836 211.672C81.8817 157.191 131.932 120.049 192.549 111.809C192.26 107.677 192.254 103.26 192.579 98.6845C194.141 76.7085 202.666 59.4096 211.619 60.0457Z";

  return (
    <svg width={size} height={size} viewBox="0 0 480 480" fill="none" role={title ? "img" : undefined} aria-label={title || undefined} aria-hidden={title ? undefined : true} className={className}>
      {tile !== "none" && <rect width="480" height="480" rx="44" fill={tile} />}
      <mask id={m0} fill="white"><path d={snout} /></mask>
      <path d={snout} strokeWidth="32" stroke={ink} mask={`url(#${m0})`} />
      <ellipse cx="176.778" cy="241.607" rx="12.0708" ry="5.68038" transform="rotate(120 176.778 241.607)" fill={ink} />
      <ellipse cx="209.985" cy="260.779" rx="12.0708" ry="5.68038" transform="rotate(120 209.985 260.779)" fill={ink} />
      <mask id={m1} fill="white"><path d={head} /></mask>
      <path d={head} strokeWidth="48" stroke={ink} mask={`url(#${m1})`} />
      <ellipse cx="223.531" cy="185.091" rx="8.86481" ry="11.081" transform="rotate(30 223.531 185.091)" fill={ink} />
      <ellipse cx="260.639" cy="206.514" rx="8.86481" ry="11.081" transform="rotate(30 260.639 206.514)" fill={ink} />
      <path d="M214 337.134C225.777 345.401 250.37 341.268 259.694 334" strokeWidth="18" strokeLinecap="round" stroke={ink} />
      <circle cx="271" cy="109" r="23" strokeWidth="16" stroke={ink} />
      <circle cx="300" cy="60" r="13" strokeWidth="10" stroke={ink} />
    </svg>
  );
}
