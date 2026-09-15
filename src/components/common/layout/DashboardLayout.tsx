"use client";

import React, { useState } from "react";
import RoleGuard from "@/components/common/auth/RoleGuard";
import ScreenLockModal from "@/components/common/ui/ScreenLockModal";
import Sidebar from "./Sidebar";
import Header from "./Header";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isLockTriggerOpen, setIsLockTriggerOpen] = useState(false);
  const [isSessionLocked, setIsSessionLocked] = useState(false);

  return (
    <RoleGuard>
      <div className="flex h-screen w-screen overflow-hidden bg-[#F6F8FC] text-slate-900 select-none">
        {/* Fixed Brand Navy Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden">
          <Header onLockClick={() => setIsLockTriggerOpen(true)} />

          {/* Scrollable Page Body with Clean Login Aesthetic */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 bg-[#F6F8FC]">
            {children}
          </main>
        </div>

        {/* Screen Lock Modal / Fullscreen Lock Overlay */}
        <ScreenLockModal
          isLockTriggerOpen={isLockTriggerOpen}
          setIsLockTriggerOpen={setIsLockTriggerOpen}
          isSessionLocked={isSessionLocked}
          setIsSessionLocked={setIsSessionLocked}
        />
      </div>
    </RoleGuard>
  );
}
