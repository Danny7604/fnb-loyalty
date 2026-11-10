"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  BarChart3,
  UtensilsCrossed,
  Gift,
  Users,
  Ticket,
  CreditCard,
  Eye,
  Store,
} from "lucide-react";
import DashboardOverviewTab from "@/components/admin/DashboardOverviewTab";
import MenuManagementTab from "@/components/admin/MenuManagementTab";
import LoyaltyRulesTab from "@/components/admin/LoyaltyRulesTab";
import CustomersTab from "@/components/admin/CustomersTab";
import VouchersTab from "@/components/admin/VouchersTab";

const tabs = [
  { id: "overview",  label: "Tổng Quan & Báo Cáo",   icon: BarChart3,       color: "text-emerald-400" },
  { id: "menu",      label: "Quản Lý Thực Đơn",      icon: UtensilsCrossed, color: "text-orange-400"  },
  { id: "rewards",   label: "Mốc Đổi Thưởng & Điểm", icon: Gift,            color: "text-red-400"     },
  { id: "customers", label: "Khách Hàng (CRM)",      icon: Users,           color: "text-sky-400"     },
  { id: "vouchers",  label: "Kho Voucher & Quà",     icon: Ticket,          color: "text-pink-400"    },
];

function AdminContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialTab = searchParams.get("tab") || "overview";
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    const newUrl = tabId === "overview" ? "/admin" : `/admin?tab=${tabId}`;
    window.history.replaceState(null, "", newUrl);
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* ── Top Unified Hub Bar ────────────────────────────────────────────── */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-3 md:p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand & Status */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-10 h-10 rounded-full border border-neutral-700 bg-neutral-950 shrink-0 overflow-hidden flex items-center justify-center">
            <img
              src="/logo.png"
              alt="Đạt Lẩu & Nướng"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h1 className="font-black text-sm md:text-base text-white leading-tight">
              TRANG QUẢN TRỊ TỔNG HỢP • ĐẠT LẨU & NƯỚNG
            </h1>
            <p className="text-[11px] text-neutral-400">
              Tất cả tính năng quản trị, thực đơn, khách hàng và đổi thưởng trong 1 màn hình
            </p>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <Link
            href="/cashier"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition press-scale shadow-sm shrink-0"
          >
            <CreditCard className="w-4 h-4" />
            <span>Màn Hình Thu Ngân</span>
          </Link>
          <Link
            href="/menu"
            target="_blank"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-amber-400 font-semibold text-xs transition border border-neutral-700 shrink-0"
          >
            <Eye className="w-4 h-4" />
            <span>Xem Menu Khách ↗</span>
          </Link>
        </div>
      </div>

      {/* ── Tab Switcher Navigation (Single click instant switch) ─────────── */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-1.5 flex items-center gap-1 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex-1 min-w-[140px] md:min-w-0 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isActive
                  ? "bg-neutral-800 text-white shadow-sm border border-neutral-700"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800/50"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? tab.color : "text-neutral-500"}`} />
              <span className="whitespace-nowrap">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Active Tab Content (Zero reload, Instant render) ───────────────── */}
      <div className="transition-opacity duration-150">
        {activeTab === "overview" && <DashboardOverviewTab onSwitchTab={handleTabChange} />}
        {activeTab === "menu" && <MenuManagementTab />}
        {activeTab === "rewards" && <LoyaltyRulesTab />}
        {activeTab === "customers" && <CustomersTab />}
        {activeTab === "vouchers" && <VouchersTab />}
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="p-8 text-neutral-400 text-xs text-center">Đang tải trang quản trị tổng hợp...</div>}>
      <AdminContent />
    </Suspense>
  );
}
