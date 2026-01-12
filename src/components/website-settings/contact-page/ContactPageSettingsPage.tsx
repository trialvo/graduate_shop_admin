import React, { useMemo, useState } from "react";
import {
  Copy,
  ExternalLink,
  Mail,
  MapPin,
  Phone,
  Plus,
  RefreshCw,
  Save,
  Trash2,
} from "lucide-react";

import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Switch from "@/components/form/switch/Switch";

import { INITIAL_CONTACT_SETTINGS } from "./mockData";
import type {
  BusinessHourRow,
  ContactFieldKey,
  ContactPageSettings,
  SocialKey,
} from "./types";

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(16).slice(2)}-${Date.now()}`;
}

function safeCopy(text: string) {
  try {
    void navigator.clipboard.writeText(text);
  } catch {
    // ignore
  }
}

const FIELD_ORDER: ContactFieldKey[] = [
  "firstName",
  "lastName",
  "mobile",
  "email",
  "subject",
  "message",
];

const SOCIAL_ICONS: Record<SocialKey, React.ReactNode> = {
  facebook: <span className="text-xs font-semibold">f</span>,
  instagram: <span className="text-xs font-semibold">IG</span>,
  whatsapp: <span className="text-xs font-semibold">WA</span>,
  tiktok: <span className="text-xs font-semibold">TT</span>,
  youtube: <span className="text-xs font-semibold">YT</span>,
  x: <span className="text-xs font-semibold">X</span>,
};

export default function ContactPageSettingsPage() {
  const [settings, setSettings] = useState<ContactPageSettings>(
    INITIAL_CONTACT_SETTINGS
  );
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const enabledSocials = useMemo(
    () => settings.socialLinks.filter((s) => s.enabled),
    [settings.socialLinks]
  );

  const onReset = () => {
    setSettings(INITIAL_CONTACT_SETTINGS);
    setLastSavedAt(null);
  };

  const onSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 450));
    console.log("CONTACT_PAGE_SETTINGS_SAVE", settings);
    setLastSavedAt(new Date().toLocaleString());
    setSaving(false);
  };

  const updateContactInfo = (
    key: keyof ContactPageSettings["contactInfo"],
    value: string
  ) => {
    setSettings((p) => ({
      ...p,
      contactInfo: { ...p.contactInfo, [key]: value },
    }));
  };

  const updateContactFormTop = (
    key: keyof ContactPageSettings["contactForm"],
    value: string
  ) => {
    setSettings((p) => ({
      ...p,
      contactForm: { ...p.contactForm, [key]: value },
    }));
  };

  const updateField = (
    field: ContactFieldKey,
    patch: Partial<ContactPageSettings["contactForm"]["fields"][ContactFieldKey]>
  ) => {
    setSettings((p) => ({
      ...p,
      contactForm: {
        ...p.contactForm,
        fields: {
          ...p.contactForm.fields,
          [field]: { ...p.contactForm.fields[field], ...patch },
        },
      },
    }));
  };

  // Phones
  const addPhone = () => {
    setSettings((p) => ({
      ...p,
      contactInfo: {
        ...p.contactInfo,
        phones: [...p.contactInfo.phones, ""],
      },
    }));
  };

  const updatePhone = (idx: number, value: string) => {
    setSettings((p) => ({
      ...p,
      contactInfo: {
        ...p.contactInfo,
        phones: p.contactInfo.phones.map((x, i) => (i === idx ? value : x)),
      },
    }));
  };

  const removePhone = (idx: number) => {
    setSettings((p) => ({
      ...p,
      contactInfo: {
        ...p.contactInfo,
        phones: p.contactInfo.phones.filter((_, i) => i !== idx),
      },
    }));
  };

  // Emails
  const addEmail = () => {
    setSettings((p) => ({
      ...p,
      contactInfo: {
        ...p.contactInfo,
        emails: [...p.contactInfo.emails, ""],
      },
    }));
  };

  const updateEmail = (idx: number, value: string) => {
    setSettings((p) => ({
      ...p,
      contactInfo: {
        ...p.contactInfo,
        emails: p.contactInfo.emails.map((x, i) => (i === idx ? value : x)),
      },
    }));
  };

  const removeEmail = (idx: number) => {
    setSettings((p) => ({
      ...p,
      contactInfo: {
        ...p.contactInfo,
        emails: p.contactInfo.emails.filter((_, i) => i !== idx),
      },
    }));
  };

  // Recipients
  const addRecipient = () => {
    setSettings((p) => ({
      ...p,
      contactForm: {
        ...p.contactForm,
        recipientEmails: [...p.contactForm.recipientEmails, ""],
      },
    }));
  };

  const updateRecipient = (idx: number, value: string) => {
    setSettings((p) => ({
      ...p,
      contactForm: {
        ...p.contactForm,
        recipientEmails: p.contactForm.recipientEmails.map((x, i) =>
          i === idx ? value : x
        ),
      },
    }));
  };

  const removeRecipient = (idx: number) => {
    setSettings((p) => ({
      ...p,
      contactForm: {
        ...p.contactForm,
        recipientEmails: p.contactForm.recipientEmails.filter((_, i) => i !== idx),
      },
    }));
  };

  // Business Hours
  const addBusinessRow = () => {
    const row: BusinessHourRow = {
      id: uid("bh"),
      label: "New Row",
      time: "10:00 AM - 10:00 PM",
      enabled: true,
    };
    setSettings((p) => ({
      ...p,
      contactInfo: {
        ...p.contactInfo,
        businessRows: [row, ...p.contactInfo.businessRows],
      },
    }));
  };

  const updateBusinessRow = (id: string, patch: Partial<BusinessHourRow>) => {
    setSettings((p) => ({
      ...p,
      contactInfo: {
        ...p.contactInfo,
        businessRows: p.contactInfo.businessRows.map((r) =>
          r.id === id ? { ...r, ...patch } : r
        ),
      },
    }));
  };

  const removeBusinessRow = (id: string) => {
    setSettings((p) => ({
      ...p,
      contactInfo: {
        ...p.contactInfo,
        businessRows: p.contactInfo.businessRows.filter((r) => r.id !== id),
      },
    }));
  };

  // Social
  const updateSocial = (
    key: SocialKey,
    patch: { url?: string; enabled?: boolean; label?: string }
  ) => {
    setSettings((p) => ({
      ...p,
      socialLinks: p.socialLinks.map((s) =>
        s.key === key ? { ...s, ...patch } : s
      ),
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Contact Page
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Configure your storefront contact section (address, phone, email,
            business hours, social links and map).
          </p>
          {lastSavedAt ? (
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Last saved: {lastSavedAt}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button
            variant="outline"
            startIcon={<RefreshCw size={16} />}
            onClick={onReset}
          >
            Reset
          </Button>

          <Button
            startIcon={<Save size={16} />}
            onClick={onSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* LEFT: SETTINGS */}
        <div className="space-y-6">
          {/* Page Intro */}
          <div className="rounded-[4px] border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Page Intro
            </h2>

            <div className="mt-5 grid grid-cols-1 gap-5">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Heading
                </p>
                <Input
                  value={settings.contactInfo.heading}
                  onChange={(e) => updateContactInfo("heading", e.target.value)}
                  placeholder="Get in Touch"
                />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Sub Heading
                </p>
                <TextArea
                  value={settings.contactInfo.subHeading}
                  onChange={(v) => updateContactInfo("subHeading", v)}
                  placeholder="Short description..."
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="rounded-[4px] border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Contact Information
            </h2>

            <div className="mt-5 space-y-5">
              {/* Address */}
              <div className="rounded-[4px] border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-brand-500" />
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    Address
                  </p>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      Title
                    </p>
                    <Input
                      value={settings.contactInfo.addressTitle}
                      onChange={(e) =>
                        updateContactInfo("addressTitle", e.target.value)
                      }
                      placeholder="Shop & Display Center Address"
                    />
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      Address Text
                    </p>
                    <TextArea
                      value={settings.contactInfo.addressText}
                      onChange={(v) => updateContactInfo("addressText", v)}
                      placeholder="House, Road, Sector..."
                    />
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      Note
                    </p>
                    <Input
                      value={settings.contactInfo.addressNote}
                      onChange={(e) =>
                        updateContactInfo("addressNote", e.target.value)
                      }
                      placeholder="(10am-10pm, Open Everyday)"
                    />
                  </div>
                </div>
              </div>

              {/* Phone */}
              <div className="rounded-[4px] border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Phone size={16} className="text-brand-500" />
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      Phone
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    startIcon={<Plus size={16} />}
                    onClick={addPhone}
                  >
                    Add
                  </Button>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3">
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      Title
                    </p>
                    <Input
                      value={settings.contactInfo.callTitle}
                      onChange={(e) =>
                        updateContactInfo("callTitle", e.target.value)
                      }
                      placeholder="Call Us"
                    />
                  </div>

                  {settings.contactInfo.phones.map((p, idx) => (
                    <div key={`phone-${idx}`} className="flex items-center gap-2">
                      <Input
                        value={p}
                        onChange={(e) => updatePhone(idx, e.target.value)}
                        placeholder="+8801XXXXXXXXX"
                      />
                      <button
                        type="button"
                        className="inline-flex h-11 w-11 items-center justify-center rounded-[4px] border border-error-200 bg-white text-error-600 shadow-theme-xs hover:bg-error-50 dark:border-error-900/40 dark:bg-gray-900 dark:text-error-400 dark:hover:bg-error-500/10"
                        onClick={() => removePhone(idx)}
                        aria-label="Remove phone"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}

                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      Note
                    </p>
                    <Input
                      value={settings.contactInfo.callNote}
                      onChange={(e) => updateContactInfo("callNote", e.target.value)}
                      placeholder="(10am-10pm, Open Everyday)"
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="rounded-[4px] border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Mail size={16} className="text-brand-500" />
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      Email
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    startIcon={<Plus size={16} />}
                    onClick={addEmail}
                  >
                    Add
                  </Button>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3">
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      Title
                    </p>
                    <Input
                      value={settings.contactInfo.mailTitle}
                      onChange={(e) => updateContactInfo("mailTitle", e.target.value)}
                      placeholder="Mail Us"
                    />
                  </div>

                  {settings.contactInfo.emails.map((m, idx) => (
                    <div key={`email-${idx}`} className="flex items-center gap-2">
                      <Input
                        value={m}
                        onChange={(e) => updateEmail(idx, e.target.value)}
                        placeholder="support@yourshop.com"
                      />
                      <button
                        type="button"
                        className="inline-flex h-11 w-11 items-center justify-center rounded-[4px] border border-error-200 bg-white text-error-600 shadow-theme-xs hover:bg-error-50 dark:border-error-900/40 dark:bg-gray-900 dark:text-error-400 dark:hover:bg-error-500/10"
                        onClick={() => removeEmail(idx)}
                        aria-label="Remove email"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Business hours */}
              <div className="rounded-[4px] border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      Business Hours
                    </p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Add rows like “Online Operations”, “Everyday”, “Closed Tuesday”, etc.
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    startIcon={<Plus size={16} />}
                    onClick={addBusinessRow}
                  >
                    Add Row
                  </Button>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      Title
                    </p>
                    <Input
                      value={settings.contactInfo.businessTitle}
                      onChange={(e) =>
                        updateContactInfo("businessTitle", e.target.value)
                      }
                      placeholder="Business Hours"
                    />
                  </div>

                  {settings.contactInfo.businessRows.map((r) => (
                    <div
                      key={r.id}
                      className="rounded-[4px] border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                          Row
                        </p>
                        <div className="flex items-center gap-2">
                          <Switch
                            label=""
                            defaultChecked={r.enabled}
                            onChange={(checked) =>
                              updateBusinessRow(r.id, { enabled: checked })
                            }
                          />
                          <button
                            type="button"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-error-200 bg-white text-error-600 shadow-theme-xs hover:bg-error-50 dark:border-error-900/40 dark:bg-gray-900 dark:text-error-400 dark:hover:bg-error-500/10"
                            onClick={() => removeBusinessRow(r.id)}
                            aria-label="Remove row"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                            Label
                          </p>
                          <Input
                            value={r.label}
                            onChange={(e) =>
                              updateBusinessRow(r.id, { label: e.target.value })
                            }
                            placeholder="Everyday (7 Days a Week)"
                          />
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                            Time (optional)
                          </p>
                          <Input
                            value={r.time}
                            onChange={(e) =>
                              updateBusinessRow(r.id, { time: e.target.value })
                            }
                            placeholder="10:00 AM - 11:00 PM"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      Footer Note (optional)
                    </p>
                    <Input
                      value={settings.contactInfo.businessFooterNote}
                      onChange={(e) =>
                        updateContactInfo("businessFooterNote", e.target.value)
                      }
                      placeholder="Example: Closed on Tuesday"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="rounded-[4px] border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Follow Us
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Enable / disable social buttons and update URLs.
            </p>

            <div className="mt-5 space-y-3">
              {settings.socialLinks.map((s) => (
                <div
                  key={s.key}
                  className="rounded-[4px] border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-[4px] border border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-200">
                        {SOCIAL_ICONS[s.key]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {s.label}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {s.key}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 md:justify-end">
                      <Switch
                        label=""
                        defaultChecked={s.enabled}
                        onChange={(checked) =>
                          updateSocial(s.key, { enabled: checked })
                        }
                      />

                      <Button
                        variant="outline"
                        startIcon={<ExternalLink size={16} />}
                        onClick={() => {
                          if (s.url) window.open(s.url, "_blank", "noreferrer");
                        }}
                        disabled={!s.url}
                      >
                        Open
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        Label
                      </p>
                      <Input
                        value={s.label}
                        onChange={(e) =>
                          updateSocial(s.key, { label: e.target.value })
                        }
                        placeholder="Facebook"
                      />
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        URL
                      </p>
                      <Input
                        value={s.url}
                        onChange={(e) =>
                          updateSocial(s.key, { url: e.target.value })
                        }
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Map */}
          <div className="rounded-[4px] border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Map
            </h2>

            <div className="mt-5 grid grid-cols-1 gap-5">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Map Title
                </p>
                <Input
                  value={settings.contactInfo.mapTitle}
                  onChange={(e) => updateContactInfo("mapTitle", e.target.value)}
                  placeholder="Find Us"
                />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Map Subtitle
                </p>
                <Input
                  value={settings.contactInfo.mapSubTitle}
                  onChange={(e) =>
                    updateContactInfo("mapSubTitle", e.target.value)
                  }
                  placeholder="Visit our shop..."
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Google Map Embed URL
                  </p>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-white/[0.03]"
                    onClick={() => safeCopy(settings.contactInfo.mapEmbedUrl)}
                  >
                    <Copy size={14} /> Copy
                  </button>
                </div>
                <Input
                  value={settings.contactInfo.mapEmbedUrl}
                  onChange={(e) => updateContactInfo("mapEmbedUrl", e.target.value)}
                  placeholder="https://www.google.com/maps?q=...&output=embed"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Tip: Google Maps → Share → Embed a map URL.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="rounded-[4px] border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Contact Form
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Control fields, required validation and message recipient emails.
            </p>

            <div className="mt-5 grid grid-cols-1 gap-5">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Form Title
                </p>
                <Input
                  value={settings.contactForm.title}
                  onChange={(e) => updateContactFormTop("title", e.target.value)}
                  placeholder="Send us a Message"
                />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Success Message
                </p>
                <TextArea
                  value={settings.contactForm.successMessage}
                  onChange={(v) => updateContactFormTop("successMessage", v)}
                  placeholder="Message to show after successful submission..."
                />
              </div>

              {/* Fields */}
              <div className="rounded-[4px] border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  Fields
                </p>

                <div className="mt-4 space-y-3">
                  {FIELD_ORDER.map((key) => {
                    const f = settings.contactForm.fields[key];
                    return (
                      <div
                        key={key}
                        className="rounded-[4px] border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
                      >
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {f.label}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {key}
                            </p>
                          </div>

                          <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                Enabled
                              </p>
                              <Switch
                                label=""
                                defaultChecked={f.enabled}
                                onChange={(checked) =>
                                  updateField(key, { enabled: checked })
                                }
                              />
                            </div>

                            <div className="flex items-center gap-2">
                              <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                Required
                              </p>
                              <Switch
                                label=""
                                defaultChecked={f.required}
                                onChange={(checked) =>
                                  updateField(key, { required: checked })
                                }
                              />
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                              Label
                            </p>
                            <Input
                              value={f.label}
                              onChange={(e) =>
                                updateField(key, { label: e.target.value })
                              }
                              placeholder="Label"
                            />
                          </div>

                          <div className="space-y-2">
                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                              Placeholder
                            </p>
                            <Input
                              value={f.placeholder}
                              onChange={(e) =>
                                updateField(key, { placeholder: e.target.value })
                              }
                              placeholder="Placeholder"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recipient Emails */}
              <div className="rounded-[4px] border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      Recipient Emails
                    </p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Contact form submissions will be routed to these emails (backend needed).
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    startIcon={<Plus size={16} />}
                    onClick={addRecipient}
                  >
                    Add
                  </Button>
                </div>

                <div className="mt-4 space-y-3">
                  {settings.contactForm.recipientEmails.map((r, idx) => (
                    <div key={`rcpt-${idx}`} className="flex items-center gap-2">
                      <Input
                        value={r}
                        onChange={(e) => updateRecipient(idx, e.target.value)}
                        placeholder="support@yourshop.com"
                      />
                      <button
                        type="button"
                        className="inline-flex h-11 w-11 items-center justify-center rounded-[4px] border border-error-200 bg-white text-error-600 shadow-theme-xs hover:bg-error-50 dark:border-error-900/40 dark:bg-gray-900 dark:text-error-400 dark:hover:bg-error-500/10"
                        onClick={() => removeRecipient(idx)}
                        aria-label="Remove recipient"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: LIVE PREVIEW */}
        <div className="space-y-6">
          <div className="rounded-[4px] border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                  Live Preview
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Preview how your storefront contact page can look.
                </p>
              </div>

              <Button
                variant="outline"
                startIcon={<ExternalLink size={16} />}
                onClick={() => console.log("Open storefront preview")}
              >
                Preview
              </Button>
            </div>

            <div className="mt-6 rounded-[4px] border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <div>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {settings.contactInfo.heading}
                </p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {settings.contactInfo.subHeading}
                </p>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Contact form preview */}
                <div className="rounded-[4px] border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
                  <p className="flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-white">
                    <Mail size={18} className="text-brand-500" /> {settings.contactForm.title}
                  </p>

                  <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                    {FIELD_ORDER.filter(
                      (k) =>
                        settings.contactForm.fields[k].enabled &&
                        (k === "firstName" ||
                          k === "lastName" ||
                          k === "mobile" ||
                          k === "email")
                    ).map((k) => {
                      const f = settings.contactForm.fields[k];
                      return (
                        <div key={k} className="space-y-2">
                          <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                            {f.label}{" "}
                            {f.required ? (
                              <span className="text-error-500">*</span>
                            ) : null}
                          </p>
                          <Input value="" onChange={() => {}} placeholder={f.placeholder} />
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4 space-y-2">
                    {(["subject", "message"] as ContactFieldKey[]).map((key) => {
                      const f = settings.contactForm.fields[key];
                      if (!f.enabled) return null;

                      return (
                        <div key={key} className="space-y-2">
                          <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                            {f.label}{" "}
                            {f.required ? (
                              <span className="text-error-500">*</span>
                            ) : null}
                          </p>
                          {key === "message" ? (
                            <TextArea value="" onChange={() => {}} placeholder={f.placeholder} />
                          ) : (
                            <Input value="" onChange={() => {}} placeholder={f.placeholder} />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
                    <Button variant="outline">Cancel</Button>
                    <Button>Send Message</Button>
                  </div>
                </div>

                {/* Contact info preview */}
                <div className="rounded-[4px] border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
                  <p className="flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-white">
                    <MapPin size={18} className="text-brand-500" /> Contact Information
                  </p>

                  <div className="mt-5 space-y-4">
                    <div className="rounded-[4px] border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {settings.contactInfo.addressTitle}
                      </p>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {settings.contactInfo.addressText}
                      </p>
                      {settings.contactInfo.addressNote ? (
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          {settings.contactInfo.addressNote}
                        </p>
                      ) : null}
                    </div>

                    <div className="rounded-[4px] border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {settings.contactInfo.callTitle}
                      </p>
                      <div className="mt-2 space-y-1">
                        {settings.contactInfo.phones.filter(Boolean).map((p) => (
                          <p key={p} className="text-sm text-gray-500 dark:text-gray-400">
                            {p}
                          </p>
                        ))}
                      </div>
                      {settings.contactInfo.callNote ? (
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          {settings.contactInfo.callNote}
                        </p>
                      ) : null}
                    </div>

                    <div className="rounded-[4px] border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {settings.contactInfo.mailTitle}
                      </p>
                      <div className="mt-2 space-y-1">
                        {settings.contactInfo.emails.filter(Boolean).map((m) => (
                          <p key={m} className="text-sm text-gray-500 dark:text-gray-400">
                            {m}
                          </p>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-[4px] border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {settings.contactInfo.businessTitle}
                      </p>
                      <div className="mt-2 space-y-1">
                        {settings.contactInfo.businessRows
                          .filter((r) => r.enabled)
                          .map((r) => (
                            <p
                              key={r.id}
                              className="text-sm text-gray-500 dark:text-gray-400"
                            >
                              <span className="font-medium text-gray-700 dark:text-gray-300">
                                {r.label}
                              </span>
                              {r.time ? `: ${r.time}` : ""}
                            </p>
                          ))}
                      </div>
                      {settings.contactInfo.businessFooterNote ? (
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          {settings.contactInfo.businessFooterNote}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Preview */}
              <div className="mt-6 rounded-[4px] border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
                <p className="text-base font-semibold text-gray-900 dark:text-white">
                  Follow Us
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  {enabledSocials.length ? (
                    enabledSocials.map((s) => (
                      <a
                        key={s.key}
                        href={s.url || "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-[4px] border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-white/[0.03]"
                      >
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800">
                          {SOCIAL_ICONS[s.key]}
                        </span>
                        {s.label}
                      </a>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No social links enabled.
                    </p>
                  )}
                </div>
              </div>

              {/* Map Preview */}
              <div className="mt-6 rounded-[4px] border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-gray-900 dark:text-white">
                      {settings.contactInfo.mapTitle}
                    </p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {settings.contactInfo.mapSubTitle}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    startIcon={<ExternalLink size={16} />}
                    onClick={() => {
                      if (settings.contactInfo.mapEmbedUrl) {
                        window.open(settings.contactInfo.mapEmbedUrl, "_blank", "noreferrer");
                      }
                    }}
                    disabled={!settings.contactInfo.mapEmbedUrl}
                  >
                    Open
                  </Button>
                </div>

                <div className="mt-4 overflow-hidden rounded-[4px] border border-gray-200 dark:border-gray-800">
                  <iframe
                    title="map"
                    src={settings.contactInfo.mapEmbedUrl}
                    className="h-[340px] w-full"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Helper */}
          <div className="rounded-[4px] border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              ✅ Backend ready: Save the settings in DB and load them in your storefront Contact page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
