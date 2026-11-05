import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0a0a0a",
};

export const metadata: Metadata = {
  title: "Khói & Vị • Hệ Thống Loyalty & Menu Online Quán Lẩu Nướng",
  description: "Hệ thống quản lý khách hàng thân thiết, tích điểm đổi thưởng và menu online gọi món tại bàn cho quán lẩu nướng.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col bg-neutral-950 text-neutral-100 font-sans selection:bg-amber-500 selection:text-neutral-950">
        {children}
      </body>
    </html>
  );
}
