import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import { ThemeInitializer } from "@/components/ui/theme-initializer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "LastPlate — Good food deserves a second chance",
    template: "%s · LastPlate",
  },
  description:
    "LastPlate connects restaurants, hostels and messes with NGOs to turn surplus food into meaningful meals.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f7f9" },
    { media: "(prefers-color-scheme: dark)", color: "#101317" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <ThemeInitializer />
        {children}
      </body>
    </html>
  );
}
