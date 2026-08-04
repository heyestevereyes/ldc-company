import { defineField, defineType } from "sanity";

/** Replica HeroSectionProps (components/sections/HeroSection.tsx) — solo los
 * campos de contenido editorial (headline, párrafo, imágenes). Logo, nav y
 * CTA quedan fuera a propósito: son elementos de marca/navegación fijos, no
 * contenido que un editor deba tocar desde el CMS. */
export const heroType = defineType({
  name: "hero",
  title: "Hero",
  type: "document",
  fields: [
    defineField({
      name: "headline",
      title: "Titular",
      type: "text",
      rows: 2,
      description:
        'Usa un salto de línea donde deba quebrar el titular, como en el diseño (equivale al "\\n" que usa el código).',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Párrafo",
      type: "text",
      rows: 4,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "backgroundImage",
      title: "Imagen de fondo",
      type: "image",
      description: "Decorativa: foto de obra que queda detrás del overlay oscuro.",
      options: { hotspot: true },
    }),
    defineField({
      name: "workerImage",
      title: "Imagen del trabajador",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "workerImageAlt",
      title: "Texto alternativo de la imagen del trabajador",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: { title: "headline", media: "workerImage" },
  },
});
