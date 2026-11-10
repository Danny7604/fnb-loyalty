"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Search,
  UserCheck,
  UserPlus,
  Coins,
  Crown,
  Tag,
  CheckCircle2,
  Calendar,
  DollarSign,
  ArrowRight,
  RefreshCw,
  Gift,
  FileText,
  AlertCircle,
  Clock,
  Sparkles,
  Receipt,
  Check,
  UtensilsCrossed,
} from "lucide-react";
import { Customer, LoyaltySetting, MenuItem, PointTransaction, RewardMilestone, Tier, Voucher } from "@/lib/types";
import { formatVND, formatDate } from "@/lib/utils";

export default function CashierPage() {
  const [phone, setPhone] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [newCustName, setNewCustName] = useState("");
  const [newCustBirthDate, setNewCustBirthDate] = useState("");

  // Milestones & Menu Items
  const [milestones, setMilestones] = useState<RewardMilestone[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedMilestone, setSelectedMilestone] = useState<RewardMilestone | null>(null);
  const [selectedRewardDish, setSelectedRewardDish] = useState<MenuItem | null>(null);

  // Bill & Loyalty calculation
  const [billCode, setBillCode] = useState("");
  const [billAmount, setBillAmount] = useState<number | "">("");
  const [applyTierDiscount, setApplyTierDiscount] = useState(true);
  const [selectedVoucherCode, setSelectedVoucherCode] = useState<string>("");

  const [availableVouchers, setAvailableVouchers] = useState<Voucher[]>([]);
  const [isBirthdayMonth, setIsBirthdayMonth] = useState(false);
  const [loyaltySetting, setLoyaltySetting] = useState<LoyaltySetting | null>(null);

  // Success Receipt State
  const [completedTx, setCompletedTx] = useState<{
    customer: Customer;
    tx: PointTransaction;
    pointsEarned: number;
    finalAmount: number;
    rewardDish?: MenuItem | null;
    milestonePointsDeducted?: number;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const phoneInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto generate bill code
    setBillCode(`HD-${Math.floor(1000 + Math.random() * 9000)}`);

    // Fetch Milestones and Rules
    fetch("/api/loyalty-rules")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setMilestones(json.data.milestones || []);
          setMenuItems(json.data.menuItems || []);
          setLoyaltySetting(json.data.setting);
        }
      })
      .catch(console.error);
  }, []);

  // Search Customer by Phone
  const handleSearchPhone = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanPhone = phone.trim().replace(/\s+/g, "");
    if (!cleanPhone || cleanPhone.length < 8) {
      setErrorMsg("Vui lòng nhập số điện thoại hợp lệ (tối thiểu 9 số)");
      return;
    }

    setErrorMsg("");
    setIsSearching(true);
    setCustomer(null);
    setIsNewCustomer(false);
    setSelectedMilestone(null);
    setSelectedRewardDish(null);
    setSelectedVoucherCode("");

    try {
      const res = await fetch(`/api/customers/${cleanPhone}`);
      const json = await res.json();
      if (json.success) {
        if (json.data.setting) {
          setLoyaltySetting(json.data.setting);
        }
        if (json.data.exists) {
          setCustomer(json.data.customer);
          setIsBirthdayMonth(json.data.isBirthdayMonth);
          setAvailableVouchers(json.data.availableVouchers || []);
        } else {
          setIsNewCustomer(true);
          setNewCustName("");
          setNewCustBirthDate("");
        }
      }
    } catch (err: any) {
      setErrorMsg("Lỗi kết nối khi tra cứu khách hàng");
    } finally {
      setIsSearching(false);
    }
  };

  // Register New Customer Fast
  const handleRegisterNewCustomer = async () => {
    if (!newCustName.trim()) {
      setErrorMsg("Vui lòng nhập họ và tên khách hàng");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phone.trim(),
          fullName: newCustName.trim(),
          birthDate: newCustBirthDate || undefined,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setCustomer(json.data);
        setIsNewCustomer(false);
        setErrorMsg("");
      }
    } catch (err: any) {
      setErrorMsg("Lỗi tạo khách hàng mới");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculations
  const rawBill = Number(billAmount || 0);
  const tierDiscountPercent = customer && applyTierDiscount ? customer.tierDiscount || 0 : 0;
  const tierDiscountValue = Math.round((rawBill * tierDiscountPercent) / 100);

  // Voucher discount
  const selectedVoucher = availableVouchers.find((v) => v.code === selectedVoucherCode);
  let voucherDiscountValue = 0;
  if (selectedVoucher && rawBill >= selectedVoucher.minOrderAmount) {
    if (selectedVoucher.discountType === "PERCENT") {
      voucherDiscountValue = Math.min(
        Math.round((rawBill * selectedVoucher.discountValue) / 100),
        selectedVoucher.maxDiscount || Infinity
      );
    } else if (selectedVoucher.discountType === "FIXED") {
      voucherDiscountValue = selectedVoucher.discountValue;
    }
  }

  const totalDiscount = tierDiscountValue + voucherDiscountValue;
  const finalPaymentAmount = Math.max(0, rawBill - totalDiscount);

  // Points to earn
  const earnRateAmount = loyaltySetting?.earnRateAmount || 20000;
  const earnRatePoints = loyaltySetting?.earnRatePoints || 1;
  const pointMultiplier = customer?.tierName?.includes("Vàng")
    ? 1.5
    : customer?.tierName?.includes("Bạc")
    ? 1.2
    : customer?.tierName?.includes("Kim Cương")
    ? 2.0
    : 1.0;

  const pointsWillEarn =
    finalPaymentAmount > 0
      ? Math.floor((finalPaymentAmount / earnRateAmount) * earnRatePoints * pointMultiplier)
      : 0;

  // Submit Transaction
  const handleSubmitTransaction = async () => {
    if (!customer) {
      setErrorMsg("Chưa chọn khách hàng để tích điểm");
      return;
    }
    if (!billAmount || Number(billAmount) <= 0) {
      setErrorMsg("Vui lòng nhập số tiền hóa đơn");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      // 1. Nếu khách có đổi món thưởng
      let deductedPoints = 0;
      if (selectedMilestone && selectedRewardDish) {
        deductedPoints = selectedMilestone.pointsRequired;
        await fetch("/api/transactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerPhone: customer.phone,
            type: "REDEEM",
            points: -deductedPoints,
            billAmount: rawBill,
            billCode: billCode || "HD-LE",
            discountAmount: selectedRewardDish.price,
            staffName: "Thu Ngân Quầy",
            notes: `Đổi món thưởng: ${selectedRewardDish.name} (${selectedMilestone.name})`,
            redeemedMilestoneId: selectedMilestone.id,
            redeemedMilestoneName: selectedMilestone.name,
            redeemedItemId: selectedRewardDish.id,
            redeemedItemName: selectedRewardDish.name,
          }),
        });
      }

      // 2. Giao dịch tích điểm hóa đơn
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerPhone: customer.phone,
          type: "EARN",
          points: pointsWillEarn,
          billAmount: finalPaymentAmount,
          billCode: billCode || "HD-LE",
          discountAmount: totalDiscount,
          staffName: "Thu Ngân Quầy",
          notes: `Tích điểm hóa đơn ${billCode} (Hạng: ${customer.tierName || "Thành viên"})`,
          voucherCode: selectedVoucherCode || undefined,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setCompletedTx({
          customer: json.data.customer,
          tx: json.data.transaction,
          pointsEarned: pointsWillEarn,
          finalAmount: finalPaymentAmount,
          rewardDish: selectedRewardDish,
          milestonePointsDeducted: deductedPoints,
        });
      } else {
        setErrorMsg(json.error || "Giao dịch không thành công");
      }
    } catch (err: any) {
      setErrorMsg("Lỗi khi kết nối hệ thống tích điểm");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForNextCustomer = () => {
    setCompletedTx(null);
    setCustomer(null);
    setSelectedMilestone(null);
    setSelectedRewardDish(null);
    setPhone("");
    setIsNewCustomer(false);
    setBillAmount("");
    setSelectedVoucherCode("");
    setBillCode(`HD-${Math.floor(1000 + Math.random() * 9000)}`);
    phoneInputRef.current?.focus();
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
      {/* Top Bar for Cashier */}
      <header className="bg-neutral-900 border-b border-neutral-800 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full border border-neutral-700 bg-neutral-950 shrink-0 overflow-hidden flex items-center justify-center">
            <img
              src="/logo.png"
              alt="Đạt Lẩu & Nướng"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h1 className="font-bold text-white text-base leading-tight">Màn Hình Thu Ngân • Tích Điểm & Đổi Món</h1>
            <p className="text-xs text-neutral-400">Đạt Lẩu &amp; Nướng • Ca làm việc: Thu Ngân Quầy 1</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/loyalty-rules"
            className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs text-amber-400 font-medium transition"
          >
            ⚙ Cấu hình mốc điểm
          </Link>
          <Link
            href="/admin/dashboard"
            className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-300 font-medium transition"
          >
            Báo cáo doanh thu
          </Link>
          <Link
            href="/menu"
            target="_blank"
            className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-300 font-medium transition"
          >
            Menu khách ↗
          </Link>
        </div>
      </header>

      {/* Main Split Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Customer Search & Milestone Reward Picker (Col 5) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Step 1: Search Phone */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-sm space-y-3">
              <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
                <Search className="w-4 h-4 text-amber-400" />
                <span>Bước 1: Nhập Số Điện Thoại Khách Ăn</span>
              </h2>

              <form onSubmit={handleSearchPhone} className="flex gap-2">
                <input
                  ref={phoneInputRef}
                  type="tel"
                  placeholder="Nhập SĐT (vd: 0901234567)..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="flex-1 bg-neutral-950 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-base font-mono text-white placeholder:text-neutral-500 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="submit"
                  disabled={isSearching || !phone.trim()}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs transition active:scale-95 disabled:opacity-50 shrink-0 flex items-center gap-1.5"
                >
                  {isSearching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  Tra cứu
                </button>
              </form>

              {/* Quick sample buttons for cashier demo */}
              <div className="pt-2 border-t border-neutral-800/80 flex items-center gap-1.5 text-[11px] text-neutral-400">
                <span>Khách mẫu:</span>
                <button
                  type="button"
                  onClick={() => {
                    setPhone("0901234567");
                    setTimeout(() => handleSearchPhone(), 50);
                  }}
                  className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-amber-300 font-mono text-[10px]"
                >
                  0901234567 (240đ)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPhone("0988776655");
                    setTimeout(() => handleSearchPhone(), 50);
                  }}
                  className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-amber-300 font-mono text-[10px]"
                >
                  0988776655 (110đ)
                </button>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-950/60 border border-red-800/80 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>

            {/* Found Customer Details */}
            {customer ? (
              <div className="space-y-4">
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg text-white">{customer.fullName}</h3>
                        <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          {customer.tierName || "Thành viên"}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400 font-mono mt-0.5">{customer.phone}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-neutral-500 uppercase font-semibold block">Điểm tích lũy</span>
                      <span className="text-xl font-black text-amber-400 font-mono">
                        {customer.currentPoints} <span className="text-xs font-normal text-neutral-400">điểm</span>
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-800 text-xs">
                    <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800/80">
                      <span className="text-neutral-500 block text-[10px]">Tổng chi tiêu quán</span>
                      <span className="font-bold text-white font-mono">{formatVND(customer.totalSpent)}</span>
                    </div>
                    <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800/80">
                      <span className="text-neutral-500 block text-[10px]">Đặc quyền hạng</span>
                      <span className="font-bold text-amber-400">
                        {customer.tierDiscount ? `Giảm ${customer.tierDiscount}%` : "Tích lũy chuẩn"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ── Quà Tặng Đổi Thưởng Theo Mốc Điểm ───────────────────── */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-sm space-y-3.5">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-white">
                      <Gift className="w-4 h-4 text-red-500" />
                      <span>Đổi Món Thưởng Theo Mốc Điểm</span>
                    </div>
                    <span className="text-[10px] text-amber-400 font-mono font-semibold">
                      Khách có: {customer.currentPoints} điểm
                    </span>
                  </div>

                  {/* Milestones list */}
                  <div className="space-y-2.5">
                    {milestones.map((m) => {
                      const isEligible = customer.currentPoints >= m.pointsRequired;
                      const isChosen = selectedMilestone?.id === m.id;
                      const assignedItems = menuItems.filter((dish) => m.itemIds.includes(dish.id));

                      return (
                        <div
                          key={m.id}
                          className={`rounded-xl border p-3 transition ${
                            isChosen
                              ? "bg-red-950/20 border-red-700/80"
                              : isEligible
                              ? "bg-neutral-950/70 border-neutral-800 hover:border-neutral-700"
                              : "bg-neutral-950/40 border-neutral-800/50 opacity-60"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono shrink-0 ${
                                  isEligible
                                    ? "bg-red-900 text-white"
                                    : "bg-neutral-800 text-neutral-400"
                                }`}
                              >
                                {m.pointsRequired}đ
                              </span>
                              <div className="min-w-0">
                                <p className="font-bold text-xs text-white truncate leading-tight">{m.name}</p>
                                <p className="text-[10px] text-neutral-400 truncate mt-0.5">{m.description}</p>
                              </div>
                            </div>

                            {isEligible ? (
                              <button
                                type="button"
                                onClick={() => {
                                  if (isChosen) {
                                    setSelectedMilestone(null);
                                    setSelectedRewardDish(null);
                                  } else {
                                    setSelectedMilestone(m);
                                    setSelectedRewardDish(null);
                                  }
                                }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 ${
                                  isChosen
                                    ? "bg-red-700 text-white"
                                    : "bg-neutral-800 hover:bg-neutral-700 text-amber-400 border border-neutral-700"
                                }`}
                              >
                                {isChosen ? "Đang chọn món" : "Đổi mốc này"}
                              </button>
                            ) : (
                              <span className="text-[10px] text-neutral-500 font-mono shrink-0">
                                Thiếu {m.pointsRequired - customer.currentPoints}đ
                              </span>
                            )}
                          </div>

                          {/* Expanded list of dishes when milestone is chosen */}
                          {isChosen && (
                            <div className="mt-3 pt-3 border-t border-neutral-800/80 space-y-2">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="font-bold text-amber-300">
                                  👉 Bấm chọn 1 món khách muốn ăn:
                                </span>
                                <span className="text-neutral-400 text-[10px]">
                                  {assignedItems.length} món khả dụng
                                </span>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                                {assignedItems.map((dish) => {
                                  const isSelectedDish = selectedRewardDish?.id === dish.id;
                                  return (
                                    <button
                                      key={dish.id}
                                      type="button"
                                      onClick={() => setSelectedRewardDish(dish)}
                                      className={`flex items-center gap-2 p-2 rounded-xl border text-left transition ${
                                        isSelectedDish
                                          ? "bg-red-900/40 border-red-500 text-white font-bold"
                                          : "bg-neutral-900 border-neutral-800 text-neutral-300 hover:bg-neutral-800"
                                      }`}
                                    >
                                      {dish.imageUrl && (
                                        <img
                                          src={dish.imageUrl}
                                          alt={dish.name}
                                          className="w-9 h-9 rounded-lg object-cover bg-neutral-950 shrink-0"
                                        />
                                      )}
                                      <div className="min-w-0 flex-1">
                                        <p className="text-xs truncate font-semibold">{dish.name}</p>
                                        <p className="text-[10px] text-emerald-400 font-mono">
                                          0đ <span className="text-neutral-500 line-through">({formatVND(dish.price)})</span>
                                        </p>
                                      </div>
                                      {isSelectedDish && (
                                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                                      )}
                                    </button>
                                  );
                                })}
                              </div>

                              {selectedRewardDish ? (
                                <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-300 flex items-center justify-between">
                                  <span>
                                    ✅ Món tặng bàn: <b>{selectedRewardDish.name}</b>
                                  </span>
                                  <span className="font-mono text-red-400 font-bold">
                                    -{m.pointsRequired} điểm
                                  </span>
                                </div>
                              ) : (
                                <p className="text-[11px] text-amber-400/90 italic">
                                  * Nhân viên vui lòng click chọn đúng món khách yêu cầu để ghi nhận vào đơn.
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : isNewCustomer ? (
              /* Fast New Customer Registration */
              <div className="bg-neutral-900 border border-amber-600/40 rounded-2xl p-5 shadow-sm space-y-4 animate-in fade-in">
                <div className="flex items-center gap-2 text-amber-400">
                  <UserPlus className="w-5 h-5" />
                  <h3 className="font-bold text-base text-white">Khách hàng mới (Đăng ký nhanh)</h3>
                </div>
                <p className="text-xs text-neutral-400">
                  SĐT <b>{phone}</b> chưa có trên hệ thống. Nhập tên để tích điểm ngay lập tức:
                </p>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-neutral-400 mb-1">Họ và tên khách (*):</label>
                    <input
                      type="text"
                      placeholder="Ví dụ: Anh Hoàng / Chị Mai"
                      value={newCustName}
                      onChange={(e) => setNewCustName(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-400 mb-1">Ngày sinh nhật (để tặng quà hàng năm):</label>
                    <input
                      type="date"
                      value={newCustBirthDate}
                      onChange={(e) => setNewCustBirthDate(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <button
                    onClick={handleRegisterNewCustomer}
                    disabled={isSubmitting}
                    className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-sm transition active:scale-95 disabled:opacity-50"
                  >
                    {isSubmitting ? "Đang lưu..." : "Tạo & Tiếp tục tích điểm"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="border border-dashed border-neutral-800 rounded-2xl p-8 text-center text-neutral-500 text-xs space-y-2">
                <UserCheck className="w-8 h-8 mx-auto text-neutral-600 opacity-60" />
                <p>Nhập số điện thoại của thực khách và bấm <b>Tra cứu</b> để bắt đầu tích điểm hoặc đổi thưởng món.</p>
              </div>
            )}
          </div>

          {/* Right Column: Billing & Transaction Confirmation (Col 7) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-sm space-y-5">
              <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center justify-between">
                <span>Bước 2: Thông Tin Hóa Đơn Bàn Ăn</span>
                <span className="text-[11px] text-emerald-400 font-mono">Đạt Lẩu &amp; Nướng</span>
              </h2>

              {/* Inputs: Bill code & Amount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-neutral-400 mb-1.5">Mã Hóa Đơn (từ bill để đối soát):</label>
                  <div className="relative">
                    <FileText className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={billCode}
                      onChange={(e) => setBillCode(e.target.value)}
                      placeholder="HD-1234"
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-xl pl-9 pr-3 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-neutral-400 mb-1.5 font-bold text-amber-300">
                    Tổng Tiền Hóa Đơn (VNĐ) (*):
                  </label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 text-amber-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      value={billAmount}
                      onChange={(e) => setBillAmount(e.target.value ? Number(e.target.value) : "")}
                      placeholder="Ví dụ: 850000"
                      step="1000"
                      className="w-full bg-neutral-950 border border-amber-600/60 rounded-xl pl-9 pr-3 py-2.5 text-base font-mono font-bold text-amber-400 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Discounts Section */}
              {customer && rawBill > 0 && (
                <div className="bg-neutral-950/70 border border-neutral-800 rounded-xl p-4 space-y-3.5 text-xs">
                  <span className="font-bold text-neutral-300 block">Ưu đãi kèm theo:</span>

                  {/* 1. Tier discount checkbox */}
                  {customer.tierDiscount && customer.tierDiscount > 0 ? (
                    <label className="flex items-center justify-between p-2 rounded-lg bg-neutral-900 border border-neutral-800 cursor-pointer hover:border-neutral-700">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={applyTierDiscount}
                          onChange={(e) => setApplyTierDiscount(e.target.checked)}
                          className="rounded accent-emerald-500 w-4 h-4"
                        />
                        <span>Áp dụng giảm {customer.tierDiscount}% cho {customer.tierName}</span>
                      </div>
                      <span className="font-bold text-emerald-400">-{formatVND(tierDiscountValue)}</span>
                    </label>
                  ) : null}

                  {/* 2. Available Vouchers Selector */}
                  {availableVouchers.length > 0 && (
                    <div>
                      <label className="block text-neutral-400 mb-1">Mã Voucher sinh nhật / ưu đãi:</label>
                      <select
                        value={selectedVoucherCode}
                        onChange={(e) => setSelectedVoucherCode(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                      >
                        <option value="">-- Không áp dụng voucher --</option>
                        {availableVouchers.map((v) => (
                          <option key={v.id} value={v.code}>
                            {v.code} - {v.title}
                          </option>
                        ))}
                      </select>

                      {voucherDiscountValue > 0 && (
                        <p className="text-[11px] text-emerald-400 mt-1 text-right">
                          Voucher giảm: -{formatVND(voucherDiscountValue)}
                        </p>
                      )}
                    </div>
                  )}

                  {/* 3. Selected Reward Dish Highlight */}
                  {selectedRewardDish && selectedMilestone && (
                    <div className="p-3 rounded-xl bg-red-950/30 border border-red-800/50 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Gift className="w-4 h-4 text-red-400" />
                        <div>
                          <p className="font-bold text-white text-xs">Món đổi thưởng: {selectedRewardDish.name}</p>
                          <p className="text-[10px] text-neutral-400">{selectedMilestone.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-emerald-400 font-mono block">Miễn phí (0đ)</span>
                        <span className="text-[10px] text-red-400 font-mono">Trừ {selectedMilestone.pointsRequired} điểm</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Summary & Points Earned Preview */}
              <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-xs text-neutral-400">
                  <span>Tiền hóa đơn gốc:</span>
                  <span>{formatVND(rawBill)}</span>
                </div>
                {totalDiscount > 0 && (
                  <div className="flex justify-between text-xs text-emerald-400">
                    <span>Tổng giảm giá hóa đơn:</span>
                    <span>-{formatVND(totalDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-neutral-800">
                  <span>Khách thực tế thanh toán:</span>
                  <span className="text-lg text-emerald-400 font-extrabold">{formatVND(finalPaymentAmount)}</span>
                </div>

                {/* Loyalty Reward preview */}
                <div className="mt-2 pt-2 border-t border-neutral-800/60 flex items-center justify-between text-xs text-amber-300">
                  <span className="flex items-center gap-1.5">
                    <Coins className="w-4 h-4 text-amber-400" />
                    Điểm tích lũy cộng mới từ bữa ăn:
                  </span>
                  <span className="font-black text-amber-400 font-mono text-sm">+{pointsWillEarn} điểm</span>
                </div>
              </div>

              {/* Big Action Submit Button */}
              <button
                onClick={handleSubmitTransaction}
                disabled={isSubmitting || !customer || !billAmount || Number(billAmount) <= 0}
                className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-base tracking-wide transition active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-black/20 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Đang ghi nhận giao dịch...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    XÁC NHẬN TÍCH ĐIỂM & HOÀN TẤT
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* 4. Success Receipt Modal */}
      {completedTx && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-700 max-w-md w-full rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-150 space-y-5">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
                <Check className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-xl text-white">Giao Dịch Thành Công!</h3>
              <p className="text-xs text-neutral-400 font-mono">Mã hóa đơn: {completedTx.tx.billCode}</p>
            </div>

            {/* Receipt Details Box */}
            <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 text-xs space-y-2.5 font-mono">
              <div className="flex justify-between">
                <span className="text-neutral-500">Khách hàng:</span>
                <span className="font-bold text-white">{completedTx.customer.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Số điện thoại:</span>
                <span className="text-neutral-300">{completedTx.customer.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Hạng thành viên:</span>
                <span className="text-amber-400 font-bold">{completedTx.customer.tierName}</span>
              </div>

              {completedTx.rewardDish && (
                <div className="p-2.5 rounded-xl bg-red-950/40 border border-red-800/60 my-2 space-y-1">
                  <div className="flex justify-between font-bold text-white">
                    <span>🎁 Món đổi thưởng tặng bàn:</span>
                    <span className="text-emerald-400">0đ</span>
                  </div>
                  <p className="text-amber-300 font-bold">{completedTx.rewardDish.name}</p>
                  <p className="text-[11px] text-red-400">
                    Đã trừ: -{completedTx.milestonePointsDeducted} điểm tích lũy
                  </p>
                </div>
              )}

              <div className="flex justify-between pt-2 border-t border-neutral-800">
                <span className="text-neutral-500">Số tiền thanh toán:</span>
                <span className="text-white font-bold">{formatVND(completedTx.finalAmount)}</span>
              </div>
              <div className="flex justify-between text-amber-400 font-bold">
                <span>Điểm vừa cộng mới:</span>
                <span>+{completedTx.pointsEarned} điểm</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-neutral-800 text-sm">
                <span className="text-neutral-400">Số điểm còn lại của khách:</span>
                <span className="font-black text-amber-400">{completedTx.customer.currentPoints} điểm</span>
              </div>
            </div>

            <button
              onClick={handleResetForNextCustomer}
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition active:scale-95 shadow-md shadow-black/20"
            >
              Xong, Tiếp Tục Bàn Tiếp Theo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
