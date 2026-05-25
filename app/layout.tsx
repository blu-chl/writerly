import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Writerly — Tu espacio de escritura",
  description: "Crea, organiza y exporta tus libros desde cualquier dispositivo",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
