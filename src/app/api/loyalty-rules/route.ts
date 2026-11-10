import { store } from "@/lib/store";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const tiers = store.getTiers();
  const setting = store.getLoyaltySetting();
  const milestones = store.getRewardMilestones();
  const menuItems = store.getMenuItems();
  return NextResponse.json({
    success: true,
    data: { tiers, setting, milestones, menuItems },
  });
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
    if (body.milestone) {
      store.saveRewardMilestone(body.milestone);
    }
    return NextResponse.json({
      success: true,
      data: {
        tiers: store.getTiers(),
        setting: store.getLoyaltySetting(),
        milestones: store.getRewardMilestones(),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const milestone = store.saveRewardMilestone(body);
    return NextResponse.json({ success: true, data: milestone });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const milestoneId = searchParams.get("milestoneId");
  if (!milestoneId) {
    return NextResponse.json({ success: false, error: "Missing milestoneId" }, { status: 400 });
  }
  const deleted = store.deleteRewardMilestone(milestoneId);
  return NextResponse.json({ success: deleted });
}
