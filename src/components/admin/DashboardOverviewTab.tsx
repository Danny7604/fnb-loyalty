"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Users,
  Coins,
  Repeat,
  Receipt,
  Crown,
  Gift,
  PlusCircle,
} from "lucide-react";
import { Customer, PointTransaction } from "@/lib/types";
import { formatVND, formatDate } from "@/lib/utils";

// Animated counter hook
function useCountUp(target: number, duration = 900, start = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start || target === 0) {
      setValue(target);
      return;
    }
    let startTime: number | null = null;
    const step = (ts: number) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return value;
}

// Stat Card skeleton
function StatCardSkeleton() {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="skeleton h-3 w-28 rounded" />
        <div className="skeleton w-8 h-8 rounded-lg" />
      </div>
      <div className="skeleton h-7 w-36 rounded" />
      <div className="skeleton h-3 w-40 rounded" />
    </div>
  );
}

// Stat Card
function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  iconBg,
  iconColor,
  valueColor,
}: {
  label: string;
  value: string;
  sub: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  valueColor?: string;
}) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-sm space-y-2 hover:border-neutral-700 transition group">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-neutral-400">{label}</span>
        <div className={`w-9 h-9 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center group-hover:scale-105 transition-transform`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className={`text-2xl font-black ${valueColor ?? "text-white"}`}>{value}</p>
      <p className="text-[11px] text-neutral-500 leading-snug">{sub}</p>
    </div>
  );
}

// Tier badge
function TierBadge({ tier }: { tier?: string }) {
  const map: Record<string, string> = {
    "Hạng Kim Cương": "bg-sky-500/15 text-sky-300 border-sky-500/30",
    "Hạng Vàng": "bg-amber-500/15 text-amber-300 border-amber-500/30",
    "Hạng Bạc": "bg-neutral-400/15 text-neutral-300 border-neutral-400/30",
    "Hạng Đồng": "bg-orange-900/30 text-orange-400 border-orange-700/30",
  };
  const cls = map[tier ?? ""] ?? "bg-neutral-800 text-neutral-400 border-neutral-700";
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${cls}`}>
      {tier ?? "Hạng Đồng"}
    </span>
  );
}

export default function DashboardOverviewTab({ onSwitchTab }: { onSwitchTab?: (tab: string) => void }) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [animStart, setAnimStart] = useState(false);

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
        setTimeout(() => setAnimStart(true), 50);
      }
    }
    loadData();
  }, []);

  // Metrics
  const totalRevenue = transactions.reduce((acc, t) => acc + (t.billAmount || 0), 0);
  const totalPointsGiven = transactions.filter((t) => t.type === "EARN").reduce((acc, t) => acc + t.points, 0);
  const topCustomers = [...customers].sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 5);

  // Animated counters
  const animRevenue = useCountUp(totalRevenue, 1000, animStart);
  const animPts = useCountUp(totalPointsGiven, 900, animStart);
  const animCusts = useCountUp(customers.length, 700, animStart);

  return (
    <div className="space-y-6">
      {/* ── Sub Header ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight">
            Báo Cáo Doanh Thu & Chỉ Số Loyalty
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Tổng quan hiệu quả bán hàng và dữ liệu khách hàng thân thiết quán Đạt Lẩu &amp; Nướng
          </p>
        </div>
        <Link
          href="/cashier"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition press-scale shadow-sm shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          Màn hình thu ngân tại quầy
        </Link>
      </div>

      {/* ── 4 Stat Cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              label="Doanh Thu Qua Tích Điểm"
              value={formatVND(animRevenue)}
              sub={`Ghi nhận qua ${transactions.length} lượt hóa đơn`}
              icon={TrendingUp}
              iconBg="bg-emerald-500/10"
              iconColor="text-emerald-400"
              valueColor="text-white"
            />
            <StatCard
              label="Khách Hàng Thành Viên"
              value={`${animCusts} khách`}
              sub="Đã lưu hồ sơ SĐT và ngày sinh"
              icon={Users}
              iconBg="bg-sky-500/10"
              iconColor="text-sky-400"
            />
            <StatCard
              label="Điểm Tích Lũy Đã Phát"
              value={`+${animPts} pts`}
              sub="Điểm sẵn sàng đổi món thưởng"
              icon={Coins}
              iconBg="bg-amber-500/10"
              iconColor="text-amber-400"
              valueColor="text-amber-400"
            />
            <StatCard
              label="Tỷ Lệ Tái Ghé (Retention)"
              value="75%"
              sub="Khách có từ 2 lần ghé quán trở lên"
              icon={Repeat}
              iconBg="bg-purple-500/10"
              iconColor="text-purple-400"
              valueColor="text-purple-400"
            />
          </>
        )}
      </div>

      {/* ── Main Grid ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Transactions */}
        <div className="lg:col-span-8 bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-400" />
              Lịch Sử Giao Dịch Gần Đây
            </h3>
            <span className="text-xs text-neutral-500 font-mono bg-neutral-800 px-2 py-0.5 rounded-full">
              {transactions.length} giao dịch
            </span>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex gap-3 items-center py-2 border-b border-neutral-800">
                  <div className="skeleton h-3 w-20 rounded" />
                  <div className="skeleton h-3 w-28 rounded" />
                  <div className="skeleton h-3 w-20 rounded ml-auto" />
                  <div className="skeleton h-3 w-14 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-800 text-neutral-500">
                    <th className="pb-3 font-semibold">Mã HĐ</th>
                    <th className="pb-3 font-semibold">Khách Hàng</th>
                    <th className="pb-3 font-semibold">Tiền HĐ</th>
                    <th className="pb-3 font-semibold">Điểm</th>
                    <th className="pb-3 font-semibold">Món Đổi Thưởng</th>
                    <th className="pb-3 font-semibold hidden sm:table-cell">Thời Gian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/50">
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-neutral-500">
                        Chưa có giao dịch. Bấm sang tab <b>Thu Ngân</b> để tạo giao dịch đầu tiên!
                      </td>
                    </tr>
                  ) : (
                    transactions.slice(0, 8).map((t) => (
                      <tr key={t.id} className="hover:bg-neutral-800/50 transition-colors">
                        <td className="py-3 font-mono font-bold text-neutral-300 text-[11px]">{t.billCode || "HD-LE"}</td>
                        <td className="py-3">
                          <p className="font-bold text-white">{t.customerName}</p>
                          <p className="text-[11px] text-neutral-500 font-mono">{t.customerPhone}</p>
                        </td>
                        <td className="py-3 font-bold text-white tabular-nums">{formatVND(t.billAmount || 0)}</td>
                        <td className="py-3">
                          {t.type === "EARN" ? (
                            <span className="font-bold text-emerald-400 font-mono">+{t.points} pts</span>
                          ) : (
                            <span className="font-bold text-rose-400 font-mono">{t.points} pts</span>
                          )}
                        </td>
                        <td className="py-3">
                          {t.redeemedItemName ? (
                            <span className="text-[11px] text-amber-300 font-bold bg-amber-950/40 border border-amber-800/60 px-2 py-0.5 rounded-full">
                              🎁 {t.redeemedItemName}
                            </span>
                          ) : (
                            <span className="text-neutral-500">-</span>
                          )}
                        </td>
                        <td className="py-3 text-neutral-500 hidden sm:table-cell">{formatDate(t.createdAt)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Top Spending Customers */}
        <div className="lg:col-span-4 bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-400" />
              Khách VIP Chi Tiêu Cao Nhất
            </h3>
            {onSwitchTab && (
              <button
                onClick={() => onSwitchTab("customers")}
                className="text-xs text-amber-400 hover:underline font-semibold"
              >
                Xem tất cả ➔
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-neutral-950/50">
                  <div className="skeleton w-7 h-7 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <div className="skeleton h-3 w-24 rounded" />
                    <div className="skeleton h-2.5 w-16 rounded" />
                  </div>
                  <div className="skeleton h-4 w-16 rounded" />
                </div>
              ))}
            </div>
          ) : topCustomers.length === 0 ? (
            <div className="text-center py-8 text-neutral-500 text-xs">
              <Gift className="w-8 h-8 mx-auto mb-2 text-neutral-700" />
              Chưa có khách hàng nào
            </div>
          ) : (
            <div className="space-y-2">
              {topCustomers.map((cust, idx) => (
                <div
                  key={cust.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-neutral-950/60 border border-neutral-800/60 hover:border-neutral-700 transition group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-full border flex items-center justify-center font-black text-xs ${
                        idx === 0
                          ? "bg-amber-500/20 border-amber-500/40 text-amber-400"
                          : idx === 1
                          ? "bg-neutral-400/10 border-neutral-400/30 text-neutral-300"
                          : idx === 2
                          ? "bg-orange-500/10 border-orange-500/30 text-orange-400"
                          : "bg-neutral-800 border-neutral-700 text-neutral-500"
                      }`}
                    >
                      #{idx + 1}
                    </div>
                    <div>
                      <p className="font-bold text-xs text-white leading-tight">{cust.fullName}</p>
                      <p className="text-[10px] text-neutral-500 font-mono">{cust.phone}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-amber-400 tabular-nums">{formatVND(cust.totalSpent)}</p>
                    <TierBadge tier={cust.tierName} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
