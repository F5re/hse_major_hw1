import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import "./globals.css";

export const metadata: Metadata = {
  title: "генИИ — проверка подозрительного письма",
  description: "Объяснимый анализ признаков мошенничества в тексте делового письма"
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#f4f7f6" };

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  await headers();
  return <html lang="ru"><body>{children}</body></html>;
}
