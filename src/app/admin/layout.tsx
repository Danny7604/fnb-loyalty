"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Users,
  UtensilsCrossed,
  Ticket,
  Sliders,
  Store,
  ExternalLink,
  Flame,
  CreditCard,
  LogOut,
  ChevronRight,
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { label: "Báo Cáo Doanh Thu", href: "/admin/dashboard", icon: BarChart3 },
    { label: "Khách Hàng (CRM)", href: "/admin/customers", icon: Users },
    { label: "Quản Lý Thực Đơn", href: "/admin/menu-management", icon: UtensilsCrossed },
    { label: "Kho Voucher & Quà", href: "/admin/vouchers", icon: Ticket },
    { label: "Cấu Hình Tích Điểm", href: "/admin/loyalty-rules", icon: Sliders },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col md:flex-row">
      {/* Sidebar for Desktop */}
      <aside className="w-full md:w-64 bg-neutral-900 border-r border-neutral-800 flex flex-col shrink-0">
        {/* Brand */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-red-600 flex items-center justify-center">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-sm tracking-tight text-white leading-tight">KHÓI & VỊ ADMIN</h2>
              <span className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider">Loyalty & Menu Hub</span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
          <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider px-3 py-2">
            Quản trị hệ thống
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? "bg-amber-500 text-neutral-950 shadow-md font-bold"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-800"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-neutral-950" : "text-neutral-400"}`} />
                {item.label}
              </Link>
            );
          })}

          <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider px-3 pt-6 py-2">
            Lối tắt vận hành
          </div>

          {/* Quick links to Cashier and Menu */}
          <Link
            href="/cashier"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-emerald-400 bg-emerald-950/30 border border-emerald-800/40 hover:bg-emerald-950/60 transition"
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
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-amber-400 bg-amber-950/30 border border-amber-800/40 hover:bg-amber-950/60 transition mt-1"
          >
            <div className="flex items-center gap-2.5">
              <Store className="w-4 h-4" />
              <span>Menu Khách Xem (QR)</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </nav>

        {/* User profile bottom */}
        <div className="p-4 border-t border-neutral-800 text-xs flex items-center justify-between">
          <div>
            <p className="font-bold text-white">Chủ Quán</p>
            <p className="text-[11px] text-neutral-500 font-mono">admin@khoivavi.vn</p>
          </div>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold">
            Online
          </span>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto min-h-screen">{children}</main>
    </div>
  );
}
