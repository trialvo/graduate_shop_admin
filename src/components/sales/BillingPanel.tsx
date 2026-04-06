import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Trash2,
  ChevronLeft,
  ChevronRight,
  User2,
  Mail,
  Phone,
  MapPin,
  Receipt,
  Truck,
  ShoppingCart,
  CreditCard,
  StickyNote,
  Ticket,
  CheckCircle2,
  Plus,
} from "lucide-react";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";

import Button from "@/components/ui/button/Button";
import AddCustomerModal from "./AddCustomerModal";
import type { CartItem } from "./types";
import { cn } from "@/lib/utils";
import SlidingTabFilter from "@/components/ui/SlidingTabFilter";

import { getDeliveryCharges } from "@/api/delivery-charges.api";
import {
  createManualAddress,
  createManualOrder,
  createManualOrderStranger,
  type ManualAddressPayload,
} from "@/api/manual-orders.api";
import {
  getAdminUser,
  getAdminUsers,
  type AdminUserEntity,
} from "@/api/admin-users.api";
import { imageFallbackSvgDataUri } from "@/utils/imageFallback";
import { toPublicUrl } from "@/utils/toPublicUrl";

type Props = {
  cart: CartItem[];
  onUpdateQty: (key: string, qty: number) => void;
  onRemove: (key: string) => void;
};

type CustomerMode = "existing" | "stranger";

function userFullName(u: AdminUserEntity) {
  const name = `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim();
  return name || u.email || `User #${u.id}`;
}

function firstVerifiedPhone(u: AdminUserEntity): string {
  const verified = u.phones?.find(
    (p) => p.is_verified === true || p.is_verified === 1
  );
  const any = u.phones?.[0];
  return verified?.phone_number || any?.phone_number || "";
}

function formatCurrencyBDT(n: number) {
  return `৳${Number.isFinite(n) ? n.toFixed(0) : "0"}`;
}

function toPublicUrlSafe(pathOrUrl: string | null | undefined) {
  if (!pathOrUrl) return null;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return pathOrUrl;
}

function badgeClass(variant: "ok" | "warn" | "muted") {
  if (variant === "ok")
    return "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-200 dark:ring-emerald-500/20";
  if (variant === "warn")
    return "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-200 dark:ring-amber-500/20";
  return "bg-gray-50 text-gray-700 ring-gray-200 dark:bg-white/5 dark:text-gray-200 dark:ring-white/10";
}

/* ─── Reusable styled card label (uppercase tracking) ─── */
function SectionLabel({ icon, children }: { icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      {icon && <span className="text-brand-500 dark:text-brand-400">{icon}</span>}
      <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
        {children}
      </p>
    </div>
  );
}

/* ─── Input wrapper class ─── */
const inputClass =
  "h-11 w-full rounded-xl border border-gray-200 bg-white px-3.5 text-sm text-gray-900 transition focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-gray-700 dark:bg-gray-800/60 dark:text-white dark:focus:border-brand-500 dark:focus:ring-brand-500/10";

const selectClass =
  "h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 transition focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-gray-700 dark:bg-gray-800/60 dark:text-white dark:focus:border-brand-500 dark:focus:ring-brand-500/10";

function CustomerRow({
  u,
  active,
  onPick,
  t,
}: {
  u: AdminUserEntity;
  active: boolean;
  onPick: () => void;
  t: (key: string) => string;
}) {
  const img = toPublicUrlSafe(u.img_path);
  const fallback = imageFallbackSvgDataUri(userFullName(u));
  const imageSrc = img ? toPublicUrl(img) : fallback;
  const phone = firstVerifiedPhone(u);
  const addrCount = Array.isArray(u.addresses) ? u.addresses.length : 0;

  return (
    <button
      type="button"
      onClick={onPick}
      className={cn(
        "w-full rounded-xl border p-3 text-left transition-all",
        active
          ? "border-brand-400 bg-brand-50/60 shadow-sm ring-1 ring-brand-300/30 dark:border-brand-500/60 dark:bg-brand-500/5 dark:ring-brand-500/20"
          : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm dark:border-gray-700 dark:bg-gray-800/40 dark:hover:border-gray-600"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageSrc}
            alt={userFullName(u)}
            className="h-full w-full object-cover"
            loading="lazy"
            onError={(event) => {
              const target = event.currentTarget;
              if (target.src !== fallback) {
                target.src = fallback;
              }
            }}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="truncate text-sm font-semibold text-gray-900 dark:text-white">
              {userFullName(u)}
            </div>

            <span
              className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1",
                badgeClass(u.status === "active" ? "ok" : "muted")
              )}
            >
              {String(u.status ?? "unknown")}
            </span>

            {u.is_fully_verified ? (
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1",
                  badgeClass("ok")
                )}
              >
                {t("sales.verified")}
              </span>
            ) : (
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1",
                  badgeClass("warn")
                )}
              >
                {t("sales.notVerified")}
              </span>
            )}
          </div>

          <div className="mt-1.5 grid grid-cols-12 gap-2 text-xs text-gray-600 dark:text-gray-300">
            <div className="col-span-12 md:col-span-6 min-w-0">
              <div className="flex items-center gap-1.5 truncate">
                <Mail size={13} className="text-gray-400" />
                <span className="truncate">{u.email}</span>
              </div>
            </div>

            <div className="col-span-12 md:col-span-6 min-w-0">
              <div className="flex items-center gap-1.5 truncate">
                <Phone size={13} className="text-gray-400" />
                <span className="truncate">{phone || t("sales.noPhone")}</span>
              </div>
            </div>

            <div className="col-span-12 md:col-span-6">
              <div className="flex items-center gap-1.5">
                <MapPin size={13} className="text-gray-400" />
                <span>{addrCount} {t("sales.addressCount")}</span>
              </div>
            </div>

            <div className="col-span-12 md:col-span-6">
              <div className="flex items-center justify-between gap-2">
                <span>{t("sales.totalSpent")}</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {formatCurrencyBDT(Number(u.total_spent ?? 0))}
                </span>
              </div>
            </div>
          </div>
        </div>

        {active ? (
          <div className="mt-1 flex-shrink-0 rounded-full bg-brand-500 px-2 py-0.5 text-[11px] font-semibold text-white">
            {t("sales.selected")}
          </div>
        ) : null}
      </div>
    </button>
  );
}

export default function BillingPanel({ cart, onUpdateQty, onRemove }: Props) {
  const { t } = useTranslation();
  const [mode, setMode] = useState<CustomerMode>("existing");

  // ---------- EXISTING USER FLOW ----------
  const [userQ, setUserQ] = useState("");
  const [usersOffset, setUsersOffset] = useState(0);
  const USERS_LIMIT = 4;

  const usersQuery = useQuery({
    queryKey: [
      "adminUsers",
      { q: userQ.trim(), limit: USERS_LIMIT, offset: usersOffset },
    ],
    queryFn: () =>
      getAdminUsers({
        limit: USERS_LIMIT,
        offset: usersOffset === 0 ? undefined : usersOffset,
        search: userQ.trim() ? userQ.trim() : undefined,
      }),
    placeholderData: keepPreviousData,
  });

  const users = usersQuery.data?.users ?? [];
  const usersTotal = usersQuery.data?.meta?.total ?? 0;

  const [customerId, setCustomerId] = useState<number | null>(null);

  const userDetailsQuery = useQuery({
    queryKey: ["adminUser", customerId],
    queryFn: () => getAdminUser(Number(customerId)),
    enabled: typeof customerId === "number" && customerId > 0,
  });

  const selectedUser = userDetailsQuery.data?.user ?? null;
  const addresses = selectedUser?.addresses ?? [];

  const [addressId, setAddressId] = useState<number | null>(null);

  useEffect(() => {
    if (!selectedUser) {
      setAddressId(null);
      return;
    }

    const def = Number(selectedUser.default_address ?? 0);
    if (def) {
      setAddressId(def);
      return;
    }

    const first = addresses?.[0]?.id ? Number(addresses[0].id) : null;
    setAddressId(first);
  }, [selectedUser, addresses]);

  const [addCustomerOpen, setAddCustomerOpen] = useState(false);

  // Manual address modal
  const [manualAddressOpen, setManualAddressOpen] = useState(false);
  const [manualAddressName, setManualAddressName] = useState("");
  const [manualAddressPhone, setManualAddressPhone] = useState("");
  const [manualAddressFull, setManualAddressFull] = useState("");
  const [manualAddressCity, setManualAddressCity] = useState("");
  const [manualAddressZip, setManualAddressZip] = useState("");
  const [manualAddressType, setManualAddressType] = useState<
    "home" | "office" | "n/a"
  >("n/a");

  useEffect(() => {
    if (!manualAddressOpen) return;
    if (!selectedUser) return;

    setManualAddressName(userFullName(selectedUser));
    setManualAddressPhone(firstVerifiedPhone(selectedUser));
    setManualAddressFull("");
    setManualAddressCity("");
    setManualAddressZip("");
    setManualAddressType("n/a");
  }, [manualAddressOpen, selectedUser]);

  const createAddressMutation = useMutation({
    mutationFn: (payload: ManualAddressPayload) => createManualAddress(payload),
    onSuccess: (data) => {
      if (data?.success === true || data?.flag === 200) {
        toast.success(data?.message || "Address created");
        setManualAddressOpen(false);
        void userDetailsQuery.refetch();
        return;
      }

      toast.error(data?.error || data?.message || "Failed to create address");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to create address");
    },
  });

  // ---------- STRANGER FLOW ----------
  const [strangerName, setStrangerName] = useState("");
  const [strangerPhone, setStrangerPhone] = useState("");
  const [strangerEmail, setStrangerEmail] = useState("");
  const [strangerFullAddress, setStrangerFullAddress] = useState("");
  const [strangerCity, setStrangerCity] = useState("");
  const [strangerZip, setStrangerZip] = useState("");

  // ---------- DELIVERY ----------
  const deliveryChargesQuery = useQuery({
    queryKey: ["deliveryCharges", { limit: 20 }],
    queryFn: () => getDeliveryCharges({ limit: 20, status: true }),
  });

  const deliveryCharges = deliveryChargesQuery.data?.data ?? [];
  const [deliveryChargeId, setDeliveryChargeId] = useState<number | null>(null);

  useEffect(() => {
    if (deliveryChargeId) return;
    const first = deliveryCharges?.[0]?.id
      ? Number(deliveryCharges[0].id)
      : null;
    setDeliveryChargeId(first);
  }, [deliveryCharges, deliveryChargeId]);

  const deliveryCharge = useMemo(() => {
    if (!deliveryChargeId) return null;
    return (
      deliveryCharges.find((d) => Number(d.id) === Number(deliveryChargeId)) ??
      null
    );
  }, [deliveryCharges, deliveryChargeId]);

  // ---------- PAYMENT ----------
  const [payBy, setPayBy] = useState<"cod" | "bkash">("cod");
  const [trx, setTrx] = useState("");

  // ---------- NOTE / COUPON ----------
  const [note, setNote] = useState("");
  const [couponCode, setCouponCode] = useState("");

  // ---------- TOTALS ----------
  const subtotal = useMemo(
    () => cart.reduce((sum, i) => sum + i.unitPrice * i.qty, 0),
    [cart]
  );
  const deliveryFee = useMemo(
    () => Number(deliveryCharge?.customer_charge ?? 0),
    [deliveryCharge]
  );

  // Weight surcharge
  const weightSurcharge = useMemo(() => {
    const weightFreeKg = Number(deliveryCharge?.default_weight_kg ?? 0);
    const extraPerKg = Number(deliveryCharge?.extra_charge_per_kg ?? 0);
    if (extraPerKg <= 0) return 0;
    const totalWeightKg = cart.reduce((sum, i) => sum + (Number(i.weight_kg ?? 0) * i.qty), 0);
    const excessKg = weightFreeKg > 0 ? Math.max(0, totalWeightKg - weightFreeKg) : totalWeightKg;
    return Math.round(excessKg * extraPerKg);
  }, [cart, deliveryCharge]);

  const discount = 0;
  const tax = 0;
  const total = subtotal - discount + deliveryFee + weightSurcharge + tax;

  // ---------- PLACE ORDER ----------
  const canPlaceExisting = useMemo(() => {
    if (cart.length === 0) return false;
    if (!customerId) return false;
    if (!addressId) return false;
    if (!deliveryChargeId) return false;
    if (payBy === "bkash" && trx.trim() === "") return false;

    const anyMissingVariation = cart.some((i) => !Number(i.productVariationId));
    if (anyMissingVariation) return false;

    return true;
  }, [cart, customerId, addressId, deliveryChargeId, payBy, trx]);

  const canPlaceStranger = useMemo(() => {
    if (cart.length === 0) return false;
    if (!deliveryChargeId) return false;
    if (
      !strangerName.trim() ||
      !strangerPhone.trim() ||
      !strangerFullAddress.trim()
    )
      return false;
    if (payBy === "bkash" && trx.trim() === "") return false;

    const anyMissingVariation = cart.some((i) => !Number(i.productVariationId));
    if (anyMissingVariation) return false;

    return true;
  }, [
    cart,
    deliveryChargeId,
    strangerName,
    strangerPhone,
    strangerFullAddress,
    payBy,
    trx,
  ]);

  const placeExistingMutation = useMutation({
    mutationFn: async () => {
      const order_items = cart.map((i) => ({
        product_variation_id: Number(i.productVariationId),
        quantity: Number(i.qty),
      }));

      return createManualOrder({
        customer_id: Number(customerId),
        address_id: Number(addressId),
        payment_type: payBy === "bkash" ? "bkash" : "cod",
        trx_id: payBy === "bkash" ? trx.trim() : undefined,
        delivery_charge_id: Number(deliveryChargeId),
        note: note.trim() || undefined,
        coupon_code: couponCode.trim() || undefined,
        order_items,
      } as any);
    },
    onSuccess: (data) => {
      if (data?.success === true) {
        toast.success(data?.message || "Order created");
        window.dispatchEvent(new CustomEvent("new-sale-clear-cart"));
        setNote("");
        setCouponCode("");
        setTrx("");
        return;
      }
      toast.error(data?.error || data?.message || "Failed to place order");
    },
    onError: (err: any) => toast.error(err?.message || "Failed to place order"),
  });

  const placeStrangerMutation = useMutation({
    mutationFn: async () => {
      const order_items = cart.map((i) => ({
        product_variation_id: Number(i.productVariationId),
        quantity: Number(i.qty),
      }));

      return createManualOrderStranger({
        name: strangerName.trim(),
        phone: strangerPhone.trim(),
        email: strangerEmail.trim() || undefined,
        full_address: strangerFullAddress.trim(),
        city: strangerCity.trim() || undefined,
        zip_code: strangerZip.trim() || undefined,
        payment_type: payBy === "bkash" ? "bkash" : "cod",
        trx_id: payBy === "bkash" ? trx.trim() : undefined,
        delivery_charge_id: Number(deliveryChargeId),
        note: note.trim() || undefined,
        coupon_code: couponCode.trim() || undefined,
        order_items,
      } as any);
    },
    onSuccess: (data) => {
      if (data?.success === true) {
        toast.success(data?.message || "Order created");
        window.dispatchEvent(new CustomEvent("new-sale-clear-cart"));
        setNote("");
        setCouponCode("");
        setTrx("");
        setStrangerName("");
        setStrangerPhone("");
        setStrangerEmail("");
        setStrangerFullAddress("");
        setStrangerCity("");
        setStrangerZip("");
        return;
      }
      toast.error(data?.error || data?.message || "Failed to place order");
    },
    onError: (err: any) => toast.error(err?.message || "Failed to place order"),
  });

  const placing =
    placeExistingMutation.isPending || placeStrangerMutation.isPending;

  // ---------- UI ----------
  return (
    <div
      className={cn(
        "flex h-full min-h-0 flex-col overflow-hidden rounded-2xl bg-white",
        "shadow-[0_1px_2px_rgba(16,24,40,0.04),0_6px_20px_-14px_rgba(16,24,40,0.14)] transition-shadow duration-300 ease-out",
        "dark:bg-gray-900 dark:shadow-[0_1px_2px_rgba(0,0,0,0.3),0_10px_24px_-14px_rgba(0,0,0,0.45)]"
      )}
    >
      {/* ── Panel Header ── */}
      <div className="flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white px-5 py-3.5 dark:border-gray-800 dark:from-white/[0.03] dark:to-white/[0.01]">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
            <Receipt className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">{t("sales.billing")}</p>
            <p className="text-[10px] text-gray-400 dark:text-gray-500">{t("sales.billingSubtitle")}</p>
          </div>
        </div>

        <SlidingTabFilter
          options={[
            { label: t("sales.existing"), value: "existing" as CustomerMode },
            { label: t("sales.stranger"), value: "stranger" as CustomerMode },
          ]}
          value={mode}
          onChange={setMode}
        />
      </div>

      {/* ── Scroll container ── */}
      <div className="flex-1 min-h-0 overflow-auto custom-scrollbar p-4 space-y-4">

        {/* ═══════ Cart Items ═══════ */}
        <div className="rounded-xl border border-gray-200/80 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-white/[0.02]">
          <div className="flex items-center justify-between mb-3">
            <SectionLabel icon={<ShoppingCart size={14} />}>{t("sales.cartItems")}</SectionLabel>
            <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[11px] font-bold text-gray-600 dark:bg-gray-700 dark:text-gray-300">
              {cart.length}
            </span>
          </div>

          <div className="space-y-2">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center rounded-xl border border-dashed border-gray-200 bg-white py-6 dark:border-gray-700 dark:bg-gray-800/40">
                <ShoppingCart className="mb-2 h-6 w-6 text-gray-300 dark:text-gray-600" />
                <p className="text-xs text-gray-400 dark:text-gray-500">{t("sales.cartIsEmpty")}</p>
              </div>
            ) : (
              cart.map((i) => (
                <div
                  key={i.key}
                  className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-3 transition hover:shadow-sm dark:border-gray-700 dark:bg-gray-800/40 dark:hover:border-gray-600"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                      {i.title}
                    </div>
                    <div className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">
                      SKU: {i.sku}
                      {i.colorName || i.variantName ? (
                        <>
                          {" "}
                          • {i.colorName ?? "Color"} •{" "}
                          {i.variantName ?? "Variant"}
                        </>
                      ) : null}{" "}
                      • PV:{" "}
                      {i.productVariationId ? (
                        <span className="font-semibold text-gray-700 dark:text-gray-200">
                          {i.productVariationId}
                        </span>
                      ) : (
                        <span className="font-semibold text-error-600 dark:text-error-300">
                          (Select variation)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5 rounded-xl border border-gray-200 bg-gray-50 p-0.5 dark:border-gray-700 dark:bg-gray-800">
                      <button
                        type="button"
                        onClick={() => onUpdateQty(i.key, Math.max(1, i.qty - 1))}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-sm font-semibold text-gray-700 transition hover:bg-white dark:text-gray-200 dark:hover:bg-gray-700"
                      >
                        -
                      </button>
                      <div className="w-8 text-center text-sm font-bold text-gray-900 dark:text-white">
                        {i.qty}
                      </div>
                      <button
                        type="button"
                        onClick={() => onUpdateQty(i.key, i.qty + 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500 text-sm font-semibold text-white hover:bg-brand-600"
                      >
                        +
                      </button>
                    </div>

                    <div className="w-[88px] text-right text-sm font-bold text-gray-900 dark:text-white">
                      {formatCurrencyBDT(i.unitPrice * i.qty)}
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemove(i.key)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 transition hover:border-error-300 hover:bg-error-50 hover:text-error-500 dark:border-gray-700 dark:hover:border-error-500/40 dark:hover:bg-error-500/10"
                      aria-label="Remove item"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ═══════ Customer / Stranger ═══════ */}
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 lg:col-span-7">
            <div className="rounded-xl border border-gray-200/80 bg-white p-4 dark:border-gray-800 dark:bg-gray-800/40">
              <div className="flex items-center justify-between gap-3 mb-3">
                <SectionLabel icon={<User2 size={14} />}>
                  {mode === "existing" ? t("sales.customer") : t("sales.strangerCustomer")}
                </SectionLabel>

                {mode === "existing" ? (
                  <Button
                    onClick={() => setAddCustomerOpen(true)}
                    className="h-8 gap-1.5 rounded-lg px-3 text-xs"
                  >
                    <Plus size={14} /> {t("sales.add")}
                  </Button>
                ) : null}
              </div>

              {mode === "existing" ? (
                <>
                  <div>
                    <input
                      value={userQ}
                      onChange={(e) => {
                        setUsersOffset(0);
                        setUserQ(e.target.value);
                      }}
                      placeholder={t("sales.searchByNameEmailPhone")}
                      className={inputClass}
                    />
                  </div>

                  <div className="mt-3 space-y-2">
                    {usersQuery.isLoading ? (
                      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800/40 dark:text-gray-400">
                        {t("sales.loadingCustomers")}
                      </div>
                    ) : users.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800/40 dark:text-gray-400">
                        {t("sales.noCustomersFound")}
                      </div>
                    ) : (
                      users.map((u) => (
                        <CustomerRow
                          key={u.id}
                          u={u}
                          active={Number(customerId) === Number(u.id)}
                          onPick={() => setCustomerId(Number(u.id))}
                          t={t}
                        />
                      ))
                    )}
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <div>
                      {t("sales.showing")}{" "}
                      <span className="font-semibold text-gray-800 dark:text-gray-200">
                        {usersTotal === 0
                          ? 0
                          : Math.min(usersOffset + USERS_LIMIT, usersTotal)}
                      </span>{" "}
                      / {usersTotal}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={usersOffset === 0}
                        onClick={() =>
                          setUsersOffset((o) => Math.max(0, o - USERS_LIMIT))
                        }
                        className={cn(
                          "inline-flex items-center gap-1 rounded-lg px-2.5 py-1 ring-1 transition",
                          usersOffset === 0
                            ? "cursor-not-allowed text-gray-400 ring-gray-200 dark:ring-gray-700"
                            : "text-gray-700 ring-gray-200 hover:bg-gray-50 dark:text-gray-200 dark:ring-gray-700 dark:hover:bg-white/[0.03]"
                        )}
                      >
                        <ChevronLeft size={14} />
                        {t("sales.prev")}
                      </button>

                      <button
                        type="button"
                        disabled={usersOffset + USERS_LIMIT >= usersTotal}
                        onClick={() => setUsersOffset((o) => o + USERS_LIMIT)}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-lg px-2.5 py-1 ring-1 transition",
                          usersOffset + USERS_LIMIT >= usersTotal
                            ? "cursor-not-allowed text-gray-400 ring-gray-200 dark:ring-gray-700"
                            : "text-gray-700 ring-gray-200 hover:bg-gray-50 dark:text-gray-200 dark:ring-gray-700 dark:hover:bg-white/[0.03]"
                        )}
                      >
                        {t("sales.next")}
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="mt-3 rounded-xl border border-gray-200/80 bg-gray-50/50 p-4 dark:border-gray-700 dark:bg-white/[0.02]">
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <SectionLabel icon={<MapPin size={14} />}>{t("sales.address")}</SectionLabel>
                      <Button
                        variant="outline"
                        onClick={() => {
                          if (!selectedUser) {
                            toast.error(t("sales.selectCustomerError"));
                            return;
                          }
                          setManualAddressOpen(true);
                        }}
                        className="h-8 gap-1.5 rounded-lg px-3 text-xs"
                      >
                        <Plus size={14} /> {t("sales.add")}
                      </Button>
                    </div>

                    <select
                      value={addressId ?? ""}
                      onChange={(e) =>
                        setAddressId(
                          e.target.value ? Number(e.target.value) : null
                        )
                      }
                      className={selectClass}
                      disabled={!selectedUser}
                    >
                      <option value="">
                        {selectedUser
                          ? t("sales.chooseAddress")
                          : t("sales.selectCustomerFirst")}
                      </option>
                      {addresses.map((a: any) => (
                        <option key={a.id} value={a.id}>
                          {a?.name ? `${a.name} - ` : ""}
                          {String(a?.full_address ?? "")}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-12 md:col-span-6">
                    <SectionLabel>{t("sales.name")}</SectionLabel>
                    <input
                      value={strangerName}
                      onChange={(e) => setStrangerName(e.target.value)}
                      className={inputClass}
                    />
                  </div>

                  <div className="col-span-12 md:col-span-6">
                    <SectionLabel>{t("sales.phone")}</SectionLabel>
                    <input
                      value={strangerPhone}
                      onChange={(e) => setStrangerPhone(e.target.value)}
                      className={inputClass}
                    />
                  </div>

                  <div className="col-span-12">
                    <SectionLabel>{t("sales.fullAddress")}</SectionLabel>
                    <input
                      value={strangerFullAddress}
                      onChange={(e) => setStrangerFullAddress(e.target.value)}
                      className={inputClass}
                    />
                  </div>

                  <div className="col-span-12 md:col-span-4">
                    <SectionLabel>{t("sales.city")}</SectionLabel>
                    <input
                      value={strangerCity}
                      onChange={(e) => setStrangerCity(e.target.value)}
                      className={inputClass}
                    />
                  </div>

                  <div className="col-span-12 md:col-span-4">
                    <SectionLabel>{t("sales.zip")}</SectionLabel>
                    <input
                      value={strangerZip}
                      onChange={(e) => setStrangerZip(e.target.value)}
                      className={inputClass}
                    />
                  </div>

                  <div className="col-span-12 md:col-span-4">
                    <SectionLabel>{t("sales.email")}</SectionLabel>
                    <input
                      value={strangerEmail}
                      onChange={(e) => setStrangerEmail(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ═══════ Delivery + Payment + Totals ═══════ */}
          <div className="col-span-12 lg:col-span-5">
            <div className="space-y-4">
              {/* Delivery */}
              <div className="rounded-xl border border-gray-200/80 bg-white p-4 dark:border-gray-800 dark:bg-gray-800/40">
                <SectionLabel icon={<Truck size={14} />}>{t("sales.deliveryChargeLabel")}</SectionLabel>
                <select
                  value={deliveryChargeId ?? ""}
                  onChange={(e) =>
                    setDeliveryChargeId(
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                  className={cn(selectClass, "mt-2")}
                >
                  <option value="">
                    {deliveryChargesQuery.isLoading
                      ? t("sales.loading")
                      : t("sales.chooseDeliveryCharge")}
                  </option>
                  {deliveryCharges.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.title} — {formatCurrencyBDT(d.customer_charge)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Totals */}
              <div className="rounded-xl border border-gray-200/80 bg-gradient-to-b from-gray-50 to-white p-4 dark:border-gray-800 dark:from-white/[0.03] dark:to-white/[0.01]">
                <div className="space-y-2.5 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400">{t("sales.subtotal")}</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrencyBDT(subtotal)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400">{t("sales.delivery")}</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrencyBDT(deliveryFee)}
                    </span>
                  </div>
                  {weightSurcharge > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 dark:text-gray-400">⚖ Weight Surcharge</span>
                      <span className="font-semibold text-orange-500">
                        +{formatCurrencyBDT(weightSurcharge)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400">{t("sales.discount")}</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrencyBDT(0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400">{t("sales.tax")}</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrencyBDT(0)}
                    </span>
                  </div>

                  <div className="border-t border-gray-200 pt-3 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{t("sales.total")}</span>
                      <span className="text-lg font-extrabold text-brand-600 dark:text-brand-400">
                        {formatCurrencyBDT(total)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Coupon */}
              <div className="rounded-xl border border-gray-200/80 bg-white p-4 dark:border-gray-800 dark:bg-gray-800/40">
                <SectionLabel icon={<Ticket size={14} />}>{t("sales.coupon")}</SectionLabel>
                <input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder={t("sales.optionalCouponCode")}
                  className={cn(inputClass, "mt-2")}
                />
              </div>

              {/* Note */}
              <div className="rounded-xl border border-gray-200/80 bg-white p-4 dark:border-gray-800 dark:bg-gray-800/40">
                <SectionLabel icon={<StickyNote size={14} />}>{t("sales.note")}</SectionLabel>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={t("sales.optionalNote")}
                  className="mt-2 min-h-[80px] w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 transition focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-gray-700 dark:bg-gray-800/60 dark:text-white dark:focus:border-brand-500 dark:focus:ring-brand-500/10"
                />
              </div>

              {/* Payment */}
              <div className="rounded-xl border border-gray-200/80 bg-white p-4 dark:border-gray-800 dark:bg-gray-800/40">
                <SectionLabel icon={<CreditCard size={14} />}>{t("sales.payment")}</SectionLabel>
                <div className="mt-2.5 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPayBy("cod")}
                    className={cn(
                      "rounded-xl px-4 py-2.5 text-sm font-semibold ring-1 transition-all",
                      payBy === "cod"
                        ? "bg-gray-900 text-white ring-gray-900 dark:bg-white dark:text-gray-900 dark:ring-white"
                        : "bg-white text-gray-700 ring-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:ring-gray-700 dark:hover:bg-gray-700"
                    )}
                  >
                    {t("sales.cod")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayBy("bkash")}
                    className={cn(
                      "rounded-xl px-4 py-2.5 text-sm font-semibold ring-1 transition-all",
                      payBy === "bkash"
                        ? "bg-gray-900 text-white ring-gray-900 dark:bg-white dark:text-gray-900 dark:ring-white"
                        : "bg-white text-gray-700 ring-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:ring-gray-700 dark:hover:bg-gray-700"
                    )}
                  >
                    {t("sales.bkash")}
                  </button>
                </div>

                {payBy === "bkash" ? (
                  <div className="mt-3">
                    <SectionLabel>{t("sales.bkashTrxId")}</SectionLabel>
                    <input
                      value={trx}
                      onChange={(e) => setTrx(e.target.value)}
                      placeholder={t("sales.enterTransactionId")}
                      className={cn(inputClass, "mt-1")}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ── Sticky Footer ── */}
      <div className="flex items-center gap-3 border-t border-gray-200 bg-white px-5 py-3.5 dark:border-gray-800 dark:bg-gray-900">
        <Button
          variant="outline"
          className="flex-1"
          startIcon={<Trash2 size={15} />}
          onClick={() =>
            window.dispatchEvent(new CustomEvent("new-sale-clear-cart"))
          }
        >
          {t("sales.clearCart")}
        </Button>

        <Button
          variant="primary"
          className="flex-1"
          disabled={
            mode === "existing" ? !canPlaceExisting : !canPlaceStranger
          }
          isLoading={placing}
          loadingText={t("sales.placing")}
          startIcon={<CheckCircle2 size={15} />}
          onClick={() => {
            if (placing) return;

            const anyMissingVariation = cart.some(
              (i) => !Number(i.productVariationId)
            );
            if (anyMissingVariation) {
              toast.error(t("sales.selectVariationError"));
              return;
            }

            if (mode === "existing") {
              if (!canPlaceExisting) {
                toast.error(
                  t("sales.existingOrderError")
                );
                return;
              }
              placeExistingMutation.mutate();
              return;
            }

            if (!canPlaceStranger) {
              toast.error(
                t("sales.strangerOrderError")
              );
              return;
            }
            placeStrangerMutation.mutate();
          }}
        >
          {t("sales.placeOrder")}
        </Button>
      </div>

      <AddCustomerModal
        open={addCustomerOpen}
        onClose={() => setAddCustomerOpen(false)}
        onCreated={(data) => setCustomerId(data.id)}
      />

      {manualAddressOpen ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-[760px] overflow-hidden rounded-xl bg-white shadow-theme-lg dark:bg-gray-900">
            <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white px-6 py-4 dark:border-gray-800 dark:from-white/[0.03] dark:to-white/[0.01]">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {t("sales.addAddress")}
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {t("sales.createManualAddress")}
              </p>
            </div>

            <div className="px-6 py-6">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 md:col-span-6">
                  <SectionLabel>{t("sales.name")}</SectionLabel>
                  <input
                    value={manualAddressName}
                    onChange={(e) => setManualAddressName(e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div className="col-span-12 md:col-span-6">
                  <SectionLabel>{t("sales.phone")}</SectionLabel>
                  <input
                    value={manualAddressPhone}
                    onChange={(e) => setManualAddressPhone(e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div className="col-span-12">
                  <SectionLabel>{t("sales.fullAddress")}</SectionLabel>
                  <input
                    value={manualAddressFull}
                    onChange={(e) => setManualAddressFull(e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div className="col-span-12 md:col-span-4">
                  <SectionLabel>{t("sales.city")}</SectionLabel>
                  <input
                    value={manualAddressCity}
                    onChange={(e) => setManualAddressCity(e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div className="col-span-12 md:col-span-4">
                  <SectionLabel>{t("sales.zip")}</SectionLabel>
                  <input
                    value={manualAddressZip}
                    onChange={(e) => setManualAddressZip(e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div className="col-span-12 md:col-span-4">
                  <SectionLabel>{t("sales.type")}</SectionLabel>
                  <select
                    value={manualAddressType}
                    onChange={(e) =>
                      setManualAddressType(e.target.value as any)
                    }
                    className={selectClass}
                  >
                    <option value="n/a">n/a</option>
                    <option value="home">home</option>
                    <option value="office">office</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 bg-gray-50/60 px-6 py-4 dark:border-gray-800 dark:bg-white/[0.02]">
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => setManualAddressOpen(false)}
                >
                  {t("sales.cancel")}
                </Button>
                <Button
                  className="rounded-xl"
                  disabled={
                    !selectedUser ||
                    createAddressMutation.isPending ||
                    !manualAddressName.trim() ||
                    !manualAddressPhone.trim() ||
                    !manualAddressFull.trim()
                  }
                  onClick={() => {
                    if (!selectedUser) return;
                    if (
                      !manualAddressName.trim() ||
                      !manualAddressPhone.trim() ||
                      !manualAddressFull.trim()
                    ) {
                      toast.error(t("sales.addressRequiredError"));
                      return;
                    }

                    createAddressMutation.mutate({
                      customer_id: Number(selectedUser.id),
                      name: manualAddressName.trim(),
                      phone: manualAddressPhone.trim(),
                      full_address: manualAddressFull.trim(),
                      city: manualAddressCity.trim() || undefined,
                      zip_code: manualAddressZip.trim() || undefined,
                      type: manualAddressType,
                    });
                  }}
                >
                  {createAddressMutation.isPending
                    ? t("sales.saving")
                    : t("sales.saveAddress")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
