"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useNotificationStore } from "@/store/useNotificationStore";
import { UserRole, ROLE_DEFAULT_ROUTES } from "@/types/auth";

interface RoleGuardProps {
  children: React.ReactNode;
}

export default function RoleGuard({ children }: RoleGuardProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser } = useAuthStore();
  const { showToast } = useNotificationStore();

  useEffect(() => {
    // If not authenticated, redirect to login
    if (!currentUser) {
      router.replace("/login");
      return;
    }

    const pathSegments = pathname.split("/").filter(Boolean);
    const targetRole = pathSegments[0] as UserRole | undefined;

    const validRoles: UserRole[] = ["cashier", "kitchen", "manager", "owner"];

    if (targetRole && validRoles.includes(targetRole)) {
      if (currentUser.role !== targetRole) {
        // Unauthorized role access attempt
        showToast(
          "Access Restricted",
          `Your account (@${currentUser.username}) is authorized for [${currentUser.role.toUpperCase()}] only. Redirected to your home portal.`,
          "WARNING"
        );

        const fallbackRoute = ROLE_DEFAULT_ROUTES[currentUser.role] || "/login";
        router.replace(fallbackRoute);
      }
    }
  }, [pathname, currentUser, router, showToast]);

  if (!currentUser) {
    return null;
  }

  return <>{children}</>;
}
