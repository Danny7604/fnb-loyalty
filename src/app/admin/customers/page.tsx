"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Users,
  Search,
  UserPlus,
  Crown,
  Gift,
  Coins,
  DollarSign,
  Calendar,
  X,
  FileText,
  Clock,
  Sparkles,
  Phone,
  RefreshCw,
} from "lucide-react";
import { Customer, PointTransaction } from "@/lib/types";
import { formatVND, formatDate } from "@/lib/utils";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTier, setSelectedTier] = useState<string>("all");
  const [onlyBirthdaysThisMonth, setOnlyBirthdaysThisMonth] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerTx, setCustomerTx] = useState<PointTransaction[]>([]);

  // Add new customer modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({ phone: "", fullName: "", birthDate: "", notes: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/customers");
      const json = await res.json();
      if (json.success) setCustomers(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const [currentMonth, setCurrentMonth] = useState<number>(0);

  useEffect(() => {
    fetchCustomers();
    setCurrentMonth(new Date().getMonth());
  }, []);

  // Filter customers

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const matchSearch =
        c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || c.phone.includes(searchQuery);
      const matchTier = selectedTier === "all" || c.tierId === selectedTier;

      let matchBirthday = true;
      if (onlyBirthdaysThisMonth) {
        if (!c.birthDate) matchBirthday = false;
        else {
          const m = new Date(c.birthDate).getMonth();
          matchBirthday = m === currentMonth;
        }
      }

      return matchSearch && matchTier && matchBirthday;
    });
  }, [customers, searchQuery, selectedTier, onlyBirthdaysThisMonth, currentMonth]);

  // View Customer History
  const handleViewCustomer = async (cust: Customer) => {
    setSelectedCustomer(cust);
    try {
      const res = await fetch("/api/transactions");
      const json = await res.json();
      if (json.success) {
        const txs = json.data.filter((t: PointTransaction) => t.customerId === cust.id || t.customerPhone === cust.phone);
        setCustomerTx(txs);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Add Customer Submit
  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.phone || !formData.fullName) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (json.success) {
        setIsAddModalOpen(false);
        setFormData({ phone: "", fullName: "", birthDate: "", notes: "" });
        fetchCustomers();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-sky-400" />
            Quản Lý Khách Hàng (CRM)
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Tra cứu hồ sơ khách ăn lẩu nướng, tích điểm, phân hạng và chăm sóc sinh nhật
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition shadow-lg shadow-sky-950/40"
        >
          <UserPlus className="w-4 h-4" />
          Thêm khách hàng mới
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên hoặc số điện thoại..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-3 py-2 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Tier filter */}
          <select
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value)}
            className="bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
          >
            <option value="all">Tất cả các hạng</option>
            <option value="tier-bronze">Hạng Đồng</option>
            <option value="tier-silver">Hạng Bạc</option>
            <option value="tier-gold">Hạng Vàng</option>
            <option value="tier-diamond">Hạng Kim Cương</option>
          </select>

          {/* Birthday toggle */}
          <button
            onClick={() => setOnlyBirthdaysThisMonth(!onlyBirthdaysThisMonth)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition border ${
              onlyBirthdaysThisMonth
                ? "bg-rose-500/20 text-rose-300 border-rose-500/50"
                : "bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white"
            }`}
          >
            <Gift className="w-3.5 h-3.5 text-rose-400" />
            Sinh nhật tháng này {onlyBirthdaysThisMonth && "✓"}
          </button>
        </div>
      </div>

      {/* Customer Table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-950/60 text-neutral-400">
                <th className="py-3.5 px-4 font-semibold">Khách Hàng</th>
                <th className="py-3.5 px-4 font-semibold">Số Điện Thoại</th>
                <th className="py-3.5 px-4 font-semibold">Hạng Thành Viên</th>
                <th className="py-3.5 px-4 font-semibold">Điểm Tích Lũy</th>
                <th className="py-3.5 px-4 font-semibold">Tổng Chi Tiêu</th>
                <th className="py-3.5 px-4 font-semibold">Sinh Nhật</th>
                <th className="py-3.5 px-4 font-semibold text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-500">
                    Không tìm thấy khách hàng nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => {
                  const isBirthday =
                    cust.birthDate && new Date(cust.birthDate).getMonth() === currentMonth;

                  return (
                    <tr key={cust.id} className="hover:bg-neutral-800/40 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{cust.fullName}</span>
                          {isBirthday && (
                            <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/40 px-1.5 py-0.5 rounded-full flex items-center gap-1 font-semibold">
                              <Gift className="w-2.5 h-2.5" /> SN tháng này
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-neutral-300">{cust.phone}</td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-neutral-800 border border-neutral-700 text-amber-300">
                          <Crown className="w-3 h-3 text-amber-400" />
                          {cust.tierName || "Hạng Đồng"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-amber-400 text-sm">
                        {cust.currentPoints} pts
                      </td>
                      <td className="py-3.5 px-4 font-bold text-white">{formatVND(cust.totalSpent)}</td>
                      <td className="py-3.5 px-4 text-neutral-400">
                        {cust.birthDate ? formatDate(cust.birthDate) : "—"}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleViewCustomer(cust)}
                          className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition"
                        >
                          Lịch sử ăn
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Customer Details & History Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 max-w-2xl w-full rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-150 space-y-5">
            <div className="flex items-start justify-between border-b border-neutral-800 pb-4">
              <div>
                <h3 className="font-bold text-xl text-white flex items-center gap-2">
                  {selectedCustomer.fullName}
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {selectedCustomer.tierName}
                  </span>
                </h3>
                <p className="text-xs text-neutral-400 font-mono mt-1">SĐT: {selectedCustomer.phone}</p>
              </div>

              <button
                onClick={() => setSelectedCustomer(null)}
                className="w-8 h-8 rounded-full bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick stats in modal */}
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                <span className="text-neutral-500 block">Điểm hiện có</span>
                <span className="font-black text-amber-400 text-lg">{selectedCustomer.currentPoints} pts</span>
              </div>
              <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                <span className="text-neutral-500 block">Tổng chi tiêu</span>
                <span className="font-bold text-white text-base">{formatVND(selectedCustomer.totalSpent)}</span>
              </div>
              <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                <span className="text-neutral-500 block">Ngày sinh nhật</span>
                <span className="font-bold text-neutral-300">
                  {selectedCustomer.birthDate ? formatDate(selectedCustomer.birthDate) : "Chưa cập nhật"}
                </span>
              </div>
            </div>

            {/* Transaction History */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs text-neutral-400 uppercase tracking-wider">
                Lịch sử các lần ghé ăn & tích điểm:
              </h4>
              <div className="max-h-56 overflow-y-auto space-y-2">
                {customerTx.length === 0 ? (
                  <p className="text-xs text-neutral-500 py-4 text-center">Chưa có giao dịch nào được ghi nhận.</p>
                ) : (
                  customerTx.map((tx) => (
                    <div
                      key={tx.id}
                      className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs flex items-center justify-between"
                    >
                      <div>
                        <p className="font-bold text-white font-mono">{tx.billCode || "HD-LE"}</p>
                        <p className="text-[11px] text-neutral-400">{tx.notes || "Tích điểm bữa ăn"}</p>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-white">{formatVND(tx.billAmount || 0)}</p>
                        <p className={tx.type === "EARN" ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                          {tx.type === "EARN" ? `+${tx.points}` : tx.points} pts
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add New Customer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleAddCustomer}
            className="bg-neutral-900 border border-neutral-800 max-w-md w-full rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-150 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="font-bold text-base text-white">Thêm Khách Hàng Mới</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-7 h-7 rounded-full bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1 font-semibold">Số điện thoại (*):</label>
                <input
                  type="tel"
                  required
                  placeholder="0901234567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 font-semibold">Họ và tên (*):</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Anh Nam / Chị Hương"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 font-semibold">Ngày sinh nhật:</label>
                <input
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 font-semibold">Ghi chú (sở thích, bàn hay ngồi):</label>
                <textarea
                  placeholder="Ví dụ: Ăn cay tốt, thích ngồi bàn 12 ngoài trời..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500 resize-none h-20"
                />
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-1/2 py-2.5 rounded-xl bg-neutral-800 text-neutral-300 font-semibold text-xs hover:bg-neutral-700 transition"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-1/2 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? "Đang lưu..." : "Lưu khách hàng"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
