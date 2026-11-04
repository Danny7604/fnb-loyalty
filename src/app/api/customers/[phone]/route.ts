import { store } from "@/lib/store";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ phone: string }> }) {
  const { phone } = await params;
  const customer = store.getCustomerByPhone(phone);
  const tiers = store.getTiers();
  const setting = store.getLoyaltySetting();
  const vouchers = store.getVouchers().filter((v) => v.isActive);

  if (!customer) {
    return NextResponse.json({
      success: true,
      data: {
        exists: false,
        customer: null,
        tiers,
        setting,
      },
    });
  }

  // Check birthday month
  let isBirthdayMonth = false;
  if (customer.birthDate) {
    const birthMonth = new Date(customer.birthDate).getMonth();
    const currentMonth = new Date().getMonth();
    isBirthdayMonth = birthMonth === currentMonth;
  }

  // Filter vouchers applicable
  const availableVouchers = vouchers.filter((v) => {
    if (v.isBirthdayVoucher && !isBirthdayMonth) return false;
    return v.usedCount < v.usageLimit;
  });

  return NextResponse.json({
    success: true,
    data: {
      exists: true,
      customer,
      isBirthdayMonth,
      availableVouchers,
      tiers,
      setting,
    },
  });
}
