import type React from "react";
import { User, Phone, Mail, MapPin } from "lucide-react";

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
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
          <User size={18} />
        </div>
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">
            Customer
          </div>
          <div className="text-base font-semibold text-gray-900 dark:text-white">
            Contact Summary
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex items-start gap-3 rounded-lg bg-gray-50 px-3 py-2.5 dark:bg-gray-800/50">
          <User size={14} className="mt-0.5 shrink-0 text-gray-400" />
          <div>
            <div className="text-[10px] uppercase tracking-[0.15em] text-gray-400 dark:text-gray-500">Name</div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">{name}</div>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-lg bg-gray-50 px-3 py-2.5 dark:bg-gray-800/50">
          <Phone size={14} className="mt-0.5 shrink-0 text-gray-400" />
          <div>
            <div className="text-[10px] uppercase tracking-[0.15em] text-gray-400 dark:text-gray-500">Phone</div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">{phone}</div>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-lg bg-gray-50 px-3 py-2.5 dark:bg-gray-800/50">
          <Mail size={14} className="mt-0.5 shrink-0 text-gray-400" />
          <div>
            <div className="text-[10px] uppercase tracking-[0.15em] text-gray-400 dark:text-gray-500">Email</div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">{email}</div>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-lg bg-gray-50 px-3 py-2.5 dark:bg-gray-800/50">
          <MapPin size={14} className="mt-0.5 shrink-0 text-gray-400" />
          <div>
            <div className="text-[10px] uppercase tracking-[0.15em] text-gray-400 dark:text-gray-500">Address</div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">{address}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidebarInfoCard;
