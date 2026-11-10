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
  MapPin,
  Clock,
  Sun,
  Moon,
} from "lucide-react";
import { Category, MenuItem, WishlistItem } from "@/lib/types";
import { formatVND } from "@/lib/utils";
import { useTheme } from "@/components/ThemeProvider";

// ─── Skeleton Card for Smooth Loading ─────────────────────────────────────────
function SkeletonCard({ hero }: { hero?: boolean }) {
  if (hero) {
    return (
      <div className="rounded-2xl border border-stone-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 overflow-hidden space-y-3">
        <div className="skeleton w-full h-44 sm:h-52" />
        <div className="p-4 space-y-2.5">
          <div className="skeleton h-5 w-3/4" />
          <div className="skeleton h-3.5 w-full" />
          <div className="flex justify-between items-center pt-2">
            <div className="skeleton h-6 w-28" />
            <div className="skeleton h-8 w-24 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="flex gap-3 p-3 rounded-2xl border border-stone-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60">
      <div className="skeleton w-24 h-24 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2 py-1">
        <div className="skeleton h-4 w-3/4" />
        <div className="skeleton h-3 w-full" />
        <div className="skeleton h-3 w-1/2" />
        <div className="flex justify-between items-center pt-1">
          <div className="skeleton h-5 w-20" />
          <div className="skeleton h-7 w-20 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// ─── Spicy Level Flame Component ──────────────────────────────────────────────
function SpicyFlame({ level }: { level: number }) {
  if (!level || level <= 0) return null;
  return (
    <span
      className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-500/30 text-[10px] text-rose-700 dark:text-rose-300 font-bold"
      title={`Độ cay cấp ${level}`}
    >
      {Array.from({ length: level }).map((_, i) => (
        <Flame key={i} size={11} className="text-rose-600 dark:text-rose-400 fill-rose-600 dark:fill-rose-400 shrink-0" />
      ))}
    </span>
  );
}

export default function MenuPage() {
  const { themeMode, resolvedTheme, cycleTheme } = useTheme();
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [selectedItemDetail, setSelectedItemDetail] = useState<MenuItem | null>(null);
  const [copiedWifi, setCopiedWifi] = useState(false);
  const [tableNumber, setTableNumber] = useState<string>("Bàn 08");
  const [isEditingTable, setIsEditingTable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Animation triggers
  const [addedItemId, setAddedItemId] = useState<string | null>(null);
  const [wishlistBadgePulse, setWishlistBadgePulse] = useState(false);
  const prevTotalRef = useRef(0);

  // Load menu data
  useEffect(() => {
    async function loadMenu() {
      try {
        const res = await fetch("/api/menu");
        const json = await res.json();
        if (json.success) {
          setCategories(json.data.categories || []);
          setItems(json.data.items || []);
        }
      } catch (err) {
        console.error("Failed to load menu", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadMenu();
  }, []);

  // Pulse badge whenever wishlist count changes
  const totalWishlistItems = wishlist.reduce((acc, w) => acc + w.quantity, 0);
  useEffect(() => {
    if (totalWishlistItems > prevTotalRef.current) {
      setWishlistBadgePulse(true);
      setTimeout(() => setWishlistBadgePulse(false), 400);
    }
    prevTotalRef.current = totalWishlistItems;
  }, [totalWishlistItems]);

  // Wishlist actions
  const addToWishlist = useCallback((item: MenuItem) => {
    setWishlist((prev) => {
      const existing = prev.find((w) => w.item.id === item.id);
      if (existing) {
        return prev.map((w) => (w.item.id === item.id ? { ...w, quantity: w.quantity + 1 } : w));
      }
      return [...prev, { item, quantity: 1 }];
    });
    setAddedItemId(item.id);
    setTimeout(() => setAddedItemId(null), 400);
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
    if (navigator?.clipboard) {
      navigator.clipboard.writeText("88888888");
      setCopiedWifi(true);
      setTimeout(() => setCopiedWifi(false), 2000);
    }
  };

  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case "combo-tiet-kiem":
        return <Flame size={14} className="text-orange-500 shrink-0" />;
      case "thit-bo-heo-nuong":
        return <Beef size={14} className="text-rose-500 shrink-0" />;
      case "hai-san-nuong":
        return <Fish size={14} className="text-sky-500 shrink-0" />;
      case "nuoc-lau-set-lau":
        return <Soup size={14} className="text-amber-500 shrink-0" />;
      case "topping-nhung-lau":
        return <Salad size={14} className="text-emerald-500 shrink-0" />;
      case "mon-khai-vi":
        return <Utensils size={14} className="text-purple-500 shrink-0" />;
      case "do-uong-trang-mieng":
        return <Wine size={14} className="text-pink-500 shrink-0" />;
      default:
        return <Flame size={14} className="text-orange-500 shrink-0" />;
    }
  };

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchCat = selectedCategory === "all" || item.categoryId === selectedCategory;
      const matchSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [items, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-stone-100/70 dark:bg-neutral-950 text-stone-900 dark:text-neutral-100 pb-36 font-sans select-none antialiased transition-colors duration-200">
      {/* ── 1. Top Brand & Table Info Header ───────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-b border-stone-200 dark:border-neutral-800 shadow-xs transition-colors duration-200">
        <div className="max-w-md mx-auto px-4 pt-3 pb-2.5">
          {/* Brand Row + Controls */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              {/* Circular Logo */}
              <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-stone-200 dark:border-neutral-700 bg-stone-100 dark:bg-neutral-800 flex items-center justify-center">
                <img
                  src="/logo.png"
                  alt="Đạt Lẩu & Nướng"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="font-extrabold text-sm tracking-tight text-neutral-900 dark:text-white uppercase leading-none">
                    Đạt Lẩu &amp; Nướng
                  </h1>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-stone-100 dark:bg-neutral-800 text-red-700 dark:text-red-400 border border-stone-200 dark:border-neutral-700 font-bold uppercase">
                    BBQ
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 dark:text-neutral-400 mt-0.5">Thực đơn gọi món tại bàn</p>
              </div>
            </div>

            {/* Right Controls: Theme Toggle & Table Number */}
            <div className="flex items-center gap-1.5">
              {/* Theme Toggle Button */}
              <button
                onClick={cycleTheme}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-stone-100 dark:bg-neutral-800 border border-stone-200 dark:border-neutral-700 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:border-stone-400 dark:hover:border-neutral-600 transition active:scale-95"
                title={`Chế độ: ${themeMode === "auto" ? "Tự động theo giờ điện thoại" : themeMode === "light" ? "Giao diện sáng" : "Giao diện tối"} (Bấm để đổi)`}
              >
                {themeMode === "auto" ? (
                  <>
                    <Clock size={12} className="text-stone-600 dark:text-stone-400 shrink-0" />
                    <span className="text-[10px]">Auto</span>
                  </>
                ) : themeMode === "light" ? (
                  <>
                    <Sun size={12} className="text-amber-600 shrink-0" />
                    <span className="text-[10px]">Sáng</span>
                  </>
                ) : (
                  <>
                    <Moon size={12} className="text-stone-300 shrink-0" />
                    <span className="text-[10px]">Tối</span>
                  </>
                )}
              </button>

              {/* Table Badge */}
              <div className="relative shrink-0">
                {isEditingTable ? (
                  <div className="flex items-center gap-1 bg-white dark:bg-neutral-800 border border-stone-300 dark:border-neutral-600 rounded-lg p-1">
                    <input
                      type="text"
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                      onBlur={() => setIsEditingTable(false)}
                      autoFocus
                      className="w-16 bg-stone-100 dark:bg-neutral-950 text-stone-900 dark:text-white text-xs font-bold px-1.5 py-0.5 rounded outline-none"
                    />
                    <button
                      onClick={() => setIsEditingTable(false)}
                      className="p-1 text-emerald-600 dark:text-emerald-400"
                    >
                      <Check size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsEditingTable(true)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-neutral-800 border border-stone-200 dark:border-neutral-700 text-xs font-bold text-stone-800 dark:text-stone-200 hover:border-stone-400 dark:hover:border-neutral-600 transition active:scale-95"
                    title="Nhấn để đổi số bàn"
                  >
                    <MapPin size={12} className="text-red-700 dark:text-red-400 shrink-0" />
                    <span>{tableNumber}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Quick Info Bar: Wifi & Member perk */}
          <div className="mt-2.5 flex items-center justify-between gap-2 text-xs">
            {/* Wifi Quick Copy */}
            <button
              onClick={copyWifiPassword}
              className="flex-1 flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-stone-100 dark:bg-neutral-800 border border-stone-200 dark:border-neutral-700 text-stone-700 dark:text-neutral-300 hover:text-stone-900 dark:hover:text-white transition active:scale-95"
            >
              <div className="flex items-center gap-1.5 text-[11px]">
                <Wifi size={13} className="text-stone-600 dark:text-stone-400 shrink-0" />
                <span className="font-mono text-stone-500 dark:text-neutral-400">Wifi: <b className="text-stone-800 dark:text-neutral-200">DatLauNuong_5G</b></span>
              </div>
              {copiedWifi ? (
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <Check size={12} /> Đã chép
                </span>
              ) : (
                <span className="text-[10px] text-stone-700 dark:text-stone-300 font-mono bg-stone-200/80 dark:bg-neutral-900 px-1.5 py-0.5 rounded font-semibold">
                  88888888
                </span>
              )}
            </button>

            {/* Member Reminder Pill */}
            <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-stone-100 dark:bg-neutral-800 border border-stone-200 dark:border-neutral-700 text-[11px] text-stone-700 dark:text-stone-300 font-medium">
              <Gift size={13} className="text-red-700 dark:text-red-400 shrink-0" />
              <span>Tích 10–15% điểm đổi quà</span>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative mt-2.5">
            <Search size={15} className="text-stone-400 dark:text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Tìm bò Mỹ, dẻ sườn, lẩu thái, ba chỉ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-stone-100 dark:bg-neutral-800 border border-stone-200 dark:border-neutral-700 rounded-xl pl-9 pr-8 py-2 text-xs text-stone-900 dark:text-neutral-100 placeholder:text-stone-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-red-700 dark:focus:border-neutral-500 focus:bg-white dark:focus:bg-neutral-800 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:text-neutral-500 dark:hover:text-white p-1"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Category Horizontal Scroll Tabs */}
          <div className="mt-2.5 -mx-4 px-4 overflow-x-auto no-scrollbar flex items-center gap-2 pb-1">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 ${
                selectedCategory === "all"
                  ? "bg-red-800 text-white"
                  : "bg-stone-100 dark:bg-neutral-800 text-stone-600 dark:text-neutral-400 border border-stone-200 dark:border-neutral-700 hover:text-stone-900 dark:hover:text-neutral-200"
              }`}
            >
              <Sparkles size={13} className="shrink-0" />
              <span>Tất cả ({items.length})</span>
            </button>

            {categories.map((cat) => {
              const count = items.filter((i) => i.categoryId === cat.id).length;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 ${
                    isActive
                      ? "bg-red-800 text-white"
                      : "bg-stone-100 dark:bg-neutral-800 text-stone-600 dark:text-neutral-400 border border-stone-200 dark:border-neutral-700 hover:text-stone-900 dark:hover:text-neutral-200"
                  }`}
                >
                  {getCategoryIcon(cat.slug)}
                  <span>{cat.name}</span>
                  {count > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-stone-200 dark:bg-neutral-700 text-stone-600 dark:text-neutral-400"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* ── 2. Menu Item Feed ────────────────────────────────────────────────── */}
      <main className="max-w-md mx-auto px-4 mt-4 space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            <SkeletonCard hero />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-neutral-900/50 rounded-2xl border border-stone-200 dark:border-neutral-800/80 p-8 shadow-sm">
            <Utensils size={36} className="text-stone-400 dark:text-neutral-600 mx-auto mb-3" />
            <p className="text-stone-800 dark:text-neutral-400 text-sm font-semibold">Không tìm thấy món phù hợp</p>
            <p className="text-xs text-stone-500 dark:text-neutral-500 mt-1">Thử tìm bằng từ khóa khác hoặc xem tất cả món</p>
            <button
              onClick={() => {
                setSelectedCategory("all");
                setSearchQuery("");
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-bold shadow-sm transition"
            >
              Xem toàn bộ thực đơn
            </button>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isHero = item.isSignature || item.isBestSeller || item.categoryId === "cat-combo";
            const wishlistItem = wishlist.find((w) => w.item.id === item.id);
            const isJustAdded = addedItemId === item.id;

            // ── A. HERO CARD (for Combos and Signature Dishes) ──
            if (isHero) {
              return (
                <div
                  key={item.id}
                  className={`group rounded-2xl border overflow-hidden transition-all duration-200 ${
                    !item.isAvailable
                      ? "opacity-60 bg-stone-100 dark:bg-neutral-900/40 border-stone-200 dark:border-neutral-800/50"
                      : "bg-white dark:bg-neutral-900/90 hover:border-red-300 dark:hover:border-neutral-700 border-stone-200 dark:border-neutral-800 shadow-sm dark:shadow-lg dark:shadow-black/40"
                  }`}
                >
                  {/* Big Hero Image */}
                  <div
                    className="relative w-full h-44 sm:h-52 overflow-hidden cursor-pointer"
                    onClick={() => setSelectedItemDetail(item)}
                  >
                    <img
                      src={item.imageUrl || "https://images.unsplash.com/photo-1544025162-d76694265947?w=800"}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500 ease-out"
                    />

                    {/* Gradient overlay for readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/30 pointer-events-none" />

                    {/* Badges on Top Left */}
                    <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
                      {item.isSignature && (
                        <span className="bg-red-700 text-white font-bold text-[10px] px-2 py-0.5 rounded shadow-xs flex items-center gap-1 uppercase tracking-wide">
                          <Flame size={11} className="fill-white" />
                          Nên thử
                        </span>
                      )}
                      {item.isBestSeller && !item.isSignature && (
                        <span className="bg-amber-600 text-white font-bold text-[10px] px-2 py-0.5 rounded shadow-xs uppercase tracking-wide">
                          ⭐ Best seller
                        </span>
                      )}
                      {item.spicyLevel > 0 && <SpicyFlame level={item.spicyLevel} />}
                    </div>

                    {/* Portion Tag on Bottom Left */}
                    {item.portion && (
                      <span className="absolute bottom-2.5 left-2.5 bg-neutral-950/85 backdrop-blur-sm text-neutral-200 text-[11px] font-semibold px-2 py-0.5 rounded-md border border-neutral-800">
                        {item.portion}
                      </span>
                    )}

                    {/* Out of Stock Overlay */}
                    {!item.isAvailable && (
                      <div className="absolute inset-0 bg-neutral-950/80 backdrop-blur-xs flex items-center justify-center z-20">
                        <span className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
                          Tạm hết món hôm nay
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Hero Card Content */}
                  <div className="p-4 space-y-2.5">
                    <div>
                      <h3
                        onClick={() => setSelectedItemDetail(item)}
                        className="font-bold text-stone-900 dark:text-neutral-100 text-base leading-snug hover:text-red-700 dark:hover:text-amber-400 cursor-pointer transition line-clamp-1"
                      >
                        {item.name}
                      </h3>
                      {item.description && (
                        <p className="text-xs text-stone-500 dark:text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>

                    {/* Price and Action Row */}
                    <div className="pt-2 border-t border-stone-200 dark:border-neutral-800/80 flex items-center justify-between gap-2">
                      <div>
                        <span className="font-black text-red-700 dark:text-amber-400 text-lg tabular-nums">
                          {formatVND(item.price)}
                        </span>
                      </div>

                      {/* Add Button / Stepper */}
                      {item.isAvailable ? (
                        wishlistItem ? (
                          <div className="flex items-center gap-1.5 bg-stone-100 dark:bg-neutral-800 border border-stone-200 dark:border-neutral-700 rounded-xl p-1">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-7 h-7 rounded-lg bg-stone-200 dark:bg-neutral-700 hover:bg-stone-300 dark:hover:bg-neutral-600 text-stone-900 dark:text-white flex items-center justify-center transition active:scale-95"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="text-xs font-bold text-stone-900 dark:text-white w-5 text-center tabular-nums">
                              {wishlistItem.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-7 h-7 rounded-lg bg-red-700 hover:bg-red-800 text-white font-bold flex items-center justify-center transition active:scale-95"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addToWishlist(item)}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-bold active:scale-95 transition"
                          >
                            <Plus size={14} />
                            <span>Chọn món</span>
                          </button>
                        )
                      ) : (
                        <span className="text-xs text-stone-400 dark:text-neutral-500 font-medium">Hết hàng</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            }

            // ── B. STANDARD CARD (Horizontal mobile card for meats, toppings, drinks) ──
            return (
              <div
                key={item.id}
                className={`group flex gap-3 p-3 rounded-2xl border transition-all duration-200 overflow-hidden ${
                  !item.isAvailable
                    ? "opacity-60 bg-stone-100 dark:bg-neutral-900/40 border-stone-200 dark:border-neutral-800/40"
                    : "bg-white dark:bg-neutral-900/90 hover:border-red-300 dark:hover:border-neutral-700 border-stone-200 dark:border-neutral-800/80 shadow-xs dark:shadow-md dark:shadow-black/30"
                }`}
              >
                {/* 96x96 Rounded Image Thumbnail */}
                <div
                  className="relative w-24 h-24 shrink-0 rounded-xl overflow-hidden cursor-pointer"
                  onClick={() => setSelectedItemDetail(item)}
                >
                  <img
                    src={item.imageUrl || "https://images.unsplash.com/photo-1544025162-d76694265947?w=800"}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />

                  {/* Badges on thumbnail */}
                  {item.spicyLevel > 0 && (
                    <div className="absolute top-1.5 left-1.5">
                      <SpicyFlame level={item.spicyLevel} />
                    </div>
                  )}

                  {item.portion && (
                    <span className="absolute bottom-1.5 left-1.5 bg-neutral-950/80 backdrop-blur-xs text-neutral-300 text-[9px] font-semibold px-1.5 py-0.2 rounded">
                      {item.portion}
                    </span>
                  )}

                  {!item.isAvailable && (
                    <div className="absolute inset-0 bg-neutral-950/80 backdrop-blur-xs flex items-center justify-center p-1 text-center">
                      <span className="text-[10px] text-red-400 font-bold uppercase leading-tight">
                        Hết
                      </span>
                    </div>
                  )}
                </div>

                {/* Info & Price Column */}
                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                  <div>
                    <h3
                      onClick={() => setSelectedItemDetail(item)}
                      className="font-bold text-stone-900 dark:text-neutral-100 text-sm leading-tight hover:text-red-700 dark:hover:text-amber-400 cursor-pointer transition line-clamp-1"
                    >
                      {item.name}
                    </h3>
                    {item.description && (
                      <p className="text-[11px] text-stone-500 dark:text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* Price & Add Stepper */}
                  <div className="mt-2 flex items-center justify-between gap-1 pt-1.5 border-t border-stone-200 dark:border-neutral-800/60">
                    <div>
                      <span className="font-extrabold text-red-700 dark:text-amber-400 text-sm tabular-nums">
                        {formatVND(item.price)}
                      </span>
                    </div>

                    {item.isAvailable ? (
                      wishlistItem ? (
                        <div className="flex items-center gap-1 bg-stone-100 dark:bg-neutral-800 border border-stone-200 dark:border-neutral-700 rounded-xl p-0.5">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-6 h-6 rounded-lg bg-stone-200 dark:bg-neutral-700 text-stone-900 dark:text-white flex items-center justify-center transition active:scale-95"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-xs font-bold text-stone-900 dark:text-white w-4 text-center tabular-nums">
                            {wishlistItem.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-6 h-6 rounded-lg bg-red-700 hover:bg-red-800 text-white font-bold flex items-center justify-center transition active:scale-95"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToWishlist(item)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-stone-100 dark:bg-neutral-800 hover:bg-red-700 hover:text-white border border-stone-200 dark:border-neutral-700 text-stone-800 dark:text-neutral-200 text-xs font-bold transition active:scale-95"
                        >
                          <Plus size={13} />
                          <span>Chọn</span>
                        </button>
                      )
                    ) : (
                      <span className="text-[11px] text-stone-400 dark:text-neutral-500">Hết</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </main>

      {/* ── 3. Floating Bottom Wishlist Bar ("Bàn đã chọn X món") ───────────── */}
      {totalWishlistItems > 0 && (
        <div className="fixed bottom-4 left-3 right-3 z-40 max-w-md mx-auto">
          <div
            onClick={() => setIsWishlistOpen(true)}
            className="bg-red-800 text-white rounded-2xl p-3.5 shadow-xl shadow-black/30 flex items-center justify-between cursor-pointer border border-red-700/80 transition active:scale-98"
          >
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-xl bg-black/25 flex items-center justify-center font-bold text-sm shrink-0 tabular-nums text-white"
              >
                {totalWishlistItems}
              </div>
              <div>
                <p className="font-extrabold text-xs leading-tight flex items-center gap-1.5">
                  <span>Món bàn {tableNumber} đã chọn</span>
                </p>
                <p className="text-[11px] text-stone-200 font-medium tabular-nums">
                  Tạm tính: {formatVND(totalEstimatedPrice)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-xs font-bold bg-black/20 hover:bg-black/30 px-3 py-1.5 rounded-xl text-white shrink-0">
              <span>Đọc cho NV</span>
              <ChevronRight size={14} />
            </div>
          </div>
        </div>
      )}

      {/* ── 4. Wishlist Drawer / Modal (Dành cho khách đọc món cho phục vụ) ──── */}
      {isWishlistOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsWishlistOpen(false);
          }}
        >
          <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl max-h-[88vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Mobile Drag Handle */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1 rounded-full bg-stone-300 dark:bg-neutral-700" />
            </div>

            {/* Modal Header */}
            <div className="p-4 border-b border-stone-200 dark:border-neutral-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-base text-stone-900 dark:text-white">Món đã chọn ({tableNumber})</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 dark:bg-amber-500/20 text-red-700 dark:text-amber-300 font-bold">
                    {totalWishlistItems} phần
                  </span>
                </div>
                <p className="text-xs text-stone-500 dark:text-neutral-400 mt-0.5">
                  Mở màn hình này để đọc tên món cho nhân viên phục vụ ghi order
                </p>
              </div>
              <button
                onClick={() => setIsWishlistOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 dark:bg-neutral-800 hover:bg-stone-200 dark:hover:bg-neutral-700 text-stone-500 dark:text-neutral-400 hover:text-stone-900 dark:hover:text-white flex items-center justify-center transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Item List */}
            <div className="p-4 overflow-y-auto space-y-2 flex-1 divide-y divide-stone-100 dark:divide-neutral-800/60">
              {wishlist.map((w) => (
                <div key={w.item.id} className="pt-2.5 first:pt-0 flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-stone-900 dark:text-neutral-100 truncate">{w.item.name}</p>
                    <p className="text-xs text-red-700 dark:text-amber-400 font-bold tabular-nums">
                      {formatVND(w.item.price * w.quantity)}
                    </p>
                    {w.item.portion && (
                      <span className="text-[10px] text-stone-400 dark:text-neutral-500">{w.item.portion}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-1 bg-stone-100 dark:bg-neutral-800 border border-stone-200 dark:border-neutral-700 rounded-xl p-1">
                      <button
                        onClick={() => updateQuantity(w.item.id, -1)}
                        className="w-6 h-6 rounded-lg bg-stone-200 dark:bg-neutral-700 text-stone-900 dark:text-white flex items-center justify-center active:scale-95 transition"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-xs font-black w-5 text-center text-stone-900 dark:text-white tabular-nums">
                        {w.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(w.item.id, 1)}
                        className="w-6 h-6 rounded-lg bg-red-700 hover:bg-red-800 text-white font-bold flex items-center justify-center active:scale-95 transition"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <button
                      onClick={() => updateQuantity(w.item.id, -w.quantity)}
                      className="text-stone-400 hover:text-rose-600 dark:text-neutral-500 dark:hover:text-rose-400 p-1.5 transition"
                      title="Xóa món"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-stone-50 dark:bg-neutral-950 border-t border-stone-200 dark:border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-500 dark:text-neutral-400 font-medium">Tổng hóa đơn tạm tính:</span>
                <span className="font-black text-red-700 dark:text-amber-400 text-lg tabular-nums">
                  {formatVND(totalEstimatedPrice)}
                </span>
              </div>

              {/* Loyalty Earn Estimate */}
              <div className="bg-stone-100 dark:bg-neutral-800 border border-stone-200 dark:border-neutral-700 rounded-xl p-2.5 text-xs text-stone-800 dark:text-stone-200 flex items-start gap-2">
                <Gift size={15} className="text-red-700 dark:text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-stone-900 dark:text-white leading-tight">Nhắc nhở tích điểm đổi quà:</p>
                  <p className="text-[11px] text-stone-600 dark:text-stone-300 mt-0.5 leading-normal">
                    Hóa đơn này dự kiến tích lũy khoảng{" "}
                    <b>+{Math.floor(totalEstimatedPrice / 10000)} điểm</b>. Nhớ đọc số điện thoại khi tính tiền để đổi quà nhé!
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsWishlistOpen(false)}
                className="w-full py-3 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold text-xs uppercase tracking-wider transition active:scale-98"
              >
                Đã xong, quay lại xem món tiếp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 5. Dish Detail Modal (Bottom popup on tap) ───────────────────────── */}
      {selectedItemDetail && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedItemDetail(null);
          }}
        >
          <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl">
            {/* Modal Header Image */}
            <div className="relative h-56 sm:h-64 w-full">
              <img
                src={selectedItemDetail.imageUrl || "https://images.unsplash.com/photo-1544025162-d76694265947?w=800"}
                alt={selectedItemDetail.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/30 pointer-events-none" />

              <button
                onClick={() => setSelectedItemDetail(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-neutral-950/70 text-white flex items-center justify-center hover:bg-neutral-950 transition active:scale-95"
              >
                <X size={16} />
              </button>

              {/* Badges on image */}
              <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                {selectedItemDetail.isSignature && (
                  <span className="bg-red-700 text-white font-bold text-[10px] px-2 py-0.5 rounded shadow-xs flex items-center gap-1 uppercase">
                    <Flame size={11} className="fill-white" /> Nên thử
                  </span>
                )}
                {selectedItemDetail.isBestSeller && !selectedItemDetail.isSignature && (
                  <span className="bg-amber-600 text-white font-bold text-[10px] px-2 py-0.5 rounded shadow-xs uppercase">
                    ⭐ Best seller
                  </span>
                )}
                {selectedItemDetail.spicyLevel > 0 && (
                  <SpicyFlame level={selectedItemDetail.spicyLevel} />
                )}
              </div>

              {selectedItemDetail.portion && (
                <span className="absolute bottom-3 left-3 bg-neutral-950/85 backdrop-blur-sm text-neutral-200 text-xs font-semibold px-2.5 py-1 rounded-lg border border-neutral-800">
                  {selectedItemDetail.portion}
                </span>
              )}
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-3">
              <div>
                <h3 className="font-extrabold text-lg text-stone-900 dark:text-white leading-tight">
                  {selectedItemDetail.name}
                </h3>
                <p className="text-xs text-stone-500 dark:text-neutral-400 mt-1.5 leading-relaxed">
                  {selectedItemDetail.description ||
                    "Món ăn hảo hạng được chế biến từ nguyên liệu tươi sống mỗi ngày, ướp sốt đặc trưng của bếp trưởng Đạt Lẩu & Nướng."}
                </p>
              </div>

              <div className="pt-3 border-t border-stone-200 dark:border-neutral-800 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] text-stone-400 dark:text-neutral-500 uppercase tracking-wider block">
                    Giá món
                  </span>
                  <span className="font-black text-red-700 dark:text-amber-400 text-2xl tabular-nums">
                    {formatVND(selectedItemDetail.price)}
                  </span>
                </div>

                {selectedItemDetail.isAvailable ? (
                  <button
                    onClick={() => {
                      addToWishlist(selectedItemDetail);
                      setSelectedItemDetail(null);
                    }}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold text-xs uppercase tracking-wider active:scale-95 transition"
                  >
                    <Plus size={16} />
                    <span>Thêm vào món gọi</span>
                  </button>
                ) : (
                  <span className="text-xs text-red-600 dark:text-red-400 font-bold bg-red-100 dark:bg-red-950/50 border border-red-300 dark:border-red-900/60 px-3 py-2 rounded-xl">
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
