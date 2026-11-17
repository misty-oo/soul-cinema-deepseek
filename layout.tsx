import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SOUL CINEMA | 电影人格解码器",
  description: "从你钟爱的电影，解码灵魂的三种形状。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
