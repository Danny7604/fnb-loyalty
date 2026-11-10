"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import {
  BarChart3,
  Users,
  UtensilsCrossed,
  Ticket,
  Gift,
  Store,
  ExternalLink,
  CreditCard,
  ChevronRight,
} from "lucide-react";

const navItems = [
  { id: "overview",  label: "Báo Cáo Doanh Thu", href: "/admin?tab=overview", icon: BarChart3,       color: "text-emerald-400" },
  { id: "menu",      label: "Quản Lý Thực Đơn",  href: "/admin?tab=menu",     icon: UtensilsCrossed, color: "text-orange-400"  },
  { id: "rewards",   label: "Mốc Đổi Thưởng",    href: "/admin?tab=rewards",  icon: Gift,            color: "text-red-400"     },
  { id: "customers", label: "Khách Hàng (CRM)",  href: "/admin?tab=customers",icon: Users,           color: "text-sky-400"     },
  { id: "vouchers",  label: "Kho Voucher & Quà", href: "/admin?tab=vouchers", icon: Ticket,          color: "text-pink-400"    },
];

function AdminNavContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "overview";

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col md:flex-row">
      {/* ── Desktop Sidebar ───────────────────────────────────────────────── */}
      <aside className="hidden md:flex w-64 bg-neutral-900 border-r border-neutral-800 flex-col shrink-0 sticky top-0 h-screen overflow-hidden">
        {/* Brand */}
        <div className="p-5 border-b border-neutral-800">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full border border-neutral-700 bg-neutral-950 shrink-0 overflow-hidden flex items-center justify-center">
              <img
                src="/logo.png"
                alt="Đạt Lẩu & Nướng"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h2 className="font-black text-sm tracking-tight text-white leading-tight">ĐẠT LẨU &amp; NƯỚNG</h2>
              <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">Admin Portal Tổng</span>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="p-3 space-y-0.5 flex-1 overflow-y-auto">
          <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest px-3 py-2.5">
            Chức năng quản trị
          </p>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === "/admin" ? currentTab === item.id : pathname.includes(item.id);
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 overflow-hidden ${
                  isActive
                    ? "bg-amber-500/15 text-white"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-800/80"
                }`}
              >
                {/* Active left-border indicator */}
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-0.5 bg-amber-400 rounded-r-full animate-active-bar" />
                )}
                {/* Active icon indicator */}
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? item.color : "text-neutral-500 group-hover:text-neutral-300"
                  }`}
                />
                <span className={isActive ? "font-bold text-white" : ""}>{item.label}</span>

                {isActive && (
                  <ChevronRight className="w-3.5 h-3.5 ml-auto text-amber-400/70" />
                )}
              </Link>
            );
          })}

          {/* Quick links section */}
          <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest px-3 pt-5 pb-2">
            Lối tắt vận hành
          </p>

          <Link
            href="/cashier"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-emerald-400 bg-emerald-950/30 border border-emerald-800/30 hover:bg-emerald-950/60 hover:border-emerald-700/50 transition press-scale"
          >
            <div className="flex items-center gap-2.5">
              <CreditCard className="w-4 h-4" />
              <span>Màn Hình Thu Ngân</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>

          <Link
            href="/menu"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-amber-400 bg-amber-950/30 border border-amber-800/30 hover:bg-amber-950/60 hover:border-amber-700/50 transition mt-1 press-scale"
          >
            <div className="flex items-center gap-2.5">
              <Store className="w-4 h-4" />
              <span>Menu Khách Xem (Live)</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </nav>

        {/* Footer profile */}
        <div className="p-4 border-t border-neutral-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-xs font-black text-white shrink-0">
              Đ
            </div>
            <div>
              <p className="font-bold text-xs text-white leading-tight">Chủ Quán</p>
              <p className="text-[10px] text-neutral-500 font-mono">admin@datlaunuong.vn</p>
            </div>
          </div>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold border border-emerald-500/20">
            ● Online
          </span>
        </div>
      </aside>

      {/* ── Mobile Bottom Navigation ──────────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-neutral-900/95 backdrop-blur-md border-t border-neutral-800 flex items-stretch">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === "/admin" ? currentTab === item.id : pathname.includes(item.id);
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-all press-scale relative ${
                isActive ? "text-amber-400" : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              {isActive && (
                <span className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-amber-400 rounded-b-full animate-active-bar" />
              )}
              <Icon className="w-4.5 h-4.5" />
              <span className={`text-[9px] font-semibold leading-tight truncate max-w-14 text-center ${isActive ? "font-bold" : ""}`}>
                {item.label.split(" ")[0]}
              </span>
            </Link>
          );
        })}
        {/* Cashier quick link */}
        <Link
          href="/cashier"
          className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-emerald-400 hover:text-emerald-300 transition press-scale"
        >
          <CreditCard className="w-4.5 h-4.5" />
          <span className="text-[9px] font-bold leading-tight">Thu Ngân</span>
        </Link>
      </nav>

      {/* ── Main Content ──────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto min-h-screen pb-16 md:pb-0">{children}</main>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-950 text-neutral-400 text-xs p-6">Đang tải...</div>}>
      <AdminNavContent>{children}</AdminNavContent>
    </Suspense>
  );
}
