import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import AntdProvider from "@/src/providers/AntdProvider";

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AetherERP – Your Team's Brain, Always Accessible",
  description:
    "AetherERP keeps your collective intelligence flowing across every tool, every conversation, every decision. Never lose context again.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jakartaSans.variable}`}>
      <body className="min-h-full flex flex-col">
        <AntdProvider>{children}</AntdProvider>
      </body>
    </html>
  );
}
