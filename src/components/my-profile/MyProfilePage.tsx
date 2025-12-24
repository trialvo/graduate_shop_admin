import React, { useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";

import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";

import type { ProfileUser } from "./types";
import { INITIAL_PROFILE_USER } from "./mockData";
import ProfileSidePanel from "./components/ProfileSidePanel";
import ProfileDetailsCard from "./components/ProfileDetailsCard";

export default function MyProfilePage() {
  const [user, setUser] = useState<ProfileUser>(INITIAL_PROFILE_USER);
  const [search, setSearch] = useState("");

  const refreshedAt = useMemo(() => {
    // just demo timestamp
    return new Date().toLocaleString();
  }, []);

  const onLogout = () => {
    console.log("LOGOUT");
  };

  const onUpdateProfile = (next: ProfileUser) => {
    setUser(next);
    console.log("PROFILE_UPDATE", next);
  };

  const onChangePassword = (payload: { current: string; next: string }) => {
    console.log("CHANGE_PASSWORD", payload);
  };

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Settings
          </h1>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <div className="flex items-center gap-2 text-sm text-gray-200">
            <span>Data Refreshed</span>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-200 hover:bg-white/10"
              onClick={() => console.log("refresh")}
              aria-label="Refresh"
            >
              <RefreshCw size={16} />
            </button>
          </div>

          <div className="inline-flex items-center rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-gray-100">
            {refreshedAt}
          </div>

          <div className="w-full sm:w-[260px]">
            <div className="rounded-xl border border-white/10 bg-white/5">
              <Input
                className="!border-0 !bg-transparent !text-gray-100 placeholder:text-gray-400"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* LEFT */}
        <div className="xl:col-span-4 space-y-6">
          <ProfileSidePanel user={user} onLogout={onLogout} />
        </div>

        {/* RIGHT */}
        <div className="xl:col-span-8">
          <ProfileDetailsCard
            user={user}
            onChange={onUpdateProfile}
            onChangePassword={onChangePassword}
          />
        </div>
      </div>

      {/* footer divider line like screenshot */}
      <div className="h-px w-full bg-white/10" />

      <div className="flex items-center justify-between text-sm text-gray-300">
        <span>Copyright © 2023 By brandlabs. All Rights Reserved</span>
        <span className="opacity-80">Powered by M</span>
      </div>
    </div>
  );
}
