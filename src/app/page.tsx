"use client";

import Link from "next/link";
import {
  Flame,
  QrCode,
  CreditCard,
  BarChart3,
  Users,
  UtensilsCrossed,
  Ticket,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  Layers,
  Database,
  Cloud,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between selection:bg-amber-500 selection:text-neutral-950">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-red-600/15 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 -left-40 w-[400px] h-[400px] bg-amber-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-neutral-800/80 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full p-0.5 bg-gradient-to-tr from-red-700 via-amber-500 to-red-800 shadow-md shadow-red-950/60 shrink-0 overflow-hidden flex items-center justify-center">
            <img
              src="/logo.png"
              alt="Đạt Lẩu & Nướng"
              className="w-full h-full object-contain rounded-full bg-neutral-950"
            />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
              ĐẠT LẨU &amp; NƯỚNG
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 font-semibold">
                Hotpot &amp; BBQ
              </span>
            </span>
            <p className="text-[11px] text-neutral-400">Hệ Sinh Thái Loyalty &amp; Menu Online Quán Lẩu Nướng</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="hidden sm:inline-flex items-center gap-1.5 text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-3 py-1 rounded-full font-mono font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            MVP Ready
          </span>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-6xl mx-auto w-full px-6 py-12 flex-1 flex flex-col justify-center">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-xs text-amber-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Đồng bộ 2 trong 1: Thực đơn tại bàn + Tích điểm đổi thưởng</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Giải Pháp Vận Hành Loyalty & Thực Đơn Cho{" "}
            <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-red-500 bg-clip-text text-transparent">
              Quán Lẩu Nướng
            </span>
          </h1>

          <p className="text-sm sm:text-base text-neutral-400 leading-relaxed max-w-2xl mx-auto">
            Khách không cần tải app hay Zalo — chỉ việc quét QR xem menu hấp dẫn tại bàn và đọc số điện thoại khi tính tiền. 
            Quản lý tập trung mọi thứ trên một nền tảng duy nhất.
          </p>
        </div>

        {/* 3 Main Portals */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 1. Customer Digital Menu */}
          <Link
            href="/menu"
            className="group relative bg-neutral-900/90 hover:bg-neutral-900 border border-neutral-800 hover:border-amber-500/50 rounded-3xl p-6 transition duration-300 shadow-xl flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-red-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition">
                <QrCode className="w-6 h-6" />
              </div>

              <div>
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block mb-1">
                  Dành cho Thực Khách Tại Bàn
                </span>
                <h2 className="text-xl font-bold text-white group-hover:text-amber-400 transition">
                  Menu Online Quét QR
                </h2>
                <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                  Giao diện lẩu nướng bắt mắt, danh mục trượt mượt mà, tính năng lưu món muốn gọi (Table Wishlist) và hiển thị giá ưu đãi thành viên.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-neutral-800 flex items-center justify-between text-xs font-bold text-amber-400">
              <span>Trải nghiệm ngay</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </Link>

          {/* 2. Fast Cashier POS Screen */}
          <Link
            href="/cashier"
            className="group relative bg-neutral-900/90 hover:bg-neutral-900 border border-neutral-800 hover:border-emerald-500/50 rounded-3xl p-6 transition duration-300 shadow-xl flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition">
                <CreditCard className="w-6 h-6" />
              </div>

              <div>
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                  Dành cho Thu Ngân Quầy
                </span>
                <h2 className="text-xl font-bold text-white group-hover:text-emerald-400 transition">
                  Màn Hình Tích Điểm Nhanh
                </h2>
                <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                  Nhập SĐT tra cứu trong 1 giây. Tự động áp dụng chiết khấu hạng, tiêu điểm, voucher sinh nhật. Chạy độc lập hoặc sẵn sàng gắn API POS.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-neutral-800 flex items-center justify-between text-xs font-bold text-emerald-400">
              <span>Mở màn hình thu ngân</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </Link>

          {/* 3. Owner Admin Portal */}
          <Link
            href="/admin/dashboard"
            className="group relative bg-neutral-900/90 hover:bg-neutral-900 border border-neutral-800 hover:border-sky-500/50 rounded-3xl p-6 transition duration-300 shadow-xl flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500/20 to-indigo-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 group-hover:scale-110 transition">
                <BarChart3 className="w-6 h-6" />
              </div>

              <div>
                <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider block mb-1">
                  Dành cho Chủ Quán & Quản Lý
                </span>
                <h2 className="text-xl font-bold text-white group-hover:text-sky-400 transition">
                  Admin Portal & CRM
                </h2>
                <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                  Quản lý khách hàng CRM, kho voucher, cấu hình tích điểm/hạng thẻ, quản lý thực đơn (thêm món, đổi giá, tắt món tạm hết) và báo cáo doanh thu.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-neutral-800 flex items-center justify-between text-xs font-bold text-sky-400">
              <span>Vào trang quản trị</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </Link>
        </div>

        {/* Integration Specs & Deployment status */}
        <div className="mt-12 bg-neutral-900/50 border border-neutral-800 rounded-2xl p-5 text-xs text-neutral-400 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-neutral-800 text-amber-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-white">Kiến Trúc Cloud: Vercel + Supabase (PostgreSQL)</p>
              <p className="text-[11px] text-neutral-500">
                Sẵn sàng REST API Webhook cho POS: <code>POST /api/v1/pos/transaction</code>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-neutral-500">Database Schema:</span>
            <span className="font-mono bg-neutral-800 px-2 py-0.5 rounded text-neutral-300">Prisma ORM</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-neutral-800/80 px-6 py-4 text-center text-xs text-neutral-500">
        Hệ thống Quản lý Loyalty & Menu Online Quán Lẩu Nướng • Thiết kế dành riêng cho vận hành F&B thực chiến
      </footer>
    </div>
  );
}
