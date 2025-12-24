import React from "react";
import { Bell, Mail } from "lucide-react";

type Props = {
  notifications: number;
  messages: number;
};

function Row({
  icon,
  label,
  count,
  iconBg,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
  iconBg: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-4">
      <div className="flex items-center gap-3">
        <div className={["h-10 w-10 rounded-xl flex items-center justify-center", iconBg].join(" ")}>
          {icon}
        </div>
        <p className="text-sm font-semibold text-white">{label}</p>
      </div>

      <span className="text-sm font-bold text-gray-200">({count})</span>
    </div>
  );
}

export default function ProfileQuickStatsCard({ notifications, messages }: Props) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-3">
      <Row
        icon={<Bell size={18} className="text-white" />}
        label="Notifications"
        count={notifications}
        iconBg="bg-red-600"
      />
      <Row
        icon={<Mail size={18} className="text-white" />}
        label="Messages"
        count={messages}
        iconBg="bg-emerald-600"
      />
    </div>
  );
}
