import localFont from "next/font/local";

// Satoshi (Fontshare, licencia libre para uso comercial) — titulares, nav, logo
// y (peso Bold) cifras destacadas como las de la sección Nosotros.
export const satoshi = localFont({
  src: [
    { path: "../public/fonts/Satoshi-Medium.woff2", weight: "500", style: "normal" },
    { path: "../public/fonts/Satoshi-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-satoshi",
  display: "swap",
});

// Inter variable (Google Fonts, SIL Open Font License) — cuerpo de texto y botones.
export const inter = localFont({
  src: "../public/fonts/Inter-Variable.woff2",
  weight: "400 600",
  style: "normal",
  variable: "--font-inter",
  display: "swap",
});
