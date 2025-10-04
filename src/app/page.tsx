import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TravelPro - AI-Powered Travel Platform",
  description: "Modern travel booking platform for operators and agents",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="antialiased h-full bg-white font-sans">
        {children}
      </body>
    </html>
  );
}