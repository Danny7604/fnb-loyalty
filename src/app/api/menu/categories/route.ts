import { prisma } from "@/lib/prisma";
import { store } from "@/lib/store";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { name, icon } = await request.json();
    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, error: "Tên danh mục không được để trống" }, { status: 400 });
    }

    const cleanSlug = "cat-" + name
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-") + "-" + Date.now().toString().slice(-4);

    try {
      const created = await prisma.category.create({
        data: {
          name: name.trim(),
          slug: cleanSlug,
          icon: icon || "UtensilsCrossed",
        },
      });
      return NextResponse.json({ success: true, data: created });
    } catch (dbErr) {
      // Fallback
      const newCat = {
        id: `cat-${Date.now()}`,
        name: name.trim(),
        slug: cleanSlug,
        displayOrder: 99,
        icon: icon || "UtensilsCrossed",
      };
      const cats = store.getCategories();
      cats.push(newCat);
      return NextResponse.json({ success: true, data: newCat });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
