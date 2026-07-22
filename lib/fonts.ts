import localFont from "next/font/local";

// Satoshi (Fontshare, licencia libre para uso comercial) — titulares, nav y logo.
export const satoshi = localFont({
  src: "../public/fonts/Satoshi-Medium.woff2",
  weight: "500",
  style: "normal",
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
