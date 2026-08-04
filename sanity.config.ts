import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { projectId, dataset, isSanityConfigured } from "./sanity/env";
import { schema } from "./sanity/schemaTypes";
import { structure } from "./sanity/structure";

// El placeholder PENDIENTE_ de NEXT_PUBLIC_SANITY_PROJECT_ID (ver
// sanity/env.ts) no es un projectId válido para Sanity (solo admite
// a-z, 0-9 y guiones) — defineConfig() lo valida y tira un error en
// cuanto se visita /studio, aunque sea antes de hacer ninguna consulta.
// Un id "de mentira" mantiene el Studio cargando (mostrará su propio
// error de conexión) en vez de tumbar la ruta entera.
export default defineConfig({
  name: "ldc-content",
  title: "LDC Content",
  basePath: "/studio",
  projectId: isSanityConfigured ? (projectId as string) : "not-configured",
  dataset,
  schema,
  plugins: [structureTool({ structure })],
});
