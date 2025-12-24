import { useMemo } from "react";
import Button from "@/components/ui/button/Button";
import type { NotificationCount, ProfileUser } from "../types";

type Props = {
  user: ProfileUser;
  counts: NotificationCount;
  onLogout: () => void;
};

function initials(firstName: string, lastName: string): string {
  const a = (firstName?.[0] ?? "").toUpperCase();
  const b = (lastName?.[0] ?? "").toUpperCase();
  return `${a}${b}` || "U";
}

export default function ProfileOverviewCard({ user, onLogout }: Props) {
  const name = useMemo(() => `${user.firstName} ${user.lastName}`, [user]);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex flex-col items-center text-center">
        {/* Avatar */}
        <div className="relative">
          <div className="h-28 w-28 overflow-hidden rounded-full border-4 border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-gray-700 dark:text-gray-200">
              {initials(user.firstName, user.lastName)}
            </div>
          </div>
          <span className="absolute bottom-1 right-2 h-4 w-4 rounded-full border-2 border-white bg-success-500 dark:border-gray-900" />
        </div>

        <h3 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
          {name}
        </h3>

        {/* Role pill */}
        <span className="mt-2 inline-flex items-center rounded-full bg-error-500 px-3 py-1 text-xs font-semibold text-white">
          {user.role}
        </span>

        {/* Last visit */}
        {user.lastVisitAt ? (
          <p className="mt-3 text-sm text-brand-500">
            last visit {user.lastVisitAt}
          </p>
        ) : null}

        <div className="mt-6 w-full">
          <Button onClick={onLogout} className="w-full">
            Log Out
          </Button>
        </div>
      </div>
    </div>
  );
}
