export type UserRole = "cashier" | "kitchen" | "manager" | "owner";

export interface UserProfile {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  pinCode?: string;
  isActive: boolean;
}

export const ROLE_PREFIX_MAP: Record<string, UserRole> = {
  csh_: "cashier",
  ktc_: "kitchen",
  mgr_: "manager",
  own_: "owner",
};

export const ROLE_DEFAULT_ROUTES: Record<UserRole, string> = {
  cashier: "/cashier/pos",
  kitchen: "/kitchen/overview",
  manager: "/manager/overview",
  owner: "/owner/overview",
};
