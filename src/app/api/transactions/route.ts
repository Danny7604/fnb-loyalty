import { store } from "@/lib/store";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const transactions = store.getTransactions();
  return NextResponse.json({ success: true, data: transactions });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customerPhone,
      type,
      points,
      billAmount,
      billCode,
      discountAmount,
      staffName,
      notes,
      voucherCode,
      redeemedMilestoneId,
      redeemedMilestoneName,
      redeemedItemId,
      redeemedItemName,
    } = body;

    if (!customerPhone || !type || points === undefined) {
      return NextResponse.json({ success: false, error: "Thiếu thông tin giao dịch" }, { status: 400 });
    }

    // Nếu có dùng voucher thì ghi nhận
    if (voucherCode) {
      store.useVoucher(voucherCode);
    }

    const result = store.recordTransaction({
      customerPhone,
      type,
      points: Number(points),
      billAmount: Number(billAmount || 0),
      billCode: billCode || `HD-${Date.now().toString().slice(-4)}`,
      discountAmount: Number(discountAmount || 0),
      staffName: staffName || "Thu Ngân",
      notes: notes || "",
      redeemedMilestoneId,
      redeemedMilestoneName,
      redeemedItemId,
      redeemedItemName,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
