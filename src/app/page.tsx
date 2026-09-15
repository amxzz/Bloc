"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { ROLE_DEFAULT_ROUTES } from "@/types/auth";

export default function RootPage() {
  const router = useRouter();
  const { currentUser, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      const defaultRoute = ROLE_DEFAULT_ROUTES[currentUser.role] || "/cashier/catalog";
      router.replace(defaultRoute);
    } else {
      router.replace("/login");
    }
  }, [currentUser, isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-[#FAF6F0] flex items-center justify-center">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-[#1A1410] tracking-tight">Bloc. Gelato</h1>
        <p className="text-xs text-stone-400 tracking-widest font-mono font-bold uppercase">Loading Portal...</p>
      </div>
    </div>
  );
}
