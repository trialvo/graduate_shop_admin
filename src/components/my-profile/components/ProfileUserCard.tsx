import React from "react";
import type { ProfileUser } from "../types";
import Button from "@/components/ui/button/Button";

function initials(first: string, last: string) {
  const a = (first?.[0] ?? "").toUpperCase();
  const b = (last?.[0] ?? "").toUpperCase();
  return `${a}${b}`.trim() || "U";
}

type Props = {
  user: ProfileUser;
  onLogout: () => void;
};

export default function ProfileUserCard({ user, onLogout }: Props) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="flex flex-col items-center text-center">
        <div className="relative">
          <div className="h-24 w-24 rounded-full border-4 border-white/40 bg-white/10 flex items-center justify-center text-2xl font-extrabold text-white">
            {user.avatarUrl ? (
              // keep simple - you can swap with <img/>
              <img
                src={user.avatarUrl}
                alt="avatar"
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              initials(user.firstName, user.lastName)
            )}
          </div>

          <span
            className={[
              "absolute bottom-2 right-2 h-4 w-4 rounded-full border-2 border-[#0B1020]",
              user.online ? "bg-emerald-500" : "bg-gray-400",
            ].join(" ")}
            aria-hidden
          />
        </div>

        <h3 className="mt-4 text-lg font-extrabold text-white">
          {user.firstName} {user.lastName}
        </h3>

        <span className="mt-2 inline-flex items-center rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white">
          {user.role}
        </span>

        <p className="mt-3 text-sm text-brand-300">{user.lastVisitText}</p>

        <div className="mt-5 w-full">
          <Button className="w-full" onClick={onLogout}>
            Log Out
          </Button>
        </div>
      </div>
    </div>
  );
}
