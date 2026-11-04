import { store } from "@/lib/store";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const vouchers = store.getVouchers();
  return NextResponse.json({ success: true, data: vouchers });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.code || !body.title) {
      return NextResponse.json({ success: false, error: "Thiếu mã hoặc tiêu đề voucher" }, { status: 400 });
    }
    const voucher = store.createVoucher(body);
    return NextResponse.json({ success: true, data: voucher });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
