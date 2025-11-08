import type { Metadata } from "next";
import "./globals.css";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

export const metadata: Metadata = {
  title: "SoloQ Challenge",
  description: "Community SoloQ challenge tracker",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body suppressHydrationWarning className="min-h-screen bg-neutral-950 text-neutral-100">
        <Header />
        {children}
        <Footer /> 
      </body>
    </html>
  );

}
