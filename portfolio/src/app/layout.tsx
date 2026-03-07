import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SplashScreen } from "@/components/SplashScreen";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Chirag Dabhere",
  description: "Full Stack Developer & Machine Learning Enthusiast",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white`}
      >
        <SplashScreen>{children}</SplashScreen>
      </body>
    </html>
  );
}
