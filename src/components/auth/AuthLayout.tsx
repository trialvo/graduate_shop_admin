"use client";

import React from "react";
import BrandLogo from "@/components/common/BrandLogo";
import { cn } from "@/lib/utils";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
      <div
        className={cn(
          "w-full max-w-md rounded-[4px] border bg-white dark:bg-gray-900 shadow-sm p-6",
          "border-gray-200 dark:border-gray-800"
        )}
      >
        <div className="flex items-center justify-center mb-5">
          <BrandLogo className="h-10 w-auto" />
        </div>
        {children}
      </div>
    </div>
  );
}
