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
} from "lucide-react";
import { Customer, LoyaltySetting, PointTransaction, Tier, Voucher } from "@/lib/types";
import { formatVND, formatDate } from "@/lib/utils";

export default function CashierPage() {
  const [phone, setPhone] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [newCustName, setNewCustName] = useState("");
  const [newCustBirthDate, setNewCustBirthDate] = useState("");

  // Bill & Loyalty calculation
  const [billCode, setBillCode] = useState("");
  const [billAmount, setBillAmount] = useState<number | "">("");
  const [applyTierDiscount, setApplyTierDiscount] = useState(true);
  const [usePoints, setUsePoints] = useState<number>(0);
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
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const phoneInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto generate bill code
    setBillCode(`HD-${Math.floor(1000 + Math.random() * 9000)}`);
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
    setUsePoints(0);
    setSelectedVoucherCode("");

    try {
      const res = await fetch(`/api/customers/${cleanPhone}`);
      const json = await res.json();
      if (json.success) {
        setLoyaltySetting(json.data.setting);
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

  // Points redemption discount
  const pointExchangeRate = loyaltySetting?.redeemRateAmount || 1000;
  const pointsDiscountValue = usePoints * pointExchangeRate;

  const totalDiscount = tierDiscountValue + voucherDiscountValue + pointsDiscountValue;
  const finalPaymentAmount = Math.max(0, rawBill - totalDiscount);

  // Points to earn
  const earnRateAmount = loyaltySetting?.earnRateAmount || 100000;
  const earnRatePoints = loyaltySetting?.earnRatePoints || 10;
  const pointMultiplier = customer?.tierName?.includes("Vàng")
    ? 1.5
    : customer?.tierName?.includes("Bạc")
    ? 1.2
    : customer?.tierName?.includes("Kim Cương")
    ? 2.0
    : 1.0;

  const pointsWillEarn =
    finalPaymentAmount > 0 ? Math.round((finalPaymentAmount / earnRateAmount) * earnRatePoints * pointMultiplier) : 0;

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
      // 1. Nếu có tiêu điểm
      if (usePoints > 0) {
        await fetch("/api/transactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerPhone: customer.phone,
            type: "REDEEM",
            points: -usePoints,
            billAmount: rawBill,
            billCode: billCode || "HD-LE",
            discountAmount: pointsDiscountValue,
            staffName: "Thu Ngân Quầy",
            notes: `Tiêu ${usePoints} điểm cấn trừ ${formatVND(pointsDiscountValue)}`,
          }),
        });
      }

      // 2. Giao dịch tích điểm
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerPhone: customer.phone,
          type: "EARN",
          points: pointsWillEarn,
          billAmount: finalPaymentAmount,
          billCode: billCode || "HD-LE",
          discountAmount: tierDiscountValue + voucherDiscountValue,
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
    setPhone("");
    setCustomer(null);
    setIsNewCustomer(false);
    setBillAmount("");
    setUsePoints(0);
    setSelectedVoucherCode("");
    setBillCode(`HD-${Math.floor(1000 + Math.random() * 9000)}`);
    phoneInputRef.current?.focus();
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col">
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
            <h1 className="font-bold text-white text-base leading-tight">Màn Hình Thu Ngân • Tích Điểm Nhanh</h1>
            <p className="text-xs text-neutral-400">Đạt Lẩu &amp; Nướng • Ca làm việc: Thu Ngân Quầy 1</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/dashboard"
            className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-300 font-medium transition"
          >
            Về Trang Quản Trị (Admin)
          </Link>
          <Link
            href="/menu"
            target="_blank"
            className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 text-xs font-semibold transition"
          >
            Mở Menu Khách ↗
          </Link>
        </div>
      </header>

      {/* Main Cashier Workspace */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Phone Search & Customer Card (Col 5) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Step 1: Phone Search Box */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-xl">
            <label className="block text-xs font-semibold text-neutral-400 mb-2 uppercase tracking-wider">
              Bước 1: Nhập Số Điện Thoại Khách Hàng
            </label>
            <form onSubmit={handleSearchPhone} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  ref={phoneInputRef}
                  type="tel"
                  placeholder="Ví dụ: 0901234567..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl pl-11 pr-3 py-3 text-lg font-mono font-bold text-white placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={isSearching}
                className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition active:scale-95 disabled:opacity-50 flex items-center gap-1.5 shrink-0"
              >
                {isSearching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Tra cứu
              </button>
            </form>

            {errorMsg && (
              <div className="mt-3 p-2.5 rounded-lg bg-red-950/50 border border-red-800 text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          {/* Customer Profile Result */}
          {customer ? (
            <div className="bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-800/80 border border-neutral-700/80 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-xl text-white">{customer.fullName}</h2>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold flex items-center gap-1">
                      <Crown className="w-3 h-3 text-amber-400" />
                      {customer.tierName || "Hạng Đồng"}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1 font-mono">SĐT: {customer.phone}</p>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-neutral-400 block">Điểm tích lũy</span>
                  <span className="text-2xl font-black text-amber-400 font-mono">
                    {customer.currentPoints} <span className="text-xs font-normal text-neutral-400">điểm</span>
                  </span>
                </div>
              </div>

              {/* Birthday Banner */}
              {isBirthdayMonth && (
                <div className="bg-rose-950/40 border border-rose-800/50 rounded-xl p-3 flex items-center gap-2.5 text-xs text-rose-200">
                  <Gift className="w-5 h-5 text-rose-400 shrink-0 animate-bounce" />
                  <div>
                    <span className="font-bold text-rose-300">🎂 Sinh nhật trong tháng này!</span>
                    <p className="text-[11px] text-rose-300/80">Khách được ưu tiên áp dụng voucher tặng món sinh nhật.</p>
                  </div>
                </div>
              )}

              {/* Customer Stats */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-neutral-950/60 p-3 rounded-xl border border-neutral-800">
                <div>
                  <span className="text-neutral-500 block">Đặc quyền hạng:</span>
                  <span className="font-bold text-emerald-400">
                    Giảm {customer.tierDiscount}% tổng bill
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Tổng chi tiêu:</span>
                  <span className="font-bold text-neutral-200">{formatVND(customer.totalSpent)}</span>
                </div>
              </div>

              {customer.notes && (
                <p className="text-xs text-neutral-400 italic bg-neutral-950/40 p-2.5 rounded-lg border border-neutral-800">
                  Ghi chú: {customer.notes}
                </p>
              )}
            </div>
          ) : isNewCustomer ? (
            /* Fast New Customer Registration */
            <div className="bg-neutral-900 border border-amber-600/40 rounded-2xl p-5 shadow-xl space-y-4 animate-in fade-in">
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
              <p>Nhập số điện thoại của thực khách và bấm <b>Tra cứu</b> để bắt đầu tích điểm hoặc đổi thưởng.</p>
            </div>
          )}
        </div>

        {/* Right Column: Billing & Transaction Confirmation (Col 7) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-xl space-y-5">
            <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center justify-between">
              <span>Bước 2: Thông Tin Hóa Đơn & Áp Ưu Đãi</span>
              <span className="text-[11px] text-emerald-400 font-mono">Độc lập với POS</span>
            </h2>

            {/* Inputs: Bill code & Amount */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-neutral-400 mb-1.5">Mã Hóa Đơn (từ bill POS để đối soát):</label>
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
                <span className="font-bold text-neutral-300 block">Ưu đãi & Đổi điểm khả dụng:</span>

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
                    <label className="block text-neutral-400 mb-1">Áp dụng mã Voucher của quán:</label>
                    <select
                      value={selectedVoucherCode}
                      onChange={(e) => setSelectedVoucherCode(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="">-- Không áp dụng voucher --</option>
                      {availableVouchers.map((v) => (
                        <option key={v.id} value={v.code}>
                          {v.code} - {v.title} ({v.discountType === "FREE_ITEM" ? v.freeItemName : `${v.discountValue}${v.discountType === "PERCENT" ? "%" : "đ"}`})
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

                {/* 3. Redeem Points Slider / Input */}
                {customer.currentPoints >= 10 && (
                  <div className="pt-2 border-t border-neutral-800">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-neutral-400">
                        Đổi điểm trừ tiền (Khách có {customer.currentPoints} điểm = {formatVND(customer.currentPoints * 1000)}):
                      </span>
                      <span className="font-bold text-amber-400 font-mono">
                        Dùng {usePoints} điểm (-{formatVND(pointsDiscountValue)})
                      </span>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max={Math.min(customer.currentPoints, Math.floor(rawBill / pointExchangeRate))}
                      step="10"
                      value={usePoints}
                      onChange={(e) => setUsePoints(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
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
                  <span>Tổng giảm giá / trừ điểm:</span>
                  <span>-{formatVND(totalDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-neutral-800">
                <span>Khách cần thanh toán:</span>
                <span className="text-lg text-emerald-400 font-extrabold">{formatVND(finalPaymentAmount)}</span>
              </div>

              {/* Loyalty Reward preview */}
              <div className="mt-2 pt-2 border-t border-neutral-800/60 flex items-center justify-between text-xs text-amber-300">
                <span className="flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-amber-400" />
                  Số điểm khách sẽ được cộng:
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
      </main>

      {/* 4. Success Receipt Modal */}
      {completedTx && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-700 max-w-md w-full rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-150 space-y-5">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
                <Check className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-xl text-white">Tích Điểm Thành Công!</h3>
              <p className="text-xs text-neutral-400 font-mono">Hóa đơn: {completedTx.tx.billCode}</p>
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
              <div className="flex justify-between pt-2 border-t border-neutral-800">
                <span className="text-neutral-500">Số tiền thanh toán:</span>
                <span className="text-white font-bold">{formatVND(completedTx.finalAmount)}</span>
              </div>
              <div className="flex justify-between text-amber-400 font-bold">
                <span>Điểm vừa cộng:</span>
                <span>+{completedTx.pointsEarned} điểm</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-neutral-800 text-sm">
                <span className="text-neutral-400">Tổng điểm hiện có:</span>
                <span className="font-black text-amber-400">{completedTx.customer.currentPoints} điểm</span>
              </div>
            </div>

            <button
              onClick={handleResetForNextCustomer}
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition active:scale-95 shadow-md shadow-black/20"
            >
              Xong, Chuyển Khách Tiếp Theo (Phím Esc)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
