import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, Check, ChevronDown, ImagePlus, RefreshCw, Search, X } from "lucide-react";
import {
  useCreateAnnouncement, useEditAnnouncement, useAnnouncementById, useCityZones,
} from "@/hooks/useAnnouncements";
import type { AnnouncementChannel, AnnouncementStatus, AnnouncementTargetType, AnnouncementZoneScope } from "@/api/announcements.api";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import PageMeta from "@/components/common/PageMeta";

/** Inline searchable city multi-select — sourced from location_mappings via useCityZones */
function ZonePicker({
  cities,
  selected,
  onToggle,
  isSyncing,
}: {
  cities: string[];
  selected: string[];
  onToggle: (city: string) => void;
  isSyncing: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const lower = q.toLowerCase().trim();
    return lower ? cities.filter((c) => c.toLowerCase().includes(lower)) : cities;
  }, [cities, q]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const label = selected.length === 0
    ? "Select zones…"
    : `${selected.length} zone${selected.length > 1 ? "s" : ""} selected`;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => { setOpen((p) => !p); }}
        className="flex w-full items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-800 dark:bg-gray-900 dark:text-white hover:border-gray-400 transition-colors"
      >
        <Search size={13} className="shrink-0 text-gray-400" />
        <span className={`flex-1 text-left ${selected.length ? "text-gray-900 dark:text-white" : "text-gray-400"}`}>{label}</span>
        <ChevronDown size={13} className={`shrink-0 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-950">
          {/* Search within dropdown */}
          <div className="border-b border-gray-100 p-2 dark:border-gray-800">
            <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-1.5 dark:bg-gray-900">
              <Search size={12} className="text-gray-400" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search city…"
                className="flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400 dark:text-gray-200"
              />
              {q && <button onClick={() => setQ("")}><X size={11} className="text-gray-400" /></button>}
            </div>
          </div>

          <div className="max-h-56 overflow-y-auto">
            {isSyncing ? (
              <p className="py-4 text-center text-xs text-gray-400">Loading zones…</p>
            ) : filtered.length === 0 ? (
              <p className="py-4 text-center text-xs text-gray-400">No zones found</p>
            ) : (
              filtered.map((city) => {
                const isSelected = selected.includes(city);
                return (
                  <button
                    key={city}
                    type="button"
                    onClick={() => onToggle(city)}
                    className={`flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors hover:bg-brand-50 dark:hover:bg-brand-500/10 ${
                      isSelected ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400" : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                      isSelected ? "border-brand-500 bg-brand-500" : "border-gray-300 dark:border-gray-600"
                    }`}>
                      {isSelected && <Check size={10} className="text-white" />}
                    </span>
                    {city}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}


type FormState = {
  headline: string;
  body: string;
  channel: AnnouncementChannel;
  target_type: AnnouncementTargetType;
  zone_scope: AnnouncementZoneScope;
  zones: string[];
  status: AnnouncementStatus;
  scheduled_at: string;
};

const EMPTY_FORM: FormState = {
  headline: "",
  body: "",
  channel: "email",
  target_type: "all",
  zone_scope: "all",
  zones: [],
  status: "draft",
  scheduled_at: "",
};

interface Props {
  edit?: boolean;
}

export default function CreateAnnouncementPage({ edit }: Props) {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const announcementId = id ? parseInt(id, 10) : null;

  const { data: existingData, isLoading: existingLoading } = useAnnouncementById(
    edit && announcementId ? announcementId : null
  );

  const createMutation = useCreateAnnouncement();
  const editMutation = useEditAnnouncement();
  const { cities: liveCities, isSyncing, sync: syncZones } = useCityZones();

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Populate form when editing
  useEffect(() => {
    if (edit && existingData?.data) {
      const d = existingData.data;
      setForm({
        headline: d.headline,
        body: d.body,
        channel: d.channel,
        target_type: d.target_type,
        zone_scope: d.zone_scope,
        zones: d.zones.map((z) => z.city_name),
        status: d.status,
        scheduled_at: d.scheduled_at ? new Date(d.scheduled_at).toISOString().slice(0, 16) : "",
      });
    }
  }, [edit, existingData]);

  const set = <K extends keyof FormState>(key: K, val: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: val }));

  const addZone = (zone: string) => {
    const trimmed = zone.trim();
    if (trimmed && !form.zones.includes(trimmed))
      setForm((f) => ({ ...f, zones: [...f.zones, trimmed] }));
  };
  const removeZone = (z: string) => setForm((f) => ({ ...f, zones: f.zones.filter((x) => x !== z) }));

  const handleImage = (file: File | null) => {
    setImageFile(file);
    if (file) setImagePreview(URL.createObjectURL(file));
    else setImagePreview("");
  };

  const buildFormData = () => {
    const fd = new FormData();
    fd.append("headline", form.headline);
    fd.append("body", form.body);
    fd.append("channel", form.channel);
    fd.append("target_type", form.target_type);
    fd.append("zone_scope", form.zone_scope);
    fd.append("status", form.status);
    if (form.status === "scheduled" && form.scheduled_at)
      fd.append("scheduled_at", new Date(form.scheduled_at).toISOString());
    if (form.zone_scope === "selected" && form.zones.length)
      fd.append("zones", JSON.stringify(form.zones));
    if (imageFile) fd.append("announcement_image", imageFile);
    return fd;
  };

  const handleSave = async () => {
    if (!form.headline.trim() || !form.body.trim()) {
      toast.error("Headline and body are required."); return;
    }
    if (form.status === "scheduled" && !form.scheduled_at) {
      toast.error("Please set a scheduled date/time."); return;
    }
    setSaving(true);
    try {
      if (edit && announcementId) {
        await editMutation.mutateAsync({ id: announcementId, formData: buildFormData() });
        toast.success("Announcement updated.");
      } else {
        await createMutation.mutateAsync(buildFormData());
        toast.success("Announcement created.");
      }
      navigate("/announcements");
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  if (edit && existingLoading) return <p className="p-8 text-sm text-gray-400">Loading...</p>;

  return (
    <>
      <PageMeta
        title={edit ? "Edit Announcement" : "Create Announcement"}
        description="Compose an announcement to send to customers via email, SMS, or both"
      />

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate("/announcements")}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300">
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {edit ? "Edit Announcement" : "Create Announcement"}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {edit ? "Modify and re-use as a new send or save changes." : "Draft a new email, SMS, or both announcement."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main form — 2/3 width */}
        <div className="space-y-5 lg:col-span-2">
          {/* Headline */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="headline">Headline <span className="text-error-500">*</span></Label>
              <input id="headline" value={form.headline} onChange={(e: React.ChangeEvent<HTMLInputElement>) => set("headline", e.target.value)} placeholder="e.g. Eid Special Offer — 25% Off!" className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-800 dark:bg-gray-900 dark:text-white focus:border-brand-500 focus:outline-none" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="body">Body Message <span className="text-error-500">*</span></Label>
              <textarea
                id="body" rows={8} value={form.body}
                onChange={(e) => set("body", e.target.value)}
                placeholder="Write your announcement message here..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm dark:border-gray-800 dark:bg-gray-800/40 dark:text-gray-200 focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Channel — v2 NEW */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 space-y-3">
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Delivery Channel</p>
              <p className="text-xs text-gray-500 mt-0.5">Choose how to deliver this announcement. <span className="text-brand-500 font-medium">New in v2.</span></p>
            </div>
            <div className="flex flex-wrap gap-3">
              {(["email", "sms", "both"] as AnnouncementChannel[]).map((ch) => (
                <button key={ch} type="button" onClick={() => set("channel", ch)}
                  className={`flex-1 min-w-[120px] rounded-xl border-2 px-4 py-3 text-sm font-medium capitalize transition-colors ${form.channel === ch ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300" : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400"}`}>
                  {ch === "email" ? "📧 Email" : ch === "sms" ? "💬 SMS" : "📧 + 💬 Both"}
                </button>
              ))}
            </div>
          </div>

          {/* Image upload */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 space-y-3">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Announcement Image (Optional)</p>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImage(e.target.files?.[0] ?? null)} />
            {imagePreview ? (
              <div className="relative w-full max-w-sm">
                <img src={imagePreview} alt="preview" className="rounded-xl w-full h-40 object-cover" />
                <button onClick={() => handleImage(null)}
                  className="absolute top-2 right-2 h-7 w-7 flex items-center justify-center rounded-full bg-error-500 text-white hover:bg-error-600 shadow">
                  <X size={13} />
                </button>
              </div>
            ) : (
              <button onClick={() => fileRef.current?.click()}
                className="flex items-center gap-2 rounded-xl border-2 border-dashed border-gray-200 px-5 py-4 text-sm text-gray-500 hover:border-brand-400 hover:text-brand-500 transition-colors dark:border-gray-700">
                <ImagePlus size={18} /> Upload image
              </button>
            )}
          </div>
        </div>

        {/* Sidebar settings — 1/3 width */}
        <div className="space-y-5">
          {/* Status & Schedule */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 space-y-4">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Status & Schedule</p>
            <div className="space-y-2">
              <Label>Status</Label>
              <select value={form.status} onChange={(e) => set("status", e.target.value as AnnouncementStatus)}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-800 dark:bg-gray-900 dark:text-white">
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            {form.status === "scheduled" && (
              <div className="space-y-2">
                <Label htmlFor="scheduled_at">Scheduled At <span className="text-error-500">*</span></Label>
                <input type="datetime-local" id="scheduled_at" value={form.scheduled_at}
                  onChange={(e) => set("scheduled_at", e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-800 dark:bg-gray-900 dark:text-white" />
              </div>
            )}
          </div>

          {/* Audience */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 space-y-4">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Target Audience</p>
            <div className="space-y-2">
              <Label>Target Type</Label>
              <select value={form.target_type} onChange={(e) => set("target_type", e.target.value as AnnouncementTargetType)}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-800 dark:bg-gray-900 dark:text-white">
                <option value="all">All</option>
                <option value="subscribed_only">Subscribed Only</option>
                <option value="registered_users_only">Registered Users Only</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Zone Scope</Label>
              <select value={form.zone_scope} onChange={(e) => set("zone_scope", e.target.value as AnnouncementZoneScope)}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-800 dark:bg-gray-900 dark:text-white">
                <option value="all">All Zones</option>
                <option value="selected">Selected Zones</option>
              </select>
            </div>

            {form.zone_scope === "selected" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Zones</Label>
                  <button
                    type="button"
                    onClick={() => syncZones()}
                    disabled={isSyncing}
                    title="Sync latest zones from location_mappings"
                    className="inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs text-gray-500 hover:text-brand-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw size={11} className={isSyncing ? "animate-spin" : ""} />
                    Sync zones
                  </button>
                </div>

                {/* Searchable zone dropdown */}
                <ZonePicker
                  cities={liveCities}
                  selected={form.zones}
                  onToggle={(city) => form.zones.includes(city) ? removeZone(city) : addZone(city)}
                  isSyncing={isSyncing}
                />

                {/* Selected zone chips */}
                {form.zones.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {form.zones.map((z) => (
                      <span key={z} className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-500/10 dark:text-brand-400">
                        {z}
                        <button type="button" onClick={() => removeZone(z)} className="ml-0.5 hover:text-error-500">×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Save */}
          <div className="flex flex-col gap-3">
            <Button size="lg" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : edit ? "Update Announcement" : "Create Announcement"}
            </Button>
            <Button variant="outline" onClick={() => navigate("/announcements")}>Cancel</Button>
          </div>
        </div>
      </div>
    </>
  );
}
