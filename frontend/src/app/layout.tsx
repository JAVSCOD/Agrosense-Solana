import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "AgroSense",
  description: "Sistema inteligente de monitoreo agrícola",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">

        {/* 🔥 AQUÍ SE INYECTA TODO */}
        <Providers>
          {children}
        </Providers>

      </body>
    </html>
  );
}

