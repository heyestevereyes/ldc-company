import { HeroSection, NosotrosSection, Trayectoria } from "@/components/sections";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <HeroSection />
      <NosotrosSection />
      <Trayectoria />
    </main>
  );
}
