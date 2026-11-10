"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  UtensilsCrossed,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Check,
  X,
  Flame,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  ExternalLink,
  Search,
} from "lucide-react";
import { Category, MenuItem } from "@/lib/types";
import { formatVND } from "@/lib/utils";

export default function MenuManagementPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [selectedCat, setSelectedCat] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Category Modal State
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [isSubmittingCat, setIsSubmittingCat] = useState(false);

  // Form State
  const [form, setForm] = useState({
    name: "",
    categoryId: "",
    price: 0,
    description: "",
    imageUrl: "",
    portion: "",
    spicyLevel: 0,
    isBestSeller: false,
    isSignature: false,
  });

  const [isLoading, setIsLoading] = useState(true);

  const fetchMenu = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/menu");
      const json = await res.json();
      if (json.success) {
        setCategories(json.data.categories);
        setItems(json.data.items);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  // Quick 1-click Toggle "Còn món / Tạm hết món"
  const handleToggleAvailable = async (itemId: string) => {
    try {
      // Optimistic update
      setItems((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, isAvailable: !i.isAvailable } : i))
      );
      await fetch("/api/menu", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: itemId }),
      });
    } catch (err) {
      fetchMenu();
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (item: MenuItem) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      categoryId: item.categoryId,
      price: item.price,
      description: item.description || "",
      imageUrl: item.imageUrl || "",
      portion: item.portion || "",
      spicyLevel: item.spicyLevel || 0,
      isBestSeller: item.isBestSeller,
      isSignature: item.isSignature,
    });
    setIsModalOpen(true);
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setForm({
      name: "",
      categoryId: categories[0]?.id || "cat-meat",
      price: 150000,
      description: "",
      imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800",
      portion: "Đĩa 250g",
      spicyLevel: 0,
      isBestSeller: false,
      isSignature: false,
    });
    setIsModalOpen(true);
  };

  // Save Dish
  const handleSaveDish = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(editingItem ? { id: editingItem.id } : {}),
          ...form,
          price: Number(form.price),
        }),
      });
      const json = await res.json();
      if (json.success) {
        setIsModalOpen(false);
        fetchMenu();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Create Category
  const handleSaveCat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setIsSubmittingCat(true);
    try {
      const res = await fetch("/api/menu/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCatName.trim() }),
      });
      const json = await res.json();
      if (json.success) {
        setNewCatName("");
        setIsCatModalOpen(false);
        fetchMenu();
      } else {
        alert(json.error || "Không thể tạo danh mục");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingCat(false);
    }
  };

  // Delete Dish
  const handleDeleteDish = async (itemId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa món này khỏi thực đơn?")) return;
    try {
      await fetch(`/api/menu?id=${itemId}`, { method: "DELETE" });
      setItems((prev) => prev.filter((i) => i.id !== itemId));
    } catch (err) {
      console.error(err);
    }
  };

  const filteredItems = items.filter((i) => {
    const matchCat = selectedCat === "all" || i.categoryId === selectedCat;
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <UtensilsCrossed className="w-6 h-6 text-amber-500" />
            Quản Lý Thực Đơn & Món Ăn
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Chỉnh sửa giá, ảnh, danh mục và bật/tắt tạm hết món tức thì cho menu online
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/menu"
            target="_blank"
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs text-amber-400 font-semibold transition border border-neutral-700"
          >
            <Eye className="w-4 h-4" />
            Xem Menu Khách (Live) ↗
          </Link>
          <button
            onClick={() => setIsCatModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs transition border border-neutral-700"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            Thêm danh mục
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Thêm món mới
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm tên món ăn..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-3 py-2 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1">
          <button
            onClick={() => setSelectedCat("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              selectedCat === "all" ? "bg-amber-500 text-neutral-950 font-bold" : "bg-neutral-950 text-neutral-400 hover:text-white"
            }`}
          >
            Tất cả ({items.length})
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCat(c.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedCat === c.id ? "bg-amber-500 text-neutral-950 font-bold" : "bg-neutral-950 text-neutral-400 hover:text-white"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-950/60 text-neutral-400">
                <th className="py-3.5 px-4 font-semibold">Ảnh & Tên Món</th>
                <th className="py-3.5 px-4 font-semibold">Danh Mục</th>
                <th className="py-3.5 px-4 font-semibold">Giá Bán</th>
                <th className="py-3.5 px-4 font-semibold">Đặc Điểm</th>
                <th className="py-3.5 px-4 font-semibold">Trạng Thái (Hết Món)</th>
                <th className="py-3.5 px-4 font-semibold text-right">Hành Động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-neutral-800/40 transition">
                  {/* Image & Name */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-neutral-950">
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm leading-tight">{item.name}</p>
                        {item.portion && <p className="text-[11px] text-neutral-400 mt-0.5">{item.portion}</p>}
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4 text-neutral-300">{item.categoryName}</td>
                  <td className="py-3 px-4 font-bold text-amber-400 text-sm">{formatVND(item.price)}</td>

                  {/* Badges */}
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {item.isSignature && (
                        <span className="text-[10px] bg-red-950 text-red-300 border border-red-800 px-1.5 py-0.5 rounded font-bold">
                          Nên thử
                        </span>
                      )}
                      {item.isBestSeller && (
                        <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-800 px-1.5 py-0.5 rounded font-bold">
                          Best seller
                        </span>
                      )}
                      {item.spicyLevel > 0 && (
                        <span className="text-[10px] text-rose-400">{"🌶️".repeat(item.spicyLevel)}</span>
                      )}
                    </div>
                  </td>

                  {/* 1-click Toggle Available */}
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleToggleAvailable(item.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition ${
                        item.isAvailable
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                          : "bg-red-500/20 text-red-400 border border-red-500/40"
                      }`}
                    >
                      {item.isAvailable ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      {item.isAvailable ? "Còn phục vụ" : "Tạm hết món"}
                    </button>
                  </td>

                  {/* Action buttons */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition"
                        title="Chỉnh sửa món"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteDish(item.id)}
                        className="p-1.5 rounded-lg bg-neutral-800 hover:bg-red-900/60 text-neutral-400 hover:text-red-300 transition"
                        title="Xóa món"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Dish Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveDish}
            className="bg-neutral-900 border border-neutral-800 max-w-lg w-full rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-150 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="font-bold text-base text-white">
                {editingItem ? `Chỉnh Sửa: ${editingItem.name}` : "Thêm Món Ăn Mới"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-full bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1 font-semibold">Tên món ăn (*):</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Ba Chỉ Bò Mỹ Nướng Sốt Tiêu"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1 font-semibold">Danh mục:</label>
                  <select
                    value={form.categoryId}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1 font-semibold">Định lượng / Số người:</label>
                  <input
                    type="text"
                    placeholder="Đĩa 250g / Set 3-4 người"
                    value={form.portion}
                    onChange={(e) => setForm({ ...form, portion: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 font-semibold">Giá bán (VNĐ) (*):</label>
                <input
                  type="number"
                  required
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-sm font-bold text-amber-400 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 font-semibold">Đường dẫn ảnh (Image URL):</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 font-semibold">Mô tả món ăn:</label>
                <textarea
                  placeholder="Gợi ý nguyên liệu, nước sốt ăn kèm..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 resize-none h-16"
                />
              </div>

              <div className="flex flex-wrap gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isBestSeller}
                    onChange={(e) => setForm({ ...form, isBestSeller: e.target.checked })}
                    className="rounded accent-amber-500 w-4 h-4"
                  />
                  <span>Món Best-Seller</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isSignature}
                    onChange={(e) => setForm({ ...form, isSignature: e.target.checked })}
                    className="rounded accent-red-500 w-4 h-4"
                  />
                  <span>Món Nên Thử</span>
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
                className="w-1/2 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs transition active:scale-95"
              >
                Lưu vào Thực Đơn
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Category Modal */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveCat}
            className="bg-neutral-900 border border-neutral-800 max-w-sm w-full rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-150 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="font-bold text-base text-white">Thêm Danh Mục Mới</h3>
              <button
                type="button"
                onClick={() => setIsCatModalOpen(false)}
                className="w-7 h-7 rounded-full bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1 font-semibold">Tên danh mục (*):</label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Ví dụ: Bia & Rượu, Trà & Cà phê..."
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setIsCatModalOpen(false)}
                className="w-1/2 py-2.5 rounded-xl bg-neutral-800 text-neutral-300 font-semibold text-xs hover:bg-neutral-700 transition"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmittingCat || !newCatName.trim()}
                className="w-1/2 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs transition active:scale-95 disabled:opacity-50"
              >
                {isSubmittingCat ? "Đang tạo..." : "Tạo Danh Mục"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
