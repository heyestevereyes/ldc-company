"use client";

import {
  useCallback,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import AnimatedSection from "@/components/AnimatedSection";
import { useModalBehavior } from "@/hooks/useModalBehavior";

export interface ProyectoDetalle {
  label: string;
  value: string;
}

export interface Proyecto {
  /** Nombre corto que titula la tarjeta y el lightbox (node 6:22). */
  nombre: string;
  /** Primera línea de detalle en la tarjeta (node 6:25). */
  subtitulo: string;
  /** Omite el campo (en tarjeta y lightbox) si el proyecto no tiene una sede
   * única — p. ej. una división de suministro que abastece varias regiones. */
  ubicacion?: string;
  tipologia: string;
  /** P. ej. "80 – 140 m²" o "No aplica". Deja sin definir si el dato aún no
   * existe: se muestra como "Por definir" en vez de omitirse. */
  superficie?: string;
  estado: string;
  /** P. ej. "2017 – 2022". Deja sin definir para mostrar "Por definir". */
  anio?: string;
  /** Única imagen del proyecto: se reutiliza en el slide y en el lightbox. */
  imageSrc: string;
  imageAlt: string;
  descripcion: string;
  /** Narrativa opcional sobre un avance/cambio en el método constructivo del
   * proyecto (p. ej. adopción de un sistema industrializado). Solo la tienen
   * algunos proyectos: se omite del lightbox cuando no está definida. */
  innovacionTecnica?: string;
}

export interface TrayectoriaProps {
  eyebrow?: string;
  headline?: string;
  proyectos?: Proyecto[];
}

/** Placeholder discreto para campos que sí aplican pero cuyo valor real aún
 * no está definido (a diferencia de un campo que no aplica, que se omite). */
const POR_DEFINIR = "Por definir";

/** Línea combinada de la tarjeta (node 32:2, p. ej. "2023 - Actualmente en
 * ejecución"): omite el año cuando aún no está definido, para no mostrar
 * "Por definir" en la vista compacta (sí se ve, con su etiqueta, en el
 * lightbox vía buildDetalles). */
function formatEstadoLinea(estado: string, anio?: string): string {
  if (anio && anio !== POR_DEFINIR) return `${anio} - ${estado}`;
  return estado;
}

/** Ficha técnica del lightbox, derivada de los mismos campos estructurados
 * que usa la tarjeta — así un campo ausente (undefined) se omite de forma
 * consistente en los dos lugares sin tener que mantener dos copias del dato. */
function buildDetalles(proyecto: Proyecto): ProyectoDetalle[] {
  const detalles: ProyectoDetalle[] = [];
  if (proyecto.ubicacion) detalles.push({ label: "Ubicación", value: proyecto.ubicacion });
  detalles.push({ label: "Tipología", value: proyecto.tipologia });
  if (proyecto.superficie) detalles.push({ label: "Superficie", value: proyecto.superficie });
  detalles.push({ label: "Estado", value: proyecto.estado });
  if (proyecto.anio) detalles.push({ label: "Año", value: proyecto.anio });
  return detalles;
}

const DEFAULT_PROYECTOS: Proyecto[] = [
  {
    nombre: "San Francisco",
    subtitulo: "Complejo Residencial San Francisco (En Desarrollo)",
    ubicacion: "San Juan del Río, Querétaro",
    tipologia: "Complejo residencial",
    superficie: "60 m² por departamento",
    estado: "Actualmente en ejecución",
    anio: "2023",
    imageSrc: "/images/sanfrancisco_cover.jpg",
    imageAlt:
      "Fachada del Complejo Residencial San Francisco al atardecer, en San Juan del Río, Querétaro",
    descripcion:
      "Proyecto de alta densidad compuesto por 18 torres que albergan un total de 8 departamentos por torre. Cada unidad habitacional cuenta con una superficie de 60 m² de construcción, distribuida eficientemente en áreas funcionales que integran un baño completo, área de lavado independiente y un cajón de estacionamiento exclusivo. En materia de servicios, el complejo garantiza autonomía hídrica mediante la instalación de una cisterna individual de 1,000 L y un tinaco propio de 600 L por departamento. Adicionalmente, dispone de seguridad privada 24/7 y áreas infantiles de uso común para el sano esparcimiento familiar.",
    innovacionTecnica:
      "Fiel a su filosofía de vanguardia, el proyecto comenzó inicialmente utilizando un sistema tradicional de construcción con tabique. Sin embargo, en el año 2026, la compañía dio un salto tecnológico clave al implementar un sistema constructivo industrializado basado en moldes de precisión. Esta innovación reduce sustancialmente el margen de error, acelera los tiempos de entrega y eleva exponencialmente la eficiencia en la obra.",
  },
  {
    nombre: "Villas de la Cruz",
    subtitulo: "Complejo Residencial Villas de la Cruz",
    ubicacion: "San Juan del Río, Querétaro",
    tipologia: "Complejo residencial",
    superficie: "80 – 140 m²",
    estado: "Concluido",
    anio: "2017 – 2022",
    imageSrc: "/images/villasdelacruz_cover.jpg",
    imageAlt:
      "Fachada de las Villas de la Cruz, complejo residencial de estilo colonial en San Juan del Río, Querétaro",
    descripcion:
      "Desarrollo residencial de casas con un distinguido estilo colonial, con superficies que varían desde los 80 m² hasta los 140 m² de construcción aproximadamente. Las viviendas fueron diseñadas con una distribución óptima que incluye 3 recámaras, 2 y ½ baños, jardín trasero y 2 cajones de estacionamiento. El complejo destaca por su infraestructura de seguridad integral, operando con control de acceso y vigilancia las 24 horas, los 7 días de la semana.",
  },
  {
    nombre: "San Gerardo",
    subtitulo: "Desarrollo Residencial San Gerardo",
    ubicacion: "San Miguel de Allende, Guanajuato",
    tipologia: "Desarrollo habitacional",
    superficie: POR_DEFINIR,
    estado: "Planeación y Proyección a Futuro",
    anio: POR_DEFINIR,
    imageSrc: "/images/sangerardo_cover.jpg",
    imageAlt:
      "Vista del desarrollo residencial San Gerardo en construcción, en San Miguel de Allende, Guanajuato",
    descripcion:
      "Con este próximo paso estratégico en una de las ciudades con mayor plusvalía y atractivo cultural del país, Lithos Development Company reafirma su compromiso de expandir su huella habitacional bajo premisas de alta calidad, diseño vanguardista y valor patrimonial a largo plazo.",
  },
  {
    nombre: "Divisiones Estratégicas de Suministro",
    subtitulo: "Concretera y Bloquera",
    // Sin ubicación: abastece varios proyectos en la región, no tiene una sede única.
    tipologia: "División industrial / de suministro",
    superficie: "No aplica",
    estado: "En operación",
    anio: "2018",
    imageSrc: "/images/divisiones-suministro_cover.jpg",
    imageAlt:
      "Planta de concretera y bloquera de Lithos Development Company en operación, con silos, camión revolvedor y block apilado",
    descripcion:
      "Fundadas en 2018 a la par del crecimiento de la firma, las divisiones de Concretera y Bloquera nacieron con el objetivo estratégico de asegurar el autoabastecimiento y control de calidad de los materiales de la empresa. Además de blindar la cadena de suministro interna, estas plantas producen y abastecen activamente diversos proyectos constructivos e industriales en los alrededores de la región de Polotitlán y San Juan del Río.",
  },
];

/** Puntos del icono del eyebrow (node 1:237, 68×44, se rota 180° como en Figma). */
const EYEBROW_DOTS: Array<[number, number]> = [
  [0, 0], [12, 0], [24, 0], [48, 0],
  [0, 12], [12, 12], [24, 12], [36, 12], [60, 12],
  [0, 24], [12, 24], [24, 24], [36, 24],
  [0, 36], [12, 36], [24, 36], [36, 36], [48, 36], [60, 36],
];

/** Puntos del icono del card (node 6:6, grid 4×4, paso 18.51, punto 13.221). */
const CARD_DOTS: Array<[number, number]> = [
  [0, 0], [18.51, 0], [37.02, 0],
  [0, 18.51], [37.02, 18.51], [55.53, 18.51],
  [0, 37.02], [18.51, 37.02], [55.53, 37.02],
  [0, 55.53], [18.51, 55.53], [37.02, 55.53], [55.53, 55.53],
];

function EyebrowCluster({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 68 44" className={className} aria-hidden>
      {EYEBROW_DOTS.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={8} height={8} fill="currentColor" />
      ))}
    </svg>
  );
}

function CardCluster({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 68.748 68.748" className={className} aria-hidden>
      {CARD_DOTS.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={13.221} height={13.221} fill="currentColor" />
      ))}
    </svg>
  );
}

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 18 18" fill="none" className={className} aria-hidden>
      <path d="M9 14.25L3.75 9L9 3.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14.25 9H3.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 18 18" fill="none" className={className} aria-hidden>
      <path d="M3.75 9H14.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 3.75L14.25 9L9 14.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** Tarjeta-overlay de un slide (node 6:5). Fondo con la textura de gradiente
 * (asset exportado de Figma: es un mesh azul, no un linear-gradient simple).
 * En mobile/tablet se ancla al fondo a lo ancho; en xl: va a la derecha como
 * en el frame. */
function ProjectCard({ proyecto }: { proyecto: Proyecto }) {
  return (
    <div
      className="absolute inset-x-3 bottom-3 flex flex-col justify-between gap-5 overflow-hidden p-5
        md:inset-x-5 md:bottom-5 md:gap-8 md:p-7
        xl:inset-x-auto xl:top-[clamp(1.6897rem,1.9792vw,2.375rem)] xl:bottom-[clamp(1.6151rem,1.8924vw,2.2709rem)] xl:right-[clamp(1.6681rem,1.9539vw,2.3446rem)] xl:left-auto xl:w-[clamp(18.3417rem,21.4836vw,25.7804rem)] xl:gap-0 xl:p-[clamp(1.4109rem,1.6526vw,1.9831rem)]"
    >
      {/* Fondo de gradiente. Va antes del contenido en el DOM y el contenido usa
          `relative`, así ambos son posicionados y el orden de pintado deja el
          texto por encima sin recurrir a z-index. */}
      <Image
        src="/images/trayectoria-card-bg.png"
        alt=""
        fill
        aria-hidden
        sizes="(min-width: 1366px) 22vw, (min-width: 768px) 60vw, 90vw"
        className="object-cover"
      />
      <div className="relative">
        <CardCluster className="h-10 w-10 text-ldc-blue-light opacity-90 md:h-12 md:w-12 xl:h-[clamp(3.057rem,3.5806vw,4.2968rem)] xl:w-[clamp(3.057rem,3.5806vw,4.2968rem)]" />
      </div>
      <div className="relative">
        <p className="font-display text-xl font-bold leading-[1.05] tracking-[-0.02em] text-white md:text-2xl xl:text-[clamp(1.646rem,1.928vw,2.3136rem)]">
          {proyecto.nombre}
        </p>
        <div className="mt-3 flex flex-col text-xs leading-[1.5] text-white/80 md:text-sm xl:mt-[clamp(0.7055rem,0.8263vw,0.9916rem)] xl:text-[clamp(0.823rem,0.964vw,1.1568rem)] xl:leading-[1.5]">
          <span>{proyecto.subtitulo}</span>
          {proyecto.ubicacion && <span>{proyecto.ubicacion}</span>}
          <span>{formatEstadoLinea(proyecto.estado, proyecto.anio)}</span>
        </div>
      </div>
    </div>
  );
}

function Lightbox({
  proyecto,
  onClose,
}: {
  proyecto: Proyecto;
  onClose: () => void;
}) {
  const { dialogRef, initialFocusRef: closeRef } = useModalBehavior<HTMLButtonElement>(onClose);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-ldc-navy/80 p-4 backdrop-blur-sm sm:p-6"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="lightbox-title"
        className="relative my-auto flex w-full max-w-4xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl md:flex-row"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Cerrar detalle del proyecto"
          className="absolute right-4 top-4 z-10 flex size-10 items-center justify-center rounded-full bg-white/90 text-ldc-navy transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-ldc-blue md:bg-ldc-navy/10 md:text-ldc-navy md:hover:bg-ldc-navy/20"
        >
          <CloseIcon className="size-5" />
        </button>

        {/* Misma imagen de cover que el slide (sin imagen separada para el
            lightbox): fill dentro de un contenedor con tamaño explícito
            (aspect-ratio en mobile, alto por flex-stretch en md:+). */}
        <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden md:aspect-auto md:w-1/2">
          <Image
            src={proyecto.imageSrc}
            alt={proyecto.imageAlt}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>

        <div className="flex flex-col gap-5 p-6 md:w-1/2 md:overflow-y-auto md:p-8">
          <div>
            <h3
              id="lightbox-title"
              className="font-display text-2xl font-bold tracking-[-0.02em] text-ldc-navy md:text-3xl"
            >
              {proyecto.nombre}
            </h3>
            <p className="mt-1 text-sm text-ldc-ink/70">{proyecto.subtitulo}</p>
          </div>

          <p className="text-sm leading-[1.6] text-ldc-ink/80">{proyecto.descripcion}</p>

          {proyecto.innovacionTecnica && (
            <div>
              <h4 className="font-display text-sm font-semibold tracking-[-0.01em] text-ldc-navy">
                Innovación técnica
              </h4>
              <p className="mt-1.5 text-sm leading-[1.6] text-ldc-ink/80">
                {proyecto.innovacionTecnica}
              </p>
            </div>
          )}

          <dl className="flex flex-col divide-y divide-black/10 border-t border-black/10 text-sm">
            {buildDetalles(proyecto).map((detalle) => (
              <div key={detalle.label} className="flex justify-between gap-4 py-2.5">
                <dt className="text-ldc-ink/60">{detalle.label}</dt>
                <dd className="text-right font-medium text-ldc-navy">{detalle.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default function Trayectoria({
  eyebrow = "Trayectoria",
  headline = "Trayectoria de Proyectos Residenciales y Comerciales",
  proyectos = DEFAULT_PROYECTOS,
}: TrayectoriaProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    containScroll: false,
  });
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  // Posición del puntero al iniciar el gesto sobre un slide: si se movió más que
  // el umbral entre down y click, fue un drag (swipe) y no debe abrir el lightbox.
  const pointerStart = useRef<{ x: number; y: number } | null>(null);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const handleSlideClick = useCallback(
    (index: number, event: ReactMouseEvent) => {
      const start = pointerStart.current;
      if (start) {
        const moved =
          Math.abs(event.clientX - start.x) > 10 ||
          Math.abs(event.clientY - start.y) > 10;
        if (moved) return;
      }
      setOpenIndex(index);
    },
    [],
  );

  return (
    <section id="proyectos" className="relative w-full overflow-hidden bg-ldc-navy py-14 md:py-20 xl:py-[clamp(2.7124rem,3.1771vw,3.8125rem)] xl:pb-[clamp(3.6462rem,4.2708vw,5.125rem)]">
      <div className="mx-auto max-w-(--frame-max-w)">
        {/* Eyebrow + regla decorativa (node 1:236, 1:258) */}
        <AnimatedSection className="px-6 md:px-10 lg:px-11 xl:px-[clamp(3.8241rem,4.4792vw,5.375rem)]">
          <div className="flex items-center gap-4 xl:gap-[clamp(0.8004rem,0.9375vw,1.125rem)]">
            <div className="flex items-end gap-3 xl:gap-[clamp(0.8449rem,0.9896vw,1.1875rem)]">
              <EyebrowCluster className="h-9 w-14 rotate-180 text-ldc-blue opacity-90 xl:h-[clamp(1.9565rem,2.2917vw,2.75rem)] xl:w-[clamp(3.0237rem,3.5417vw,4.25rem)]" />
              <span className="font-display text-lg font-medium whitespace-nowrap text-white xl:text-[clamp(1.0672rem,1.25vw,1.5rem)]">
                {eyebrow}
              </span>
            </div>
            <div className="h-px flex-1 bg-white/10" />
          </div>
        </AnimatedSection>

        {/* Titular + controles (node 1:235, 34:36) */}
        <AnimatedSection
          delay={0.1}
          className="mt-6 flex flex-col gap-6 px-6 md:mt-8 md:px-10 lg:px-11 xl:mt-[clamp(2.1344rem,2.5vw,3rem)] xl:flex-row xl:items-end xl:justify-between xl:gap-8 xl:px-[clamp(3.8241rem,4.4792vw,5.375rem)]"
        >
          <h2 className="max-w-xl font-display text-4xl font-medium leading-[1.05] text-white sm:max-w-2xl sm:text-5xl md:max-w-3xl md:text-6xl lg:text-7xl xl:max-w-[clamp(66.1656rem,77.5vw,93rem)] xl:text-[clamp(4.9909rem,5.8458vw,7.015rem)] xl:leading-none">
            {headline}
          </h2>
          <div className="flex shrink-0 items-center gap-3 xl:gap-[clamp(0.5336rem,0.625vw,0.75rem)]">
            <button
              type="button"
              onClick={scrollPrev}
              aria-label="Proyecto anterior"
              className="flex size-12 items-center justify-center rounded-full border border-white/25 bg-ldc-blue text-white transition-colors hover:bg-ldc-blue/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 xl:size-[clamp(2.1344rem,2.5vw,3rem)]"
            >
              <ArrowLeftIcon className="size-[18px] xl:size-[clamp(0.8004rem,0.9375vw,1.125rem)]" />
            </button>
            <button
              type="button"
              onClick={scrollNext}
              aria-label="Proyecto siguiente"
              className="flex size-12 items-center justify-center rounded-full border border-white/25 bg-ldc-blue text-white transition-colors hover:bg-ldc-blue/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 xl:size-[clamp(2.1344rem,2.5vw,3rem)]"
            >
              <ArrowRightIcon className="size-[18px] xl:size-[clamp(0.8004rem,0.9375vw,1.125rem)]" />
            </button>
          </div>
        </AnimatedSection>

        {/* Carrusel (node 6:2 …). Viewport con inset izquierdo pero sangrado a la
            derecha para dejar asomar el siguiente slide, como en el Figma. */}
        <AnimatedSection
          delay={0.2}
          className="mt-8 overflow-hidden pl-6 md:mt-10 md:pl-10 lg:pl-11 xl:mt-[clamp(1.3785rem,1.6146vw,1.9375rem)] xl:pl-[clamp(3.8241rem,4.4792vw,5.375rem)]"
          as="div"
        >
          <div className="overflow-hidden" ref={emblaRef}>
            <ul className="-ml-4 flex touch-pan-y md:-ml-6 xl:-ml-[clamp(1.3785rem,1.6146vw,1.9375rem)]">
              {proyectos.map((proyecto, index) => (
                <li
                  key={index}
                  className="min-w-0 shrink-0 grow-0 basis-[85vw] pl-4 md:basis-[88vw] md:pl-6 xl:basis-[89.8438vw] xl:pl-[clamp(1.3785rem,1.6146vw,1.9375rem)]"
                >
                  <button
                    type="button"
                    onPointerDown={(event: ReactPointerEvent) => {
                      pointerStart.current = { x: event.clientX, y: event.clientY };
                    }}
                    onClick={(event) => handleSlideClick(index, event)}
                    aria-label={`Ver detalle de ${proyecto.nombre} — ${proyecto.subtitulo}`}
                    className="group relative block w-full overflow-hidden text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
                  >
                    <div className="relative aspect-[3/4] w-full overflow-hidden sm:aspect-[4/3] md:aspect-[16/9] xl:aspect-[1725/701]">
                      <Image
                        src={proyecto.imageSrc}
                        alt={proyecto.imageAlt}
                        fill
                        sizes="(min-width: 1366px) 90vw, 88vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                      />
                      <ProjectCard proyecto={proyecto} />
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </AnimatedSection>
      </div>

      {openIndex !== null && (
        <Lightbox proyecto={proyectos[openIndex]} onClose={() => setOpenIndex(null)} />
      )}
    </section>
  );
}
