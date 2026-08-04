import { metadata, viewport } from "next-sanity/studio";
import StudioClient from "./StudioClient";

export { metadata, viewport };

// El Studio es una SPA client-side (StudioClient la monta entera en el
// navegador) — no hay nada que renderizar por request.
export const dynamic = "force-static";

export default function StudioPage() {
  return <StudioClient />;
}
