import type { Metadata } from "next";
import { Instrument_Sans, Fraunces, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

// Instrument Sans (humanist body) + Fraunces (characterful serif for display
// numerals) gives the app an editorial, hand-crafted feel - not the default
// Inter-on-dark look.
const sans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  axes: ["opsz", "SOFT"],
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "EcoSphere - ESG Management Platform",
  description:
    "Measure and improve Environmental, Social, and Governance performance from one dashboard, with a live scoring engine and an AI ESG Copilot.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${display.variable} ${mono.variable} dark`}
    >
      <body className="font-sans">
        {children}
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: "rgba(32,27,16,0.92)",
              border: "1px solid rgba(217,201,163,0.14)",
              backdropFilter: "blur(12px)",
              color: "#E9E0CE",
            },
          }}
        />
      </body>
    </html>
  );
}
