import type { ReactNode } from "react";

/** Root layout propio para /studio (route group separado del sitio, ver
 * app/(site)/layout.tsx): el Studio necesita su documento HTML limpio, sin
 * el globals.css de Tailwind ni el SmoothScroll/Lenis que envuelve el resto
 * del sitio — ambos rompen el layout y el scroll interno de sus paneles. */
export default function StudioLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
