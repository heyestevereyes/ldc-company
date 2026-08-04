/**
 * Migración inicial de contenido a Sanity: crea los documentos hero,
 * proyecto (x4) y footer con el mismo contenido que hoy vive hardcodeado
 * como fallback en components/sections/*.tsx (ver DEFAULT_PROYECTOS en
 * Trayectoria.tsx y los valores por defecto de HeroSection/Footer).
 *
 * Uso: npx tsx scripts/migrate-sanity-content.ts
 *
 * Idempotente: usa createOrReplace con _id fijo por documento, así que
 * correrlo más de una vez actualiza en vez de duplicar.
 */
import { createClient } from "@sanity/client";
import { createReadStream, existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, "..");

/** tsx no carga .env.local automáticamente (a diferencia de `next dev`) —
 * lo leemos a mano antes de tocar process.env. */
function loadEnvLocal(): void {
  const envPath = resolve(rootDir, ".env.local");
  if (!existsSync(envPath)) return;

  for (const line of readFileSync(envPath, "utf-8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;

    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnvLocal();

function isPending(value: string | undefined): boolean {
  return !value || value.startsWith("PENDIENTE_");
}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_API_TOKEN;

if (isPending(projectId)) {
  console.error(
    "[migrate] NEXT_PUBLIC_SANITY_PROJECT_ID no está configurado en .env.local todavía.",
  );
  process.exit(1);
}

if (isPending(token)) {
  console.error(
    "[migrate] SANITY_API_TOKEN no está configurado todavía (placeholder PENDIENTE_ " +
      "detectado en .env.local) — no se corrió ninguna migración.\n\n" +
      `Genera uno con permisos de escritura en:\n` +
      `  https://www.sanity.io/manage/project/${projectId}/api → pestaña "Tokens" → "Add API token"\n` +
      `  (nombre: "Migración de contenido", permisos: "Editor")\n\n` +
      "Pega el token en .env.local reemplazando el placeholder de SANITY_API_TOKEN y vuelve a correr:\n" +
      "  npx tsx scripts/migrate-sanity-content.ts",
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: "2025-01-01",
  useCdn: false,
});

const imagesDir = resolve(rootDir, "public", "images");

interface SanityImageValue {
  _type: "image";
  asset: { _type: "reference"; _ref: string };
}

/** Sanity direcciona los assets por hash de contenido — re-subir el mismo
 * archivo en corridas repetidas del script reutiliza el asset existente en
 * vez de duplicarlo. */
async function uploadImage(filename: string): Promise<SanityImageValue> {
  const filePath = resolve(imagesDir, filename);
  const asset = await client.assets.upload("image", createReadStream(filePath), { filename });
  return { _type: "image", asset: { _type: "reference", _ref: asset._id } };
}

async function migrateHero(): Promise<void> {
  const [backgroundImage, workerImage] = await Promise.all([
    uploadImage("hero-background.png"),
    uploadImage("hero-worker.png"),
  ]);

  await client.createOrReplace({
    _id: "hero",
    _type: "hero",
    headline: "Construimos\nun futuro para ti.",
    description:
      "En Lithos construimos espacios pensados para resistir el tiempo y acompañar generaciones. Porque un hogar no se mide en metros, se mide en los años que es capaz de permanecer.",
    backgroundImage,
    workerImage,
    workerImageAlt: "Trabajador de Lithos observando la obra en construcción",
  });

  console.log("✓ hero");
}

interface ProyectoSeed {
  id: string;
  orden: number;
  nombre: string;
  subtitulo: string;
  ubicacion?: string;
  tipologia: string;
  superficie?: string;
  estado: string;
  anio?: string;
  imageFile: string;
  imageAlt: string;
  descripcion: string;
  innovacionTecnica?: string;
}

// Mismo contenido y mismo orden que DEFAULT_PROYECTOS en
// components/sections/Trayectoria.tsx.
const PROYECTOS: ProyectoSeed[] = [
  {
    id: "proyecto-san-francisco",
    orden: 1,
    nombre: "San Francisco",
    subtitulo: "Complejo Residencial San Francisco (En Desarrollo)",
    ubicacion: "San Juan del Río, Querétaro",
    tipologia: "Complejo residencial",
    superficie: "60 m² por departamento",
    estado: "Actualmente en ejecución",
    anio: "2023",
    imageFile: "sanfrancisco_cover.jpg",
    imageAlt:
      "Fachada del Complejo Residencial San Francisco al atardecer, en San Juan del Río, Querétaro",
    descripcion:
      "Complejo residencial de alta densidad con 18 torres y 8 departamentos por torre de 60 m² cada uno. Cada unidad cuenta con autonomía hídrica propia, y el conjunto ofrece seguridad privada 24/7 y áreas infantiles de uso común.",
    innovacionTecnica:
      "El proyecto pasó de un sistema tradicional de tabique a uno industrializado con moldes de precisión en 2026, logrando mayor eficiencia y un menor margen de error en la obra.",
  },
  {
    id: "proyecto-villas-de-la-cruz",
    orden: 2,
    nombre: "Villas de la Cruz",
    subtitulo: "Complejo Residencial Villas de la Cruz",
    ubicacion: "San Juan del Río, Querétaro",
    tipologia: "Complejo residencial",
    superficie: "80 – 140 m²",
    estado: "Concluido",
    anio: "2017 – 2022",
    imageFile: "villasdelacruz_cover.jpg",
    imageAlt:
      "Fachada de las Villas de la Cruz, complejo residencial de estilo colonial en San Juan del Río, Querétaro",
    descripcion:
      "Desarrollo residencial de casas con un distinguido estilo colonial, con superficies que varían desde los 80 m² hasta los 140 m² de construcción aproximadamente. Las viviendas fueron diseñadas con una distribución óptima que incluye 3 recámaras, 2 y ½ baños, jardín trasero y 2 cajones de estacionamiento. El complejo destaca por su infraestructura de seguridad integral, operando con control de acceso y vigilancia las 24 horas, los 7 días de la semana.",
  },
  {
    id: "proyecto-san-gerardo",
    orden: 3,
    nombre: "San Gerardo",
    subtitulo: "Desarrollo Residencial San Gerardo",
    ubicacion: "San Miguel de Allende, Guanajuato",
    tipologia: "Desarrollo habitacional",
    estado: "Planeación y Proyección a Futuro",
    imageFile: "sangerardo_cover.jpg",
    imageAlt:
      "Vista del desarrollo residencial San Gerardo en construcción, en San Miguel de Allende, Guanajuato",
    descripcion:
      "Con este próximo paso estratégico en una de las ciudades con mayor plusvalía y atractivo cultural del país, Lithos Development Company reafirma su compromiso de expandir su huella habitacional bajo premisas de alta calidad, diseño vanguardista y valor patrimonial a largo plazo.",
  },
  {
    id: "proyecto-divisiones-estrategicas-de-suministro",
    orden: 4,
    nombre: "Divisiones Estratégicas de Suministro",
    subtitulo: "Concretera y Bloquera",
    // Sin ubicación: abastece varios proyectos en la región, no tiene una sede única.
    tipologia: "División industrial / de suministro",
    superficie: "No aplica",
    estado: "En operación",
    anio: "2018",
    imageFile: "divisiones-suministro_cover.jpg",
    imageAlt:
      "Planta de concretera y bloquera de Lithos Development Company en operación, con silos, camión revolvedor y block apilado",
    descripcion:
      "Fundadas en 2018 a la par del crecimiento de la firma, las divisiones de Concretera y Bloquera nacieron con el objetivo estratégico de asegurar el autoabastecimiento y control de calidad de los materiales de la empresa. Además de blindar la cadena de suministro interna, estas plantas producen y abastecen activamente diversos proyectos constructivos e industriales en los alrededores de la región de Polotitlán y San Juan del Río.",
  },
];

async function migrateProyectos(): Promise<void> {
  for (const p of PROYECTOS) {
    const imagen = await uploadImage(p.imageFile);

    await client.createOrReplace({
      _id: p.id,
      _type: "proyecto",
      orden: p.orden,
      nombre: p.nombre,
      subtitulo: p.subtitulo,
      ...(p.ubicacion ? { ubicacion: p.ubicacion } : {}),
      tipologia: p.tipologia,
      ...(p.superficie ? { superficie: p.superficie } : {}),
      estado: p.estado,
      ...(p.anio ? { anio: p.anio } : {}),
      imagen,
      imageAlt: p.imageAlt,
      descripcion: p.descripcion,
      ...(p.innovacionTecnica ? { innovacionTecnica: p.innovacionTecnica } : {}),
    });

    console.log(`✓ proyecto: ${p.nombre}`);
  }
}

async function migrateFooter(): Promise<void> {
  await client.createOrReplace({
    _id: "footer",
    _type: "footer",
    headline: "Hagamos tu proyecto\nrealidad.",
    email: "ventas@ldc-lithosdev.com",
  });

  console.log("✓ footer");
}

async function main() {
  console.log(`[migrate] Proyecto ${projectId} / dataset ${dataset}\n`);
  await migrateHero();
  await migrateProyectos();
  await migrateFooter();
  console.log("\n[migrate] Listo. Revisa /studio para confirmar el contenido.");
}

main().catch((err) => {
  console.error("[migrate] Error:", err);
  process.exit(1);
});
