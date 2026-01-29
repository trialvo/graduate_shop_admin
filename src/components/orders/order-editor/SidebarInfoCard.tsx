import type React from "react";

interface SidebarInfoCardProps {
  name: string;
  phone: string;
  email: string;
  address: string;
}

const SidebarInfoCard: React.FC<SidebarInfoCardProps> = ({
  name,
  phone,
  email,
  address,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-[0_12px_30px_-20px_rgba(15,23,42,0.5)] backdrop-blur dark:border-gray-800 dark:bg-gray-900/70">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.25em] text-gray-500 dark:text-gray-400">
            Customer
          </div>
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            Contact summary
          </div>
        </div>
        <div className="rounded-full border border-slate-200/70 bg-white px-3 py-1 text-[11px] font-semibold text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
          Primary
        </div>
      </div>

      <div className="mt-5 space-y-4 text-sm">
        <div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">Name</div>
          <div className="font-semibold text-gray-900 dark:text-white">{name}</div>
        </div>

        <div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">Phone</div>
          <div className="font-semibold text-gray-900 dark:text-white">{phone}</div>
        </div>

        <div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">Email</div>
          <div className="font-semibold text-gray-900 dark:text-white">{email}</div>
        </div>

        <div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">Address</div>
          <div className="font-semibold text-gray-900 dark:text-white">{address}</div>
        </div>
      </div>
    </div>
  );
};

export default SidebarInfoCard;
