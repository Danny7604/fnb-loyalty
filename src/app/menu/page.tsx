"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import {
  Flame,
  Search,
  Wifi,
  Sparkles,
  Heart,
  Plus,
  Minus,
  Trash2,
  X,
  Share2,
  Check,
  ChevronRight,
  Gift,
  Soup,
  Utensils,
  Beef,
  Fish,
  Salad,
  Wine,
  PhoneCall,
  Clock,
  Info,
} from "lucide-react";
import { Category, MenuItem, WishlistItem } from "@/lib/types";
import { formatVND } from "@/lib/utils";

export default function MenuPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [selectedItemDetail, setSelectedItemDetail] = useState<MenuItem | null>(null);
  const [copiedWifi, setCopiedWifi] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadMenu() {
      try {
        const res = await fetch("/api/menu");
        const json = await res.json();
        if (json.success) {
          setCategories(json.data.categories);
          setItems(json.data.items);
        }
      } catch (err) {
        console.error("Failed to load menu", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadMenu();
  }, []);

  // Filter items based on Category & Search
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchCat = selectedCategory === "all" || item.categoryId === selectedCategory;
      const matchSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [items, selectedCategory, searchQuery]);

  // Wishlist actions
  const addToWishlist = (item: MenuItem) => {
    setWishlist((prev) => {
      const existing = prev.find((w) => w.item.id === item.id);
      if (existing) {
        return prev.map((w) => (w.item.id === item.id ? { ...w, quantity: w.quantity + 1 } : w));
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setWishlist((prev) => {
      return prev
        .map((w) => {
          if (w.item.id === itemId) {
            const newQty = w.quantity + delta;
            return newQty > 0 ? { ...w, quantity: newQty } : null;
          }
          return w;
        })
        .filter(Boolean) as WishlistItem[];
    });
  };

  const totalWishlistItems = wishlist.reduce((acc, w) => acc + w.quantity, 0);
  const totalEstimatedPrice = wishlist.reduce((acc, w) => acc + w.item.price * w.quantity, 0);

  const copyWifiPassword = () => {
    navigator.clipboard.writeText("88888888");
    setCopiedWifi(true);
    setTimeout(() => setCopiedWifi(false), 2000);
  };

  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case "combo-tiet-kiem":
        return <Flame className="w-4 h-4 text-orange-500" />;
      case "thit-bo-heo-nuong":
        return <Beef className="w-4 h-4 text-rose-500" />;
      case "hai-san-nuong":
        return <Fish className="w-4 h-4 text-sky-500" />;
      case "nuoc-lau-set-lau":
        return <Soup className="w-4 h-4 text-amber-500" />;
      case "topping-nhung-lau":
        return <Salad className="w-4 h-4 text-emerald-500" />;
      case "mon-khai-vi":
        return <Utensils className="w-4 h-4 text-purple-500" />;
      case "do-uong-trang-mieng":
        return <Wine className="w-4 h-4 text-pink-500" />;
      default:
        return <Flame className="w-4 h-4 text-orange-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 pb-28">
      {/* 1. Header Banner & Wifi */}
      <header className="relative bg-gradient-to-b from-neutral-900 via-neutral-900 to-neutral-950 border-b border-neutral-800 pt-6 pb-4 px-4 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-red-600 flex items-center justify-center shadow-lg shadow-red-950/50">
                <Flame className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg leading-tight tracking-tight text-white flex items-center gap-1.5">
                  LẨU NƯỚNG KHÓI & VỊ
                  <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 font-medium">
                    Hotpot & BBQ
                  </span>
                </h1>
                <p className="text-xs text-neutral-400">Thực đơn điện tử gọi món tại bàn</p>
              </div>
            </div>

            {/* Quick Wifi badge */}
            <button
              onClick={copyWifiPassword}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800/90 border border-neutral-700/80 text-xs text-neutral-300 hover:text-white transition active:scale-95"
              title="Nhấn để chép mật khẩu Wifi"
            >
              <Wifi className="w-3.5 h-3.5 text-amber-400" />
              <span>Wifi: <b>KhoiVaVi_5G</b></span>
              {copiedWifi ? (
                <Check className="w-3 h-3 text-emerald-400" />
              ) : (
                <span className="text-[10px] text-neutral-400 bg-neutral-700 px-1 py-0.5 rounded">Pass: 88888888</span>
              )}
            </button>
          </div>

          {/* Member Banner Teaser */}
          <div className="bg-gradient-to-r from-amber-950/60 via-red-950/40 to-neutral-900 border border-amber-800/40 rounded-xl p-2.5 mb-3 flex items-center justify-between text-xs text-amber-200">
            <div className="flex items-center gap-2">
              <Gift className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <b>Ưu đãi hội viên:</b> Đọc SĐT khi thanh toán để tích <b>10% – 15%</b> điểm thưởng & giảm giá trực tiếp!
              </span>
            </div>
            <span className="shrink-0 font-semibold text-[11px] bg-amber-500 text-neutral-950 px-2 py-0.5 rounded-full ml-2">
              Free Đăng ký
            </span>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm bò Mỹ, dẻ sườn, lẩu thái, bạch tuộc..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-amber-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Sticky Horizontal Category Tabs */}
        <div className="max-w-3xl mx-auto mt-3 overflow-x-auto no-scrollbar flex items-center gap-2 pb-1">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
              selectedCategory === "all"
                ? "bg-amber-500 text-neutral-950 shadow-md font-semibold"
                : "bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-neutral-800"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Tất cả món ({items.length})
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedCategory === cat.id
                  ? "bg-amber-500 text-neutral-950 shadow-md font-semibold"
                  : "bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-neutral-800"
              }`}
            >
              {getCategoryIcon(cat.slug)}
              {cat.name}
            </button>
          ))}
        </div>
      </header>

      {/* 2. Menu Item Feed */}
      <main className="max-w-3xl mx-auto px-4 mt-5 space-y-4">
        {isLoading ? (
          <div className="text-center py-20 text-neutral-500 text-sm">Đang tải thực đơn nóng hổi...</div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-neutral-900/50 rounded-2xl border border-neutral-800 p-8">
            <Utensils className="w-10 h-10 text-neutral-600 mx-auto mb-2" />
            <p className="text-neutral-400 text-sm">Không tìm thấy món ăn phù hợp với từ khóa.</p>
            <button
              onClick={() => {
                setSelectedCategory("all");
                setSearchQuery("");
              }}
              className="mt-3 text-xs text-amber-400 hover:underline"
            >
              Xem toàn bộ thực đơn
            </button>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isHero = item.isSignature || item.isBestSeller || item.categoryId === "cat-combo";
            const wishlistItem = wishlist.find((w) => w.item.id === item.id);

            return (
              <div
                key={item.id}
                className={`group rounded-2xl border transition overflow-hidden ${
                  !item.isAvailable
                    ? "opacity-60 bg-neutral-900/40 border-neutral-800/50"
                    : "bg-neutral-900/80 hover:bg-neutral-900 border-neutral-800/80 hover:border-neutral-700 shadow-lg"
                }`}
              >
                {/* Visual Card Layout */}
                <div className={isHero ? "flex flex-col" : "flex flex-row p-3 gap-3"}>
                  {/* Image */}
                  <div
                    className={`relative overflow-hidden cursor-pointer ${
                      isHero ? "w-full h-48 sm:h-56" : "w-28 h-28 shrink-0 rounded-xl"
                    }`}
                    onClick={() => setSelectedItemDetail(item)}
                  >
                    <img
                      src={item.imageUrl || "https://images.unsplash.com/photo-1544025162-d76694265947?w=800"}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />

                    {/* Out of stock overlay */}
                    {!item.isAvailable && (
                      <div className="absolute inset-0 bg-neutral-950/80 backdrop-blur-xs flex items-center justify-center">
                        <span className="bg-red-500/90 text-white font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
                          Tạm hết món hôm nay
                        </span>
                      </div>
                    )}

                    {/* Badges on Hero image */}
                    {item.isAvailable && (
                      <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
                        {item.isSignature && (
                          <span className="bg-red-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
                            <Flame className="w-3 h-3 fill-white" /> Chữ ký quán
                          </span>
                        )}
                        {item.isBestSeller && !item.isSignature && (
                          <span className="bg-amber-500 text-neutral-950 font-bold text-[10px] px-2 py-0.5 rounded-full shadow-md">
                            Best Seller
                          </span>
                        )}
                        {item.spicyLevel > 0 && (
                          <span className="bg-neutral-950/80 text-rose-400 border border-rose-500/30 text-[10px] px-2 py-0.5 rounded-full backdrop-blur-xs">
                            {"🌶️".repeat(item.spicyLevel)}
                          </span>
                        )}
                      </div>
                    )}

                    {item.portion && (
                      <div className="absolute bottom-2 left-2 bg-neutral-950/80 text-neutral-300 text-[10px] px-2 py-0.5 rounded-md backdrop-blur-xs">
                        {item.portion}
                      </div>
                    )}
                  </div>

                  {/* Content Info */}
                  <div className={`flex flex-col justify-between ${isHero ? "p-4" : "flex-1 min-w-0"}`}>
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3
                          onClick={() => setSelectedItemDetail(item)}
                          className="font-bold text-neutral-100 text-base leading-snug hover:text-amber-400 cursor-pointer transition line-clamp-1"
                        >
                          {item.name}
                        </h3>
                      </div>

                      {item.description && (
                        <p className="text-xs text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>

                    {/* Price & Action row */}
                    <div className="mt-3 pt-2.5 border-t border-neutral-800/80 flex items-center justify-between gap-2">
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="font-extrabold text-amber-400 text-base">
                            {formatVND(item.price)}
                          </span>

                          {/* Member perk price hint */}
                          {item.memberPrice && (
                            <span className="text-[11px] text-neutral-400 line-through">
                              {formatVND(item.memberPrice)}
                            </span>
                          )}
                        </div>

                        {item.memberPrice && (
                          <div className="text-[10px] text-amber-300/80 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-400" />
                            Giá hội viên: <b>{formatVND(item.memberPrice)}</b>
                          </div>
                        )}
                      </div>

                      {/* Add to Wishlist Button */}
                      {item.isAvailable ? (
                        wishlistItem ? (
                          <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-xl p-1">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-7 h-7 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white flex items-center justify-center transition active:scale-95"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-xs font-bold text-amber-400 px-1">{wishlistItem.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-7 h-7 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold flex items-center justify-center transition active:scale-95"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addToWishlist(item)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-amber-500 hover:text-neutral-950 border border-neutral-700 text-xs font-semibold text-neutral-200 transition active:scale-95"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Chọn món
                          </button>
                        )
                      ) : (
                        <span className="text-xs text-neutral-500 font-medium">Hết hàng</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </main>

      {/* 3. Floating Table Wishlist Bar ("Danh sách món muốn gọi") */}
      {totalWishlistItems > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-40 max-w-lg mx-auto">
          <div
            onClick={() => setIsWishlistOpen(true)}
            className="bg-gradient-to-r from-red-600 to-amber-600 rounded-2xl p-3.5 shadow-2xl shadow-red-950/80 flex items-center justify-between cursor-pointer border border-amber-400/30 hover:brightness-105 transition active:scale-98 text-white"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-neutral-950/40 flex items-center justify-center font-black text-sm">
                {totalWishlistItems}
              </div>
              <div>
                <p className="font-bold text-sm leading-tight">Danh sách món bàn muốn gọi</p>
                <p className="text-xs text-amber-100">Ước tính: {formatVND(totalEstimatedPrice)}</p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-xs font-bold bg-neutral-950/30 px-3 py-1.5 rounded-xl">
              <span>Mở đọc cho NV</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      )}

      {/* 4. Wishlist Drawer Modal (Dành cho khách mở ra đọc cho nhân viên ghi chép) */}
      {isWishlistOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-neutral-900 border border-neutral-800 w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[85vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200">
            {/* Modal Header */}
            <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-amber-500" />
                  Món đã chọn của bàn ({totalWishlistItems} món)
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Mở màn hình này để đọc tên món cho nhân viên phục vụ ghi order
                </p>
              </div>
              <button
                onClick={() => setIsWishlistOpen(false)}
                className="w-8 h-8 rounded-full bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List */}
            <div className="p-4 overflow-y-auto space-y-3 flex-1 divide-y divide-neutral-800/60">
              {wishlist.map((w) => (
                <div key={w.item.id} className="pt-3 first:pt-0 flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-neutral-200">{w.item.name}</p>
                    <p className="text-xs text-amber-400 font-medium">{formatVND(w.item.price * w.quantity)}</p>
                    {w.item.portion && <span className="text-[10px] text-neutral-500">{w.item.portion}</span>}
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 bg-neutral-800 border border-neutral-700 rounded-xl p-1">
                      <button
                        onClick={() => updateQuantity(w.item.id, -1)}
                        className="w-6 h-6 rounded-lg bg-neutral-700 text-white flex items-center justify-center text-xs"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold w-5 text-center text-white">{w.quantity}</span>
                      <button
                        onClick={() => updateQuantity(w.item.id, 1)}
                        className="w-6 h-6 rounded-lg bg-amber-500 text-neutral-950 font-bold flex items-center justify-center text-xs"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => updateQuantity(w.item.id, -w.quantity)}
                      className="text-neutral-500 hover:text-rose-400 p-1"
                      title="Xóa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-neutral-950 border-t border-neutral-800 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-400">Tổng tạm tính:</span>
                <span className="font-extrabold text-amber-400 text-lg">{formatVND(totalEstimatedPrice)}</span>
              </div>

              {/* Call to Action for Waiter & Loyalty reminder */}
              <div className="bg-amber-950/40 border border-amber-800/40 rounded-xl p-3 text-xs text-amber-200/90 flex items-start gap-2.5">
                <Gift className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-300">Nhắc nhở tích điểm:</p>
                  <p className="mt-0.5">
                    Hóa đơn này sẽ tích lũy khoảng <b>{Math.floor(totalEstimatedPrice / 10000)} điểm</b>. Nhớ đọc số điện thoại khi nhân viên tính tiền nhé!
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsWishlistOpen(false)}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-sm transition"
              >
                Đã xong, quay lại xem món tiếp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Item Detail Modal */}
      {selectedItemDetail && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="relative h-60 w-full">
              <img
                src={selectedItemDetail.imageUrl || "https://images.unsplash.com/photo-1544025162-d76694265947?w=800"}
                alt={selectedItemDetail.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedItemDetail(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-neutral-950/70 text-white flex items-center justify-center hover:bg-neutral-950"
              >
                <X className="w-5 h-5" />
              </button>
              {selectedItemDetail.portion && (
                <span className="absolute bottom-3 left-3 bg-neutral-950/80 backdrop-blur-xs text-neutral-200 text-xs px-2.5 py-1 rounded-lg">
                  {selectedItemDetail.portion}
                </span>
              )}
            </div>

            <div className="p-5">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-lg text-white">{selectedItemDetail.name}</h3>
                {selectedItemDetail.spicyLevel > 0 && (
                  <span className="text-xs bg-rose-950 text-rose-300 border border-rose-800/40 px-2 py-0.5 rounded-full">
                    {"🌶️".repeat(selectedItemDetail.spicyLevel)}
                  </span>
                )}
              </div>

              <p className="text-sm text-neutral-400 mt-2 leading-relaxed">
                {selectedItemDetail.description || "Món ăn hảo hạng được chế biến từ nguyên liệu tươi sống mỗi ngày."}
              </p>

              <div className="mt-4 pt-4 border-t border-neutral-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-neutral-500 block">Giá niêm yết</span>
                  <span className="font-extrabold text-amber-400 text-xl">{formatVND(selectedItemDetail.price)}</span>
                </div>

                {selectedItemDetail.isAvailable ? (
                  <button
                    onClick={() => {
                      addToWishlist(selectedItemDetail);
                      setSelectedItemDetail(null);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-sm transition active:scale-95 shadow-lg shadow-amber-500/20"
                  >
                    <Plus className="w-4 h-4" />
                    Thêm vào danh sách
                  </button>
                ) : (
                  <span className="text-xs text-red-400 font-semibold bg-red-950/40 border border-red-900 px-3 py-1.5 rounded-xl">
                    Tạm hết món
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
