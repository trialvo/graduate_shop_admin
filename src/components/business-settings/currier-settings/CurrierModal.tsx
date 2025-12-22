import React, { useEffect, useMemo, useState } from "react";
import { Image as ImageIcon, ShieldCheck, ShieldOff } from "lucide-react";

import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import Switch from "@/components/form/switch/Switch";

import type {
  CurrierProviderType,
  CurrierRow,
  PaperflyApiConfig,
  PathaoApiConfig,
  RedxApiConfig,
  SteadfastApiConfig,
} from "./types";
import Modal from "@/components/ui/modal/Modal";

type Option = { value: string; label: string };

const TYPE_OPTIONS: Option[] = [
  { value: "STEADFAST", label: "Steadfast" },
  { value: "REDX", label: "RedX" },
  { value: "PATHAO", label: "Pathao" },
  { value: "PAPERFLY", label: "Paperfly" },
];

function nowText(): string {
  const d = new Date();
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isValidUrl(url: string): boolean {
  const v = url.trim();
  if (!v) return true;
  try {
    // eslint-disable-next-line no-new
    new URL(v);
    return true;
  } catch {
    return false;
  }
}

type PathaoApiDraft = Omit<PathaoApiConfig, "type">;
type SteadfastApiDraft = Omit<SteadfastApiConfig, "type">;
type RedxApiDraft = Omit<RedxApiConfig, "type">;
type PaperflyApiDraft = Omit<PaperflyApiConfig, "type">;

const DEFAULT_PATHAO: PathaoApiDraft = {
  apiBaseUrl: "",
  storeId: "",
  clientId: "",
  clientSecret: "",
  clientEmail: "",
  clientPassword: "",
};

const DEFAULT_STEADFAST: SteadfastApiDraft = {
  apiBaseUrl: "",
  apiKey: "",
  secretKey: "",
};

const DEFAULT_REDX: RedxApiDraft = {
  apiBaseUrl: "",
  storeId: "",
  apiToken: "",
};

const DEFAULT_PAPERFLY: PaperflyApiDraft = {
  apiBaseUrl: "",
  username: "",
  password: "",
  apiKey: "",
};

export default function CurrierModal({
  open,
  mode,
  initial,
  onClose,
  onSubmit,
}: {
  open: boolean;
  mode: "create" | "edit";
  initial?: CurrierRow | null;
  onClose: () => void;
  onSubmit: (payload: CurrierRow) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<CurrierProviderType>("STEADFAST");
  const [active, setActive] = useState(true);
  const [defaultNote, setDefaultNote] = useState("");

  const [pathaoApi, setPathaoApi] = useState<PathaoApiDraft>(DEFAULT_PATHAO);
  const [steadfastApi, setSteadfastApi] = useState<SteadfastApiDraft>(DEFAULT_STEADFAST);
  const [redxApi, setRedxApi] = useState<RedxApiDraft>(DEFAULT_REDX);
  const [paperflyApi, setPaperflyApi] = useState<PaperflyApiDraft>(DEFAULT_PAPERFLY);

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState("");

  useEffect(() => {
    if (!open) return;

    const src = initial ?? null;

    setName(src?.name ?? "");
    setDescription(src?.description ?? "");
    setType(src?.type ?? "STEADFAST");
    setActive(src?.active ?? true);
    setDefaultNote(src?.defaultNote ?? "");

    // load API details safely based on provider
    if (src?.api?.type === "PATHAO") {
      setPathaoApi({
        apiBaseUrl: src.api.apiBaseUrl ?? "",
        storeId: src.api.storeId ?? "",
        clientId: src.api.clientId ?? "",
        clientSecret: src.api.clientSecret ?? "",
        clientEmail: src.api.clientEmail ?? "",
        clientPassword: src.api.clientPassword ?? "",
      });
    } else {
      setPathaoApi(DEFAULT_PATHAO);
    }

    if (src?.api?.type === "STEADFAST") {
      setSteadfastApi({
        apiBaseUrl: src.api.apiBaseUrl ?? "",
        apiKey: src.api.apiKey ?? "",
        secretKey: src.api.secretKey ?? "",
      });
    } else {
      setSteadfastApi(DEFAULT_STEADFAST);
    }

    if (src?.api?.type === "REDX") {
      setRedxApi({
        apiBaseUrl: src.api.apiBaseUrl ?? "",
        storeId: src.api.storeId ?? "",
        apiToken: src.api.apiToken ?? "",
      });
    } else {
      setRedxApi(DEFAULT_REDX);
    }

    if (src?.api?.type === "PAPERFLY") {
      setPaperflyApi({
        apiBaseUrl: src.api.apiBaseUrl ?? "",
        username: src.api.username ?? "",
        password: src.api.password ?? "",
        apiKey: src.api.apiKey ?? "",
      });
    } else {
      setPaperflyApi(DEFAULT_PAPERFLY);
    }

    setLogoFile(null);
    setLogoPreviewUrl(src?.logoUrl ?? "");
  }, [open, initial]);

  useEffect(() => {
    return () => {
      if (logoPreviewUrl.startsWith("blob:")) URL.revokeObjectURL(logoPreviewUrl);
    };
  }, [logoPreviewUrl]);

  const apiBaseUrl = useMemo(() => {
    if (type === "PATHAO") return pathaoApi.apiBaseUrl;
    if (type === "STEADFAST") return steadfastApi.apiBaseUrl;
    if (type === "REDX") return redxApi.apiBaseUrl;
    return paperflyApi.apiBaseUrl;
  }, [type, pathaoApi.apiBaseUrl, steadfastApi.apiBaseUrl, redxApi.apiBaseUrl, paperflyApi.apiBaseUrl]);

  const errors = useMemo(() => {
    const n = name.trim();
    const baseOk = !apiBaseUrl.trim() || isValidUrl(apiBaseUrl);

    return {
      name: !n ? "Currier name is required." : "",
      apiBaseUrl: !baseOk ? "Invalid API Base URL." : "",
    };
  }, [name, apiBaseUrl]);

  const canSubmit = useMemo(() => {
    return !errors.name && !errors.apiBaseUrl;
  }, [errors]);

  const titleText = mode === "create" ? "ADD NEW" : "VIEW / EDIT SETTINGS";
  const primaryText = mode === "create" ? "Create Currier" : "Update Currier";

  const submit = () => {
    if (!canSubmit) return;

    const api =
      type === "PATHAO"
        ? ({
            type: "PATHAO",
            apiBaseUrl: pathaoApi.apiBaseUrl.trim(),
            storeId: pathaoApi.storeId.trim(),
            clientId: pathaoApi.clientId.trim(),
            clientSecret: pathaoApi.clientSecret.trim(),
            clientEmail: pathaoApi.clientEmail.trim(),
            clientPassword: pathaoApi.clientPassword.trim(),
          } satisfies PathaoApiConfig)
        : type === "STEADFAST"
        ? ({
            type: "STEADFAST",
            apiBaseUrl: steadfastApi.apiBaseUrl.trim(),
            apiKey: steadfastApi.apiKey.trim(),
            secretKey: steadfastApi.secretKey.trim(),
          } satisfies SteadfastApiConfig)
        : type === "REDX"
        ? ({
            type: "REDX",
            apiBaseUrl: redxApi.apiBaseUrl.trim(),
            storeId: redxApi.storeId.trim(),
            apiToken: redxApi.apiToken.trim(),
          } satisfies RedxApiConfig)
        : ({
            type: "PAPERFLY",
            apiBaseUrl: paperflyApi.apiBaseUrl.trim(),
            username: paperflyApi.username.trim(),
            password: paperflyApi.password.trim(),
            apiKey: paperflyApi.apiKey.trim(),
          } satisfies PaperflyApiConfig);

    const payload: CurrierRow = {
      id: initial?.id ?? Date.now(),
      name: name.trim(),
      description: description.trim(),
      type,
      active,
      defaultNote: defaultNote.trim(),
      logoUrl: logoPreviewUrl || undefined,
      api,
      createdAt: initial?.createdAt ?? nowText(),
      updatedAt: nowText(),
    };

    onSubmit(payload);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={titleText}
      description={
        mode === "create"
          ? "Save courier API credentials and enable/disable it anytime."
          : "Update courier API credentials and status."
      }
      size="xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!canSubmit}>
            {primaryText}
          </Button>
        </>
      }
    >
      {/* ✅ This is the fix: modal content scrolls if height > 800px */}
      <div className="max-h-[500px] overflow-y-auto pr-2">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* LEFT */}
          <div className="lg:col-span-8 space-y-6">
            {/* Basic info */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                Currier Information
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Name, description, provider type and status.
              </p>

              <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Courier Name <span className="text-error-500">*</span>
                  </p>
                  <Input value={name} onChange={(e) => setName(String(e.target.value))} placeholder="Stead Fast" />
                  {errors.name ? <p className="text-xs text-error-500">{errors.name}</p> : null}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description
                  </p>
                  <Input
                    value={description}
                    onChange={(e) => setDescription(String(e.target.value))}
                    placeholder="Enter courier description"
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Type
                  </p>
                  <Select
                    key={`type-${type}`}
                    options={TYPE_OPTIONS}
                    placeholder="Select type"
                    defaultValue={type}
                    onChange={(v) => setType(v as CurrierProviderType)}
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Active / Inactive
                  </p>
                  <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-800/40">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {active ? (
                          <ShieldCheck size={18} className="text-success-500" />
                        ) : (
                          <ShieldOff size={18} className="text-error-500" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {active ? "Enabled" : "Disabled"}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Disable to stop using this courier API.
                        </p>
                      </div>
                    </div>

                    <Switch label="" defaultChecked={active} onChange={(c) => setActive(c)} />
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Default Note
                  </p>
                  <Input
                    value={defaultNote}
                    onChange={(e) => setDefaultNote(String(e.target.value))}
                    placeholder="Enter default note for this courier..."
                  />
                </div>
              </div>
            </div>

            {/* API config - dynamic fields */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                API Configuration
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Fields auto change based on courier type.
              </p>

              {/* STEADFAST */}
              {type === "STEADFAST" ? (
                <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      API Base URL
                    </p>
                    <Input
                      value={steadfastApi.apiBaseUrl}
                      onChange={(e) =>
                        setSteadfastApi((p) => ({ ...p, apiBaseUrl: String(e.target.value) }))
                      }
                      placeholder="https://api.steadfast.com.bd/"
                    />
                    {errors.apiBaseUrl ? <p className="text-xs text-error-500">{errors.apiBaseUrl}</p> : null}
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      API Key
                    </p>
                    <Input
                      value={steadfastApi.apiKey}
                      onChange={(e) =>
                        setSteadfastApi((p) => ({ ...p, apiKey: String(e.target.value) }))
                      }
                      placeholder="API Key"
                    />
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Secret Key
                    </p>
                    <Input
                      value={steadfastApi.secretKey}
                      onChange={(e) =>
                        setSteadfastApi((p) => ({ ...p, secretKey: String(e.target.value) }))
                      }
                      placeholder="Secret Key"
                    />
                  </div>
                </div>
              ) : null}

              {/* REDX */}
              {type === "REDX" ? (
                <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      API Base URL
                    </p>
                    <Input
                      value={redxApi.apiBaseUrl}
                      onChange={(e) =>
                        setRedxApi((p) => ({ ...p, apiBaseUrl: String(e.target.value) }))
                      }
                      placeholder="https://api.redx.com.bd/"
                    />
                    {errors.apiBaseUrl ? <p className="text-xs text-error-500">{errors.apiBaseUrl}</p> : null}
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Store ID
                    </p>
                    <Input
                      value={redxApi.storeId}
                      onChange={(e) =>
                        setRedxApi((p) => ({ ...p, storeId: String(e.target.value) }))
                      }
                      placeholder="Store ID"
                    />
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      API Token
                    </p>
                    <Input
                      value={redxApi.apiToken}
                      onChange={(e) =>
                        setRedxApi((p) => ({ ...p, apiToken: String(e.target.value) }))
                      }
                      placeholder="API Token"
                    />
                  </div>
                </div>
              ) : null}

              {/* PATHAO */}
              {type === "PATHAO" ? (
                <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Pathao API Base URL
                    </p>
                    <Input
                      value={pathaoApi.apiBaseUrl}
                      onChange={(e) =>
                        setPathaoApi((p) => ({ ...p, apiBaseUrl: String(e.target.value) }))
                      }
                      placeholder="https://api.pathao.com/"
                    />
                    {errors.apiBaseUrl ? <p className="text-xs text-error-500">{errors.apiBaseUrl}</p> : null}
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Store ID
                    </p>
                    <Input
                      value={pathaoApi.storeId}
                      onChange={(e) =>
                        setPathaoApi((p) => ({ ...p, storeId: String(e.target.value) }))
                      }
                      placeholder="Store ID"
                    />
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Client ID
                    </p>
                    <Input
                      value={pathaoApi.clientId}
                      onChange={(e) =>
                        setPathaoApi((p) => ({ ...p, clientId: String(e.target.value) }))
                      }
                      placeholder="Client ID"
                    />
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Client Secret
                    </p>
                    <Input
                      value={pathaoApi.clientSecret}
                      onChange={(e) =>
                        setPathaoApi((p) => ({ ...p, clientSecret: String(e.target.value) }))
                      }
                      placeholder="Client Secret"
                    />
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Client Email
                    </p>
                    <Input
                      value={pathaoApi.clientEmail}
                      onChange={(e) =>
                        setPathaoApi((p) => ({ ...p, clientEmail: String(e.target.value) }))
                      }
                      placeholder="Client Email"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Client Password
                    </p>
                    <Input
                      value={pathaoApi.clientPassword}
                      onChange={(e) =>
                        setPathaoApi((p) => ({ ...p, clientPassword: String(e.target.value) }))
                      }
                      placeholder="Client Password"
                    />
                  </div>
                </div>
              ) : null}

              {/* PAPERFLY */}
              {type === "PAPERFLY" ? (
                <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      API Base URL
                    </p>
                    <Input
                      value={paperflyApi.apiBaseUrl}
                      onChange={(e) =>
                        setPaperflyApi((p) => ({ ...p, apiBaseUrl: String(e.target.value) }))
                      }
                      placeholder="https://api.paperfly.com.bd/"
                    />
                    {errors.apiBaseUrl ? <p className="text-xs text-error-500">{errors.apiBaseUrl}</p> : null}
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Username
                    </p>
                    <Input
                      value={paperflyApi.username}
                      onChange={(e) =>
                        setPaperflyApi((p) => ({ ...p, username: String(e.target.value) }))
                      }
                      placeholder="Username"
                    />
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Password
                    </p>
                    <Input
                      value={paperflyApi.password}
                      onChange={(e) =>
                        setPaperflyApi((p) => ({ ...p, password: String(e.target.value) }))
                      }
                      placeholder="Password"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      API Key
                    </p>
                    <Input
                      value={paperflyApi.apiKey}
                      onChange={(e) =>
                        setPaperflyApi((p) => ({ ...p, apiKey: String(e.target.value) }))
                      }
                      placeholder="API Key"
                    />
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {/* RIGHT */}
          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                Currier Logo
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Optional logo for card display.
              </p>

              <div className="mt-4 flex items-center gap-4">
                <div className="h-14 w-14 overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/40 flex items-center justify-center">
                  {logoPreviewUrl ? (
                    <img
                      src={logoPreviewUrl}
                      alt="Logo preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="text-gray-400" size={18} />
                  )}
                </div>

                <div className="flex flex-wrap gap-3">
                  <label className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-white/[0.03]">
                    Upload
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => {
                        const f = e.target.files?.[0] ?? null;
                        setLogoFile(f);
                        if (!f) return;

                        if (logoPreviewUrl.startsWith("blob:")) {
                          URL.revokeObjectURL(logoPreviewUrl);
                        }
                        const url = URL.createObjectURL(f);
                        setLogoPreviewUrl(url);
                      }}
                    />
                  </label>

                  <Button
                    variant="outline"
                    onClick={() => {
                      setLogoFile(null);
                      if (logoPreviewUrl.startsWith("blob:")) {
                        URL.revokeObjectURL(logoPreviewUrl);
                      }
                      setLogoPreviewUrl("");
                    }}
                  >
                    Remove
                  </Button>
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/40">
                <p className="text-xs text-gray-500 dark:text-gray-400">Preview</p>
                <p className="mt-2 text-base font-semibold text-gray-900 dark:text-white">
                  {name.trim() || "—"}
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Type:{" "}
                  <span className="font-semibold text-gray-700 dark:text-gray-200">
                    {type}
                  </span>
                </p>

                <div className="mt-3">
                  <span
                    className={[
                      "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
                      active
                        ? "bg-success-500/10 text-success-600 dark:text-success-400"
                        : "bg-error-500/10 text-error-600 dark:text-error-300",
                    ].join(" ")}
                  >
                    {active ? "ACTIVE" : "INACTIVE"}
                  </span>
                </div>
              </div>

              {logoFile ? (
                <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                  Selected: <span className="font-semibold">{logoFile.name}</span>
                </div>
              ) : null}
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 text-xs text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                Security Notice
              </p>
              <p className="mt-2">
                UI demo stores credentials in memory. Real app should store securely on backend.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
