import { useEffect, useMemo, useRef, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAdminUsers, type AdminUserEntity } from "@/api/admin-users.api";

type Props = {
  value: number | null;
  onChange: (id: number | null, user?: AdminUserEntity | null) => void;
  disabled?: boolean;
  className?: string;
};

const LIMIT = 20;

function fullName(u: AdminUserEntity) {
  const n = `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim();
  return n || u.email || `User #${u.id}`;
}

export default function CustomerSearchDropdown({ value, onChange, disabled = false, className }: Props) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [offset, setOffset] = useState(0);

  const wrapRef = useRef<HTMLDivElement | null>(null);

  const usersQuery = useQuery({
    queryKey: ["adminUsersDropdown", { q: q.trim(), limit: LIMIT, offset }],
    queryFn: () =>
      getAdminUsers({
        search: q.trim() || undefined,
        limit: LIMIT,
        offset: offset === 0 ? undefined : offset,
      }),
    placeholderData: keepPreviousData,
  });

  const users = usersQuery.data?.users ?? [];
  const total = usersQuery.data?.meta?.total ?? 0;

  const selectedUser = useMemo(() => users.find((u) => u.id === value) ?? null, [users, value]);

  const label = useMemo(() => {
    if (value && selectedUser) return `${fullName(selectedUser)} (${selectedUser.email})`;
    if (value && !selectedUser) return `Selected: #${value}`;
    return "Select customer";
  }, [value, selectedUser]);

  useEffect(() => {
    if (!open) return;

    const onDoc = (e: MouseEvent) => {
      const el = wrapRef.current;
      if (!el) return;
      if (el.contains(e.target as Node)) return;
      setOpen(false);
    };

    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onDoc);
    window.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      window.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className={cn("relative", className)} aria-disabled={disabled ? true : undefined}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex h-11 w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-white",
          disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
        )}
      >
        <span className="min-w-0 truncate">{label}</span>
        <ChevronDown className="h-4 w-4 text-gray-400" />
      </button>

      {open ? (
        <div className="absolute z-[60] mt-2 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-theme-lg dark:border-gray-800 dark:bg-gray-950">
          <div className="border-b border-gray-200 p-3 dark:border-gray-800">
            <div className="flex h-10 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 dark:border-gray-800 dark:bg-gray-900">
              <Search size={16} className="text-gray-400" />
              <input
                value={q}
                onChange={(e) => {
                  setOffset(0);
                  setQ(e.target.value);
                }}
                placeholder="Search name/email/phone"
                className="w-full bg-transparent text-sm text-gray-900 outline-none dark:text-white"
              />
            </div>
          </div>

          <div className="max-h-72 overflow-auto custom-scrollbar">
            {usersQuery.isLoading ? (
              <div className="p-4 text-sm text-gray-500 dark:text-gray-400">Loading...</div>
            ) : users.length === 0 ? (
              <div className="p-4 text-sm text-gray-500 dark:text-gray-400">No users found</div>
            ) : (
              <div className="p-2">
                {users.map((u) => {
                  const active = u.id === value;
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => {
                        onChange(u.id, u);
                        setOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition",
                        active
                          ? "bg-gray-100 text-gray-900 dark:bg-white/[0.06] dark:text-white"
                          : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-white/[0.06]"
                      )}
                    >
                      <span className="min-w-0 truncate">
                        {fullName(u)}{" "}
                        <span className="text-xs text-gray-500 dark:text-gray-400">({u.email})</span>
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">#{u.id}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-gray-200 px-3 py-2 text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400">
            <div>
              {Math.min(offset + LIMIT, total)} / {total}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={offset === 0}
                onClick={() => setOffset((o) => Math.max(0, o - LIMIT))}
                className={cn(
                  "rounded-md px-2 py-1 ring-1 transition",
                  offset === 0
                    ? "cursor-not-allowed text-gray-400 ring-gray-200 dark:ring-gray-800"
                    : "text-gray-700 ring-gray-200 hover:bg-gray-50 dark:text-gray-200 dark:ring-gray-800 dark:hover:bg-white/[0.03]"
                )}
              >
                Prev
              </button>
              <button
                type="button"
                disabled={offset + LIMIT >= total}
                onClick={() => setOffset((o) => o + LIMIT)}
                className={cn(
                  "rounded-md px-2 py-1 ring-1 transition",
                  offset + LIMIT >= total
                    ? "cursor-not-allowed text-gray-400 ring-gray-200 dark:ring-gray-800"
                    : "text-gray-700 ring-gray-200 hover:bg-gray-50 dark:text-gray-200 dark:ring-gray-800 dark:hover:bg-white/[0.03]"
                )}
              >
                Next
              </button>
              <button
                type="button"
                onClick={() => {
                  onChange(null, null);
                  setOpen(false);
                }}
                className="rounded-md px-2 py-1 text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/[0.03]"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
