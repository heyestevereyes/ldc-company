"use client";

import { NextStudio, NextStudioLayout } from "next-sanity/studio";
import config from "@/sanity.config";

/** Aísla sanity.config.ts (y todo lo que arrastra: sanity/structure, los
 * schemas, etc.) detrás de un límite "use client" explícito. page.tsx es un
 * Server Component (necesita exportar metadata/viewport) — si importara
 * sanity.config.ts directamente, Turbopack intenta resolver esa cadena de
 * imports también para el grafo RSC del servidor, y algunos internos de
 * Sanity (p. ej. los que usan el hook useSWR) rompen el build ahí porque
 * solo están pensados para ejecutarse en cliente. */
export default function StudioClient() {
  return (
    <NextStudioLayout>
      <NextStudio config={config} />
    </NextStudioLayout>
  );
}
