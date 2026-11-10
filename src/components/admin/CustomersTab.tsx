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

export default function CustomersTab() {
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
      } else {
        alert(json.error || "Không thể tạo khách hàng");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-sky-400" />
            Quản Lý Khách Hàng (CRM Loyalty)
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Tra cứu hồ sơ khách ăn lẩu nướng, tích điểm, phân hạng và chăm sóc sinh nhật
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition shadow-sm shrink-0"
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
          {/* Tier Filter */}
          <select
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value)}
            className="bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 rounded-xl px-3 py-2 focus:outline-none focus:border-sky-500"
          >
            <option value="all">Tất cả hạng thẻ</option>
            <option value="tier-bronze">Hạng Đồng</option>
            <option value="tier-silver">Hạng Bạc</option>
            <option value="tier-gold">Hạng Vàng</option>
            <option value="tier-diamond">Hạng Kim Cương</option>
          </select>

          {/* Birthday Filter */}
          <button
            onClick={() => setOnlyBirthdaysThisMonth(!onlyBirthdaysThisMonth)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
              onlyBirthdaysThisMonth
                ? "bg-pink-600/20 text-pink-300 border border-pink-500/40"
                : "bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800"
            }`}
          >
            <Gift className="w-3.5 h-3.5 text-pink-400" />
            <span>Sinh nhật tháng {currentMonth + 1}</span>
          </button>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-950/60 text-neutral-400">
                <th className="py-3.5 px-4 font-semibold">Khách Hàng</th>
                <th className="py-3.5 px-4 font-semibold">Số Điện Thoại</th>
                <th className="py-3.5 px-4 font-semibold">Hạng Thẻ</th>
                <th className="py-3.5 px-4 font-semibold">Điểm Tích Lũy</th>
                <th className="py-3.5 px-4 font-semibold">Tổng Chi Tiêu</th>
                <th className="py-3.5 px-4 font-semibold">Sinh Nhật</th>
                <th className="py-3.5 px-4 font-semibold text-right">Chi Tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-500">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-sky-400" />
                    Đang tải danh sách khách hàng...
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-500">
                    Không tìm thấy khách hàng nào phù hợp
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => {
                  const isBday =
                    cust.birthDate && new Date(cust.birthDate).getMonth() === currentMonth;
                  return (
                    <tr
                      key={cust.id}
                      onClick={() => handleViewCustomer(cust)}
                      className="hover:bg-neutral-800/40 transition cursor-pointer"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-white text-sm">{cust.fullName}</p>
                          {isBday && (
                            <span className="text-[10px] bg-pink-500/20 text-pink-300 border border-pink-500/30 px-1.5 py-0.2 rounded-full font-bold flex items-center gap-1">
                              🎂 Sinh nhật
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-neutral-300">{cust.phone}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${
                            cust.tierName?.includes("Kim Cương")
                              ? "bg-sky-500/10 text-sky-300 border-sky-500/30"
                              : cust.tierName?.includes("Vàng")
                              ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
                              : cust.tierName?.includes("Bạc")
                              ? "bg-neutral-400/10 text-neutral-300 border-neutral-400/30"
                              : "bg-orange-950/40 text-orange-400 border-orange-800/30"
                          }`}
                        >
                          {cust.tierName || "Hạng Đồng"}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-black text-amber-400 font-mono text-sm">
                        {cust.currentPoints} pts
                      </td>
                      <td className="py-3 px-4 font-bold text-white font-mono">
                        {formatVND(cust.totalSpent)}
                      </td>
                      <td className="py-3 px-4 text-neutral-400">
                        {cust.birthDate ? formatDate(cust.birthDate) : "-"}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-xs text-sky-400 hover:underline font-semibold">
                          Lịch sử ➔
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail Modal (History & Info) */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 max-w-lg w-full rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-150 space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div>
                <h3 className="font-bold text-lg text-white">{selectedCustomer.fullName}</h3>
                <p className="text-xs text-neutral-400 font-mono">{selectedCustomer.phone}</p>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="w-7 h-7 rounded-full bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Stat Pill */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800">
                <span className="text-[10px] text-neutral-500 block">Hạng</span>
                <span className="font-bold text-amber-400">{selectedCustomer.tierName}</span>
              </div>
              <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800">
                <span className="text-[10px] text-neutral-500 block">Điểm có sẵn</span>
                <span className="font-black text-amber-400 font-mono text-sm">
                  {selectedCustomer.currentPoints}
                </span>
              </div>
              <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800">
                <span className="text-[10px] text-neutral-500 block">Tổng chi tiêu</span>
                <span className="font-bold text-white font-mono text-xs">
                  {formatVND(selectedCustomer.totalSpent)}
                </span>
              </div>
            </div>

            {/* History Table */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs text-neutral-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-neutral-400" />
                Lịch sử giao dịch ăn tại quán ({customerTx.length} lượt)
              </h4>

              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 text-xs">
                {customerTx.length === 0 ? (
                  <p className="text-neutral-500 text-center py-4 italic">Chưa có lịch sử giao dịch</p>
                ) : (
                  customerTx.map((tx) => (
                    <div
                      key={tx.id}
                      className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800/80 flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-1.5 font-bold text-white">
                          <span className="font-mono text-[11px] text-neutral-400">{tx.billCode}</span>
                          {tx.redeemedItemName && (
                            <span className="text-[10px] text-amber-400 bg-amber-950/40 px-1.5 py-0.2 rounded">
                              🎁 {tx.redeemedItemName}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-neutral-500 mt-0.5">{formatDate(tx.createdAt)}</p>
                      </div>

                      <div className="text-right">
                        <span className="font-bold text-white block font-mono">
                          {formatVND(tx.billAmount || 0)}
                        </span>
                        <span
                          className={`font-mono font-bold text-[11px] ${
                            tx.type === "EARN" ? "text-emerald-400" : "text-rose-400"
                          }`}
                        >
                          {tx.type === "EARN" ? `+${tx.points}` : tx.points} pts
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <button
              onClick={() => setSelectedCustomer(null)}
              className="w-full py-2.5 rounded-xl bg-neutral-800 text-white font-bold text-xs hover:bg-neutral-700 transition"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
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
                  placeholder="09..."
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 font-semibold">Họ và tên (*):</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn A"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 font-semibold">Ngày sinh nhật:</label>
                <input
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 font-semibold">Ghi chú khẩu vị / sở thích:</label>
                <textarea
                  placeholder="Ví dụ: Thích ngồi bàn ngoài trời, không ăn cay..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 resize-none h-16"
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
                {isSubmitting ? "Đang lưu..." : "Lưu Khách Hàng"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
