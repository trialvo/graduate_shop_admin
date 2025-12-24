import React, { useMemo, useState } from "react";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";

type Props = {
  onSubmit: (payload: { current: string; next: string }) => void;
};

export default function ChangePasswordInline({ onSubmit }: Props) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");

  const error = useMemo(() => {
    if (!next && !confirm) return "";
    if (next.length > 0 && next.length < 6) return "Password must be at least 6 characters.";
    if (confirm && next !== confirm) return "Password confirmation doesn't match.";
    return "";
  }, [next, confirm]);

  const canSubmit = current.trim() && next.trim() && confirm.trim() && !error;

  const submit = () => {
    if (!canSubmit) return;
    onSubmit({ current, next });
    setCurrent("");
    setNext("");
    setConfirm("");
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-white/5">
          <Input
            type="password"
            className="!border-0 !bg-transparent !text-gray-100 placeholder:text-gray-400"
            placeholder="Current password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
          />
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5">
          <Input
            type="password"
            className="!border-0 !bg-transparent !text-gray-100 placeholder:text-gray-400"
            placeholder="New password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
          />
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5">
          <Input
            type="password"
            className="!border-0 !bg-transparent !text-gray-100 placeholder:text-gray-400"
            placeholder="Confirm new password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>
      </div>

      {error ? (
        <p className="mt-3 text-sm font-semibold text-error-400">{error}</p>
      ) : null}

      <div className="mt-4 flex justify-end">
        <Button onClick={submit} disabled={!canSubmit}>
          Update Password
        </Button>
      </div>
    </div>
  );
}
