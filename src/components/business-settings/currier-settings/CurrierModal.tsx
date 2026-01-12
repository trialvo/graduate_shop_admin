// src/components/business-settings/currier-settings/CurrierModal.tsx

import React, { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { AlertTriangle, Image as ImageIcon } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import Switch from "@/components/form/switch/Switch";
import Modal from "@/components/ui/modal/Modal";

import { COURIER_PROVIDER_DEFS } from "./providerDefs";
import type { CourierProvider, CourierProviderConfigCard, Option } from "./types";
import { setDefaultCourier, updateCourierProviderConfig } from "@/api/courier-config.api";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  provider: CourierProvider | null;
  initial: CourierProviderConfigCard | null;
  onClose: () => void;
  onSaved: () => void;
};

const PROVIDER_OPTIONS: Option[] = COURIER_PROVIDER_DEFS.map((d) => ({
  value: d.provider,
  label: d.title,
}));

function getDef(p: CourierProvider) {
  return COURIER_PROVIDER_DEFS.find((d) => d.provider === p) ?? COURIER_PROVIDER_DEFS[0];
}

function safeStr(v: unknown): string {
  if (typeof v === "string") return v;
  if (v == null) return "";
  return String(v);
}

export default function CurrierModal({ open, provider, initial, onClose, onSaved }: Props) {
  const [currentProvider, setCurrentProvider] = useState<CourierProvider>("steadfast");

  // common
  const [status, setStatus] = useState<boolean>(true);
  const [setDefault, setSetDefault] = useState<boolean>(false);
  const [armWipe, setArmWipe] = useState<boolean>(false);

  const [baseUrl, setBaseUrl] = useState("");
  const [description, setDescription] = useState("");
  const [note, setNote] = useState("");

  // creds dynamic by providerDef.fields
  const [credentials, setCredentials] = useState<Record<string, string>>({});

  // image
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const hydratingRef = useRef(false);

  useEffect(() => {
    if (!open) return;

    hydratingRef.current = true;

    const p = provider ?? initial?.provider ?? "steadfast";
    setCurrentProvider(p);

    const def = getDef(p);
    const cfg = initial?.config ?? {};

    setStatus(Boolean(initial?.is_active ?? true));
    setSetDefault(Boolean(initial?.isDefault ?? false));
    setArmWipe(false);

    setBaseUrl(safeStr(cfg?.[def.common.base_url] ?? initial?.base_url ?? ""));
    setDescription(safeStr(cfg?.[def.common.description] ?? initial?.description ?? ""));
    setNote(safeStr(cfg?.[def.common.note] ?? initial?.note ?? ""));

    // hydrate credentials by provider fields
    const nextCred: Record<string, string> = {};
    for (const f of def.fields) {
      nextCred[f.key] = safeStr(cfg?.[f.readFromConfigKey] ?? "");
    }
    setCredentials(nextCred);

    setImageFile(null);
    setImagePreview(safeStr(cfg?.[def.common.image] ?? initial?.imagePath ?? ""));

    const t = window.setTimeout(() => {
      hydratingRef.current = false;
    }, 0);

    return () => window.clearTimeout(t);
  }, [open, provider, initial]);

  useEffect(() => {
    return () => {
      if (imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const providerDef = useMemo(() => getDef(currentProvider), [currentProvider]);

  const hasAnyCredentialInput = useMemo(() => {
    return providerDef.fields.some((f) => safeStr(credentials[f.key]).trim().length > 0);
  }, [credentials, providerDef.fields]);

  const allRequiredFilled = useMemo(() => {
    return providerDef.fields
      .filter((f) => f.required)
      .every((f) => safeStr(credentials[f.key]).trim().length > 0);
  }, [credentials, providerDef.fields]);

  const canSave = useMemo(() => {
    if (armWipe) return true;
    if (!hasAnyCredentialInput) return true;
    return allRequiredFilled;
  }, [armWipe, hasAnyCredentialInput, allRequiredFilled]);

  const mutation = useMutation({
    mutationFn: async (fd: FormData) => {
      const res = await updateCourierProviderConfig(currentProvider, fd);

      // extra safety: if backend didn't set it, we force default by patch endpoint
      if (!armWipe && setDefault) {
        await setDefaultCourier(currentProvider);
      }

      return res;
    },
    onSuccess: (res: any) => {
      if (res?.success === true) {
        toast.success("Courier config updated");
        onSaved();
        return;
      }
      toast.error(res?.error ?? res?.message ?? "Update failed");
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.error ?? err?.response?.data?.message ?? "Update failed";
      toast.error(msg);
    },
  });

  const changeCred = (k: string, v: string) => {
    if (hydratingRef.current) return;
    setCredentials((p) => ({ ...p, [k]: v }));
  };

  const submit = () => {
    if (!canSave || mutation.isPending) return;

    const fd = new FormData();

    if (armWipe) {
      fd.append("setnull", "true");
      fd.append("setdefault", "false");
      fd.append("status", "false");
      mutation.mutate(fd);
      return;
    }

    const anyCredFilled = hasAnyCredentialInput;

    if (baseUrl.trim()) fd.append("base_url", baseUrl.trim());
    if (description.trim()) fd.append("description", description.trim());
    if (note.trim()) fd.append("note", note.trim());

    fd.append("status", String(Boolean(status)));
    fd.append("setdefault", String(Boolean(setDefault)));
    fd.append("setnull", "false");

    if (imageFile) {
      fd.append("image", imageFile);
    }

    if (anyCredFilled) {
      for (const f of providerDef.fields) {
        fd.append(f.key, safeStr(credentials[f.key]).trim());
      }
    }

    mutation.mutate(fd);
  };

  if (!open) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit Courier Provider"
      description="Update credentials, status and default provider."
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button
            onClick={submit}
            disabled={mutation.isPending || !canSave}
            className={cn(armWipe && "bg-error-600 hover:bg-error-700")}
          >
            {mutation.isPending ? "Saving..." : armWipe ? "Wipe & Save" : "Save Changes"}
          </Button>
        </>
      }
      bodyClassName="max-h-[560px]"
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Provider</p>
          <Select
            key={`courier-provider-${currentProvider}`}
            options={PROVIDER_OPTIONS}
            placeholder="Select provider"
            defaultValue={currentProvider}
            disabled
            onChange={(v) => setCurrentProvider(v as CourierProvider)}
          />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</p>
          <div className="h-11 flex items-center justify-between rounded-[4px] border border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-900">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {status ? "Active" : "Inactive"}
            </p>
            <Switch label="" defaultChecked={status} onChange={(c) => setStatus(c)} />
          </div>
        </div>

        <div className="space-y-2 md:col-span-2">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Base URL</p>
          <Input
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="https://portal.packzy.com/api/v1"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</p>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Note</p>
          <Input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optional note"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Set Default Provider
          </p>
          <div className="h-11 flex items-center justify-between rounded-[4px] border border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-900">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {setDefault ? "Yes" : "No"}
            </p>
            <Switch label="" defaultChecked={setDefault} onChange={(c) => setSetDefault(c)} />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            This sets <span className="font-mono">COURIER_DEFAULT_PROVIDER</span>.
          </p>
        </div>
      </div>

      {/* Credentials */}
      <div className="mt-6 rounded-[4px] border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
              {providerDef.title} Credentials
            </h4>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              If you fill 1 field → all required fields must be filled.
            </p>
          </div>

          <span className="inline-flex items-center rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
            {providerDef.category}
          </span>
        </div>

        {!canSave ? (
          <div className="mt-3 rounded-[4px] border border-warning-200 bg-warning-50 px-4 py-3 text-xs font-semibold text-warning-700 dark:border-warning-900/40 dark:bg-warning-500/10 dark:text-warning-300">
            Please fill all required fields (since you started entering credentials).
          </div>
        ) : null}

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          {providerDef.fields.map((f) => (
            <div key={`${currentProvider}-${f.key}`} className="space-y-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {f.label} {f.required ? <span className="text-error-500">*</span> : null}
              </p>
              <Input
                type={f.type === "password" ? "password" : "text"}
                value={credentials[f.key] ?? ""}
                onChange={(e) => changeCred(f.key, e.target.value)}
                placeholder={f.placeholder ?? ""}
              />
              {f.helperText ? (
                <p className="text-xs text-gray-500 dark:text-gray-400">{f.helperText}</p>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      {/* Image */}
      <div className="mt-6 rounded-[4px] border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
              Provider Image
            </h4>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Upload a new logo/image for this provider.
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-[4px] border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/40">
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
            ) : (
              <ImageIcon size={18} className="text-gray-400" />
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <label className="inline-flex cursor-pointer items-center justify-center rounded-[4px] border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-white/[0.03]">
              Upload
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null;
                  setImageFile(f);
                  if (!f) return;

                  setImagePreview((prev) => {
                    if (prev.startsWith("blob:")) URL.revokeObjectURL(prev);
                    return URL.createObjectURL(f);
                  });
                }}
              />
            </label>

            <Button
              variant="outline"
              onClick={() => {
                setImageFile(null);
                setImagePreview((prev) => {
                  if (prev.startsWith("blob:")) URL.revokeObjectURL(prev);
                  return "";
                });
              }}
            >
              Remove
            </Button>
          </div>
        </div>
      </div>

      {/* Danger zone */}
      <div className="mt-6 rounded-[4px] border border-error-200 bg-error-50 p-4 dark:border-error-900/40 dark:bg-error-500/10">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 text-error-600 dark:text-error-300">
            <AlertTriangle size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-error-700 dark:text-error-200">
              Danger Zone (setnull)
            </p>
            <p className="mt-1 text-xs text-error-700/90 dark:text-error-300">
              If enabled, it wipes this provider config from database.
            </p>

            <div className="mt-3 flex items-center justify-between rounded-[4px] border border-error-200 bg-white px-4 py-3 dark:border-error-900/40 dark:bg-gray-900">
              <p className="text-sm font-semibold text-error-700 dark:text-error-200">
                {armWipe ? "Armed: setnull=true" : "Not armed"}
              </p>
              <Switch label="" defaultChecked={armWipe} onChange={(c) => setArmWipe(c)} />
            </div>

            {armWipe ? (
              <p className="mt-2 text-xs font-semibold text-error-700 dark:text-error-300">
                Saving now will send <span className="font-mono">setnull: true</span>.
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </Modal>
  );
}
