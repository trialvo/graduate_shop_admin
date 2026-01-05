import { useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";

import { MOCK_CONTACT, MOCK_COUNTS, MOCK_USER } from "./mockData";
import type { ProfileUser } from "./types";
import ProfileOverviewCard from "./components/ProfileOverviewCard";
import ProfileQuickLinksCard from "./components/ProfileQuickLinksCard";
import ProfileDetailsForm from "./components/ProfileDetailsForm";
import ChangePasswordModal from "./components/ChangePasswordModal";
import ProfileContactCard from "./components/ProfileContactCard";

function formatNow(): string {
  const d = new Date();
  const date = d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "2-digit",
  });
  const time = d.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${date} at ${time}`;
}

export default function MyProfilePage() {
  const [refreshedAt, setRefreshedAt] = useState<string>(() => formatNow());
  const [user, setUser] = useState<ProfileUser>(MOCK_USER);
  const [pwdOpen, setPwdOpen] = useState(false);

  const counts = useMemo(() => MOCK_COUNTS, []);
  const contact = useMemo(() => MOCK_CONTACT, []);

  return (
    <div className="space-y-6">
      {/* Header (theme-matching) */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">
            Settings
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Update your profile details, password and contact preferences.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-200 dark:hover:bg-white/[0.06]"
            onClick={() => setRefreshedAt(formatNow())}
          >
            <span className="text-gray-500 dark:text-gray-400">
              Data Refreshed
            </span>
            <RefreshCw size={16} className="text-brand-500" />
          </button>

          <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-200">
            {refreshedAt}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* Left */}
        <div className="space-y-6 xl:col-span-4">
          <ProfileOverviewCard
            user={user}
            counts={counts}
            onLogout={() => console.log("logout")}
          />
          <ProfileQuickLinksCard counts={counts} />
          <ProfileContactCard contact={contact} />
        </div>

        {/* Right */}
        <div className="xl:col-span-8">
          <ProfileDetailsForm
            user={user}
            onChange={setUser}
            onOpenChangePassword={() => setPwdOpen(true)}
          />
        </div>
      </div>

      <ChangePasswordModal
        isOpen={pwdOpen}
        onClose={() => setPwdOpen(false)}
        onChanged={() => console.log("password updated")}
      />
    </div>
  );
}
