"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Users,
  Coins,
  Repeat,
  ArrowUpRight,
  Receipt,
  Crown,
  Calendar,
  Gift,
  PlusCircle,
  ExternalLink,
} from "lucide-react";
import { Customer, PointTransaction } from "@/lib/types";
import { formatVND, formatDate } from "@/lib/utils";

export default function AdminDashboardPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [custRes, txRes] = await Promise.all([
          fetch("/api/customers"),
          fetch("/api/transactions"),
        ]);
        const custJson = await custRes.json();
        const txJson = await txRes.json();

        if (custJson.success) setCustomers(custJson.data);
        if (txJson.success) setTransactions(txJson.data);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Compute metrics
  const totalRevenue = transactions.reduce((acc, t) => acc + (t.billAmount || 0), 0);
  const totalPointsGiven = transactions.filter((t) => t.type === "EARN").reduce((acc, t) => acc + t.points, 0);
  const totalDiscountGiven = transactions.reduce((acc, t) => acc + (t.discountAmount || 0), 0);

  // Top customers by spend
  const topCustomers = [...customers].sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 5);

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Báo Cáo Doanh Thu & Chỉ Số Loyalty</h1>
          <p className="text-xs text-neutral-400 mt-1">
            Tổng quan hiệu quả chương trình khách hàng thân thiết cho quán lẩu nướng
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/cashier"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-lg shadow-emerald-950/40"
          >
            <PlusCircle className="w-4 h-4" />
            Tích điểm tại quầy
          </Link>
        </div>
      </div>

      {/* 4 Quick Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-semibold">Doanh Thu Qua Tích Điểm</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white">{formatVND(totalRevenue)}</p>
          <p className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5" /> Ghi nhận qua {transactions.length} lượt hóa đơn
          </p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-semibold">Khách Hàng Thành Viên</span>
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white">{customers.length} khách</p>
          <p className="text-[11px] text-neutral-400">Đã lưu hồ sơ SĐT và ngày sinh</p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-semibold">Điểm Tích Lũy Đã Phát</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-400 font-mono">+{totalPointsGiven} pts</p>
          <p className="text-[11px] text-amber-300/80">Tương đương ~{formatVND(totalPointsGiven * 1000)} tiền mặt</p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-semibold">Tỷ Lệ Tái Ghé (Retention)</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Repeat className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-purple-400">75%</p>
          <p className="text-[11px] text-neutral-400">Khách có từ 2 lần ghé quán trở lên</p>
        </div>
      </div>

      {/* Main Grid: Transactions & VIP Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Transactions (Col 8) */}
        <div className="lg:col-span-8 bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-400" />
              Lịch Sử Giao Dịch Tích Điểm Gần Đây
            </h3>
            <span className="text-xs text-neutral-500 font-mono">{transactions.length} giao dịch</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-400">
                  <th className="pb-3 font-semibold">Mã Hóa Đơn</th>
                  <th className="pb-3 font-semibold">Khách Hàng</th>
                  <th className="pb-3 font-semibold">Tiền Hóa Đơn</th>
                  <th className="pb-3 font-semibold">Điểm Tích / Tiêu</th>
                  <th className="pb-3 font-semibold">Thu Ngân</th>
                  <th className="pb-3 font-semibold">Thời Gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-neutral-500">
                      Chưa có giao dịch tích điểm nào. Hãy vào Màn hình Thu ngân để tạo giao dịch đầu tiên!
                    </td>
                  </tr>
                ) : (
                  transactions.slice(0, 8).map((t) => (
                    <tr key={t.id} className="hover:bg-neutral-800/40 transition">
                      <td className="py-3 font-mono font-bold text-neutral-300">{t.billCode || "HD-LE"}</td>
                      <td className="py-3">
                        <p className="font-bold text-white">{t.customerName}</p>
                        <p className="text-[11px] text-neutral-500 font-mono">{t.customerPhone}</p>
                      </td>
                      <td className="py-3 font-bold text-white">{formatVND(t.billAmount || 0)}</td>
                      <td className="py-3">
                        {t.type === "EARN" ? (
                          <span className="font-bold text-emerald-400 font-mono">+{t.points} pts</span>
                        ) : (
                          <span className="font-bold text-rose-400 font-mono">{t.points} pts</span>
                        )}
                      </td>
                      <td className="py-3 text-neutral-400">{t.staffName || "Thu Ngân"}</td>
                      <td className="py-3 text-neutral-500">{formatDate(t.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Spending Customers (Col 4) */}
        <div className="lg:col-span-4 bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-400" />
              Khách VIP Chi Tiêu Cao Nhất
            </h3>
            <Link href="/admin/customers" className="text-xs text-amber-400 hover:underline">
              Xem tất cả
            </Link>
          </div>

          <div className="space-y-3">
            {topCustomers.map((cust, idx) => (
              <div
                key={cust.id}
                className="flex items-center justify-between p-3 rounded-xl bg-neutral-950/70 border border-neutral-800/80 hover:border-neutral-700 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-neutral-800 flex items-center justify-center font-bold text-xs text-amber-400">
                    #{idx + 1}
                  </div>
                  <div>
                    <p className="font-bold text-xs text-white leading-tight">{cust.fullName}</p>
                    <p className="text-[10px] text-neutral-500 font-mono">{cust.phone}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xs font-black text-amber-400">{formatVND(cust.totalSpent)}</p>
                  <span className="text-[10px] text-neutral-400 bg-neutral-800 px-1.5 py-0.5 rounded">
                    {cust.tierName || "Hạng Đồng"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
