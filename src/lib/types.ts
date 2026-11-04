export interface Category {
  id: string;
  name: string;
  slug: string;
  displayOrder: number;
  icon?: string;
  items?: MenuItem[];
}

export interface MenuItem {
  id: string;
  categoryId: string;
  categoryName?: string;
  name: string;
  description?: string;
  price: number;
  memberPrice?: number;
  imageUrl?: string;
  isAvailable: boolean;
  isBestSeller: boolean;
  isSignature: boolean;
  spicyLevel: number; // 0: không cay, 1: cay vừa, 2: cay nhiều
  portion?: string; // "Combo 3-4 người", "Đĩa 250g"
  rewardPointsRequired?: number;
  displayOrder: number;
}

export interface Tier {
  id: string;
  name: string;
  minSpend: number;
  discountPercent: number;
  pointMultiplier: number;
  color: string;
  benefits?: string;
}

export interface Customer {
  id: string;
  phone: string;
  fullName: string;
  birthDate?: string; // YYYY-MM-DD
  currentPoints: number;
  totalSpent: number;
  tierId: string;
  tierName?: string;
  tierDiscount?: number;
  notes?: string;
  createdAt: string;
}

export interface PointTransaction {
  id: string;
  customerId: string;
  customerName?: string;
  customerPhone?: string;
  type: "EARN" | "REDEEM" | "ADJUST";
  points: number;
  billAmount?: number;
  billCode?: string;
  discountAmount?: number;
  staffName?: string;
  notes?: string;
  createdAt: string;
}

export interface Voucher {
  id: string;
  code: string;
  title: string;
  description?: string;
  discountType: "PERCENT" | "FIXED" | "FREE_ITEM";
  discountValue: number;
  freeItemName?: string;
  minOrderAmount: number;
  maxDiscount?: number;
  startDate: string;
  endDate: string;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
  isBirthdayVoucher: boolean;
}

export interface LoyaltySetting {
  earnRateAmount: number; // vd: 100000
  earnRatePoints: number; // vd: 10
  redeemRatePoint: number; // vd: 1
  redeemRateAmount: number; // vd: 1000
  minRedeemPoints: number; // vd: 10
}

export interface WishlistItem {
  item: MenuItem;
  quantity: number;
  note?: string;
}
