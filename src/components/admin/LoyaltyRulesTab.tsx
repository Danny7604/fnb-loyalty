"use client";

import { useEffect, useState } from "react";
import {
  Gift,
  Coins,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Sparkles,
  Info,
  Search,
} from "lucide-react";
import { LoyaltySetting, MenuItem, RewardMilestone } from "@/lib/types";
import { formatVND } from "@/lib/utils";

export default function LoyaltyRulesTab() {
  const [milestones, setMilestones] = useState<RewardMilestone[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [setting, setSetting] = useState<LoyaltySetting>({
    earnRateAmount: 20000,
    earnRatePoints: 1,
    redeemRatePoint: 1,
    redeemRateAmount: 0,
    minRedeemPoints: 50,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal State for Milestones
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<RewardMilestone | null>(null);
  const [milestoneForm, setMilestoneForm] = useState({
    name: "",
    pointsRequired: 50,
    description: "",
    itemIds: [] as string[],
    isActive: true,
  });
  const [dishSearch, setDishSearch] = useState("");

  const fetchRules = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/loyalty-rules");
      const json = await res.json();
      if (json.success) {
        setMilestones(json.data.milestones || []);
        setSetting(json.data.setting);
        setMenuItems(json.data.menuItems || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleOpenAdd = () => {
    setEditingMilestone(null);
    setMilestoneForm({
      name: "",
      pointsRequired: 50,
      description: "",
      itemIds: [],
      isActive: true,
    });
    setDishSearch("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (m: RewardMilestone) => {
    setEditingMilestone(m);
    setMilestoneForm({
      name: m.name,
      pointsRequired: m.pointsRequired,
      description: m.description || "",
      itemIds: [...m.itemIds],
      isActive: m.isActive,
    });
    setDishSearch("");
    setIsModalOpen(true);
  };

  const handleToggleItemSelection = (itemId: string) => {
    setMilestoneForm((prev) => {
      const exists = prev.itemIds.includes(itemId);
      return {
        ...prev,
        itemIds: exists
          ? prev.itemIds.filter((id) => id !== itemId)
          : [...prev.itemIds, itemId],
      };
    });
  };

  const handleSaveMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!milestoneForm.name.trim() || Number(milestoneForm.pointsRequired) <= 0) {
      alert("Vui lòng nhập tên mốc và số điểm tích lũy hợp lệ!");
      return;
    }

    try {
      const res = await fetch("/api/loyalty-rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(editingMilestone ? { id: editingMilestone.id } : {}),
          ...milestoneForm,
          pointsRequired: Number(milestoneForm.pointsRequired),
        }),
      });
      const json = await res.json();
      if (json.success) {
        setIsModalOpen(false);
        fetchRules();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteMilestone = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa mốc điểm thưởng này?")) return;
    try {
      await fetch(`/api/loyalty-rules?milestoneId=${id}`, { method: "DELETE" });
      setMilestones((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveFormula = async () => {
    setIsSubmitting(true);
    try {
      await fetch("/api/loyalty-rules", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ setting }),
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredDishes = menuItems.filter((i) =>
    i.name.toLowerCase().includes(dishSearch.toLowerCase()) ||
    (i.categoryName && i.categoryName.toLowerCase().includes(dishSearch.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      {/* ── Sub Header ────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <Gift className="w-5 h-5 text-red-500" />
            Cấu Hình Tích Điểm & Đổi Thưởng Món
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Quy định các mốc điểm tích lũy, danh sách món ăn được đổi cho từng mốc và tỷ lệ tích điểm hóa đơn
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs transition shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          Thêm mốc điểm mới
        </button>
      </div>

      {/* ── Section 1: Milestone Reward Cards ──────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">
              Danh Sách Mốc Điểm & Món Đổi Thưởng ({milestones.length} mốc)
            </h3>
          </div>
          <span className="text-xs text-neutral-400">
            Khách đạt mốc được chọn <b>1 món bất kỳ</b> trong danh sách
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {milestones.map((m) => {
            const assignedItems = menuItems.filter((item) => m.itemIds.includes(item.id));
            return (
              <div
                key={m.id}
                className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 hover:border-neutral-700 transition flex flex-col justify-between shadow-sm space-y-4"
              >
                <div className="space-y-3">
                  {/* Top Bar of Milestone Card */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="px-3 py-1.5 rounded-xl bg-red-950/80 border border-red-800/80 text-red-300 font-black font-mono text-sm shrink-0 flex items-center gap-1.5">
                        <Gift className="w-4 h-4 text-red-400" />
                        <span>{m.pointsRequired} Điểm</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm leading-snug">{m.name}</h4>
                        <p className="text-[11px] text-neutral-400 mt-0.5">{m.description || "Đổi 1 món miễn phí"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleOpenEdit(m)}
                        className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition"
                        title="Chỉnh sửa mốc"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteMilestone(m.id)}
                        className="p-1.5 rounded-lg bg-neutral-800 hover:bg-red-900/60 text-neutral-400 hover:text-red-300 transition"
                        title="Xóa mốc"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* List of Eligible Dishes */}
                  <div className="bg-neutral-950/80 border border-neutral-800 rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-neutral-400 border-b border-neutral-800 pb-1.5">
                      <span className="font-semibold text-neutral-300">
                        Món được chọn ({assignedItems.length} món):
                      </span>
                      <span className="text-[10px] text-amber-400 font-medium">Khách chọn 1 món khi đổi</span>
                    </div>

                    {assignedItems.length === 0 ? (
                      <p className="text-[11px] text-neutral-500 italic py-2 text-center">
                        Chưa gán món ăn nào cho mốc này. Bấm sửa để chọn món.
                      </p>
                    ) : (
                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {assignedItems.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-neutral-900 border border-neutral-800/80 text-xs"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              {item.imageUrl && (
                                <img
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className="w-7 h-7 rounded-md object-cover bg-neutral-950 shrink-0"
                                />
                              )}
                              <span className="font-bold text-white truncate text-xs">{item.name}</span>
                            </div>
                            <span className="text-[11px] font-mono text-neutral-400 shrink-0">
                              {formatVND(item.price)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-[11px] text-neutral-500 pt-2 border-t border-neutral-800 flex items-center justify-between">
                  <span>Trạng thái: {m.isActive ? "🟢 Đang áp dụng" : "⚪ Tạm dừng"}</span>
                  <span className="text-amber-500/80 font-mono">Đổi tự động tại Thu ngân</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Section 2: Earning Formula Rate ─────────────────────────────────── */}
      <section className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-base text-white">Tỷ Lệ Tích Điểm Khi Ăn Uống</h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Thiết lập công thức quy đổi từ số tiền hóa đơn thực trả thành điểm tích lũy
              </p>
            </div>
          </div>

          <button
            onClick={handleSaveFormula}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs transition shadow-sm active:scale-95 disabled:opacity-50"
          >
            {isSaved ? <Check className="w-4 h-4 text-emerald-950" /> : <Coins className="w-4 h-4" />}
            {isSaved ? "Đã lưu tỷ lệ!" : "Lưu tỷ lệ tích điểm"}
          </button>
        </div>

        <div className="bg-neutral-950/80 border border-neutral-800 p-5 rounded-xl space-y-4">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="font-bold text-white text-sm">Cứ mỗi</span>
            <input
              type="number"
              value={setting.earnRateAmount}
              onChange={(e) => setSetting({ ...setting, earnRateAmount: Number(e.target.value) })}
              className="w-32 bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 font-bold font-mono text-white text-right text-sm"
            />
            <span className="font-bold text-white text-sm">VNĐ chi tiêu =</span>
            <input
              type="number"
              value={setting.earnRatePoints}
              onChange={(e) => setSetting({ ...setting, earnRatePoints: Number(e.target.value) })}
              className="w-20 bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 font-bold font-mono text-amber-400 text-center text-sm"
            />
            <span className="font-bold text-amber-400 text-sm">Điểm tích lũy</span>
          </div>

          {/* Real world calculation preview */}
          <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg text-xs space-y-1.5 text-neutral-300">
            <p className="font-bold text-white flex items-center gap-1.5">
              <Info className="w-4 h-4 text-amber-400" />
              Minh họa tính điểm thực tế:
            </p>
            <p className="text-neutral-400 pl-5">
              • Bàn ăn hóa đơn <b>500.000 VNĐ</b> ➔ Tích lũy được:{" "}
              <b className="text-amber-400 font-mono">
                {Math.floor((500000 / (setting.earnRateAmount || 1)) * (setting.earnRatePoints || 1))} điểm
              </b>
            </p>
            <p className="text-neutral-400 pl-5">
              • Bàn ăn hóa đơn <b>1.000.000 VNĐ</b> ➔ Tích lũy được:{" "}
              <b className="text-amber-400 font-mono">
                {Math.floor((1000000 / (setting.earnRateAmount || 1)) * (setting.earnRatePoints || 1))} điểm
              </b>{" "}
              (Khách đủ điểm đổi ngay 1 món ở Mốc 50 điểm)
            </p>
            <p className="text-neutral-400 pl-5">
              • Bàn ăn hóa đơn <b>2.000.000 VNĐ</b> ➔ Tích lũy được:{" "}
              <b className="text-amber-400 font-mono">
                {Math.floor((2000000 / (setting.earnRateAmount || 1)) * (setting.earnRatePoints || 1))} điểm
              </b>{" "}
              (Khách đủ điểm đổi ngay 1 đĩa thịt nướng ở Mốc 100 điểm)
            </p>
          </div>
        </div>
      </section>

      {/* ── Modal: Create / Edit Reward Milestone ──────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveMilestone}
            className="bg-neutral-900 border border-neutral-800 max-w-xl w-full rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-150 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="font-bold text-base text-white">
                {editingMilestone ? `Chỉnh Sửa Mốc: ${editingMilestone.name}` : "Tạo Mốc Đổi Thưởng Mới"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-full bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-neutral-400 mb-1 font-semibold">Tên mốc đổi thưởng (*):</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Mốc 50 Điểm: Khai vị & Đồ uống"
                    value={milestoneForm.name}
                    onChange={(e) => setMilestoneForm({ ...milestoneForm, name: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1 font-semibold">Điểm cần đạt (*):</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={milestoneForm.pointsRequired}
                    onChange={(e) => setMilestoneForm({ ...milestoneForm, pointsRequired: Number(e.target.value) })}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-sm font-bold text-amber-400 font-mono text-center focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 font-semibold">Mô tả / Ghi chú điều kiện:</label>
                <input
                  type="text"
                  placeholder="Khách được chọn 1 trong các món khai vị hoặc đồ uống"
                  value={milestoneForm.description}
                  onChange={(e) => setMilestoneForm({ ...milestoneForm, description: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Dish Selector Table */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <label className="block text-white font-bold">
                    Tích chọn các món thuộc mốc này (Đã chọn: {milestoneForm.itemIds.length} món):
                  </label>
                  <span className="text-[11px] text-amber-400">Khách được đổi 1 món bất kỳ</span>
                </div>

                {/* Search dish */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Tìm tên món trong thực đơn để gán..."
                    value={dishSearch}
                    onChange={(e) => setDishSearch(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Dish list with checkboxes */}
                <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-2 max-h-56 overflow-y-auto space-y-1">
                  {filteredDishes.map((item) => {
                    const isChecked = milestoneForm.itemIds.includes(item.id);
                    return (
                      <label
                        key={item.id}
                        onClick={() => handleToggleItemSelection(item.id)}
                        className={`flex items-center justify-between p-2 rounded-xl border transition cursor-pointer select-none ${
                          isChecked
                            ? "bg-amber-950/20 border-amber-500/40 text-white"
                            : "bg-neutral-900/60 border-neutral-800 hover:bg-neutral-800/80 text-neutral-300"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            readOnly
                            className="rounded accent-amber-500 w-4 h-4 shrink-0"
                          />
                          {item.imageUrl && (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-8 h-8 rounded-lg object-cover bg-neutral-950 shrink-0"
                            />
                          )}
                          <div className="min-w-0">
                            <p className="font-bold text-xs truncate leading-tight">{item.name}</p>
                            <p className="text-[10px] text-neutral-400">{item.categoryName || "Món ăn"}</p>
                          </div>
                        </div>

                        <span className="text-[11px] font-mono text-neutral-400 font-medium shrink-0">
                          {formatVND(item.price)}
                        </span>
                      </label>
                    );
                  })}
                </div>
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
                className="w-1/2 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs transition active:scale-95"
              >
                Lưu Mốc Điểm
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
