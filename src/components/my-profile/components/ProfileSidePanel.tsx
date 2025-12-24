import React from "react";
import type { ProfileUser } from "../types";
import ProfileUserCard from "./ProfileUserCard";
import ProfileQuickStatsCard from "./ProfileQuickStatsCard";
import ProfileContactCard from "./ProfileContactCard";

type Props = {
  user: ProfileUser;
  onLogout: () => void;
};

export default function ProfileSidePanel({ user, onLogout }: Props) {
  return (
    <div className="space-y-6">
      <ProfileUserCard user={user} onLogout={onLogout} />
      <ProfileQuickStatsCard notifications={user.notifications} messages={user.messages} />
      <ProfileContactCard user={user} />
    </div>
  );
}
