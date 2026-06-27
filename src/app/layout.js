import "./globals.css";
import { Fraunces, Inter } from "next/font/google";

const display = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

export const metadata = {
  title: "Lumora — Learn tech & AI by building",
  description:
    "Lumora turns “I want to learn X” into a personalized, project-based path, taught by an AI mentor that talks you through every step.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="font-sans antialiased bg-cream-50 text-espresso-900 min-h-screen">
        <div className="lumora-stars" aria-hidden="true" />
        <div className="lumora-aurora" aria-hidden="true" />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
