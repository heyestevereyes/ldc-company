import Image from "next/image";
import AnimatedSection from "@/components/AnimatedSection";

export interface NosotrosHighlight {
  text: string;
}

export interface NosotrosSectionProps {
  eyebrow?: string;
  headline?: string;
  paragraphs?: string[];
  /** Frase que introduce la lista de highlights (node 24:5). */
  highlightsIntro?: string;
  /** Items destacados (node 24:23/24:26). Se trata como lista para poder crecer. */
  highlights?: NosotrosHighlight[];
  imageSrc?: string;
  imageAlt?: string;
}

const DEFAULT_PARAGRAPHS = [
  "Lithos Development Company (LDC) es un grupo constructor e inmobiliario dinámico y en constante evolución. Nos distinguimos por un modelo de negocio integral que abarca desde la conceptualización y ejecución de desarrollos residenciales hasta la producción y suministro autónomo de insumos clave a través de nuestras propias divisiones de concretera y bloquera.",
  "Esta estructura nos consolida con todos los elementos necesarios para materializar conceptos urbanos innovadores, garantizando los más altos estándares de seguridad estructural, eficiencia operativa y armonía ambiental en cada etapa constructiva.",
];

const DEFAULT_HIGHLIGHTS_INTRO =
  "A pesar de ser una organización joven, LDC cuenta con un respaldo de sólida experiencia técnica en proyectos de alta complejidad de infraestructura e industriales, entre los que destacan:";

const DEFAULT_HIGHLIGHTS: NosotrosHighlight[] = [
  {
    text: "La construcción de un lago especializado con sistemas de impermeabilización mediante geomembrana en Polotitlán.",
  },
  {
    text: "La edificación de tres naves industriales equipadas con techumbres de arco (arcotecho), optimizando claros libres y tiempos de ejecución.",
  },
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
    <svg viewBox="0 0 68 44" className={className} aria-hidden>
      {PIXEL_CLUSTER_DOTS.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={8} height={8} fill="currentColor" />
      ))}
    </svg>
  );
}

/** Recorte hexagonal exacto, derivado del path del mask SVG que exporta
 * Figma (node 1:232) y convertido a polígono en porcentaje. Las proporciones
 * de los chaflanes no cambiaron al redimensionar la foto, así que el polígono
 * en % es el mismo que la versión anterior del frame. */
const IMAGE_CLIP_PATH_CLASS =
  "[clip-path:polygon(83.29%_0%,0%_0%,0%_77.41%,16.71%_100%,100%_100%,100%_22.59%)]";

export default function NosotrosSection({
  eyebrow = "Quienes somos",
  headline = "Nuestra trayectoria y experiencia se demuestra en cada cimiento",
  paragraphs = DEFAULT_PARAGRAPHS,
  highlightsIntro = DEFAULT_HIGHLIGHTS_INTRO,
  highlights = DEFAULT_HIGHLIGHTS,
  imageSrc = "/images/nosotros-construccion.jpg",
  imageAlt = "Grúa de construcción trabajando en la estructura de un edificio residencial de Lithos",
}: NosotrosSectionProps) {
  return (
    <section id="nosotros" className="relative w-full overflow-hidden bg-ldc-gray">
      {/* xl:min-h contiene la foto absolute (top 469.24 + height 714.52 = bottom
          1183.76, en px de referencia del frame 1920) — a propósito ≈ al frame
          height que da Figma (1196px). La foto, al ser position:absolute, no
          empuja el alto natural del contenido de texto; sin este min-h se
          repetiría el bug de overflow entre secciones ya visto en el Hero. */}
      <div
        className="relative mx-auto max-w-(--frame-max-w) px-6 pt-10 pb-16
          md:px-10 md:pt-14 md:pb-20
          lg:px-11 lg:pt-16
          xl:px-[clamp(3.8241rem,4.4792vw,5.375rem)] xl:pt-[clamp(3.0237rem,3.5417vw,4.25rem)] xl:pb-0
          xl:min-h-[clamp(53.1815rem,62.2917vw,74.75rem)]"
      >
        {/* Eyebrow + regla decorativa (node 1:195, 1:217) */}
        <AnimatedSection>
          <div className="flex items-center gap-4 xl:gap-[clamp(0.8004rem,0.9375vw,1.125rem)]">
            <div className="flex items-end gap-3 xl:gap-[clamp(0.8449rem,0.9896vw,1.1875rem)]">
              <PixelCluster className="h-9 w-14 text-ldc-blue opacity-90 xl:h-[clamp(1.9565rem,2.2917vw,2.75rem)] xl:w-[clamp(3.0237rem,3.5417vw,4.25rem)]" />
              <span className="font-display text-lg leading-none font-medium whitespace-nowrap text-ldc-navy xl:text-[clamp(1.0672rem,1.25vw,1.5rem)]">
                {eyebrow}
              </span>
            </div>
            <div className="h-px flex-1 bg-black/10" />
          </div>
        </AnimatedSection>

        {/* Titular (node 1:193) — texto corrido de una sola cadena; envuelve solo
            (sin \n forzado), acotado con max-width para conservar ~2 líneas. */}
        <AnimatedSection delay={0.1}>
          <h2 className="mt-4 max-w-md font-display text-4xl leading-[1.05] font-medium text-ldc-navy sm:max-w-2xl sm:text-5xl md:mt-6 md:max-w-3xl md:text-6xl lg:max-w-4xl lg:text-7xl xl:mt-[clamp(2.1344rem,2.5vw,3rem)] xl:max-w-[clamp(74.6142rem,87.3958vw,104.875rem)] xl:text-[clamp(4.9909rem,5.8458vw,7.015rem)] xl:leading-none">
            {headline}
          </h2>
        </AnimatedSection>

        {/* Columna izquierda de contenido (body + highlights). En xl: se acota a
            ~787px para no correr por debajo de la foto absolute; en mobile/tablet
            ocupa el ancho legible. La foto se intercala en el orden mobile
            (después del body) pero en xl: es absolute a la derecha. */}
        <div className="xl:max-w-[clamp(34.9949rem,40.9896vw,49.1875rem)]">
          {/* Descripción (node 1:194) */}
          <AnimatedSection delay={0.2}>
            <div className="mt-6 flex max-w-prose flex-col gap-4 md:mt-8 xl:mt-[clamp(2.1344rem,2.5vw,3rem)] xl:max-w-none xl:gap-[clamp(1.2095rem,1.4167vw,1.7rem)]">
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

          {/* Foto (node 1:231, Mask group). Orden mobile: después del body, antes
              del bloque de experiencia. En xl: se saca del flujo (absolute) y se
              posiciona a la derecha como en el Figma. Clip-path exacto derivado
              del path del mask SVG (node 1:232), no una aproximación a ojo. */}
          <AnimatedSection
            delay={0.3}
            className="mt-10 md:mt-12 xl:mt-0 xl:absolute xl:top-[clamp(20.8653rem,24.4396vw,29.3275rem)] xl:right-[clamp(3.9575rem,4.6354vw,5.5625rem)] xl:w-[clamp(38.8634rem,45.5208vw,54.625rem)]"
          >
            <div
              className={`relative aspect-[874/714.523] w-full xl:h-[clamp(31.772rem,37.2146vw,44.6575rem)] xl:w-full ${IMAGE_CLIP_PATH_CLASS}`}
            >
              <Image
                src={imageSrc}
                alt={imageAlt}
                fill
                sizes="(min-width: 1366px) 46vw, (min-width: 768px) 90vw, 100vw"
                className="object-cover"
              />
            </div>
          </AnimatedSection>

          {/* Regla divisoria antes del bloque de experiencia (node 24:18) */}
          <AnimatedSection delay={0.35}>
            <div className="mt-10 h-px w-full bg-black/20 md:mt-12 xl:mt-[clamp(1.6452rem,1.9271vw,2.3125rem)]" />
          </AnimatedSection>

          {/* Intro del bloque de experiencia (node 24:5). id="historia": el nav
              no tiene una sección propia de "Historia" todavía, así que el
              link apunta aquí — el bloque de trayectoria/experiencia dentro
              de Nosotros — en vez de duplicar el mismo destino que "Nosotros"
              (que apunta al inicio de la sección). */}
          <AnimatedSection delay={0.4}>
            <p
              id="historia"
              className="mt-8 scroll-mt-6 text-base leading-[1.36] text-ldc-ink md:mt-10 xl:mt-[clamp(1.6897rem,1.9792vw,2.375rem)] xl:text-[clamp(0.8893rem,1.0417vw,1.25rem)]"
            >
              {highlightsIntro}
            </p>
          </AnimatedSection>

          {/* Highlights (node 24:30). Lista: barra navy + bloque azul con texto
              blanco. items-stretch hace que la barra iguale el alto del bloque
              cuando el texto envuelve a más líneas en mobile/tablet. */}
          <ul className="mt-6 flex flex-col gap-4 md:mt-8 xl:mt-[clamp(0.7559rem,0.8854vw,1.0625rem)] xl:gap-[clamp(0.7559rem,0.8854vw,1.0625rem)]">
            {highlights.map((highlight, index) => (
              <AnimatedSection
                key={highlight.text}
                as="li"
                delay={0.45 + index * 0.1}
                className="flex items-stretch"
              >
                <div className="w-2.5 shrink-0 rounded-l-lg bg-ldc-navy md:w-3 xl:w-[clamp(0.9783rem,1.1458vw,1.375rem)] xl:rounded-l-[clamp(0.3557rem,0.4167vw,0.5rem)]" />
                <div className="flex flex-1 items-center rounded-r-lg bg-ldc-blue px-5 py-5 md:px-6 md:py-6 xl:min-h-[clamp(4.8468rem,5.6771vw,6.8125rem)] xl:rounded-r-[clamp(0.3557rem,0.4167vw,0.5rem)] xl:py-[clamp(1.2006rem,1.4063vw,1.6875rem)] xl:pr-[clamp(1.2895rem,1.5104vw,1.8125rem)] xl:pl-[clamp(1.2895rem,1.5104vw,1.8125rem)]">
                  <p className="text-base leading-[1.36] text-white xl:text-[clamp(0.8893rem,1.0417vw,1.25rem)]">
                    {highlight.text}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
