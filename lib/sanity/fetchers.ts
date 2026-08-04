import type { SanityImageSource } from "@sanity/image-url";
import type { HeroSectionProps, FooterProps, Proyecto } from "@/components/sections";
import { getSanityClient } from "./client";
import { urlFor } from "./image";
import { heroQuery, proyectosQuery, footerQuery } from "./queries";

interface SanityHeroDoc {
  headline?: string;
  description?: string;
  backgroundImage?: SanityImageSource;
  workerImage?: SanityImageSource;
  workerImageAlt?: string;
}

interface SanityProyectoDoc {
  nombre?: string;
  subtitulo?: string;
  descripcion?: string;
  innovacionTecnica?: string;
  ubicacion?: string;
  tipologia?: string;
  superficie?: string;
  estado?: string;
  anio?: string;
  imagen?: SanityImageSource;
  imageAlt?: string;
}

interface SanityFooterDoc {
  headline?: string;
  email?: string;
}

/** Un proyecto sin sus campos requeridos (ver validation en
 * sanity/schemaTypes/proyectoType.ts) no debería poder publicarse, pero se
 * filtra igual acá — es contenido externo (frontera del sistema) y un
 * documento a medio llenar no debe romper el render del carrusel. */
function isCompleteProyecto(
  doc: SanityProyectoDoc,
): doc is SanityProyectoDoc &
  Required<Pick<SanityProyectoDoc, "nombre" | "subtitulo" | "descripcion" | "tipologia" | "estado" | "imagen" | "imageAlt">> {
  return Boolean(
    doc.nombre && doc.subtitulo && doc.descripcion && doc.tipologia && doc.estado && doc.imagen && doc.imageAlt,
  );
}

/** Devuelve `null` si Sanity no está configurado, si el documento aún no
 * existe, o si la consulta falla — page.tsx usa eso como señal para pasar
 * `undefined` a la sección y que caiga en sus valores por defecto. */
export async function getHero(): Promise<Partial<HeroSectionProps> | null> {
  const client = getSanityClient();
  if (!client) return null;

  try {
    const data = await client.fetch<SanityHeroDoc | null>(heroQuery, {}, { next: { tags: ["hero"] } });
    if (!data) return null;

    return {
      headline: data.headline,
      description: data.description,
      backgroundImageSrc: data.backgroundImage
        ? urlFor(data.backgroundImage).width(1920).auto("format").url()
        : undefined,
      workerImageSrc: data.workerImage
        ? urlFor(data.workerImage).width(1200).auto("format").url()
        : undefined,
      workerImageAlt: data.workerImageAlt,
    };
  } catch (err) {
    console.error("[lib/sanity] Error al obtener hero:", err);
    return null;
  }
}

export async function getProyectos(): Promise<Proyecto[] | null> {
  const client = getSanityClient();
  if (!client) return null;

  try {
    const data = await client.fetch<SanityProyectoDoc[]>(proyectosQuery, {}, { next: { tags: ["proyecto"] } });
    if (!data || data.length === 0) return null;

    return data.filter(isCompleteProyecto).map((item) => ({
      nombre: item.nombre,
      subtitulo: item.subtitulo,
      descripcion: item.descripcion,
      innovacionTecnica: item.innovacionTecnica || undefined,
      ubicacion: item.ubicacion || undefined,
      tipologia: item.tipologia,
      superficie: item.superficie || undefined,
      estado: item.estado,
      anio: item.anio || undefined,
      imageSrc: urlFor(item.imagen).width(1600).auto("format").url(),
      imageAlt: item.imageAlt,
    }));
  } catch (err) {
    console.error("[lib/sanity] Error al obtener proyectos:", err);
    return null;
  }
}

export async function getFooter(): Promise<Partial<FooterProps> | null> {
  const client = getSanityClient();
  if (!client) return null;

  try {
    const data = await client.fetch<SanityFooterDoc | null>(footerQuery, {}, { next: { tags: ["footer"] } });
    if (!data) return null;

    return { headline: data.headline, email: data.email };
  } catch (err) {
    console.error("[lib/sanity] Error al obtener footer:", err);
    return null;
  }
}
