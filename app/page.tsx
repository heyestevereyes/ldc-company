import { HeroSection, NosotrosSection, Trayectoria, Footer } from "@/components/sections";

export default function Home() {
  return (
    <>
      <main className="flex flex-1 flex-col">
        <HeroSection />
        <NosotrosSection />
        <Trayectoria />
      </main>
      <Footer />
    </>
  );
}
