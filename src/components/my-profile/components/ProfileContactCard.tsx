import React from "react";
import { FileText, Mail, MapPin, PhoneCall } from "lucide-react";
import type { ProfileUser } from "../types";

function Item({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-brand-300">{icon}</div>
      <p className="text-sm text-gray-200">{text}</p>
    </div>
  );
}

type Props = {
  user: ProfileUser;
};

export default function ProfileContactCard({ user }: Props) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
      <Item icon={<Mail size={18} />} text={user.contactEmail} />
      <Item icon={<MapPin size={18} />} text={user.contactAddress} />
      <Item icon={<PhoneCall size={18} />} text={user.contactPhone1} />
      {user.contactPhone2 ? (
        <Item icon={<PhoneCall size={18} />} text={user.contactPhone2} />
      ) : null}
      {user.profileFileName ? (
        <Item icon={<FileText size={18} />} text={user.profileFileName} />
      ) : null}
    </div>
  );
}
