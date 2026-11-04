"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import {
  Flame,
  Search,
  Wifi,
  Sparkles,
  Plus,
  Minus,
  Trash2,
  X,
  Check,
  ChevronRight,
  Gift,
  Soup,
  Utensils,
  Beef,
  Fish,
  Salad,
  Wine,
  Heart,
} from "lucide-react";
import { Category, MenuItem, WishlistItem } from "@/lib/types";
import { formatVND } from "@/lib/utils";

// ─── Skeleton loader for menu cards ───────────────────────────────────────────
function SkeletonCard({ hero }: { hero?: boolean }) {
  return (
    <div className={`rounded-2xl border border-neutral-800/60 overflow-hidden bg-neutral-900/50 ${hero ? "" : "flex flex-row p-3 gap-3"}`}>
      {hero ? (
        <>
          <div className="skeleton w-full h-48" />
          <div className="p-4 space-y-3">
            <div className="skeleton h-4 w-3/4" />
            <div className="skeleton h-3 w-full" />
            <div className="skeleton h-3 w-2/3" />
            <div className="flex justify-between items-center mt-4">
              <div className="skeleton h-6 w-24" />
              <div className="skeleton h-8 w-24 rounded-xl" />
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="skeleton w-28 h-28 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2 py-1">
            <div className="skeleton h-4 w-3/4" />
            <div className="skeleton h-3 w-full" />
            <div className="skeleton h-3 w-1/2" />
            <div className="flex justify-between items-center mt-3">
              <div className="skeleton h-5 w-20" />
              <div className="skeleton h-7 w-20 rounded-xl" />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Spicy flame indicator ─────────────────────────────────────────────────────
function SpicyIndicator({ level }: { level: number }) {
  if (!level) return null;
  return (
    <span className="bg-neutral-950/80 border border-rose-500/30 text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm flex items-center gap-0.5">
      {Array.from({ length: level }).map((_, i) => (
        <Flame key={i} className="w-2.5 h-2.5 text-rose-400 fill-rose-400" />
      ))}
    </span>
  );
}

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

  // Animation states
  const [addedItemId, setAddedItemId] = useState<string | null>(null);
  const [wishlistBadgePulse, setWishlistBadgePulse] = useState(false);
  const prevTotalRef = useRef(0);

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

  // Trigger badge pulse when wishlist count increases
  const totalWishlistItems = wishlist.reduce((acc, w) => acc + w.quantity, 0);
  useEffect(() => {
    if (totalWishlistItems > prevTotalRef.current) {
      setWishlistBadgePulse(true);
      setTimeout(() => setWishlistBadgePulse(false), 400);
    }
    prevTotalRef.current = totalWishlistItems;
  }, [totalWishlistItems]);

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
  const addToWishlist = useCallback((item: MenuItem) => {
    setWishlist((prev) => {
      const existing = prev.find((w) => w.item.id === item.id);
      if (existing) {
        return prev.map((w) => (w.item.id === item.id ? { ...w, quantity: w.quantity + 1 } : w));
      }
      return [...prev, { item, quantity: 1 }];
    });
    // Trigger bounce animation
    setAddedItemId(item.id);
    setTimeout(() => setAddedItemId(null), 450);
  }, []);

  const updateQuantity = useCallback((itemId: string, delta: number) => {
    setWishlist((prev) =>
      prev
        .map((w) => {
          if (w.item.id === itemId) {
            const newQty = w.quantity + delta;
            return newQty > 0 ? { ...w, quantity: newQty } : null;
          }
          return w;
        })
        .filter(Boolean) as WishlistItem[]
    );
  }, []);

  const totalEstimatedPrice = wishlist.reduce((acc, w) => acc + w.item.price * w.quantity, 0);

  const copyWifiPassword = () => {
    navigator.clipboard.writeText("88888888");
    setCopiedWifi(true);
    setTimeout(() => setCopiedWifi(false), 2000);
  };

  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case "combo-tiet-kiem":    return <Flame    className="w-3.5 h-3.5 text-orange-500" />;
      case "thit-bo-heo-nuong": return <Beef     className="w-3.5 h-3.5 text-rose-500" />;
      case "hai-san-nuong":     return <Fish     className="w-3.5 h-3.5 text-sky-500" />;
      case "nuoc-lau-set-lau":  return <Soup     className="w-3.5 h-3.5 text-amber-500" />;
      case "topping-nhung-lau": return <Salad    className="w-3.5 h-3.5 text-emerald-500" />;
      case "mon-khai-vi":       return <Utensils className="w-3.5 h-3.5 text-purple-500" />;
      case "do-uong-trang-mieng": return <Wine   className="w-3.5 h-3.5 text-pink-500" />;
      default:                  return <Flame    className="w-3.5 h-3.5 text-orange-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 pb-32">

      {/* ── 1. Sticky Header ───────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-neutral-900/95 backdrop-blur-md border-b border-neutral-800/70 pt-5 pb-3 px-4 shadow-xl shadow-neutral-950/60">
        <div className="max-w-3xl mx-auto">

          {/* Brand row */}
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-red-600 flex items-center justify-center shadow-lg shadow-red-950/60 relative overflow-hidden">
                {/* Subtle shine */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                <Flame className="w-6 h-6 text-white relative z-10" />
              </div>
              <div>
                <h1 className="font-black text-lg leading-tight tracking-tight text-white flex items-center gap-1.5">
                  LẨU NƯỚNG KHÓI&nbsp;&amp;&nbsp;VỊ
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 font-semibold">
                    Hotpot &amp; BBQ
                  </span>
                </h1>
                <p className="text-xs text-neutral-400 mt-0.5">Thực đơn điện tử · Gọi món tại bàn</p>
              </div>
            </div>

            {/* Wifi badge */}
            <button
              onClick={copyWifiPassword}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800/90 border border-neutral-700/80 text-xs text-neutral-300 hover:text-white hover:border-amber-500/50 transition press-scale"
              title="Nhấn để chép mật khẩu Wifi"
            >
              <Wifi className="w-3.5 h-3.5 text-amber-400" />
              <span>
                Wifi: <b>KhoiVaVi_5G</b>
              </span>
              {copiedWifi ? (
                <Check className="w-3 h-3 text-emerald-400" />
              ) : (
                <span className="text-[10px] text-neutral-400 bg-neutral-700 px-1 py-0.5 rounded">
                  Pass: 88888888
                </span>
              )}
            </button>
          </div>

          {/* Member Banner */}
          <div className="bg-gradient-to-r from-amber-950/70 via-red-950/50 to-neutral-900 border border-amber-800/40 rounded-xl p-2.5 mb-3 flex items-center justify-between text-xs text-amber-200">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
                <Gift className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <span>
                <b>Ưu đãi hội viên:</b> Đọc SĐT khi thanh toán để tích <b>10–15%</b> điểm thưởng &amp; giảm giá!
              </span>
            </div>
            <span className="shrink-0 font-bold text-[11px] bg-amber-500 text-neutral-950 px-2 py-0.5 rounded-full ml-2">
              Free
            </span>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Tìm bò Mỹ, dẻ sườn, lẩu thái, bạch tuộc..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-800/80 border border-neutral-700/70 rounded-xl pl-10 pr-4 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-amber-500 focus:bg-neutral-800 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Category Tabs — sliding active indicator */}
        <div className="max-w-3xl mx-auto mt-3 overflow-x-auto no-scrollbar flex items-center gap-2 pb-1 px-0">
          {/* All tab */}
          <button
            onClick={() => setSelectedCategory("all")}
            className={`relative px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 press-scale ${
              selectedCategory === "all"
                ? "bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/30"
                : "bg-neutral-800/70 text-neutral-400 hover:text-neutral-200 border border-neutral-700/60"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Tất cả ({items.length})
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`relative px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 press-scale ${
                selectedCategory === cat.id
                  ? "bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/30"
                  : "bg-neutral-800/70 text-neutral-400 hover:text-neutral-200 border border-neutral-700/60"
              }`}
            >
              {getCategoryIcon(cat.slug)}
              {cat.name}
            </button>
          ))}
        </div>
      </header>

      {/* ── 2. Menu Feed ────────────────────────────────────────────────────── */}
      <main className="max-w-3xl mx-auto px-4 mt-5 space-y-3.5">
        {isLoading ? (
          // Loading skeletons
          <div className="space-y-3.5">
            <SkeletonCard hero />
            <SkeletonCard hero />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-neutral-900/50 rounded-2xl border border-neutral-800 p-8 animate-fade-slide-up">
            <Utensils className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
            <p className="text-neutral-400 text-sm font-medium">Không tìm thấy món phù hợp</p>
            <button
              onClick={() => { setSelectedCategory("all"); setSearchQuery(""); }}
              className="mt-4 text-xs text-amber-400 hover:text-amber-300 underline underline-offset-2 transition"
            >
              Xem toàn bộ thực đơn
            </button>
          </div>
        ) : (
          filteredItems.map((item, idx) => {
            const isHero = item.isSignature || item.isBestSeller || item.categoryId === "cat-combo";
            const wishlistItem = wishlist.find((w) => w.item.id === item.id);
            const isJustAdded = addedItemId === item.id;

            // Stagger index — clamp to 8
            const staggerClass = `stagger-${Math.min(idx + 1, 8)}`;

            return (
              <div
                key={item.id}
                className={`group rounded-2xl border overflow-hidden transition-all duration-300 animate-fade-slide-up ${staggerClass} ${
                  !item.isAvailable
                    ? "opacity-55 bg-neutral-900/40 border-neutral-800/40"
                    : "bg-neutral-900/80 hover:bg-neutral-900 border-neutral-800/70 hover:border-amber-500/20 hover:shadow-lg hover:shadow-amber-950/30"
                }`}
              >
                <div className={isHero ? "flex flex-col" : "flex flex-row p-3 gap-3"}>

                  {/* ── Image ── */}
                  <div
                    className={`relative overflow-hidden cursor-pointer ${
                      isHero ? "w-full h-48 sm:h-56" : "w-28 h-28 shrink-0 rounded-xl"
                    }`}
                    onClick={() => setSelectedItemDetail(item)}
                  >
                    <img
                      src={item.imageUrl || "https://images.unsplash.com/photo-1544025162-d76694265947?w=800"}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-700 ease-out"
                    />

                    {/* Out-of-stock overlay */}
                    {!item.isAvailable && (
                      <div className="absolute inset-0 bg-neutral-950/75 backdrop-blur-xs flex items-center justify-center">
                        <div className="bg-red-500/90 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg flex items-center gap-1.5">
                          <X className="w-3 h-3" />
                          Tạm hết hôm nay
                        </div>
                      </div>
                    )}

                    {/* Badges */}
                    {item.isAvailable && (
                      <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
                        {item.isSignature && (
                          <span className="bg-gradient-to-r from-red-600 to-orange-500 text-white font-bold text-[10px] px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
                            <Flame className="w-2.5 h-2.5 fill-white" />
                            Chữ ký quán
                          </span>
                        )}
                        {item.isBestSeller && !item.isSignature && (
                          <span className="bg-amber-500 text-neutral-950 font-bold text-[10px] px-2 py-0.5 rounded-full shadow-md">
                            ⭐ Best Seller
                          </span>
                        )}
                        {item.spicyLevel > 0 && <SpicyIndicator level={item.spicyLevel} />}
                      </div>
                    )}

                    {item.portion && (
                      <div className="absolute bottom-2 left-2 bg-neutral-950/80 text-neutral-300 text-[10px] px-2 py-0.5 rounded-md backdrop-blur-sm">
                        {item.portion}
                      </div>
                    )}
                  </div>

                  {/* ── Info ── */}
                  <div className={`flex flex-col justify-between ${isHero ? "p-4" : "flex-1 min-w-0"}`}>
                    <div>
                      <h3
                        onClick={() => setSelectedItemDetail(item)}
                        className="font-bold text-neutral-100 text-base leading-snug hover:text-amber-400 cursor-pointer transition line-clamp-1"
                      >
                        {item.name}
                      </h3>
                      {item.description && (
                        <p className="text-xs text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>

                    {/* Price + Action */}
                    <div className="mt-3 pt-2.5 border-t border-neutral-800/70 flex items-center justify-between gap-2">
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="font-extrabold text-amber-400 text-base tabular-nums">
                            {formatVND(item.price)}
                          </span>
                          {item.memberPrice && (
                            <span className="text-[11px] text-neutral-500 line-through tabular-nums">
                              {formatVND(item.memberPrice)}
                            </span>
                          )}
                        </div>
                        {item.memberPrice && (
                          <div className="text-[10px] text-amber-300/80 flex items-center gap-1 mt-0.5">
                            <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                            Hội viên: <b>{formatVND(item.memberPrice)}</b>
                          </div>
                        )}
                      </div>

                      {/* Add / Quantity control */}
                      {item.isAvailable ? (
                        wishlistItem ? (
                          <div className={`flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 rounded-xl p-1 ${isJustAdded ? "animate-bounce-pop" : ""}`}>
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-7 h-7 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white flex items-center justify-center transition press-scale"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-xs font-black text-amber-400 w-5 text-center tabular-nums">
                              {wishlistItem.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-7 h-7 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold flex items-center justify-center transition press-scale"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addToWishlist(item)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition press-scale ${
                              isJustAdded
                                ? "animate-bounce-pop bg-amber-500 border-amber-400 text-neutral-950"
                                : "bg-neutral-800 hover:bg-amber-500 hover:text-neutral-950 hover:border-amber-400 border-neutral-700 text-neutral-200"
                            }`}
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

      {/* ── 3. Floating Wishlist Bar ─────────────────────────────────────────── */}
      {totalWishlistItems > 0 && (
        <div className="fixed bottom-5 left-4 right-4 z-40 max-w-lg mx-auto animate-float-up">
          <div
            onClick={() => setIsWishlistOpen(true)}
            className="relative bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 rounded-2xl p-3.5 shadow-2xl shadow-red-950/70 flex items-center justify-between cursor-pointer border border-amber-400/20 hover:brightness-110 transition press-scale text-white overflow-hidden"
          >
            {/* Shimmer layer */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition duration-700 pointer-events-none" />

            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl bg-neutral-950/40 flex items-center justify-center font-black text-sm tabular-nums ${wishlistBadgePulse ? "animate-badge-pulse" : ""}`}>
                {totalWishlistItems}
              </div>
              <div>
                <p className="font-bold text-sm leading-tight">Danh sách món bàn muốn gọi</p>
                <p className="text-xs text-amber-100 tabular-nums">Ước tính: {formatVND(totalEstimatedPrice)}</p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-xs font-bold bg-neutral-950/30 px-3 py-1.5 rounded-xl backdrop-blur-sm">
              <span>Mở đọc cho NV</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      )}

      {/* ── 4. Wishlist Drawer ───────────────────────────────────────────────── */}
      {isWishlistOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setIsWishlistOpen(false); }}
        >
          <div className="bg-neutral-900 border border-neutral-800 w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[88vh] flex flex-col overflow-hidden animate-slide-in-bottom">
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1 rounded-full bg-neutral-700" />
            </div>

            {/* Header */}
            <div className="px-5 py-4 border-b border-neutral-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-amber-500" />
                  Món đã chọn ({totalWishlistItems} món)
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Mở màn hình này để đọc tên món cho nhân viên ghi order
                </p>
              </div>
              <button
                onClick={() => setIsWishlistOpen(false)}
                className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition press-scale"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Item list */}
            <div className="px-4 py-3 overflow-y-auto space-y-2 flex-1">
              {wishlist.map((w, i) => (
                <div
                  key={w.item.id}
                  className={`flex items-center justify-between gap-3 p-3 rounded-xl bg-neutral-800/50 border border-neutral-700/50 animate-fade-slide-up stagger-${Math.min(i + 1, 8)}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-neutral-200 truncate">{w.item.name}</p>
                    <p className="text-xs text-amber-400 font-bold tabular-nums mt-0.5">{formatVND(w.item.price * w.quantity)}</p>
                    {w.item.portion && <span className="text-[10px] text-neutral-500">{w.item.portion}</span>}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-1 bg-neutral-900 border border-neutral-700 rounded-xl p-1">
                      <button
                        onClick={() => updateQuantity(w.item.id, -1)}
                        className="w-6 h-6 rounded-lg bg-neutral-700 hover:bg-neutral-600 text-white flex items-center justify-center transition press-scale"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-black w-5 text-center text-white tabular-nums">{w.quantity}</span>
                      <button
                        onClick={() => updateQuantity(w.item.id, 1)}
                        className="w-6 h-6 rounded-lg bg-amber-500 text-neutral-950 font-bold flex items-center justify-center transition press-scale"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <button
                      onClick={() => updateQuantity(w.item.id, -w.quantity)}
                      className="text-neutral-600 hover:text-rose-400 transition p-1 press-scale"
                      title="Xóa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-4 bg-neutral-950/80 border-t border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-400">Tổng tạm tính:</span>
                <span className="font-black text-amber-400 text-xl tabular-nums">{formatVND(totalEstimatedPrice)}</span>
              </div>

              <div className="bg-gradient-to-r from-amber-950/50 to-red-950/30 border border-amber-800/40 rounded-xl p-3 text-xs text-amber-200/90 flex items-start gap-2.5">
                <Gift className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-300">Nhắc nhở tích điểm:</p>
                  <p className="mt-0.5">
                    Hóa đơn này sẽ tích lũy khoảng{" "}
                    <b className="text-amber-300">{Math.floor(totalEstimatedPrice / 10000)} điểm</b>.
                    Nhớ đọc số điện thoại khi nhân viên tính tiền nhé!
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsWishlistOpen(false)}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-sm transition press-scale shadow-lg shadow-amber-500/20"
              >
                Đã xong, quay lại xem món tiếp ✓
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 5. Item Detail Modal ─────────────────────────────────────────────── */}
      {selectedItemDetail && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedItemDetail(null); }}
        >
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-md w-full overflow-hidden animate-zoom-in shadow-2xl shadow-neutral-950">
            <div className="relative h-60 w-full">
              <img
                src={selectedItemDetail.imageUrl || "https://images.unsplash.com/photo-1544025162-d76694265947?w=800"}
                alt={selectedItemDetail.name}
                className="w-full h-full object-cover"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/80 via-transparent to-transparent" />

              <button
                onClick={() => setSelectedItemDetail(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-neutral-950/70 text-white flex items-center justify-center hover:bg-neutral-950 transition press-scale backdrop-blur-sm"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Badges on image */}
              <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                {selectedItemDetail.isSignature && (
                  <span className="bg-gradient-to-r from-red-600 to-orange-500 text-white font-bold text-[10px] px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
                    <Flame className="w-2.5 h-2.5 fill-white" /> Chữ ký quán
                  </span>
                )}
                {selectedItemDetail.isBestSeller && !selectedItemDetail.isSignature && (
                  <span className="bg-amber-500 text-neutral-950 font-bold text-[10px] px-2 py-0.5 rounded-full shadow-md">
                    ⭐ Best Seller
                  </span>
                )}
                {selectedItemDetail.spicyLevel > 0 && (
                  <SpicyIndicator level={selectedItemDetail.spicyLevel} />
                )}
              </div>

              {selectedItemDetail.portion && (
                <span className="absolute bottom-3 left-3 bg-neutral-950/80 backdrop-blur-sm text-neutral-200 text-xs px-2.5 py-1 rounded-lg">
                  {selectedItemDetail.portion}
                </span>
              )}
            </div>

            <div className="p-5">
              <h3 className="font-black text-lg text-white leading-tight">{selectedItemDetail.name}</h3>
              <p className="text-sm text-neutral-400 mt-2 leading-relaxed">
                {selectedItemDetail.description || "Món ăn hảo hạng được chế biến từ nguyên liệu tươi sống mỗi ngày."}
              </p>

              <div className="mt-4 pt-4 border-t border-neutral-800 flex items-center justify-between gap-3">
                <div>
                  <span className="text-xs text-neutral-500 block mb-0.5">Giá niêm yết</span>
                  <span className="font-black text-amber-400 text-2xl tabular-nums">{formatVND(selectedItemDetail.price)}</span>
                  {selectedItemDetail.memberPrice && (
                    <div className="text-[11px] text-amber-300/80 flex items-center gap-1 mt-1">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      Hội viên: <b>{formatVND(selectedItemDetail.memberPrice)}</b>
                    </div>
                  )}
                </div>

                {selectedItemDetail.isAvailable ? (
                  <button
                    onClick={() => {
                      addToWishlist(selectedItemDetail);
                      setSelectedItemDetail(null);
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-sm transition press-scale shadow-lg shadow-amber-500/25"
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
