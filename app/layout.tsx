import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "llamafile.chat — a UI for your llamafile",
  description:
    "A single-page chat interface for talking to a locally running llamafile server.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
