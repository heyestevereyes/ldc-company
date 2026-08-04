import { defineField, defineType } from "sanity";

/** Replica el subconjunto editorial de FooterProps (components/sections/Footer.tsx):
 * solo headline y email de contacto. Logo y companyName quedan fuera del CMS
 * a propósito, por la misma razón que en heroType — son marca/branding fijos. */
export const footerType = defineType({
  name: "footer",
  title: "Footer",
  type: "document",
  fields: [
    defineField({
      name: "headline",
      title: "Titular",
      type: "text",
      rows: 2,
      description: 'Usa un salto de línea donde deba quebrar el titular (equivale al "\\n" del código).',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "email",
      title: "Email de contacto",
      type: "string",
      validation: (Rule) => Rule.required().email(),
    }),
  ],
  preview: {
    select: { title: "headline", subtitle: "email" },
  },
});
