"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type AnimatedTag = "div" | "section" | "header" | "article" | "aside" | "span" | "li";

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  /** Elemento HTML a renderizar. Por defecto "div". */
  as?: AnimatedTag;
  /** Retraso en segundos, para escalonar (stagger) varios bloques. */
  delay?: number;
}

export default function AnimatedSection({
  children,
  className,
  as = "div",
  delay = 0,
}: AnimatedSectionProps) {
  const shouldReduceMotion = useReducedMotion();
  const MotionTag = motion[as];

  return (
    <MotionTag
      className={className}
      initial={shouldReduceMotion ? undefined : { opacity: 0, y: 24 }}
      whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: "easeOut", delay }}
    >
      {children}
    </MotionTag>
  );
}
