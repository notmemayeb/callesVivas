import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CallesVivas - Tu barrio, tu voz",
  description:
    "Reporta problemas en tu barrio, vota las prioridades y los periodistas investigan. Plataforma ciudadana integrada con eldiario.es.",
  openGraph: {
    title: "CallesVivas",
    description: "Plataforma ciudadana de reporte de incidencias urbanas",
    locale: "es_ES",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col font-sans">
        <Providers>
          {children}
          <Toaster position="top-center" />
        </Providers>
      </body>
    </html>
  );
}
