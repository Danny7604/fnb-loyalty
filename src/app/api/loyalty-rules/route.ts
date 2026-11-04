import { store } from "@/lib/store";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const tiers = store.getTiers();
  const setting = store.getLoyaltySetting();
  return NextResponse.json({ success: true, data: { tiers, setting } });
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    if (body.setting) {
      store.updateLoyaltySetting(body.setting);
    }
    if (body.tierId && body.tierData) {
      store.updateTier(body.tierId, body.tierData);
    }
    return NextResponse.json({
      success: true,
      data: {
        tiers: store.getTiers(),
        setting: store.getLoyaltySetting(),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
