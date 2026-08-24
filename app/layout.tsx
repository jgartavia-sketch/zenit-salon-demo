import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";
import "./home-directory.css";
import "./luxury-theme.css";

const SITE_AVAILABLE = false;

const cormorant = Cormorant_Garamond({
  variable: "--font-zenit-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-zenit-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sitio no disponible",
  description: "Este sitio no se encuentra disponible actualmente.",
  robots: {
    index: false,
    follow: false,
  },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${cormorant.variable} ${manrope.variable} antialiased`}
      >
        {SITE_AVAILABLE ? (
          children
        ) : (
          <main
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 999999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              minHeight: "100vh",
              margin: 0,
              padding: "24px",
              background: "#ffffff",
              color: "#111111",
              fontFamily: "Arial, sans-serif",
              textAlign: "center",
            }}
          >
            <h1
              style={{
                margin: 0,
                fontSize: "clamp(24px, 5vw, 42px)",
                fontWeight: 500,
              }}
            >
              Sitio no disponible
            </h1>
          </main>
        )}
      </body>
    </html>
  );
}