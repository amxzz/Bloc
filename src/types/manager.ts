import { UserRole } from "./auth";

export interface RecipeItem {
  id: string;
  flavorId: string;
  flavorName: string;
  series: string;
  baseYieldLiter: number;
  ingredients: Array<{
    itemId: string;
    itemName: string;
    amount: number;
    unit: string;
  }>;
  churningTimeMinutes: number;
  targetOverrunPercent: number;
  instructions?: string;
  updatedAt: string;
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  category: "Packaging" | "Dairy" | "Flavor & Puree" | "Equipment";
  isActive: boolean;
}

export interface StaffUser {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  phoneNumber: string;
  pinCode: string;
  isActive: boolean;
  joinedDate: string;
}
