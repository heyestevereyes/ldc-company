"use client";

import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import AnimatedSection from "@/components/AnimatedSection";

/** Desplazamiento máximo del parallax del trabajador, en cada eje (px). */
const WORKER_PARALLAX_RANGE = 12;

function clamp(value: number, limit: number) {
  return Math.max(-limit, Math.min(limit, value));
}

export interface HeroNavLink {
  label: string;
  href: string;
}

export interface HeroSectionProps {
  /** Logo-lockup completo (marca + wordmark) del artboard de Figma (node 40:2). */
  logoSrc?: string;
  logoAlt?: string;
  navLinks?: HeroNavLink[];
  ctaLabel?: string;
  ctaHref?: string;
  /** Decorativo: el contenido textual de la sección ya transmite el significado. */
  backgroundImageSrc?: string;
  workerImageSrc?: string;
  workerImageAlt?: string;
  /** Usa "\n" para forzar el salto de línea del titular, como en el diseño. */
  headline?: string;
  description?: string;
}

const DEFAULT_NAV_LINKS: HeroNavLink[] = [
  { label: "Inicio", href: "#inicio" },
  { label: "Nosotros", href: "#nosotros" },
  { label: "Historia", href: "#historia" },
  { label: "Proyectos", href: "#proyectos" },
];

export default function HeroSection({
  logoSrc = "/images/logo-lockup.svg",
  logoAlt = "Lithos Development Company",
  navLinks = DEFAULT_NAV_LINKS,
  ctaLabel = "Contacto",
  ctaHref = "#contacto",
  backgroundImageSrc = "/images/hero-background.png",
  workerImageSrc = "/images/hero-worker.png",
  workerImageAlt = "Trabajador de Lithos observando la obra en construcción",
  headline = "Construimos\nun futuro para ti.",
  description = "En Lithos construimos espacios pensados para resistir el tiempo y acompañar generaciones. Porque un hogar no se mide en metros, se mide en los años que es capaz de permanecer.",
}: HeroSectionProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuToggleRef = useRef<HTMLButtonElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const closeMenu = () => setIsMenuOpen(false);

  // Bloquea el scroll del body mientras el menú fullscreen está abierto.
  // Compensa el ancho de la scrollbar con padding-right para que el header
  // (y el propio botón hamburguesa/X) no se desplace al desaparecer/reaparecer.
  useEffect(() => {
    if (!isMenuOpen) return;

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const { body } = document;
    const previousOverflow = body.style.overflow;
    const previousPaddingRight = body.style.paddingRight;

    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPaddingRight;
    };
  }, [isMenuOpen]);

  // Cierra con Esc y devuelve el foco al botón que abrió el menú.
  useEffect(() => {
    if (!isMenuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        menuToggleRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isMenuOpen]);

  // Solo desktop con mouse real: se resincroniza si cambia el viewport o el
  // dispositivo de entrada (p. ej. una tablet con mouse conectado). El
  // parallax nunca corre en mobile/tablet: el worker ahí es estático.
  const [canParallax, setCanParallax] = useState(false);
  useEffect(() => {
    const pointerQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const viewportQuery = window.matchMedia("(min-width: 1366px)");
    const update = () =>
      setCanParallax(
        pointerQuery.matches && viewportQuery.matches && !prefersReducedMotion,
      );

    update();
    pointerQuery.addEventListener("change", update);
    viewportQuery.addEventListener("change", update);
    return () => {
      pointerQuery.removeEventListener("change", update);
      viewportQuery.removeEventListener("change", update);
    };
  }, [prefersReducedMotion]);

  const workerMouseX = useMotionValue(0);
  const workerMouseY = useMotionValue(0);
  const workerX = useSpring(workerMouseX, { stiffness: 150, damping: 20 });
  const workerY = useSpring(workerMouseY, { stiffness: 150, damping: 20 });

  useEffect(() => {
    if (!canParallax) {
      workerMouseX.set(0);
      workerMouseY.set(0);
    }
  }, [canParallax, workerMouseX, workerMouseY]);

  const handleHeroMouseMove = (event: ReactMouseEvent<HTMLElement>) => {
    if (!canParallax) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const relativeX = event.clientX - rect.left - rect.width / 2;
    const relativeY = event.clientY - rect.top - rect.height / 2;
    workerMouseX.set(
      clamp((relativeX / (rect.width / 2)) * WORKER_PARALLAX_RANGE, WORKER_PARALLAX_RANGE),
    );
    workerMouseY.set(
      clamp((relativeY / (rect.height / 2)) * WORKER_PARALLAX_RANGE, WORKER_PARALLAX_RANGE),
    );
  };

  const handleHeroMouseLeave = () => {
    workerMouseX.set(0);
    workerMouseY.set(0);
  };

  return (
    <section
      className="relative w-full overflow-hidden min-h-[100svh] xl:h-dvh xl:min-h-0"
      onMouseMove={handleHeroMouseMove}
      onMouseLeave={handleHeroMouseLeave}
    >
      {/* CAPA 1 (fondo): foto de obra + overlay oscuro (image 76, node 1:116).
          z-0 explícito: es solo documentación, ya pintaría al fondo igual (z-index:
          auto/0 sobre un descendiente posicionado pinta antes que cualquier z
          positivo), pero lo dejamos explícito para que las 3 capas se lean juntas. */}
      <div className="absolute inset-0 z-0" aria-hidden>
        <Image
          src={backgroundImageSrc}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-ldc-navy/50" />
      </div>

      {/* CAPA 2 (worker, mobile/tablet): versión estática — sin parallax, eso es
          solo desktop — a todo el ancho del hero en mobile, debajo del header,
          para que se integre como fondo real en vez de una cajita flotando en
          una esquina. El headline y el párrafo (capa 3, bottom-0) quedan
          overlaid sobre su tercio inferior a propósito — el gradiente hacia
          navy en ese borde es lo que sostiene el contraste ahí, igual que el
          tratamiento del fondo. h-[100svh] a pantalla completa en todos los
          rangos < xl:; object-top (en vez del center por defecto) evita que el
          recorte de object-cover pierda el casco. md:w-1/2 md:left-1/2 acota
          el ancho a la mitad derecha del hero en tablet (ajuste confirmado a
          ojo en el inspector) — en mobile se queda full-bleed (inset-x-0, sin
          w-1/2/left-1/2). Se apaga en xl: porque ahí toma el relevo el worker
          con parallax de abajo. */}
      <div
        className="absolute inset-x-0 top-20 z-10 h-[100svh] md:h-[100svh] md:w-1/2 md:left-1/2 xl:hidden"
        aria-hidden
      >
        <Image
          src={workerImageSrc}
          alt=""
          fill
          sizes="(max-width: 1365px) 100vw, 0vw"
          className="object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-ldc-navy" />
      </div>

      {/* CAPA 2 (worker, desktop): protagonista visual con parallax sutil siguiendo
          el mouse (node 10:82). Anclado a bottom-0 (en vez del top fijo del frame
          de Figma) para que encaje sin huecos ni recortes verticales sea cual sea
          la altura real del viewport, ahora que la sección es xl:h-dvh en vez de
          una altura fluida por ancho. xl:max-h-full evita que choque con el nav
          en ventanas muy anchas pero bajas. La sección tiene overflow-hidden así
          que el offset del parallax nunca produce scroll horizontal/vertical.
          El ancho deriva del alto vía xl:aspect-[459/865] (aspect real de la foto
          nueva del worker) en vez de un clamp fijo: así object-cover no recorta
          verticalmente y el casco/pies quedan completos sin importar la foto. */}
      <motion.div
        style={{ x: workerX, y: workerY }}
        className="hidden xl:block xl:absolute xl:bottom-0 xl:right-[clamp(11.2499rem,13.1771vw,15.8125rem)] xl:h-[clamp(41.8426rem,49.0104vw,58.8125rem)] xl:max-h-full xl:aspect-[459/865] xl:w-auto"
        aria-hidden
      >
        <Image
          src={workerImageSrc}
          alt={workerImageAlt}
          fill
          sizes="(min-width: 1366px) 30vw, 0vw"
          className="object-cover"
        />
      </motion.div>

      {/* Header: logo + nav (node 1:119, 1:184). Hijo directo de la sección (ya no
          comparte wrapper con el copy) para que z-50 compare directamente contra
          el overlay fullscreen del menú (z-40) sin quedar atrapado dentro de un
          stacking context intermedio — así el logo y el botón hamburguesa/X
          quedan siempre visibles y clicables por encima. En flujo normal (no
          absolute): al no compartir columna flex con el copy ya no hace falta
          sacarlo del flujo para que no le quite alto al texto. */}
      <AnimatedSection
        as="header"
        className="relative z-50 mx-auto max-w-(--frame-max-w)"
      >
        <div
          className="flex items-center justify-between gap-4 px-6 py-5
            md:px-10 lg:px-11
            xl:px-0
            xl:pt-[clamp(2.3122rem,2.7083vw,3.25rem)]
            xl:pl-[clamp(2.8458rem,3.3333vw,4rem)]
            xl:pr-[clamp(3.335rem,3.9063vw,4.6875rem)]"
        >
          <a
            href="#inicio"
            className="flex shrink-0 items-center rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-4"
          >
            <Image
              src={logoSrc}
              alt={logoAlt}
              width={724}
              height={158}
              priority
              unoptimized
              className="h-10 w-auto xl:h-[clamp(2.8027rem,3.2813vw,3.9375rem)]"
            />
          </a>

          {/* Toggle hamburguesa/X: mismo botón (no se remonta entre estados), mismo
              tamaño fijo (size-10) y mismo padding del header en ambos estados, así
              que su posición nunca cambia al abrir/cerrar. */}
          <button
            ref={menuToggleRef}
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-expanded={isMenuOpen}
            aria-controls="hero-mobile-nav"
            aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
            className="relative flex size-10 shrink-0 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white xl:hidden"
          >
            <span
              className={`absolute h-[1.5px] w-5 bg-current transition-transform duration-300 ${isMenuOpen ? "translate-y-0 rotate-45" : "-translate-y-1.5"}`}
            />
            <span
              className={`absolute h-[1.5px] w-5 bg-current transition-opacity duration-300 ${isMenuOpen ? "opacity-0" : "opacity-100"}`}
            />
            <span
              className={`absolute h-[1.5px] w-5 bg-current transition-transform duration-300 ${isMenuOpen ? "translate-y-0 -rotate-45" : "translate-y-1.5"}`}
            />
          </button>

          {/* Nav + CTA de escritorio: fila inline junto al logo, solo desde xl:. */}
          <div className="hidden items-center gap-[clamp(1.5563rem,1.8229vw,2.1875rem)] xl:flex">
            <nav aria-label="Principal" className="flex flex-row gap-[clamp(2.0899rem,2.4479vw,2.9375rem)]">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="rounded-sm py-2 font-display font-medium text-base text-white/80 whitespace-nowrap transition-colors hover:text-white focus-visible:text-white focus-visible:outline-none xl:py-0 xl:text-[clamp(0.8715rem,1.0208vw,1.225rem)] xl:leading-[1.4286]"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <a
              href={ctaHref}
              className="inline-flex shrink-0 items-center rounded-[clamp(0.4447rem,0.5208vw,0.625rem)] bg-white px-[clamp(1.0672rem,1.25vw,1.5rem)] py-[clamp(0.6225rem,0.7292vw,0.875rem)] font-medium text-[clamp(0.7115rem,0.8333vw,1rem)] text-ldc-navy leading-[1.5] transition-colors hover:bg-white/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ldc-navy focus-visible:outline-offset-2"
            >
              {ctaLabel}
            </a>
          </div>
        </div>
      </AnimatedSection>

      {/* CAPA 3 (contenido): titular + descripción + CTA (node 1:152, 1:153).
          z-20: por encima de ambas capas de worker y del fondo, siempre legible.
          Anclado a bottom-0 de la sección en todos los breakpoints (antes solo
          en xl:, con flex+justify-end para mobile) — se simplifica a un único
          absolute+inset-x-0+bottom-0 ahora que ya no comparte columna flex con
          el header. md:/lg: dan un paso explícito de padding para tablet en vez
          de dejar el px-6 de mobile fijo hasta el salto a los valores clamp de
          xl: — el resto de la composición (worker full-bleed, texto apilado,
          nav en hamburguesa) se mantiene igual a mobile a propósito en todo el
          rango < xl:, por la regla del proyecto de no tratar tablet como un
          desktop escalado. */}
      <div className="absolute inset-x-0 bottom-0 z-20 mx-auto flex max-w-(--frame-max-w) flex-col gap-4 px-6 pb-12 md:px-10 md:pb-14 lg:px-11 lg:pb-16 xl:gap-0 xl:px-0 xl:pb-[clamp(4.3577rem,5.1042vw,6.125rem)] xl:pl-[clamp(2.9348rem,3.4375vw,4.125rem)]">
        <AnimatedSection>
          <h1 className="max-w-md font-display text-4xl leading-[1.05] font-medium whitespace-pre-line text-white sm:max-w-xl sm:text-5xl xl:max-w-[clamp(35.6618rem,41.7708vw,50.125rem)] xl:text-[clamp(4.6768rem,5.478vw,6.5736rem)] xl:leading-none">
            {headline}
          </h1>
        </AnimatedSection>
        <AnimatedSection
          delay={0.15}
          className="xl:mt-[clamp(2.1498rem,2.5181vw,3.0218rem)] xl:pl-[clamp(0.4002rem,0.4688vw,0.5625rem)]"
        >
          <p className="max-w-md text-base leading-[1.6] text-white/80 sm:max-w-lg xl:max-w-[clamp(33.0383rem,38.6979vw,46.4375rem)] xl:text-[clamp(0.7559rem,0.8854vw,1.0625rem)]">
            {description}
          </p>
        </AnimatedSection>
        <AnimatedSection delay={0.25} className="xl:hidden">
          <a
            href={ctaHref}
            className="inline-flex items-center rounded-lg bg-white px-6 py-3 text-sm font-medium text-ldc-navy transition-colors hover:bg-white/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
          >
            {ctaLabel}
          </a>
        </AnimatedSection>
      </div>

      {/* Overlay fullscreen del menú mobile. Vive fuera de cualquier AnimatedSection a
          propósito: Framer Motion deja un transform aplicado (aunque sea translateY(0))
          en el elemento animado incluso en reposo, y cualquier transform en un ancestro
          crea un containing block nuevo para position:fixed — si este nav quedara
          anidado ahí, "fixed inset-0" se ataría a los límites del header animado en vez
          del viewport real. 100dvh en vez de 100vh evita el salto por la barra de
          direcciones del navegador móvil. z-40, por debajo del header (z-50), para que
          el botón X siga siendo el mismo elemento clicable en la misma posición. */}
      <nav
        id="hero-mobile-nav"
        aria-label="Principal"
        className={`${isMenuOpen ? "flex" : "hidden"} fixed inset-0 z-40 h-dvh w-full flex-col items-center justify-center gap-2 overflow-y-auto bg-ldc-navy px-6 py-24 xl:hidden`}
      >
        {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            onClick={closeMenu}
            className="rounded-sm px-4 py-3 font-display text-2xl font-medium text-white/80 transition-colors hover:text-white focus-visible:text-white focus-visible:outline-none"
          >
            {link.label}
          </a>
        ))}
        <a
          href={ctaHref}
          onClick={closeMenu}
          className="mt-4 inline-flex items-center rounded-lg bg-white px-8 py-3 text-base font-medium text-ldc-navy transition-colors hover:bg-white/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
        >
          {ctaLabel}
        </a>
      </nav>
    </section>
  );
}
