// src/components/contact-messages/ReplyModal.tsx
"use client";

import React from "react";

import Button from "@/components/ui/button/Button";
import Modal from "@/components/ui/modal/Modal";
import Select from "@/components/form/Select";
import TextArea from "@/components/form/input/TextArea";
import { cn } from "@/lib/utils";

export type ReplyType = "email" | "sms";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (args: { replyText: string; type: ReplyType }) => void;
  isSubmitting?: boolean;
  defaultType?: ReplyType;
  toLabel?: string;
};

const typeOptions = [
  { value: "email", label: "Email" },
  { value: "sms", label: "SMS" },
];

export default function ReplyModal({
  open,
  onClose,
  onSubmit,
  isSubmitting,
  defaultType = "sms",
  toLabel,
}: Props) {
  const [type, setType] = React.useState<ReplyType>(defaultType);
  const [text, setText] = React.useState<string>("");

  React.useEffect(() => {
    if (!open) return;
    setType(defaultType);
    setText("");
  }, [open, defaultType]);

  const canSubmit = text.trim().length > 0 && !isSubmitting;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Reply"
      description={toLabel ? `Send reply to: ${toLabel}` : "Send reply to this message"}
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={() => onSubmit({ replyText: text, type })} disabled={!canSubmit}>
            {isSubmitting ? "Sending..." : "Send"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <p className="mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">Type</p>
            <Select
              options={typeOptions}
              value={type}
              onChange={(v) => setType(v as ReplyType)}
              placeholder="Select type"
            />
          </div>

          <div className={cn("hidden sm:block")}>{/* spare column for balance */}</div>
        </div>

        <div>
          <p className="mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">Message</p>
          <TextArea rows={6} value={text} onChange={setText} placeholder="Write your reply..." />
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Tip: keep it short and clear. For SMS, best under 160 characters.
          </p>
        </div>
      </div>
    </Modal>
  );
}
