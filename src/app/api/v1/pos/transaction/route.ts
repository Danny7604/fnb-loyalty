import { store } from "@/lib/store";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // 1. Verify API Key
  const apiKey = request.headers.get("x-api-key");
  const validKey = process.env.POS_API_SECRET_KEY || "fnb_pos_secret_dev_key";

  if (apiKey !== validKey) {
    return NextResponse.json(
      { success: false, error: "Unauthorized: Invalid or missing x-api-key" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { phone, billCode, billAmount, discountAmount, staffName, notes } = body;

    if (!phone || billAmount === undefined) {
      return NextResponse.json(
        { success: false, error: "Invalid payload: 'phone' and 'billAmount' are required" },
        { status: 400 }
      );
    }

    // 2. Tra cứu khách hàng theo SĐT (nếu chưa có thì tự động tạo tài khoản mới)
    let customer = store.getCustomerByPhone(phone);
    if (!customer) {
      customer = store.createOrUpdateCustomer({
        phone,
        fullName: body.customerName || `Khách hàng ${phone.slice(-4)}`,
        birthDate: body.birthDate,
      });
    }

    // 3. Tính điểm dựa theo LoyaltySetting và Tier multiplier
    const setting = store.getLoyaltySetting();
    const tier = store.getTiers().find((t) => t.id === customer?.tierId);
    const multiplier = tier?.pointMultiplier || 1.0;

    const basePoints = Math.floor((Number(billAmount) / Number(setting.earnRateAmount)) * setting.earnRatePoints);
    const totalPoints = Math.round(basePoints * multiplier);

    // 4. Ghi nhận giao dịch
    const result = store.recordTransaction({
      customerPhone: phone,
      type: "EARN",
      points: totalPoints,
      billAmount: Number(billAmount),
      billCode: billCode || `POS-${Date.now().toString().slice(-6)}`,
      discountAmount: Number(discountAmount || 0),
      staffName: staffName || "POS Tự động",
      notes: notes || "Tích điểm tự động từ hệ thống POS",
    });

    return NextResponse.json({
      success: true,
      message: "POS Transaction processed successfully",
      data: {
        customerPhone: phone,
        customerName: result.customer.fullName,
        pointsEarned: totalPoints,
        newCurrentPoints: result.customer.currentPoints,
        tier: result.customer.tierName,
        transactionId: result.transaction.id,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
