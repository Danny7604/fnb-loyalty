import {
  initialCategories,
  initialCustomers,
  initialLoyaltySetting,
  initialMenuItems,
  initialRewardMilestones,
  initialTiers,
  initialTransactions,
  initialVouchers,
} from "./mock-data";
import { Category, Customer, LoyaltySetting, MenuItem, PointTransaction, RewardMilestone, Tier, Voucher } from "./types";

// Global in-memory cache for state persistence across hot-reloads in Node runtime
const globalStore = globalThis as unknown as {
  __fnb_categories?: Category[];
  __fnb_menuItems?: MenuItem[];
  __fnb_customers?: Customer[];
  __fnb_tiers?: Tier[];
  __fnb_vouchers?: Voucher[];
  __fnb_transactions?: PointTransaction[];
  __fnb_loyaltySetting?: LoyaltySetting;
  __fnb_rewardMilestones?: RewardMilestone[];
};

if (!globalStore.__fnb_categories) globalStore.__fnb_categories = [...initialCategories];
if (!globalStore.__fnb_menuItems) globalStore.__fnb_menuItems = [...initialMenuItems];
if (!globalStore.__fnb_customers) globalStore.__fnb_customers = [...initialCustomers];
if (!globalStore.__fnb_tiers) globalStore.__fnb_tiers = [...initialTiers];
if (!globalStore.__fnb_vouchers) globalStore.__fnb_vouchers = [...initialVouchers];
if (!globalStore.__fnb_transactions) globalStore.__fnb_transactions = [...initialTransactions];
if (!globalStore.__fnb_loyaltySetting) globalStore.__fnb_loyaltySetting = { ...initialLoyaltySetting };
if (!globalStore.__fnb_rewardMilestones) globalStore.__fnb_rewardMilestones = [...initialRewardMilestones];

export const store = {
  // Categories & Menu
  getCategories(): Category[] {
    return globalStore.__fnb_categories || [];
  },

  getMenuItems(categoryId?: string): MenuItem[] {
    let items = globalStore.__fnb_menuItems || [];
    if (categoryId && categoryId !== "all") {
      items = items.filter((item) => item.categoryId === categoryId);
    }
    return items.sort((a, b) => a.displayOrder - b.displayOrder);
  },

  toggleItemAvailability(itemId: string): MenuItem | null {
    const item = (globalStore.__fnb_menuItems || []).find((i) => i.id === itemId);
    if (item) {
      item.isAvailable = !item.isAvailable;
      return { ...item };
    }
    return null;
  },

  saveMenuItem(menuItem: Partial<MenuItem> & { name: string; price: number; categoryId: string }): MenuItem {
    const items = globalStore.__fnb_menuItems || [];
    const cat = (globalStore.__fnb_categories || []).find((c) => c.id === menuItem.categoryId);

    if (menuItem.id) {
      const idx = items.findIndex((i) => i.id === menuItem.id);
      if (idx !== -1) {
        items[idx] = {
          ...items[idx],
          ...menuItem,
          categoryName: cat?.name || items[idx].categoryName,
        };
        return items[idx];
      }
    }

    const newItem: MenuItem = {
      id: `item-${Date.now()}`,
      categoryId: menuItem.categoryId,
      categoryName: cat?.name || "Món Mới",
      name: menuItem.name,
      description: menuItem.description || "",
      price: Number(menuItem.price),
      memberPrice: menuItem.memberPrice ? Number(menuItem.memberPrice) : undefined,
      imageUrl: menuItem.imageUrl || "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80",
      isAvailable: menuItem.isAvailable ?? true,
      isBestSeller: menuItem.isBestSeller ?? false,
      isSignature: menuItem.isSignature ?? false,
      spicyLevel: menuItem.spicyLevel ?? 0,
      portion: menuItem.portion || "Phần tiêu chuẩn",
      displayOrder: (items.length || 0) + 1,
    };
    items.push(newItem);
    return newItem;
  },

  deleteMenuItem(itemId: string): boolean {
    const idx = (globalStore.__fnb_menuItems || []).findIndex((i) => i.id === itemId);
    if (idx !== -1) {
      globalStore.__fnb_menuItems?.splice(idx, 1);
      return true;
    }
    return false;
  },

  // Customers & Loyalty
  getCustomers(): Customer[] {
    return (globalStore.__fnb_customers || []).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  getCustomerByPhone(phone: string): Customer | null {
    const cleanPhone = phone.trim().replace(/\s+/g, "");
    return (globalStore.__fnb_customers || []).find((c) => c.phone === cleanPhone) || null;
  },

  createOrUpdateCustomer(data: { phone: string; fullName: string; birthDate?: string; notes?: string }): Customer {
    const cleanPhone = data.phone.trim().replace(/\s+/g, "");
    const existing = (globalStore.__fnb_customers || []).find((c) => c.phone === cleanPhone);

    if (existing) {
      existing.fullName = data.fullName;
      if (data.birthDate) existing.birthDate = data.birthDate;
      if (data.notes) existing.notes = data.notes;
      return { ...existing };
    }

    const bronzeTier = (globalStore.__fnb_tiers || []).find((t) => t.id === "tier-bronze") || initialTiers[0];
    const newCust: Customer = {
      id: `cust-${Date.now()}`,
      phone: cleanPhone,
      fullName: data.fullName,
      birthDate: data.birthDate,
      currentPoints: 0,
      totalSpent: 0,
      tierId: bronzeTier.id,
      tierName: bronzeTier.name,
      tierDiscount: bronzeTier.discountPercent,
      notes: data.notes,
      createdAt: new Date().toISOString(),
    };

    globalStore.__fnb_customers?.unshift(newCust);
    return newCust;
  },

  // Recalculate customer tier based on total spend
  recalculateTier(customer: Customer): Customer {
    const tiers = [...(globalStore.__fnb_tiers || [])].sort((a, b) => b.minSpend - a.minSpend);
    const matchedTier = tiers.find((t) => customer.totalSpent >= t.minSpend) || tiers[tiers.length - 1];

    if (matchedTier) {
      customer.tierId = matchedTier.id;
      customer.tierName = matchedTier.name;
      customer.tierDiscount = matchedTier.discountPercent;
    }
    return customer;
  },

  // Point Transactions (Earn / Redeem)
  recordTransaction(params: {
    customerPhone: string;
    type: "EARN" | "REDEEM";
    points: number;
    billAmount: number;
    billCode: string;
    discountAmount?: number;
    staffName?: string;
    notes?: string;
    redeemedMilestoneId?: string;
    redeemedMilestoneName?: string;
    redeemedItemId?: string;
    redeemedItemName?: string;
  }): { customer: Customer; transaction: PointTransaction } {
    let customer = this.getCustomerByPhone(params.customerPhone);
    if (!customer) {
      throw new Error("Không tìm thấy khách hàng với SĐT này");
    }

    const tier = (globalStore.__fnb_tiers || []).find((t) => t.id === customer?.tierId) || initialTiers[0];

    // Cập nhật điểm & tổng chi tiêu
    if (params.type === "EARN") {
      customer.currentPoints += params.points;
      customer.totalSpent += params.billAmount;
    } else if (params.type === "REDEEM") {
      if (customer.currentPoints < Math.abs(params.points)) {
        throw new Error("Khách hàng không đủ điểm để đổi");
      }
      customer.currentPoints -= Math.abs(params.points);
    }

    // Đánh giá thăng hạng
    customer = this.recalculateTier(customer);

    const tx: PointTransaction = {
      id: `tx-${Date.now()}`,
      customerId: customer.id,
      customerName: customer.fullName,
      customerPhone: customer.phone,
      type: params.type,
      points: params.type === "EARN" ? params.points : -Math.abs(params.points),
      billAmount: params.billAmount,
      billCode: params.billCode,
      discountAmount: params.discountAmount || 0,
      staffName: params.staffName || "Thu Ngân",
      notes: params.notes,
      redeemedMilestoneId: params.redeemedMilestoneId,
      redeemedMilestoneName: params.redeemedMilestoneName,
      redeemedItemId: params.redeemedItemId,
      redeemedItemName: params.redeemedItemName,
      createdAt: new Date().toISOString(),
    };

    globalStore.__fnb_transactions?.unshift(tx);
    return { customer: { ...customer }, transaction: tx };
  },

  getTransactions(): PointTransaction[] {
    return globalStore.__fnb_transactions || [];
  },

  // Tiers & Rules
  getTiers(): Tier[] {
    return globalStore.__fnb_tiers || [];
  },

  updateTier(tierId: string, data: Partial<Tier>): Tier | null {
    const tier = (globalStore.__fnb_tiers || []).find((t) => t.id === tierId);
    if (tier) {
      Object.assign(tier, data);
      return { ...tier };
    }
    return null;
  },

  getLoyaltySetting(): LoyaltySetting {
    return globalStore.__fnb_loyaltySetting || initialLoyaltySetting;
  },

  updateLoyaltySetting(data: Partial<LoyaltySetting>): LoyaltySetting {
    globalStore.__fnb_loyaltySetting = {
      ...(globalStore.__fnb_loyaltySetting || initialLoyaltySetting),
      ...data,
    };
    return globalStore.__fnb_loyaltySetting;
  },

  // Vouchers
  getVouchers(): Voucher[] {
    return globalStore.__fnb_vouchers || [];
  },

  createVoucher(voucher: Omit<Voucher, "id" | "usedCount">): Voucher {
    const newVoucher: Voucher = {
      ...voucher,
      id: `vouch-${Date.now()}`,
      usedCount: 0,
    };
    globalStore.__fnb_vouchers?.unshift(newVoucher);
    return newVoucher;
  },

  useVoucher(code: string): boolean {
    const v = (globalStore.__fnb_vouchers || []).find((item) => item.code.toUpperCase() === code.trim().toUpperCase());
    if (v && v.isActive && v.usedCount < v.usageLimit) {
      v.usedCount += 1;
      return true;
    }
    return false;
  },

  // Reward Milestones (Đổi thưởng món theo mốc điểm)
  getRewardMilestones(): RewardMilestone[] {
    return (globalStore.__fnb_rewardMilestones || []).sort((a, b) => a.pointsRequired - b.pointsRequired);
  },

  saveRewardMilestone(data: Partial<RewardMilestone> & { name: string; pointsRequired: number; itemIds: string[] }): RewardMilestone {
    const milestones = globalStore.__fnb_rewardMilestones || [];
    if (data.id) {
      const idx = milestones.findIndex((m) => m.id === data.id);
      if (idx !== -1) {
        milestones[idx] = {
          ...milestones[idx],
          ...data,
          pointsRequired: Number(data.pointsRequired),
          isActive: data.isActive ?? milestones[idx].isActive,
        };
        return milestones[idx];
      }
    }

    const newMilestone: RewardMilestone = {
      id: `milestone-${Date.now()}`,
      name: data.name,
      pointsRequired: Number(data.pointsRequired),
      description: data.description || "",
      itemIds: data.itemIds || [],
      isActive: data.isActive ?? true,
    };
    milestones.push(newMilestone);
    return newMilestone;
  },

  deleteRewardMilestone(id: string): boolean {
    const idx = (globalStore.__fnb_rewardMilestones || []).findIndex((m) => m.id === id);
    if (idx !== -1) {
      globalStore.__fnb_rewardMilestones?.splice(idx, 1);
      return true;
    }
    return false;
  },
};
