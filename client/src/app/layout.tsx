import { Providers } from "@/hook/provider";
import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

const font = Nunito({
  weight: ["200", "300", "400", "500", "700", "900"],
  style: ["normal", "italic"],
  subsets: ["latin", "vietnamese"],
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
      <body className={font.className}>
        <Providers>
          <div className="block md:hidden">{children}</div>
        </Providers>

        <div className="hidden md:flex w-screen h-screen items-center justify-center bg-[#f5f5f5]">
          <span className="text-xl">Unsupported media type</span>
        </div>
      </body>
    </html>
  );
}
