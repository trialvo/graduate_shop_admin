"use client";

import React from "react";
import type { GuestOrderStatus } from "./types";

type Tab = { label: string; value: "all" | GuestOrderStatus };

type Props = {
  title: string;
  tabs: Tab[];
  activeTab: "all" | GuestOrderStatus;
  onTabChange: (v: "all" | GuestOrderStatus) => void;
  badgeCounts: Record<"all" | GuestOrderStatus, number>;
};

const GuestOrdersHeader: React.FC<Props> = ({
  title,
  tabs,
  activeTab,
  onTabChange,
  badgeCounts,
}) => {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">{title}</h1>

      <div className="flex flex-wrap items-center gap-4 text-sm">
        {tabs.map((t) => {
          const active = activeTab === t.value;
          return (
            <button
              key={t.value}
              onClick={() => onTabChange(t.value)}
              className={[
                "inline-flex items-center gap-2 transition",
                active ? "text-primary" : "text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              <span>{t.label}</span>
              <span className={active ? "text-primary" : "text-muted-foreground"}>
                ({badgeCounts[t.value]})
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default GuestOrdersHeader;
export { GuestOrdersHeader };
