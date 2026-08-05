import { defineArrayMember, defineField, defineType } from "sanity";

/** Replica NosotrosSectionProps (components/sections/NosotrosSection.tsx) —
 * sección "Nuestra Historia" / eyebrow "Quienes somos". paragraphs e
 * highlights son arrays en la interface (no un par fijo de campos): se
 * modelan igual acá para que el cliente pueda agregar/quitar ítems sin
 * tocar el schema. */
export const nuestraHistoriaType = defineType({
  name: "nuestraHistoria",
  title: "Nuestra Historia",
  type: "document",
  fields: [
    defineField({
      name: "eyebrow",
      title: "Eyebrow",
      type: "string",
      description: 'Etiqueta corta sobre el titular, p. ej. "Quienes somos".',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "headline",
      title: "Titular",
      type: "text",
      rows: 2,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "paragraphs",
      title: "Párrafos",
      type: "array",
      of: [defineArrayMember({ type: "text", rows: 4 })],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: "image",
      title: "Imagen de la sección",
      type: "image",
      description: "La grúa de construcción junto al bloque de texto.",
      options: { hotspot: true },
    }),
    defineField({
      name: "imageAlt",
      title: "Texto alternativo de la imagen",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "highlightsIntro",
      title: "Frase introductoria de los highlights",
      type: "text",
      rows: 3,
      description: "Frase que presenta la lista de proyectos/hitos destacados debajo del body.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "highlights",
      title: "Highlights",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "highlight",
          fields: [
            defineField({
              name: "text",
              title: "Texto",
              type: "text",
              rows: 2,
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: { select: { title: "text" } },
        }),
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
  ],
  preview: {
    select: { title: "headline", media: "image" },
  },
});
