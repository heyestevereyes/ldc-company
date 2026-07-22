"use client";

import { useState } from "react";
import Image from "next/image";
import AnimatedSection from "@/components/AnimatedSection";

export interface HeroNavLink {
  label: string;
  href: string;
}

export interface HeroSectionProps {
  /** Decorativo junto al wordmark, que ya aporta el nombre accesible del logo. */
  logoMarkSrc?: string;
  logoWordmarkSrc?: string;
  logoWordmarkAlt?: string;
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
  logoMarkSrc = "/images/logo-mark.svg",
  logoWordmarkSrc = "/images/logo-wordmark.svg",
  logoWordmarkAlt = "Lithos Development Company",
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

  return (
    <section className="relative w-full overflow-hidden min-h-[100svh] xl:h-[clamp(48.0234rem,56.25vw,67.5rem)] xl:min-h-0">
      {/* Fondo: foto de obra + overlay oscuro (image 76, node 1:116) */}
      <div className="absolute inset-0" aria-hidden>
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

      {/* Trabajador (worker 1, node 10:82) — protagonista visual, se oculta en mobile/tablet
          porque el mockup de Figma no cubre ese layout y compite con el texto apilado. */}
      <div
        className="hidden xl:block xl:absolute xl:top-[clamp(7.5592rem,8.8542vw,10.625rem)] xl:right-[clamp(11.2499rem,13.1771vw,15.8125rem)] xl:h-[clamp(41.8426rem,49.0104vw,58.8125rem)] xl:w-[clamp(25.5236rem,29.8958vw,35.875rem)]"
        aria-hidden
      >
        <Image
          src={workerImageSrc}
          alt={workerImageAlt}
          fill
          sizes="(min-width: 1366px) 30vw, 0vw"
          className="object-cover"
        />
      </div>

      <div className="relative mx-auto flex h-full min-h-[100svh] max-w-(--frame-max-w) flex-col xl:min-h-0 xl:block">
        {/* Header: logo + nav (node 1:119, 1:184) */}
        <AnimatedSection as="header">
          <div
            className="relative flex items-center justify-between gap-4 px-6 py-5
              xl:absolute xl:inset-x-0 xl:top-0 xl:px-0
              xl:pt-[clamp(2.3122rem,2.7083vw,3.25rem)]
              xl:pl-[clamp(2.8458rem,3.3333vw,4rem)]
              xl:pr-[clamp(3.335rem,3.9063vw,4.6875rem)]"
          >
            <a
              href="#inicio"
              className="flex shrink-0 items-center gap-[clamp(0.2893rem,0.3388vw,0.4066rem)] rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-4"
            >
              <Image
                src={logoMarkSrc}
                alt=""
                width={143}
                height={46}
                unoptimized
                className="h-8 w-auto xl:h-[clamp(2.0418rem,2.3916vw,2.8699rem)]"
              />
              <Image
                src={logoWordmarkSrc}
                alt={logoWordmarkAlt}
                width={115}
                height={56}
                unoptimized
                className="h-9 w-auto xl:h-[clamp(2.4901rem,2.9167vw,3.5rem)]"
              />
            </a>

            <button
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

            <div className="items-center gap-[clamp(1.5563rem,1.8229vw,2.1875rem)] xl:flex">
              <nav
                id="hero-mobile-nav"
                aria-label="Principal"
                className={`${isMenuOpen ? "flex" : "hidden"} absolute inset-x-0 top-full flex-col gap-1 bg-ldc-navy/95 px-6 py-4 backdrop-blur-sm xl:static xl:flex xl:flex-row xl:gap-[clamp(2.0899rem,2.4479vw,2.9375rem)] xl:bg-transparent xl:p-0 xl:backdrop-blur-none`}
              >
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
                className="hidden shrink-0 items-center rounded-[clamp(0.4447rem,0.5208vw,0.625rem)] bg-white px-[clamp(1.0672rem,1.25vw,1.5rem)] py-[clamp(0.6225rem,0.7292vw,0.875rem)] font-medium text-[clamp(0.7115rem,0.8333vw,1rem)] text-ldc-navy leading-[1.5] transition-colors hover:bg-white/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ldc-navy focus-visible:outline-offset-2 xl:inline-flex"
              >
                {ctaLabel}
              </a>
            </div>
          </div>
        </AnimatedSection>

        {/* Titular + descripción (node 1:152, 1:153) */}
        <div className="flex flex-1 flex-col justify-end gap-4 px-6 pb-12 xl:absolute xl:inset-x-0 xl:bottom-0 xl:flex-none xl:gap-0 xl:px-0 xl:pb-[clamp(4.3577rem,5.1042vw,6.125rem)] xl:pl-[clamp(2.9348rem,3.4375vw,4.125rem)]">
          <AnimatedSection>
            <h1 className="max-w-md font-display text-4xl leading-[1.05] font-medium whitespace-pre-line text-white sm:max-w-xl sm:text-5xl xl:max-w-[clamp(35.6618rem,41.7708vw,50.125rem)] xl:text-[clamp(4.6768rem,5.478vw,6.5736rem)] xl:leading-none">
              {headline}
            </h1>
          </AnimatedSection>
          <AnimatedSection
            delay={0.15}
            className="mt-4 xl:mt-[clamp(2.1498rem,2.5181vw,3.0218rem)] xl:pl-[clamp(0.4002rem,0.4688vw,0.5625rem)]"
          >
            <p className="max-w-md text-base leading-[1.6] text-white/80 sm:max-w-lg xl:max-w-[clamp(33.0383rem,38.6979vw,46.4375rem)] xl:text-[clamp(0.7559rem,0.8854vw,1.0625rem)]">
              {description}
            </p>
          </AnimatedSection>
          <AnimatedSection delay={0.25} className="xl:hidden">
            <a
              href={ctaHref}
              className="mt-2 inline-flex items-center rounded-lg bg-white px-6 py-3 text-sm font-medium text-ldc-navy transition-colors hover:bg-white/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
            >
              {ctaLabel}
            </a>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
