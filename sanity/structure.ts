import type { StructureResolver } from "sanity/structure";

/** hero y footer son singletons (un solo documento de contenido por
 * sección, con _id fijo) — se editan directo en vez de listarse como una
 * colección. proyecto sí es una colección real (uno por tarjeta del
 * carrusel de Trayectoria). */
const SINGLETON_TYPES = new Set(["hero", "footer"]);

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Contenido")
    .items([
      S.listItem()
        .title("Hero")
        .id("hero")
        .child(S.document().schemaType("hero").documentId("hero")),
      S.listItem()
        .title("Proyectos (Trayectoria)")
        .schemaType("proyecto")
        .child(S.documentTypeList("proyecto").title("Proyectos")),
      S.listItem()
        .title("Footer")
        .id("footer")
        .child(S.document().schemaType("footer").documentId("footer")),
      S.divider(),
      ...S.documentTypeListItems().filter((item) => {
        const id = item.getId();
        return id !== undefined && !SINGLETON_TYPES.has(id) && id !== "proyecto";
      }),
    ]);
