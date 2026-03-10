import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Artist Database — Discover & Explore Artists",
  description: "A searchable visual database of artists. Find by name, style, medium, and more.",
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
