import { create } from "zustand";
import { persist } from "zustand/middleware";
import { UserProfile, UserRole, ROLE_DEFAULT_ROUTES } from "@/types/auth";

interface AuthState {
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  login: (username: string, pin?: string) => { success: boolean; defaultRoute: string; error?: string };
  logout: () => void;
  verifyPin: (pin: string, requiredRole?: UserRole) => boolean;
  updatePinCode: (userId: string, newPin: string) => void;
}

export const MOCK_USERS: UserProfile[] = [
  {
    id: "usr-csh-01",
    username: "csh_sarah",
    fullName: "Sarah Jenkins",
    role: "cashier",
    pinCode: "123456",
    isActive: true,
  },
  {
    id: "usr-ktc-01",
    username: "ktc_budi",
    fullName: "Budi Santoso",
    role: "kitchen",
    pinCode: "234567",
    isActive: true,
  },
  {
    id: "usr-mgr-01",
    username: "mgr_doni",
    fullName: "Doni Pratama",
    role: "manager",
    pinCode: "888888",
    isActive: true,
  },
  {
    id: "usr-own-01",
    username: "own_aldo",
    fullName: "Aldo Wijaya",
    role: "owner",
    pinCode: "999999",
    isActive: true,
  },
];

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      currentUser: MOCK_USERS[0], // Default logged-in user: cashier Sarah
      isAuthenticated: true,

      login: (username, pin) => {
        const cleanUsername = username.trim().toLowerCase();
        const user = MOCK_USERS.find((u) => u.username.toLowerCase() === cleanUsername);

        if (!user) {
          return { success: false, defaultRoute: "/login", error: "User account not found." };
        }

        if (pin && user.pinCode && user.pinCode !== pin) {
          return { success: false, defaultRoute: "/login", error: "Invalid PIN code." };
        }

        set({ currentUser: user, isAuthenticated: true });
        const defaultRoute = ROLE_DEFAULT_ROUTES[user.role] || "/login";
        return { success: true, defaultRoute };
      },

      logout: () => {
        set({ currentUser: null, isAuthenticated: false });
      },

      verifyPin: (pin, requiredRole) => {
        if (!pin) return false;
        
        if (requiredRole) {
          const authorizedUser = MOCK_USERS.find(
            (u) => u.role === requiredRole && u.pinCode === pin && u.isActive
          );
          return !!authorizedUser;
        }

        // Generic manager or owner PIN authorization
        const managerOrOwner = MOCK_USERS.find(
          (u) => (u.role === "manager" || u.role === "owner") && u.pinCode === pin && u.isActive
        );
        return !!managerOrOwner;
      },

      updatePinCode: (userId, newPin) => {
        const user = MOCK_USERS.find((u) => u.id === userId);
        if (user) {
          user.pinCode = newPin;
        }
        set((state) => ({
          currentUser: state.currentUser?.id === userId ? { ...state.currentUser, pinCode: newPin } : state.currentUser,
        }));
      },
    }),
    {
      name: "bloc-gelato-auth",
    }
  )
);
