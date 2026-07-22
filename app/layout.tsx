import type { Metadata } from "next";
import { satoshi, inter } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "LDC | Lithos Development Company",
  description:
    "Construimos espacios pensados para resistir el tiempo y acompañar generaciones. Lithos Development Company transforma terrenos en comunidades residenciales duraderas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${satoshi.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
