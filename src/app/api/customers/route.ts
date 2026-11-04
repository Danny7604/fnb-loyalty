import { store } from "@/lib/store";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const customers = store.getCustomers();
  return NextResponse.json({ success: true, data: customers });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.phone || !body.fullName) {
      return NextResponse.json({ success: false, error: "Vui lòng nhập đầy đủ SĐT và Tên" }, { status: 400 });
    }
    const customer = store.createOrUpdateCustomer(body);
    return NextResponse.json({ success: true, data: customer });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
