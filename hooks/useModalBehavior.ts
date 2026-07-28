"use client";

import { useEffect, useRef } from "react";

/**
 * Comportamiento accesible compartido por todos los modales del sitio
 * (Lightbox de Trayectoria, formulario de contacto del Footer): bloquea el
 * scroll del body compensando el ancho de la scrollbar, atrapa el foco
 * (Tab/Shift+Tab) dentro del diálogo, cierra con Esc, mueve el foco al
 * elemento indicado por `initialFocusRef` al abrir y lo devuelve al elemento
 * que abrió el modal en cuanto se desmonta.
 */
export function useModalBehavior<T extends HTMLElement = HTMLElement>(onClose: () => void) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const initialFocusRef = useRef<T>(null);

  useEffect(() => {
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    const { body } = document;
    const prevOverflow = body.style.overflow;
    const prevPad = body.style.paddingRight;
    body.style.overflow = "hidden";
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;
    return () => {
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPad;
    };
  }, []);

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    initialFocusRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
        'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      opener?.focus?.();
    };
  }, [onClose]);

  return { dialogRef, initialFocusRef };
}
