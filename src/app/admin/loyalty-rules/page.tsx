"use client";

import { useEffect, useState } from "react";
import {
  Sliders,
  Crown,
  Coins,
  Percent,
  Save,
  Check,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
} from "lucide-react";
import { LoyaltySetting, Tier } from "@/lib/types";
import { formatVND } from "@/lib/utils";

export default function LoyaltyRulesPage() {
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [setting, setSetting] = useState<LoyaltySetting>({
    earnRateAmount: 100000,
    earnRatePoints: 10,
    redeemRatePoint: 1,
    redeemRateAmount: 1000,
    minRedeemPoints: 10,
  });

  const [isSaved, setIsSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchRules = async () => {
    try {
      const res = await fetch("/api/loyalty-rules");
      const json = await res.json();
      if (json.success) {
        setTiers(json.data.tiers);
        setSetting(json.data.setting);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleUpdateTier = (tierId: string, field: keyof Tier, val: any) => {
    setTiers((prev) =>
      prev.map((t) => (t.id === tierId ? { ...t, [field]: val } : t))
    );
  };

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await fetch("/api/loyalty-rules", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ setting }),
      });

      // Save each tier update
      for (const t of tiers) {
        await fetch("/api/loyalty-rules", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tierId: t.id, tierData: t }),
        });
      }

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Sliders className="w-6 h-6 text-amber-500" />
            Cấu Hình Tích Điểm & Hạng Thành Viên
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Thiết lập công thức tính điểm thưởng, giá trị quy đổi và đặc quyền từng hạng thẻ
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          disabled={isSubmitting}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs transition shadow-sm active:scale-95 disabled:opacity-50"
        >
          {isSaved ? <Check className="w-4 h-4 text-emerald-950" /> : <Save className="w-4 h-4" />}
          {isSaved ? "Đã lưu cài đặt!" : "Lưu tất cả cấu hình"}
        </button>
      </div>

      <form onSubmit={handleSaveAll} className="space-y-6">
        {/* Section 1: Loyalty Point Rates */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
            <Coins className="w-5 h-5 text-amber-400" />
            <h2 className="font-bold text-base text-white">Quy Tắc Tích Lũy & Tiêu Điểm</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Earning rate */}
            <div className="bg-neutral-950/70 border border-neutral-800 p-4 rounded-xl space-y-3">
              <span className="font-bold text-amber-300 block text-sm">1. Công thức cộng điểm:</span>
              <p className="text-neutral-400">
                Mỗi khi khách ăn tại quán, hệ thống sẽ tính điểm dựa trên số tiền thực trả:
              </p>

              <div className="flex items-center gap-2">
                <span>Cứ mỗi</span>
                <input
                  type="number"
                  value={setting.earnRateAmount}
                  onChange={(e) => setSetting({ ...setting, earnRateAmount: Number(e.target.value) })}
                  className="w-28 bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1.5 font-bold font-mono text-white text-right"
                />
                <span>VNĐ chi tiêu =</span>
                <input
                  type="number"
                  value={setting.earnRatePoints}
                  onChange={(e) => setSetting({ ...setting, earnRatePoints: Number(e.target.value) })}
                  className="w-16 bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1.5 font-bold font-mono text-amber-400 text-center"
                />
                <span>điểm</span>
              </div>
              <p className="text-[11px] text-neutral-500 italic">
                Ví dụ: Ăn hóa đơn 1.000.000đ sẽ được cộng 100 điểm.
              </p>
            </div>

            {/* Redeem rate */}
            <div className="bg-neutral-950/70 border border-neutral-800 p-4 rounded-xl space-y-3">
              <span className="font-bold text-emerald-300 block text-sm">2. Công thức tiêu điểm trừ tiền:</span>
              <p className="text-neutral-400">
                Khách hàng có thể dùng điểm tích lũy để cấn trừ trực tiếp vào hóa đơn tiếp theo:
              </p>

              <div className="flex items-center gap-2">
                <span>Cứ</span>
                <input
                  type="number"
                  value={setting.redeemRatePoint}
                  onChange={(e) => setSetting({ ...setting, redeemRatePoint: Number(e.target.value) })}
                  className="w-16 bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1.5 font-bold font-mono text-amber-400 text-center"
                />
                <span>điểm tích lũy =</span>
                <input
                  type="number"
                  value={setting.redeemRateAmount}
                  onChange={(e) => setSetting({ ...setting, redeemRateAmount: Number(e.target.value) })}
                  className="w-24 bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1.5 font-bold font-mono text-emerald-400 text-right"
                />
                <span>VNĐ giảm giá</span>
              </div>
              <p className="text-[11px] text-neutral-500 italic">
                Ví dụ: Đổi 50 điểm sẽ được cấn trừ 50.000đ tiền mặt vào hóa đơn.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Membership Tiers & Upgrades */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-400" />
              <h2 className="font-bold text-base text-white">Các Hạng Thành Viên & Điều Kiện Thăng Hạng</h2>
            </div>
            <span className="text-xs text-neutral-500">Tự động thăng hạng khi đủ chi tiêu</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tiers.map((tier) => (
              <div
                key={tier.id}
                className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 space-y-4 hover:border-neutral-700 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-base text-white flex items-center gap-2">
                    <Crown className="w-4 h-4 text-amber-400" />
                    {tier.name}
                  </span>
                  <span className="text-[10px] bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded font-mono">
                    ID: {tier.id}
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-neutral-400 mb-1">Chi tiêu tích lũy tối thiểu (VNĐ):</label>
                    <input
                      type="number"
                      value={tier.minSpend}
                      onChange={(e) => handleUpdateTier(tier.id, "minSpend", Number(e.target.value))}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-white font-mono font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-neutral-400 mb-1">Giảm trực tiếp bill (%):</label>
                      <input
                        type="number"
                        value={tier.discountPercent}
                        onChange={(e) => handleUpdateTier(tier.id, "discountPercent", Number(e.target.value))}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-emerald-400 font-bold text-center"
                      />
                    </div>

                    <div>
                      <label className="block text-neutral-400 mb-1">Hệ số nhân điểm (x):</label>
                      <input
                        type="number"
                        step="0.1"
                        value={tier.pointMultiplier}
                        onChange={(e) => handleUpdateTier(tier.id, "pointMultiplier", Number(e.target.value))}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-amber-400 font-bold text-center"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-neutral-400 mb-1">Mô tả đặc quyền:</label>
                    <input
                      type="text"
                      value={tier.benefits || ""}
                      onChange={(e) => handleUpdateTier(tier.id, "benefits", e.target.value)}
                      placeholder="Ví dụ: Giảm 10%, tặng món sinh nhật..."
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-neutral-300"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: POS Integration Guide & API Key */}
        <div className="bg-neutral-900 border border-emerald-900/50 rounded-2xl p-6 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
            <h3 className="font-bold text-sm text-white">Cổng Tích Hợp POS Ngoài (Open API Webhook)</h3>
          </div>
          <p className="text-xs text-neutral-300 leading-relaxed">
            Hệ thống đã sẵn sàng kết nối tự động với các phần mềm POS (iPOS, KiotViet, CukCuk, Pos365...).
            Khi POS in hóa đơn, cấu hình Webhook gửi HTTP POST đến endpoint sau:
          </p>

          <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 font-mono text-xs text-emerald-300 space-y-1">
            <p>
              <b>Endpoint:</b> <span className="text-white">POST /api/v1/pos/transaction</span>
            </p>
            <p>
              <b>Header:</b> <span className="text-neutral-400">x-api-key: fnb_pos_secret_dev_key</span>
            </p>
            <p>
              <b>Body mẫu:</b>{" "}
              <span className="text-neutral-400">
                {`{ "phone": "0901234567", "billCode": "HD-9999", "billAmount": 850000 }`}
              </span>
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
