import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gank Requester",
  description: "Request ganks from your jungler",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
