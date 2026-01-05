import { useMemo, useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Modal from "@/components/ui/modal/Modal";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onChanged: () => void;
};

type Field = "current" | "next" | "confirm";

function PasswordField({
  label,
  value,
  onChange,
  show,
  onToggle,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label} <span className="text-error-500">*</span>
      </p>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <Lock size={16} />
        </span>
        <Input
          className="pl-9 pr-12"
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="********"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}

export default function ChangePasswordModal({ isOpen, onClose, onChanged }: Props) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [show, setShow] = useState<Record<Field, boolean>>({
    current: false,
    next: false,
    confirm: false,
  });

  const error = useMemo(() => {
    if (!current && !next && !confirm) return "";
    if (next && next.length < 8) return "Password must be at least 8 characters.";
    if (confirm && next !== confirm) return "New password and confirm password do not match.";
    return "";
  }, [confirm, current, next]);

  const canSubmit = Boolean(current.trim() && next.trim() && confirm.trim() && !error);

  const reset = () => {
    setCurrent("");
    setNext("");
    setConfirm("");
    setSaving(false);
    setShow({ current: false, next: false, confirm: false });
  };

  const submit = async () => {
    if (!canSubmit) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    onChanged();
    reset();
    onClose();
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      size="sm"
      title="Change Password"
      description="Use a strong password (min 8 chars) and keep it private."
    >
      <div className="space-y-6">
        <div className="space-y-4">
          <PasswordField
            label="Current Password"
            value={current}
            onChange={setCurrent}
            show={show.current}
            onToggle={() => setShow((p) => ({ ...p, current: !p.current }))}
          />
          <PasswordField
            label="New Password"
            value={next}
            onChange={setNext}
            show={show.next}
            onToggle={() => setShow((p) => ({ ...p, next: !p.next }))}
          />
          <PasswordField
            label="Confirm New Password"
            value={confirm}
            onChange={setConfirm}
            show={show.confirm}
            onToggle={() => setShow((p) => ({ ...p, confirm: !p.confirm }))}
          />

          {error ? (
            <div className="rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700 dark:border-error-900/40 dark:bg-error-500/10 dark:text-error-300">
              {error}
            </div>
          ) : null}
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            onClick={() => {
              reset();
              onClose();
            }}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button onClick={submit} disabled={!canSubmit || saving}>
            {saving ? "Saving..." : "Update Password"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
