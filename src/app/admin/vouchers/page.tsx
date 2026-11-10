"use client";

import { useEffect, useState } from "react";
import {
  Ticket,
  Plus,
  Gift,
  CheckCircle2,
  Calendar,
  X,
  Tag,
  Percent,
  Coins,
  AlertCircle,
  Copy,
  Check,
} from "lucide-react";
import { Voucher } from "@/lib/types";
import { formatVND, formatDate } from "@/lib/utils";

export default function VouchersPage() {
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
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Ticket className="w-6 h-6 text-pink-500" />
            Kho Voucher & Ưu Đãi
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Quản lý mã giảm giá, voucher sinh nhật và ưu đãi tặng món khi khách ghé ăn
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs transition shadow-sm"
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
            className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-xl relative overflow-hidden flex flex-col justify-between group hover:border-neutral-700 transition"
          >
            {/* Top row */}
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-base text-amber-400 bg-neutral-950 px-3 py-1 rounded-xl border border-neutral-800 tracking-wider">
                    {v.code}
                  </span>
                  <button
                    onClick={() => handleCopy(v.code)}
                    className="text-neutral-500 hover:text-white transition p-1"
                    title="Sao chép mã"
                  >
                    {copiedCode === v.code ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {v.isBirthdayVoucher && (
                  <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <Gift className="w-3 h-3" /> Sinh nhật
                  </span>
                )}
              </div>

              <h3 className="font-bold text-sm text-white">{v.title}</h3>
              {v.description && <p className="text-xs text-neutral-400 mt-1 leading-relaxed">{v.description}</p>}

              {/* Discount details */}
              <div className="mt-4 p-3 bg-neutral-950/70 rounded-xl border border-neutral-800/80 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Loại ưu đãi:</span>
                  <span className="font-bold text-white">
                    {v.discountType === "FREE_ITEM"
                      ? `Tặng món: ${v.freeItemName}`
                      : v.discountType === "PERCENT"
                      ? `Giảm ${v.discountValue}% (Tối đa ${formatVND(v.maxDiscount || 0)})`
                      : `Giảm ${formatVND(v.discountValue)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Đơn tối thiểu:</span>
                  <span className="font-semibold text-neutral-300">{formatVND(v.minOrderAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Hạn áp dụng:</span>
                  <span className="font-mono text-neutral-400">{formatDate(v.endDate)}</span>
                </div>
              </div>
            </div>

            {/* Bottom progress row */}
            <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between text-xs">
              <span className="text-neutral-400">
                Đã dùng: <b>{v.usedCount}</b> / {v.usageLimit} lượt
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                  v.isActive ? "bg-emerald-500/20 text-emerald-400" : "bg-neutral-800 text-neutral-500"
                }`}
              >
                {v.isActive ? "Đang hiệu lực" : "Hết hạn"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Create Voucher */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateVoucher}
            className="bg-neutral-900 border border-neutral-800 max-w-lg w-full rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-150 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="font-bold text-base text-white">Tạo Mã Voucher / Quà Tặng Mới</h3>
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
                  <label className="block text-neutral-400 mb-1 font-semibold">Mã Voucher (Code) (*):</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: LAU100K"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-sm font-mono font-bold text-amber-400 uppercase focus:outline-none focus:border-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1 font-semibold">Hình thức giảm (*):</label>
                  <select
                    value={form.discountType}
                    onChange={(e) => setForm({ ...form, discountType: e.target.value as any })}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
                  >
                    <option value="FIXED">Giảm tiền mặt cố định (VNĐ)</option>
                    <option value="PERCENT">Giảm phần trăm (%)</option>
                    <option value="FREE_ITEM">Tặng món ăn miễn phí</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 font-semibold">Tiêu đề voucher (*):</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Giảm 50.000đ cho bàn từ 4 người"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-pink-500"
                />
              </div>

              {form.discountType === "FREE_ITEM" ? (
                <div>
                  <label className="block text-neutral-400 mb-1 font-semibold">Tên món ăn được tặng kèm:</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: 1 Đĩa Ba Chỉ Bò Mỹ Nướng Sốt Khói"
                    value={form.freeItemName}
                    onChange={(e) => setForm({ ...form, freeItemName: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-neutral-400 mb-1 font-semibold">
                      {form.discountType === "PERCENT" ? "Số % giảm (Ví dụ: 10):" : "Số tiền giảm (VNĐ):"}
                    </label>
                    <input
                      type="number"
                      required
                      value={form.discountValue}
                      onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })}
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-sm font-bold text-amber-400 font-mono focus:outline-none focus:border-pink-500"
                    />
                  </div>

                  {form.discountType === "PERCENT" && (
                    <div>
                      <label className="block text-neutral-400 mb-1 font-semibold">Giảm tối đa (VNĐ):</label>
                      <input
                        type="number"
                        value={form.maxDiscount}
                        onChange={(e) => setForm({ ...form, maxDiscount: Number(e.target.value) })}
                        className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-sm font-bold text-white font-mono focus:outline-none focus:border-pink-500"
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1 font-semibold">Giá trị đơn tối thiểu (VNĐ):</label>
                  <input
                    type="number"
                    value={form.minOrderAmount}
                    onChange={(e) => setForm({ ...form, minOrderAmount: Number(e.target.value) })}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1 font-semibold">Số lượt áp dụng tối đa:</label>
                  <input
                    type="number"
                    value={form.usageLimit}
                    onChange={(e) => setForm({ ...form, usageLimit: Number(e.target.value) })}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 font-semibold">Ngày hết hạn:</label>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isBirthdayVoucher}
                    onChange={(e) => setForm({ ...form, isBirthdayVoucher: e.target.checked })}
                    className="rounded accent-rose-500 w-4 h-4"
                  />
                  <span className="font-semibold text-rose-300">
                    Đây là voucher sinh nhật (Chỉ áp dụng cho khách có sinh nhật trong tháng)
                  </span>
                </label>
              </div>
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
