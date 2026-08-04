/** Mismo criterio que `isPending` en app/api/contact/route.ts para Resend:
 * una env var sin definir o con el placeholder PENDIENTE_ de .env.local
 * cuenta como "todavía no configurada". */
function isPending(value: string | undefined): boolean {
  return !value || value.startsWith("PENDIENTE_");
}

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
export const apiVersion = "2025-01-01";

/** `false` mientras no se haya creado el proyecto real en sanity.io (o su id
 * siga siendo el placeholder PENDIENTE_) — la app entera debe poder seguir
 * funcionando con los valores por defecto de cada sección hasta entonces. */
export const isSanityConfigured = !isPending(projectId);
