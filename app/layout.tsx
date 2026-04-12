import type { Metadata } from "next";
import { Geist_Mono, Fraunces, Archivo_Black, JetBrains_Mono, Caveat } from "next/font/google";
import "./globals.css";

const archivoBlack = Archivo_Black({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-archivo-black",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-jetbrains-mono",
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-caveat",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

// Kept for possible future use; the wizard now uses JetBrains Mono directly.
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "SchoolWatch — Build your school's dashboard",
  description:
    "Build a real bell-schedule dashboard for your school in 5 minutes. Free, no code, no admin approval needed.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body
        className={`${archivoBlack.variable} ${jetbrainsMono.variable} ${caveat.variable} ${fraunces.variable} ${geistMono.variable} font-sans min-h-full`}
      >
        {children}
      </body>
    </html>
  );
}
