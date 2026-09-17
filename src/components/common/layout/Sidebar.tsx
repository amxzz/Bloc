"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useHoldStore } from "@/store/useHoldStore";
import { useFreezerStore } from "@/store/useFreezerStore";
import { useInventoryStore } from "@/store/useInventoryStore";
import { useSidebarStore } from "@/store/useSidebarStore";
import { UserRole } from "@/types/auth";
import {
  ShoppingBag,
  History,
  Users,
  Clock,
  LayoutDashboard,
  Grid3X3,
  Factory,
  Package,
  FileText,
  Trash2,
  CheckSquare,
  ShieldAlert,
  BookOpen,
  Truck,
  UserCheck,
  Settings,
  DollarSign,
  BarChart3,
  Briefcase,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

export default function Sidebar() {
  const pathname = usePathname();
  const { currentUser } = useAuthStore();
  const { isCollapsed, toggleSidebar, setCollapsed } = useSidebarStore();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setCollapsed(true);
    }
  }, [setCollapsed]);

  const currentRole: UserRole = currentUser?.role || "cashier";

  const roleNavMap: Record<UserRole, NavItem[]> = {
    cashier: [
      {
        label: "Orders",
        href: "/cashier/pos",
        icon: <ShoppingBag className="w-4 h-4" />,
      },
      {
        label: "Transactions",
        href: "/cashier/transactions",
        icon: <History className="w-4 h-4" />,
      },
      {
        label: "Members",
        href: "/cashier/members",
        icon: <Users className="w-4 h-4" />,
      },
      {
        label: "Shift Register",
        href: "/cashier/shift",
        icon: <Clock className="w-4 h-4" />,
      },
    ],
    kitchen: [
      {
        label: "Kitchen Command",
        href: "/kitchen/overview",
        icon: <LayoutDashboard className="w-4 h-4" />,
      },
      {
        label: "Showcase Freezer",
        href: "/kitchen/showcase",
        icon: <Grid3X3 className="w-4 h-4" />,
      },
      {
        label: "Batch Production",
        href: "/kitchen/production",
        icon: <Factory className="w-4 h-4" />,
      },
      {
        label: "Raw & Packaging",
        href: "/kitchen/inventory",
        icon: <Package className="w-4 h-4" />,
      },
      {
        label: "Purchase Orders",
        href: "/kitchen/purchase-orders",
        icon: <FileText className="w-4 h-4" />,
      },
      {
        label: "Waste & Disposal",
        href: "/kitchen/waste",
        icon: <Trash2 className="w-4 h-4" />,
      },
    ],
    manager: [
      {
        label: "Manager Overview",
        href: "/manager/overview",
        icon: <LayoutDashboard className="w-4 h-4" />,
      },
      {
        label: "Approvals Inbox",
        href: "/manager/approvals",
        icon: <CheckSquare className="w-4 h-4" />,
      },
      {
        label: "Audit Trail Logs",
        href: "/manager/audits",
        icon: <ShieldAlert className="w-4 h-4" />,
      },
      {
        label: "Recipes & BOM",
        href: "/manager/recipes",
        icon: <BookOpen className="w-4 h-4" />,
      },
      {
        label: "Suppliers Directory",
        href: "/manager/suppliers",
        icon: <Truck className="w-4 h-4" />,
      },
      {
        label: "Staff Directory",
        href: "/manager/staff",
        icon: <UserCheck className="w-4 h-4" />,
      },
      {
        label: "Store Settings",
        href: "/manager/settings",
        icon: <Settings className="w-4 h-4" />,
      },
    ],
    owner: [
      {
        label: "Executive Dashboard",
        href: "/owner/overview",
        icon: <LayoutDashboard className="w-4 h-4" />,
      },
      {
        label: "Financial n' P&L",
        href: "/owner/financial",
        icon: <DollarSign className="w-4 h-4" />,
      },
      {
        label: "Sales Analytics",
        href: "/owner/analytics",
        icon: <BarChart3 className="w-4 h-4" />,
      },
      {
        label: "Periodic Reports",
        href: "/owner/reports",
        icon: <FileText className="w-4 h-4" />,
      },
      {
        label: "High-Value Approvals",
        href: "/owner/managers",
        icon: <Briefcase className="w-4 h-4" />,
      },
    ],
  };

  const navItems = roleNavMap[currentRole] || [];
  const collapsed = mounted ? isCollapsed : false;

  return (
    <aside
      className={`h-screen bg-[#2D3D6E] text-white flex flex-col justify-between border-r border-[#1B2544] shrink-0 select-none shadow-xl transition-all duration-300 ${
        collapsed ? "w-20" : "w-60"
      }`}
    >
      {/* Brand Header */}
      <div>
        <div className="p-4 border-b border-white/10 flex items-center justify-center h-16 w-full">
          {collapsed ? (
            <div className="relative w-8 h-8 flex items-center justify-center">
              <Image
                src="/assets/Secondary logo.svg"
                alt="Bloc Icon"
                width={30}
                height={30}
                className="object-contain brightness-0 invert"
                priority
              />
            </div>
          ) : (
            <div className="relative w-28 h-8 flex items-center justify-center">
              <Image
                src="/assets/Primary logo.svg"
                alt="Bloc. Gelato Logo"
                width={112}
                height={32}
                className="object-contain brightness-0 invert"
                priority
              />
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1.5 overflow-y-auto max-h-[calc(100vh-140px)]">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== `/${currentRole}/overview` && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={`flex items-center ${
                  collapsed ? "justify-center px-0 py-3" : "justify-between px-3.5 py-2.5"
                } rounded-2xl text-xs font-semibold transition-all group relative ${
                  isActive
                    ? "bg-white/15 text-white font-bold shadow-sm ring-1 ring-white/10"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <div className={`flex items-center ${collapsed ? "justify-center" : "gap-3"}`}>
                  <span
                    className={`${
                      isActive ? "text-[#F0E79D]" : "text-white/60 group-hover:text-white"
                    }`}
                  >
                    {item.icon}
                  </span>
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </div>

              </Link>
            );
          })}
        </nav>
      </div>

      {/* Collapse / Expand Toggle Button Footer */}
      <div className="p-3 border-t border-white/10 bg-[#1B2544]/60 flex items-center justify-center">
        <button
          type="button"
          onClick={toggleSidebar}
          className="w-full py-2.5 px-3 rounded-full bg-white/10 hover:bg-white/15 active:scale-[0.98] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
          title={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 text-[#F0E79D]" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4 text-[#F0E79D]" />
              <span className="text-white/80 font-medium text-[11px]">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
