"use client";

import { useReducedMotion } from "framer-motion";
import { ReactLenis } from "lenis/react";
import type { ReactNode } from "react";

interface SmoothScrollProps {
  children: ReactNode;
}

/**
 * Envuelve el sitio en una instancia global de Lenis (scroll suave por
 * inercia + anchor links del nav animados vía la opción `anchors`).
 * Si el usuario prefiere reduced motion, Lenis ni se monta y el scroll
 * queda nativo/instantáneo — mismo criterio de accesibilidad que
 * AnimatedSection (useReducedMotion de framer-motion).
 */
export default function SmoothScroll({ children }: SmoothScrollProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <>{children}</>;
  }

  return (
    <ReactLenis root options={{ anchors: true, autoRaf: true }}>
      {children}
    </ReactLenis>
  );
}
