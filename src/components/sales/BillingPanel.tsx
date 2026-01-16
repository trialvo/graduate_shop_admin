import { useEffect, useMemo, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";

import Button from "@/components/ui/button/Button";
import AddCustomerModal from "./AddCustomerModal";
import type { CartItem } from "./types";
import { cn } from "@/lib/utils";

import { getDeliveryCharges } from "@/api/delivery-charges.api";
import {
  createManualAddress,
  createManualOrder,
  createManualOrderStranger,
  type ManualAddressPayload,
} from "@/api/manual-orders.api";
import { createAdminUser, getAdminUser, getAdminUsers, type AdminUserEntity } from "@/api/admin-users.api";

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
  const verified = u.phones?.find((p) => p.is_verified === true || p.is_verified === 1);
  const any = u.phones?.[0];
  return verified?.phone_number || any?.phone_number || "";
}

function formatCurrencyBDT(n: number) {
  return `৳${Number.isFinite(n) ? n.toFixed(0) : "0"}`;
}

export default function BillingPanel({ cart, onUpdateQty, onRemove }: Props) {
  const [mode, setMode] = useState<CustomerMode>("existing");

  // ---------- EXISTING USER FLOW ----------
  const [userQ, setUserQ] = useState("");
  const [usersOffset, setUsersOffset] = useState(0);
  const USERS_LIMIT = 20;

  const usersQuery = useQuery({
    queryKey: ["adminUsers", { q: userQ.trim(), limit: USERS_LIMIT, offset: usersOffset }],
    queryFn: () =>
      getAdminUsers({
        search: userQ.trim() || undefined,
        limit: USERS_LIMIT,
        offset: usersOffset === 0 ? undefined : usersOffset,
      }),
    placeholderData: keepPreviousData,
  });

  const users = usersQuery.data?.users ?? [];
  const usersTotal = usersQuery.data?.meta?.total ?? 0;

  const [customerId, setCustomerId] = useState<number | null>(null);

  // Load selected user details for addresses
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

  // Add new customer modal
  const [addCustomerOpen, setAddCustomerOpen] = useState(false);

  // Manual address modal (simple inline form)
  const [manualAddressOpen, setManualAddressOpen] = useState(false);
  const [manualAddressName, setManualAddressName] = useState("");
  const [manualAddressPhone, setManualAddressPhone] = useState("");
  const [manualAddressFull, setManualAddressFull] = useState("");
  const [manualAddressCity, setManualAddressCity] = useState("");
  const [manualAddressZip, setManualAddressZip] = useState("");
  const [manualAddressType, setManualAddressType] = useState<"home" | "office" | "n/a">("n/a");

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
    const first = deliveryCharges?.[0]?.id ? Number(deliveryCharges[0].id) : null;
    setDeliveryChargeId(first);
  }, [deliveryCharges, deliveryChargeId]);

  const deliveryCharge = useMemo(() => {
    if (!deliveryChargeId) return null;
    return deliveryCharges.find((d) => Number(d.id) === Number(deliveryChargeId)) ?? null;
  }, [deliveryCharges, deliveryChargeId]);

  // ---------- PAYMENT ----------
  const [payBy, setPayBy] = useState<"cod" | "bkash">("cod");
  const [trx, setTrx] = useState("");

  // ---------- NOTE / COUPON ----------
  const [note, setNote] = useState("");
  const [couponCode, setCouponCode] = useState("");

  // ---------- TOTALS ----------
  const subtotal = useMemo(() => cart.reduce((sum, i) => sum + i.unitPrice * i.qty, 0), [cart]);

  const deliveryFee = useMemo(() => Number(deliveryCharge?.customer_charge ?? 0), [deliveryCharge]);
  const discount = 0;
  const tax = 0;
  const total = subtotal - discount + deliveryFee + tax;

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
    if (!strangerName.trim() || !strangerPhone.trim() || !strangerFullAddress.trim()) return false;
    if (payBy === "bkash" && trx.trim() === "") return false;

    const anyMissingVariation = cart.some((i) => !Number(i.productVariationId));
    if (anyMissingVariation) return false;

    return true;
  }, [cart, deliveryChargeId, strangerName, strangerPhone, strangerFullAddress, payBy, trx]);

  const placeExistingMutation = useMutation({
    mutationFn: async () => {
      const order_items = cart.map((i) => ({
        product_variation_id: Number(i.productVariationId),
        quantity: Number(i.qty),
      }));

      return createManualOrder({
        customer_id: Number(customerId),
        address_id: Number(addressId),
        payment_type: "cod",
        delivery_charge_id: Number(deliveryChargeId),
        note: note.trim() || undefined,
        coupon_code: couponCode.trim() || undefined,
        order_items,
      });
    },
    onSuccess: (data) => {
      if (data?.success === true) {
        toast.success(data?.message || "Order created");
        window.dispatchEvent(new CustomEvent("new-sale-clear-cart"));
        setNote("");
        setCouponCode("");
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
        payment_type: "cod",
        delivery_charge_id: Number(deliveryChargeId),
        note: note.trim() || undefined,
        coupon_code: couponCode.trim() || undefined,
        order_items,
      });
    },
    onSuccess: (data) => {
      if (data?.success === true) {
        toast.success(data?.message || "Order created");
        window.dispatchEvent(new CustomEvent("new-sale-clear-cart"));
        setNote("");
        setCouponCode("");
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

  const placing = placeExistingMutation.isPending || placeStrangerMutation.isPending;

  // ---------- UI ----------
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-base font-semibold text-gray-900 dark:text-white/90">Billing</div>
          <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            Choose customer, delivery, payment, then place the order.
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMode("existing")}
            className={cn(
              "h-9 rounded-lg px-3 text-sm font-medium ring-1 transition",
              mode === "existing"
                ? "bg-gray-900 text-white ring-gray-900 dark:bg-white dark:text-gray-900 dark:ring-white"
                : "bg-white text-gray-700 ring-gray-200 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-200 dark:ring-gray-800 dark:hover:bg-white/[0.03]"
            )}
          >
            Existing
          </button>
          <button
            type="button"
            onClick={() => setMode("stranger")}
            className={cn(
              "h-9 rounded-lg px-3 text-sm font-medium ring-1 transition",
              mode === "stranger"
                ? "bg-gray-900 text-white ring-gray-900 dark:bg-white dark:text-gray-900 dark:ring-white"
                : "bg-white text-gray-700 ring-gray-200 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-200 dark:ring-gray-800 dark:hover:bg-white/[0.03]"
            )}
          >
            Stranger
          </button>
        </div>
      </div>

      {/* Cart summary */}
      <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-gray-800 dark:text-white/90">Cart Items</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{cart.length} item(s)</div>
        </div>

        <div className="mt-3 space-y-2">
          {cart.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-200 bg-white p-3 text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-400">
              Cart is empty.
            </div>
          ) : (
            cart.map((i) => (
              <div
                key={i.key}
                className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-950"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-gray-900 dark:text-white/90">{i.title}</div>
                  <div className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">
                    SKU: {i.sku}
                    {i.colorName || i.variantName ? (
                      <>
                        {" "}
                        • {i.colorName ?? "Color"} • {i.variantName ?? "Variant"}
                      </>
                    ) : null}
                    {" "}
                    • PV:{" "}
                    {i.productVariationId ? (
                      <span className="font-semibold text-gray-700 dark:text-gray-200">{i.productVariationId}</span>
                    ) : (
                      <span className="font-semibold text-error-600 dark:text-error-300">(Select variation)</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 dark:border-gray-800 dark:bg-white/[0.03]">
                    <button
                      type="button"
                      onClick={() => onUpdateQty(i.key, Math.max(1, i.qty - 1))}
                      className="h-7 w-7 rounded-md text-sm font-semibold text-gray-700 hover:bg-white dark:text-gray-200 dark:hover:bg-gray-900"
                    >
                      -
                    </button>
                    <div className="w-8 text-center text-sm font-semibold text-gray-900 dark:text-white/90">{i.qty}</div>
                    <button
                      type="button"
                      onClick={() => onUpdateQty(i.key, i.qty + 1)}
                      className="h-7 w-7 rounded-md text-sm font-semibold text-white bg-brand-500 hover:bg-brand-600"
                    >
                      +
                    </button>
                  </div>

                  <div className="w-[88px] text-right text-sm font-semibold text-gray-900 dark:text-white/90">
                    {formatCurrencyBDT(i.unitPrice * i.qty)}
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemove(i.key)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.03]"
                    aria-label="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Mode panels */}
      <div className="mt-4 grid grid-cols-12 gap-4">
        {/* Customer */}
        <div className="col-span-12 lg:col-span-7">
          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-semibold text-gray-900 dark:text-white/90">
                {mode === "existing" ? "Customer" : "Stranger Customer"}
              </div>

              {mode === "existing" ? (
                <Button onClick={() => setAddCustomerOpen(true)} className="h-9 px-3 text-sm">
                  + Add Customer
                </Button>
              ) : null}
            </div>

            {mode === "existing" ? (
              <>
                <div className="mt-3 grid grid-cols-12 gap-3">
                  <div className="col-span-12 md:col-span-8">
                    <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300">
                      Search customer
                    </label>
                    <input
                      value={userQ}
                      onChange={(e) => {
                        setUsersOffset(0);
                        setUserQ(e.target.value);
                      }}
                      placeholder="Search by name/email/phone"
                      className="h-11 w-full rounded-lg border border-gray-200 px-3 text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                    />
                  </div>

                  <div className="col-span-12 md:col-span-4">
                    <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300">
                      Select customer
                    </label>
                    <select
                      value={customerId ?? ""}
                      onChange={(e) => setCustomerId(e.target.value ? Number(e.target.value) : null)}
                      className="h-11 w-full rounded-lg border border-gray-200 px-3 text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                    >
                      <option value="">{usersQuery.isLoading ? "Loading..." : "Choose customer"}</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {userFullName(u)} {u.email ? `(${u.email})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* pagination */}
                <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <div>
                    Showing {Math.min(usersOffset + USERS_LIMIT, usersTotal)} / {usersTotal}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={usersOffset === 0}
                      onClick={() => setUsersOffset((o) => Math.max(0, o - USERS_LIMIT))}
                      className={cn(
                        "rounded-md px-2 py-1 ring-1 transition",
                        usersOffset === 0
                          ? "cursor-not-allowed text-gray-400 ring-gray-200 dark:ring-gray-800"
                          : "text-gray-700 ring-gray-200 hover:bg-gray-50 dark:text-gray-200 dark:ring-gray-800 dark:hover:bg-white/[0.03]"
                      )}
                    >
                      Prev
                    </button>
                    <button
                      type="button"
                      disabled={usersOffset + USERS_LIMIT >= usersTotal}
                      onClick={() => setUsersOffset((o) => o + USERS_LIMIT)}
                      className={cn(
                        "rounded-md px-2 py-1 ring-1 transition",
                        usersOffset + USERS_LIMIT >= usersTotal
                          ? "cursor-not-allowed text-gray-400 ring-gray-200 dark:ring-gray-800"
                          : "text-gray-700 ring-gray-200 hover:bg-gray-50 dark:text-gray-200 dark:ring-gray-800 dark:hover:bg-white/[0.03]"
                      )}
                    >
                      Next
                    </button>
                  </div>
                </div>

                {/* address */}
                <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-white/[0.03]">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white/90">Address</div>
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (!selectedUser) {
                          toast.error("Select a customer first");
                          return;
                        }
                        setManualAddressOpen(true);
                      }}
                      className="h-9 px-3 text-sm"
                    >
                      + Add Address
                    </Button>
                  </div>

                  <div className="mt-3">
                    <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300">
                      Select address
                    </label>
                    <select
                      value={addressId ?? ""}
                      onChange={(e) => setAddressId(e.target.value ? Number(e.target.value) : null)}
                      className="h-11 w-full rounded-lg border border-gray-200 px-3 text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                      disabled={!selectedUser}
                    >
                      <option value="">{selectedUser ? "Choose address" : "Select customer first"}</option>
                      {addresses.map((a: any) => (
                        <option key={a.id} value={a.id}>
                          {a?.name ? `${a.name} - ` : ""}
                          {String(a?.full_address ?? "")}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            ) : (
              <div className="mt-3 grid grid-cols-12 gap-3">
                <div className="col-span-12 md:col-span-6">
                  <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300">Name</label>
                  <input
                    value={strangerName}
                    onChange={(e) => setStrangerName(e.target.value)}
                    className="h-11 w-full rounded-lg border border-gray-200 px-3 text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                  />
                </div>

                <div className="col-span-12 md:col-span-6">
                  <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300">Phone</label>
                  <input
                    value={strangerPhone}
                    onChange={(e) => setStrangerPhone(e.target.value)}
                    className="h-11 w-full rounded-lg border border-gray-200 px-3 text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                  />
                </div>

                <div className="col-span-12">
                  <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300">
                    Full address
                  </label>
                  <input
                    value={strangerFullAddress}
                    onChange={(e) => setStrangerFullAddress(e.target.value)}
                    className="h-11 w-full rounded-lg border border-gray-200 px-3 text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                  />
                </div>

                <div className="col-span-12 md:col-span-4">
                  <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300">City</label>
                  <input
                    value={strangerCity}
                    onChange={(e) => setStrangerCity(e.target.value)}
                    className="h-11 w-full rounded-lg border border-gray-200 px-3 text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                  />
                </div>

                <div className="col-span-12 md:col-span-4">
                  <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300">Zip</label>
                  <input
                    value={strangerZip}
                    onChange={(e) => setStrangerZip(e.target.value)}
                    className="h-11 w-full rounded-lg border border-gray-200 px-3 text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                  />
                </div>

                <div className="col-span-12 md:col-span-4">
                  <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300">Email</label>
                  <input
                    value={strangerEmail}
                    onChange={(e) => setStrangerEmail(e.target.value)}
                    className="h-11 w-full rounded-lg border border-gray-200 px-3 text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Delivery + Payment + Notes */}
        <div className="col-span-12 lg:col-span-5">
          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="text-sm font-semibold text-gray-900 dark:text-white/90">Delivery</div>

            <div className="mt-3">
              <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300">
                Delivery charge
              </label>
              <select
                value={deliveryChargeId ?? ""}
                onChange={(e) => setDeliveryChargeId(e.target.value ? Number(e.target.value) : null)}
                className="h-11 w-full rounded-lg border border-gray-200 px-3 text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-white"
              >
                <option value="">{deliveryChargesQuery.isLoading ? "Loading..." : "Choose delivery charge"}</option>
                {deliveryCharges.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.title} — {formatCurrencyBDT(d.customer_charge)}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="flex items-center justify-between text-sm">
                <div className="text-gray-600 dark:text-gray-300">Subtotal</div>
                <div className="font-semibold text-gray-900 dark:text-white/90">{formatCurrencyBDT(subtotal)}</div>
              </div>

              <div className="mt-2 flex items-center justify-between text-sm">
                <div className="text-gray-600 dark:text-gray-300">Delivery</div>
                <div className="font-semibold text-gray-900 dark:text-white/90">{formatCurrencyBDT(deliveryFee)}</div>
              </div>

              <div className="mt-2 flex items-center justify-between text-sm">
                <div className="text-gray-600 dark:text-gray-300">Discount</div>
                <div className="font-semibold text-gray-900 dark:text-white/90">{formatCurrencyBDT(discount)}</div>
              </div>

              <div className="mt-2 flex items-center justify-between text-sm">
                <div className="text-gray-600 dark:text-gray-300">Tax</div>
                <div className="font-semibold text-gray-900 dark:text-white/90">{formatCurrencyBDT(tax)}</div>
              </div>

              <div className="mt-3 border-t border-gray-200 pt-3 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-gray-800 dark:text-white/90">Total</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white/90">
                    {formatCurrencyBDT(total)}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <div className="text-sm font-semibold text-gray-900 dark:text-white/90">Coupon</div>
              <input
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Optional coupon code"
                className="mt-2 h-11 w-full rounded-lg border border-gray-200 px-3 text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-white"
              />
            </div>

            <div className="mt-4">
              <div className="text-sm font-semibold text-gray-900 dark:text-white/90">Note</div>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Optional note for delivery / admin"
                className="mt-2 min-h-[96px] w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-white"
              />
            </div>

            <div className="mt-4">
              <div className="text-sm font-semibold text-gray-900 dark:text-white/90">Payment</div>
              <div className="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPayBy("cod")}
                  className={cn(
                    "rounded-lg px-4 py-2 text-sm ring-1 transition",
                    payBy === "cod"
                      ? "bg-gray-800 text-white ring-gray-800 dark:bg-white dark:text-gray-900 dark:ring-white"
                      : "bg-white text-gray-700 ring-gray-200 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-200 dark:ring-gray-800 dark:hover:bg-white/[0.03]"
                  )}
                >
                  COD
                </button>
                <button
                  type="button"
                  onClick={() => setPayBy("bkash")}
                  className={cn(
                    "rounded-lg px-4 py-2 text-sm ring-1 transition",
                    payBy === "bkash"
                      ? "bg-gray-800 text-white ring-gray-800 dark:bg-white dark:text-gray-900 dark:ring-white"
                      : "bg-white text-gray-700 ring-gray-200 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-200 dark:ring-gray-800 dark:hover:bg-white/[0.03]"
                  )}
                >
                  bKash
                </button>
              </div>

              {payBy === "bkash" ? (
                <div className="mt-3">
                  <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300">
                    bKash TRX ID
                  </label>
                  <input
                    value={trx}
                    onChange={(e) => setTrx(e.target.value)}
                    placeholder="Enter transaction id"
                    className="h-11 w-full rounded-lg border border-gray-200 px-3 text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                  />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-5 grid grid-cols-12 gap-3">
        <div className="col-span-12 md:col-span-6">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => window.dispatchEvent(new CustomEvent("new-sale-clear-cart"))}
          >
            Clear Cart
          </Button>
        </div>

        <div className="col-span-12 md:col-span-6">
          <button
            type="button"
            disabled={placing || (mode === "existing" ? !canPlaceExisting : !canPlaceStranger)}
            className={cn(
              "h-11 w-full rounded-lg text-sm font-semibold text-white",
              placing || (mode === "existing" ? !canPlaceExisting : !canPlaceStranger)
                ? "cursor-not-allowed bg-brand-500/60"
                : "bg-brand-500 hover:bg-brand-600"
            )}
            onClick={() => {
              if (placing) return;

              const anyMissingVariation = cart.some((i) => !Number(i.productVariationId));
              if (anyMissingVariation) {
                toast.error("Select product variation before placing order");
                return;
              }

              if (mode === "existing") {
                if (!canPlaceExisting) {
                  toast.error("Please select customer, address, delivery, and variation");
                  return;
                }
                placeExistingMutation.mutate();
                return;
              }

              if (!canPlaceStranger) {
                toast.error("Please fill stranger info, delivery, and variation");
                return;
              }
              placeStrangerMutation.mutate();
            }}
          >
            {placing ? "Placing..." : "Place Order"}
          </button>
        </div>
      </div>

      {/* Create customer */}
      <AddCustomerModal
        open={addCustomerOpen}
        onClose={() => setAddCustomerOpen(false)}
        onCreated={(data) => setCustomerId(data.id)}
      />

      {/* Inline manual address modal (simple) */}
      {manualAddressOpen ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-[760px] overflow-hidden rounded-xl bg-white shadow-theme-lg dark:bg-gray-900">
            <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white/90">Add Address</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Create a manual address for this customer.
              </p>
            </div>

            <div className="px-6 py-6">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 md:col-span-6">
                  <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300">Name</label>
                  <input
                    value={manualAddressName}
                    onChange={(e) => setManualAddressName(e.target.value)}
                    className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                  />
                </div>

                <div className="col-span-12 md:col-span-6">
                  <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300">Phone</label>
                  <input
                    value={manualAddressPhone}
                    onChange={(e) => setManualAddressPhone(e.target.value)}
                    className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                  />
                </div>

                <div className="col-span-12">
                  <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300">Full Address</label>
                  <input
                    value={manualAddressFull}
                    onChange={(e) => setManualAddressFull(e.target.value)}
                    className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                  />
                </div>

                <div className="col-span-12 md:col-span-4">
                  <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300">City</label>
                  <input
                    value={manualAddressCity}
                    onChange={(e) => setManualAddressCity(e.target.value)}
                    className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                  />
                </div>

                <div className="col-span-12 md:col-span-4">
                  <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300">Zip</label>
                  <input
                    value={manualAddressZip}
                    onChange={(e) => setManualAddressZip(e.target.value)}
                    className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                  />
                </div>

                <div className="col-span-12 md:col-span-4">
                  <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300">Type</label>
                  <select
                    value={manualAddressType}
                    onChange={(e) => setManualAddressType(e.target.value as any)}
                    className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                  >
                    <option value="n/a">n/a</option>
                    <option value="home">home</option>
                    <option value="office">office</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 bg-white/90 px-6 py-4 backdrop-blur dark:border-gray-800 dark:bg-gray-900/80">
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setManualAddressOpen(false)}>
                  Cancel
                </Button>
                <Button
                  disabled={
                    !selectedUser ||
                    createAddressMutation.isPending ||
                    !manualAddressName.trim() ||
                    !manualAddressPhone.trim() ||
                    !manualAddressFull.trim()
                  }
                  onClick={() => {
                    if (!selectedUser) return;
                    if (!manualAddressName.trim() || !manualAddressPhone.trim() || !manualAddressFull.trim()) {
                      toast.error("Name, phone, and address are required");
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
                  {createAddressMutation.isPending ? "Saving..." : "Save Address"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
