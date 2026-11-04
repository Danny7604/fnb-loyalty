import { store } from "@/lib/store";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get("categoryId") || undefined;

  const categories = store.getCategories();
  const items = store.getMenuItems(categoryId);

  return NextResponse.json({
    success: true,
    data: {
      categories,
      items,
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const item = store.saveMenuItem(body);
    return NextResponse.json({ success: true, data: item });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ success: false, error: "Missing item id" }, { status: 400 });
    }
    const updated = store.toggleItemAvailability(body.id);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ success: false, error: "Missing id" }, { status: 400 });
  }
  const deleted = store.deleteMenuItem(id);
  return NextResponse.json({ success: deleted });
}
