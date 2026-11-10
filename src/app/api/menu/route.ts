import { prisma } from "@/lib/prisma";
import { store } from "@/lib/store";
import { MenuItem } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get("categoryId") || undefined;

  try {
    const dbCategories = await prisma.category.findMany({
      orderBy: { displayOrder: "asc" },
    });

    const whereClause = categoryId && categoryId !== "all" ? { categoryId } : undefined;
    const dbItems = await prisma.menuItem.findMany({
      where: whereClause,
      include: { category: true },
      orderBy: { displayOrder: "asc" },
    });

    const formattedItems: MenuItem[] = dbItems.map((item) => ({
      id: item.id,
      categoryId: item.categoryId,
      categoryName: item.category?.name,
      name: item.name,
      description: item.description || undefined,
      price: Number(item.price),
      imageUrl: item.imageUrl || undefined,
      isAvailable: item.isAvailable,
      isBestSeller: item.isBestSeller,
      isSignature: item.isSignature,
      spicyLevel: item.spicyLevel,
      portion: item.portion || undefined,
      rewardPointsRequired: item.rewardPointsRequired || undefined,
      displayOrder: item.displayOrder,
    }));

    return NextResponse.json({
      success: true,
      data: {
        categories: dbCategories.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          displayOrder: c.displayOrder,
          icon: c.icon || undefined,
        })),
        items: formattedItems,
      },
    });
  } catch (error) {
    console.warn("Prisma query failed, falling back to in-memory store:", error);
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
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 1. Sync in-memory store
    const storeItem = store.saveMenuItem(body);

    // 2. Persist in Supabase Postgres
    try {
      if (body.id) {
        const updated = await prisma.menuItem.update({
          where: { id: body.id },
          data: {
            name: body.name,
            categoryId: body.categoryId,
            price: Number(body.price),
            imageUrl: body.imageUrl || null,
            description: body.description || null,
            portion: body.portion || null,
            spicyLevel: Number(body.spicyLevel) || 0,
            isBestSeller: Boolean(body.isBestSeller),
            isSignature: Boolean(body.isSignature),
            isAvailable: body.isAvailable ?? true,
          },
          include: { category: true },
        });

        return NextResponse.json({
          success: true,
          data: {
            id: updated.id,
            categoryId: updated.categoryId,
            categoryName: updated.category?.name,
            name: updated.name,
            description: updated.description || undefined,
            price: Number(updated.price),
            imageUrl: updated.imageUrl || undefined,
            isAvailable: updated.isAvailable,
            isBestSeller: updated.isBestSeller,
            isSignature: updated.isSignature,
            spicyLevel: updated.spicyLevel,
            portion: updated.portion || undefined,
            displayOrder: updated.displayOrder,
          },
        });
      } else {
        const created = await prisma.menuItem.create({
          data: {
            name: body.name,
            categoryId: body.categoryId,
            price: Number(body.price),
            imageUrl: body.imageUrl || null,
            description: body.description || null,
            portion: body.portion || null,
            spicyLevel: Number(body.spicyLevel) || 0,
            isBestSeller: Boolean(body.isBestSeller),
            isSignature: Boolean(body.isSignature),
            isAvailable: true,
          },
          include: { category: true },
        });

        return NextResponse.json({
          success: true,
          data: {
            id: created.id,
            categoryId: created.categoryId,
            categoryName: created.category?.name,
            name: created.name,
            description: created.description || undefined,
            price: Number(created.price),
            imageUrl: created.imageUrl || undefined,
            isAvailable: created.isAvailable,
            isBestSeller: created.isBestSeller,
            isSignature: created.isSignature,
            spicyLevel: created.spicyLevel,
            portion: created.portion || undefined,
            displayOrder: created.displayOrder,
          },
        });
      }
    } catch (dbErr) {
      console.warn("DB save error, returned store item:", dbErr);
      return NextResponse.json({ success: true, data: storeItem });
    }
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

    const storeUpdated = store.toggleItemAvailability(body.id);

    try {
      const current = await prisma.menuItem.findUnique({ where: { id: body.id } });
      if (current) {
        const dbUpdated = await prisma.menuItem.update({
          where: { id: body.id },
          data: { isAvailable: !current.isAvailable },
        });
        return NextResponse.json({ success: true, data: dbUpdated });
      }
    } catch (dbErr) {
      console.warn("DB toggle error:", dbErr);
    }

    return NextResponse.json({ success: true, data: storeUpdated });
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

  const storeDeleted = store.deleteMenuItem(id);

  try {
    await prisma.menuItem.delete({ where: { id } });
  } catch (dbErr) {
    console.warn("DB delete error:", dbErr);
  }

  return NextResponse.json({ success: true });
}
