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
    <div className="rounded-2xl border border-gray-200 bg-white/70 p-5 shadow-theme-xs backdrop-blur dark:border-gray-800 dark:bg-gray-900/60">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-extrabold uppercase tracking-wide text-gray-900 dark:text-white">
            Info:
          </div>

          <div className="mt-4 space-y-2 text-sm">
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Name
              </div>
              <div className="font-semibold text-gray-900 dark:text-white">
                {name}
              </div>
            </div>

            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Phone
              </div>
              <div className="font-semibold text-gray-900 dark:text-white">
                {phone}
              </div>
            </div>

            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Email
              </div>
              <div className="font-semibold text-gray-900 dark:text-white">
                {email}
              </div>
            </div>

            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Address
              </div>
              <div className="font-semibold text-gray-900 dark:text-white">
                {address}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
          <div className="grid h-[112px] w-[112px] grid-cols-9 gap-[2px] rounded-lg bg-gray-900/5 p-2 dark:bg-white/5">
            {Array.from({ length: 81 }).map((_, i) => (
              <span
                key={i}
                className="rounded-[2px] bg-gray-900 dark:bg-white"
                style={{
                  opacity: i % 5 === 0 || i % 7 === 0 ? 0.95 : 0.1,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidebarInfoCard;
