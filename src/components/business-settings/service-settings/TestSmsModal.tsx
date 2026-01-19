// src/components/business-settings/service-settings/TestSmsModal.tsx
"use client";

import React from "react";
import { X } from "lucide-react";

import TestSmsCard from "./TestSmsCard";

type Props = {
  open: boolean;
  activeProviderLabel: string;
  onClose: () => void;
};

export default function TestSmsModal({ open, activeProviderLabel, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-label="Close overlay"
      />

      <div className="relative w-[95vw] max-w-2xl rounded-[4px] border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-800">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Test SMS</h3>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Send a one-off message using the current active provider.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-[4px] border border-gray-200 bg-white text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-white/[0.03]"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <TestSmsCard activeProviderLabel={activeProviderLabel} variant="modal" />
        </div>
      </div>
    </div>
  );
}
