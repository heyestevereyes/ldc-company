import { defineField, defineType } from "sanity";

/** Replica la interface Proyecto (components/sections/Trayectoria.tsx) campo
 * a campo. Los campos opcionales ahí (ubicacion, superficie, anio,
 * innovacionTecnica) se dejan sin validación required aquí: un valor vacío
 * se omite en el lightbox exactamente igual que un campo undefined en la
 * interface — no hace falta ningún mapeo especial entre CMS y componente. */
export const proyectoType = defineType({
  name: "proyecto",
  title: "Proyecto",
  type: "document",
  fields: [
    defineField({
      name: "nombre",
      title: "Nombre",
      type: "string",
      description: "Nombre corto que titula la tarjeta y el lightbox.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "subtitulo",
      title: "Subtítulo",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "descripcion",
      title: "Descripción",
      type: "text",
      rows: 4,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "innovacionTecnica",
      title: "Innovación técnica",
      type: "text",
      rows: 4,
      description:
        "Opcional. Solo se muestra en el lightbox cuando el proyecto tiene una narrativa de innovación técnica que contar.",
    }),
    defineField({
      name: "ubicacion",
      title: "Ubicación",
      type: "string",
      description:
        "Déjalo vacío si el proyecto no tiene una sede única (p. ej. una división de suministro que abastece varias regiones).",
    }),
    defineField({
      name: "tipologia",
      title: "Tipología",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "superficie",
      title: "Superficie",
      type: "string",
      description: 'P. ej. "80 – 140 m²" o "No aplica". Déjalo vacío para mostrar "Por definir".',
    }),
    defineField({
      name: "estado",
      title: "Estado",
      type: "string",
      description: 'P. ej. "Concluido", "Actualmente en ejecución", "En operación".',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "anio",
      title: "Año",
      type: "string",
      description: 'P. ej. "2017 – 2022". Déjalo vacío para mostrar "Por definir".',
    }),
    defineField({
      name: "imagen",
      title: "Imagen de portada",
      type: "image",
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "imageAlt",
      title: "Texto alternativo de la imagen",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "orden",
      title: "Orden en el carrusel",
      type: "number",
      description: "Posición del proyecto en el carrusel de Trayectoria — menor va primero.",
      validation: (Rule) => Rule.required(),
    }),
  ],
  orderings: [
    {
      title: "Orden en el carrusel",
      name: "ordenAsc",
      by: [{ field: "orden", direction: "asc" }],
    },
  ],
  preview: {
    select: { title: "nombre", subtitle: "subtitulo", media: "imagen" },
  },
});
