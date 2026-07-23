import Image from "next/image";
import AnimatedSection from "@/components/AnimatedSection";

export interface NosotrosStat {
  value: string;
  /** Usa "\n" para forzar el salto de línea de la etiqueta, como en el diseño. */
  label: string;
}

export interface NosotrosSectionProps {
  eyebrow?: string;
  /** Usa "\n" para forzar el salto de línea del titular, como en el diseño. */
  headline?: string;
  paragraphs?: string[];
  stats?: NosotrosStat[];
  imageSrc?: string;
  imageAlt?: string;
}

const DEFAULT_PARAGRAPHS = [
  "Llevamos tu visión a la realidad con precisión y calidad. Nuestro compromiso con la solidez y con quienes confían en nosotros hace que cada proyecto resista el paso del tiempo.",
  "No buscamos el proyecto más rápido, sino el que siga en pie cuando dejemos de hablar de él. Esa es la diferencia entre construir y dejar huella.",
];

const DEFAULT_STATS: NosotrosStat[] = [
  { value: "4.9", label: "Calificación\nde clientes" },
  { value: "820+", label: "Proyectos\ndesarrollados" },
  { value: "$1.42B", label: "En inversión\nde proyectos" },
  { value: "27", label: "Años de\nexperiencia" },
];

/** Patrón exacto de puntos del icono junto al eyebrow (node 1:196, PixelCluster). */
const PIXEL_CLUSTER_DOTS: Array<[x: number, y: number]> = [
  [0, 0], [12, 0], [24, 0], [48, 0],
  [0, 12], [12, 12], [24, 12], [36, 12], [60, 12],
  [0, 24], [12, 24], [24, 24], [36, 24],
  [0, 36], [12, 36], [24, 36], [36, 36], [48, 36], [60, 36],
];

function PixelCluster({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 68 44"
      className={className}
      aria-hidden
    >
      {PIXEL_CLUSTER_DOTS.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={8} height={8} fill="currentColor" />
      ))}
    </svg>
  );
}

/** Recorte hexagonal exacto, derivado del path del mask SVG que exporta
 * Figma (node 1:232) y convertido a polígono en porcentaje. */
const IMAGE_CLIP_PATH_CLASS =
  "[clip-path:polygon(83.29%_0%,0%_0%,0%_77.41%,16.71%_100%,100%_100%,100%_22.59%)]";

export default function NosotrosSection({
  eyebrow = "Nosotros",
  headline = "La solidez no se promete.\nSe demuestra en cada cimiento",
  paragraphs = DEFAULT_PARAGRAPHS,
  stats = DEFAULT_STATS,
  imageSrc = "/images/nosotros-construccion.jpg",
  imageAlt = "Grúa de construcción trabajando en la estructura de un edificio residencial de Lithos",
}: NosotrosSectionProps) {
  return (
    <section className="relative w-full overflow-hidden bg-ldc-gray">
      {/* xl:min-h contiene la foto absolute (top 440 + height 670 = bottom 1110,
          en px de referencia del frame) más un margen de 82px — a propósito más
          alto que el frame height que da Figma (933px). La foto, al ser
          position:absolute, no empuja el alto natural del contenido de texto
          (que sí cierra en 933px); sin este min-h se repetiría el bug de
          overflow entre secciones ya visto en el Hero. */}
      <div
        className="relative mx-auto max-w-(--frame-max-w) px-6 pt-10 pb-16
          md:px-10 md:pt-14 md:pb-20
          lg:px-11 lg:pt-16
          xl:px-[clamp(3.8241rem,4.4792vw,5.375rem)] xl:pt-[clamp(3.0237rem,3.5417vw,4.25rem)] xl:pb-0
          xl:min-h-[clamp(53.0036rem,62.0833vw,74.5rem)]"
      >
        {/* Eyebrow + regla decorativa (node 1:195, 1:217) */}
        <AnimatedSection>
          <div className="flex items-center gap-4 xl:gap-[clamp(0.8004rem,0.9375vw,1.125rem)]">
            <div className="flex items-end gap-3 xl:gap-[clamp(0.8449rem,0.9896vw,1.1875rem)]">
              <PixelCluster className="h-9 w-14 text-ldc-blue opacity-90 xl:h-[clamp(1.9565rem,2.2917vw,2.75rem)] xl:w-[clamp(3.0237rem,3.5417vw,4.25rem)]" />
              <span className="font-display text-lg leading-none font-medium text-ldc-navy xl:text-[clamp(1.0672rem,1.25vw,1.5rem)]">
                {eyebrow}
              </span>
            </div>
            <div className="h-px flex-1 bg-black/10" />
          </div>
        </AnimatedSection>

        {/* Titular (node 1:193) */}
        <AnimatedSection delay={0.1}>
          <h2 className="mt-4 max-w-md font-display text-4xl leading-[1.05] font-medium whitespace-normal text-ldc-navy sm:max-w-xl sm:text-5xl md:mt-6 md:max-w-2xl md:text-6xl lg:max-w-3xl lg:text-7xl xl:mt-[clamp(2.1344rem,2.5vw,3rem)] xl:max-w-[clamp(74.6142rem,87.3958vw,104.875rem)] xl:text-[clamp(4.9909rem,5.8458vw,7.015rem)] xl:leading-none xl:whitespace-pre-line">
            {headline}
          </h2>
        </AnimatedSection>

        {/* Descripción (node 1:194) */}
        <AnimatedSection delay={0.2}>
          <div className="mt-6 flex max-w-md flex-col gap-4 sm:max-w-lg md:mt-8 md:max-w-xl xl:mt-[clamp(4.1798rem,4.8958vw,5.875rem)] xl:max-w-[clamp(32.7715rem,38.3854vw,46.0625rem)] xl:gap-[clamp(1.2095rem,1.4167vw,1.7rem)]">
            {paragraphs.map((paragraph) => (
              <p
                key={paragraph}
                className="text-base leading-[1.36] text-ldc-ink xl:text-[clamp(0.8893rem,1.0417vw,1.25rem)]"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </AnimatedSection>

        {/* Foto (node 1:231, Mask group) — orden mobile: después de la descripción,
            antes de las stats. En xl: se saca del flujo (absolute) y se posiciona
            a la derecha como en el Figma; al no compartir columna con las stats,
            estas quedan igual de bien alineadas en ambos casos. Clip-path exacto
            derivado del path del mask SVG que exportó Figma (node 1:232),
            convertido a polígono en porcentaje — no es una aproximación a ojo. */}
        <AnimatedSection
          delay={0.3}
          className="mt-10 md:mt-12 xl:mt-0 xl:absolute xl:top-[clamp(19.5651rem,22.9167vw,27.5rem)] xl:right-[clamp(3.9575rem,4.6354vw,5.5625rem)] xl:w-[clamp(40.2863rem,47.1875vw,56.625rem)]"
        >
          <div
            className={`relative aspect-[906/670] w-full xl:h-[clamp(29.7923rem,34.8958vw,41.875rem)] xl:w-full ${IMAGE_CLIP_PATH_CLASS}`}
          >
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              sizes="(min-width: 1366px) 47vw, (min-width: 768px) 80vw, 100vw"
              className="object-cover"
            />
          </div>
        </AnimatedSection>

        {/* Stats (node 1:218). Se queda en flujo normal en todos los breakpoints
            (a diferencia de la foto): al sacar la foto del flujo con xl:absolute,
            las stats simplemente heredan el flujo justo después de la
            descripción con su propio mt, igual que en el Figma (gap de 108px
            entre el párrafo y esta fila). */}
        <AnimatedSection
          delay={0.4}
          className="mt-10 md:mt-12 xl:mt-[clamp(4.8023rem,5.625vw,6.75rem)]"
        >
          <div className="flex flex-wrap gap-x-8 gap-y-6 md:gap-x-12 lg:gap-x-16 xl:gap-x-[clamp(3.5573rem,4.1667vw,5rem)] xl:gap-y-0">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col gap-2 xl:gap-[clamp(0.5336rem,0.625vw,0.75rem)]">
                <p className="font-display text-3xl leading-none font-bold tracking-[-0.02em] text-ldc-ink md:text-4xl lg:text-5xl xl:text-[clamp(2.4901rem,2.9167vw,3.5rem)]">
                  {stat.value}
                </p>
                <p className="font-display text-[10px] leading-[1.5] font-medium whitespace-pre-line text-ldc-blue uppercase tracking-[0.18em] sm:text-xs xl:text-[clamp(0.4891rem,0.5729vw,0.6875rem)]">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
