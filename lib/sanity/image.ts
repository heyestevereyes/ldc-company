import { createImageUrlBuilder, type SanityImageSource } from "@sanity/image-url";
import { projectId, dataset } from "@/sanity/env";

const builder = projectId && dataset ? createImageUrlBuilder({ projectId, dataset }) : null;

/** Solo se invoca desde lib/sanity/fetchers.ts, que ya comprobó que
 * getSanityClient() no es null (o sea, que Sanity está configurado) antes
 * de llegar aquí — builder nunca es null en ese punto. */
export function urlFor(source: SanityImageSource) {
  if (!builder) {
    throw new Error("urlFor() llamado sin NEXT_PUBLIC_SANITY_PROJECT_ID configurado.");
  }
  return builder.image(source);
}
