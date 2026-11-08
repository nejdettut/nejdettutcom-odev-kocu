import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Ödev Koçu — nejdettut.com",
  description:
    "Ödev sorusunu yaz — yapay zekâ cevabı vermez, Socratic yöntemle yolu açar. İpuçları, yönlendirici sorular ve çözüm adımları.",
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
