import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cynefin Sense-Making Engine",
  description:
    "A sense-making operating system for stories, Cynefin mapping, probes, signals, and learning.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
