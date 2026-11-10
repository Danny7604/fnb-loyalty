"use client";

import { useEffect, useState } from "react";
import {
  Ticket,
  Plus,
  Gift,
  X,
  Copy,
  Check,
} from "lucide-react";
import { Voucher } from "@/lib/types";
import { formatVND, formatDate } from "@/lib/utils";

export default function VouchersTab() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Form State
  const [form, setForm] = useState({
    code: "",
    title: "",
    description: "",
    discountType: "FIXED" as "PERCENT" | "FIXED" | "FREE_ITEM",
    discountValue: 50000,
    freeItemName: "",
    minOrderAmount: 300000,
    maxDiscount: 100000,
    usageLimit: 100,
    endDate: "2026-12-31",
    isBirthdayVoucher: false,
  });

  const fetchVouchers = async () => {
    try {
      const res = await fetch("/api/vouchers");
      const json = await res.json();
      if (json.success) setVouchers(json.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCreateVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code || !form.title) return;

    try {
      const res = await fetch("/api/vouchers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          code: form.code.toUpperCase().trim(),
          discountValue: Number(form.discountValue),
          minOrderAmount: Number(form.minOrderAmount),
          maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : undefined,
          usageLimit: Number(form.usageLimit),
          startDate: new Date().toISOString(),
          endDate: new Date(form.endDate).toISOString(),
          isActive: true,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setIsModalOpen(false);
        setForm({
          code: "",
          title: "",
          description: "",
          discountType: "FIXED",
          discountValue: 50000,
          freeItemName: "",
          minOrderAmount: 300000,
          maxDiscount: 100000,
          usageLimit: 100,
          endDate: "2026-12-31",
          isBirthdayVoucher: false,
        });
        fetchVouchers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <Ticket className="w-5 h-5 text-pink-500" />
            Kho Voucher & Ưu Đãi
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Quản lý mã giảm giá, voucher sinh nhật và ưu đãi tặng món khi khách ghé ăn
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs transition shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          Tạo voucher mới
        </button>
      </div>

      {/* Voucher Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {vouchers.map((v) => (
          <div
            key={v.id}
            className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-sm space-y-4 hover:border-neutral-700 transition relative flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                      v.isBirthdayVoucher
                        ? "bg-pink-500/20 text-pink-400 border border-pink-500/30"
                        : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    }`}
                  >
                    {v.isBirthdayVoucher ? "🎂 Voucher Sinh Nhật" : "Ưu Đãi Quán"}
                  </span>
                  <h3 className="font-bold text-white text-base mt-2 leading-snug">{v.title}</h3>
                  <p className="text-xs text-neutral-400 mt-1">{v.description}</p>
                </div>
              </div>

              {/* Code Box */}
              <div className="bg-neutral-950 border border-neutral-800/80 rounded-xl p-2.5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-neutral-500 block uppercase font-mono">Mã áp dụng</span>
                  <span className="font-mono font-black text-amber-400 text-sm tracking-wide">{v.code}</span>
                </div>
                <button
                  onClick={() => handleCopy(v.code)}
                  className="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-[11px] font-bold flex items-center gap-1 transition"
                >
                  {copiedCode === v.code ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Đã chép</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Sao chép</span>
                    </>
                  )}
                </button>
              </div>

              {/* Value and Conditions */}
              <div className="text-xs space-y-1 text-neutral-400 pt-1">
                <div className="flex justify-between">
                  <span>Trị giá ưu đãi:</span>
                  <span className="font-bold text-white">
                    {v.discountType === "PERCENT"
                      ? `Giảm ${v.discountValue}% (Tối đa ${formatVND(v.maxDiscount || 0)})`
                      : v.discountType === "FREE_ITEM"
                      ? `Tặng ${v.freeItemName}`
                      : `Giảm ${formatVND(v.discountValue)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Đơn tối thiểu:</span>
                  <span className="text-neutral-300 font-mono">{formatVND(v.minOrderAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Hạn sử dụng:</span>
                  <span className="text-neutral-300 font-mono">{formatDate(v.endDate)}</span>
                </div>
              </div>
            </div>

            {/* Usage Progress Bar */}
            <div className="pt-3 border-t border-neutral-800/60 text-xs">
              <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
                <span>Lượt đã dùng</span>
                <span className="font-mono text-white">
                  {v.usedCount} / {v.usageLimit}
                </span>
              </div>
              <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, (v.usedCount / v.usageLimit) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Voucher Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateVoucher}
            className="bg-neutral-900 border border-neutral-800 max-w-md w-full rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-150 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="font-bold text-base text-white">Tạo Mã Voucher Mới</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-full bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1 font-semibold">Mã code (*):</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: LAU50K"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-sm font-mono font-bold text-amber-400 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1 font-semibold">Loại ưu đãi:</label>
                  <select
                    value={form.discountType}
                    onChange={(e: any) => setForm({ ...form, discountType: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="FIXED">Giảm tiền mặt (VNĐ)</option>
                    <option value="PERCENT">Giảm phần trăm (%)</option>
                    <option value="FREE_ITEM">Tặng món ăn</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 font-semibold">Tên tiêu đề hiển thị (*):</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Giảm 50.000đ hóa đơn từ 300k"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {form.discountType === "FREE_ITEM" ? (
                <div>
                  <label className="block text-neutral-400 mb-1 font-semibold">Tên món ăn tặng kèm (*):</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: 1 Đĩa Ba Chỉ Bò Mỹ Nướng"
                    value={form.freeItemName}
                    onChange={(e) => setForm({ ...form, freeItemName: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-neutral-400 mb-1 font-semibold">
                      {form.discountType === "PERCENT" ? "Số % giảm (*):" : "Số tiền giảm (VNĐ) (*):"}
                    </label>
                    <input
                      type="number"
                      required
                      value={form.discountValue}
                      onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })}
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-sm font-bold text-white font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  {form.discountType === "PERCENT" && (
                    <div>
                      <label className="block text-neutral-400 mb-1 font-semibold">Giảm tối đa (VNĐ):</label>
                      <input
                        type="number"
                        value={form.maxDiscount}
                        onChange={(e) => setForm({ ...form, maxDiscount: Number(e.target.value) })}
                        className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1 font-semibold">Đơn hàng tối thiểu (VNĐ):</label>
                  <input
                    type="number"
                    value={form.minOrderAmount}
                    onChange={(e) => setForm({ ...form, minOrderAmount: Number(e.target.value) })}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1 font-semibold">Giới hạn số lượt dùng:</label>
                  <input
                    type="number"
                    value={form.usageLimit}
                    onChange={(e) => setForm({ ...form, usageLimit: Number(e.target.value) })}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 font-semibold">Hạn sử dụng đến ngày:</label>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={form.isBirthdayVoucher}
                  onChange={(e) => setForm({ ...form, isBirthdayVoucher: e.target.checked })}
                  className="rounded accent-pink-500 w-4 h-4"
                />
                <span className="text-neutral-300">Đây là voucher tặng khách có sinh nhật trong tháng</span>
              </label>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-1/2 py-2.5 rounded-xl bg-neutral-800 text-neutral-300 font-semibold text-xs hover:bg-neutral-700 transition"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="w-1/2 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs transition active:scale-95"
              >
                Tạo Voucher
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
