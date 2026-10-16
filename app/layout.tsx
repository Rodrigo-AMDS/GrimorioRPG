import type { Metadata } from "next";
import "./globals.css";
import { IntroSplash } from "@/components/intro-splash";

export const metadata: Metadata = { title: "O Grimório do Mestre", description: "Plataforma de campanhas de RPG" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body><IntroSplash />{children}</body></html>;
}
