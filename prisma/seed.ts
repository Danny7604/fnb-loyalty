import { PrismaClient } from "@prisma/client";
import {
  initialCategories,
  initialCustomers,
  initialLoyaltySetting,
  initialMenuItems,
  initialTiers,
  initialTransactions,
  initialVouchers,
} from "../src/lib/mock-data";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding data to Supabase...");

  // 1. Tiers
  for (const t of initialTiers) {
    await prisma.tier.upsert({
      where: { id: t.id },
      update: {},
      create: {
        id: t.id,
        name: t.name,
        minSpend: t.minSpend,
        discountPercent: t.discountPercent,
        pointMultiplier: t.pointMultiplier,
        color: t.color,
        benefits: t.benefits,
      },
    });
  }
  console.log("✓ Tiers seeded");

  // 2. Categories
  for (const c of initialCategories) {
    await prisma.category.upsert({
      where: { id: c.id },
      update: {},
      create: {
        id: c.id,
        name: c.name,
        slug: c.slug,
        displayOrder: c.displayOrder,
      },
    });
  }
  console.log("✓ Categories seeded");

  // 3. Menu Items
  for (const item of initialMenuItems) {
    await prisma.menuItem.upsert({
      where: { id: item.id },
      update: {},
      create: {
        id: item.id,
        categoryId: item.categoryId,
        name: item.name,
        description: item.description,
        price: item.price,
        memberPrice: item.memberPrice,
        imageUrl: item.imageUrl,
        isAvailable: item.isAvailable,
        isBestSeller: item.isBestSeller,
        isSignature: item.isSignature,
        spicyLevel: item.spicyLevel,
        portion: item.portion,
        displayOrder: item.displayOrder,
      },
    });
  }
  console.log("✓ Menu items seeded");

  // 4. Customers
  for (const cust of initialCustomers) {
    await prisma.customer.upsert({
      where: { phone: cust.phone },
      update: {},
      create: {
        id: cust.id,
        phone: cust.phone,
        fullName: cust.fullName,
        birthDate: cust.birthDate ? new Date(cust.birthDate) : undefined,
        currentPoints: cust.currentPoints,
        totalSpent: cust.totalSpent,
        tierId: cust.tierId,
        notes: cust.notes,
        createdAt: new Date(cust.createdAt),
      },
    });
  }
  console.log("✓ Customers seeded");

  // 5. Vouchers
  for (const v of initialVouchers) {
    await prisma.voucher.upsert({
      where: { code: v.code },
      update: {},
      create: {
        id: v.id,
        code: v.code,
        title: v.title,
        description: v.description,
        discountType: v.discountType,
        discountValue: v.discountValue,
        freeItemName: v.freeItemName,
        minOrderAmount: v.minOrderAmount,
        maxDiscount: v.maxDiscount,
        startDate: new Date(v.startDate),
        endDate: new Date(v.endDate),
        usageLimit: v.usageLimit,
        usedCount: v.usedCount,
        isActive: v.isActive,
        isBirthdayVoucher: v.isBirthdayVoucher,
      },
    });
  }
  console.log("✓ Vouchers seeded");

  // 6. Loyalty Setting
  await prisma.loyaltySetting.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      earnRateAmount: initialLoyaltySetting.earnRateAmount,
      earnRatePoints: initialLoyaltySetting.earnRatePoints,
      redeemRatePoint: initialLoyaltySetting.redeemRatePoint,
      redeemRateAmount: initialLoyaltySetting.redeemRateAmount,
      minRedeemPoints: initialLoyaltySetting.minRedeemPoints,
    },
  });
  console.log("✓ Loyalty setting seeded");

  console.log("🎉 Seeding complete successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
