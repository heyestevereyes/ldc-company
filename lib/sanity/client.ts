import { createClient } from "next-sanity";
import { projectId, dataset, apiVersion, isSanityConfigured } from "@/sanity/env";

type SanityClient = ReturnType<typeof createClient>;

let cachedClient: SanityClient | null = null;

/** `null` mientras Sanity no esté configurado (ver isSanityConfigured en
 * sanity/env.ts) — los fetchers de este directorio comprueban esto antes de
 * consultar, para no romper el sitio ni el build antes de crear el proyecto
 * real y migrar el contenido. */
export function getSanityClient(): SanityClient | null {
  if (!isSanityConfigured) return null;

  if (!cachedClient) {
    cachedClient = createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: true,
      perspective: "published",
    });
  }

  return cachedClient;
}
