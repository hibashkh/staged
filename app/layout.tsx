import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Staged",
  description: "Turn empty rooms into styled, shoppable spaces.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-50 text-neutral-900">
        {children}
      </body>
    </html>
  );
}
