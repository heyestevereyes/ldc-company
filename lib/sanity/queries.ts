import groq from "groq";

/** hero y footer son singletons: sanity/structure.ts fuerza su _id a un
 * valor fijo ("hero" / "footer"), así que se consultan por _id en vez de
 * `*[_type == "..."][0]` (que sería ambiguo si alguna vez hubiera más de
 * un documento del tipo). */
export const heroQuery = groq`*[_id == "hero"][0]{
  headline,
  description,
  backgroundImage,
  workerImage,
  workerImageAlt
}`;

export const proyectosQuery = groq`*[_type == "proyecto"] | order(orden asc){
  nombre,
  subtitulo,
  descripcion,
  innovacionTecnica,
  ubicacion,
  tipologia,
  superficie,
  estado,
  anio,
  imagen,
  imageAlt
}`;

export const footerQuery = groq`*[_id == "footer"][0]{
  headline,
  email
}`;
