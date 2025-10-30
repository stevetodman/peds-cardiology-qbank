import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QBank - Pediatric Cardiology Question Bank",
  description: "UWorld-style question bank platform for pediatric cardiology learning",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
