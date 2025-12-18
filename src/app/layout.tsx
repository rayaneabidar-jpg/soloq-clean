import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { Analytics } from "@vercel/analytics/next"

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Ranking Challenge",
  description: "Organisez, rejoignez et suivez vos challenges",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={poppins.variable}>
      <body className="antialiased font-sans flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 w-full max-w-[1400px] mx-auto px-6 sm:px-12 lg:px-24 py-12">
          {children}
        </main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
