import { HeroSection, NosotrosSection, Trayectoria, Footer } from "@/components/sections";
import { getHero, getProyectos, getFooter } from "@/lib/sanity";

export default async function Home() {
  // null (Sanity sin configurar, doc inexistente, o error de red) se pasa
  // como undefined a cada sección: sus props ya definen los valores por
  // defecto actuales, así que el sitio no se rompe antes de migrar el
  // contenido real a Sanity — ver lib/sanity/fetchers.ts.
  const [hero, proyectos, footer] = await Promise.all([getHero(), getProyectos(), getFooter()]);

  return (
    <>
      <main className="flex flex-1 flex-col">
        <HeroSection
          headline={hero?.headline}
          description={hero?.description}
          backgroundImageSrc={hero?.backgroundImageSrc}
          workerImageSrc={hero?.workerImageSrc}
          workerImageAlt={hero?.workerImageAlt}
        />
        <NosotrosSection />
        <Trayectoria proyectos={proyectos ?? undefined} />
      </main>
      <Footer headline={footer?.headline} email={footer?.email} />
    </>
  );
}
