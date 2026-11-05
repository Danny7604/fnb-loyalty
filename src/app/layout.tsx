import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#8B1E1E",
};

export const metadata: Metadata = {
  title: "Đạt Lẩu & Nướng • Thực Đơn Điện Tử & Khách Hàng Thân Thiết",
  description: "Thực đơn điện tử gọi món tại bàn và hệ thống tích điểm thành viên cho quán Đạt Lẩu & Nướng.",
  icons: {
    icon: "/favicon.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="h-full antialiased dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var mode = localStorage.getItem('theme_mode') || 'auto';
                var isDark = mode === 'dark' || (mode === 'auto' && (new Date().getHours() >= 18 || new Date().getHours() < 6));
                if (isDark) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-stone-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 font-sans selection:bg-amber-500 selection:text-neutral-950 transition-colors duration-200">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
