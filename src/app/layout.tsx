import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import "./dark-theme.css";
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
    { media: "(prefers-color-scheme: light)", color: "#f2f6ef" },
    { media: "(prefers-color-scheme: dark)", color: "#27292d" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} h-full antialiased`}
    >
      <head>
        <ThemeInitializer />
      </head>
      <body className="min-h-full">
        {children}
      </body>
    </html>
  );
}
