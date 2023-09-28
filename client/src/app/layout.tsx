import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";

const roboto = Roboto({
  weight: ["100", "300", "400", "500", "700", "900"],
  style: ["normal", "italic"],
  subsets: ["vietnamese"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Smart Home",
  description: "Smart Home by NextJS",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className={roboto.className}>{children}</body>
    </html>
  );
}
