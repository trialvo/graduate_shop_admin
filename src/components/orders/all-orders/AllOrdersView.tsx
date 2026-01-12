import { useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { keepPreviousData, useQuery, useQueries, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import OrdersTable from "./OrdersTable";
import OrderFiltersBar from "./OrderFiltersBar";

import type { OrderRow, OrderStatus, OrderItemRow } from "./types";
import {
  FRAUD_OPTIONS,
  ORDER_TYPE_OPTIONS,
  PAYMENT_PROVIDER_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
  PAYMENT_TYPE_OPTIONS,
  STATUS_OPTIONS,
} from "./orderData";

import { getAdminOrders, ordersKeys, type ApiOrder } from "@/api/orders.api";
import { toPublicUrl } from "@/utils/toPublicUrl";

function nowLabel() {
  const d = new Date();
  const date = d.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
  const time = d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  return `${date} at ${time}`;
}

function formatOrderDateLabel(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { month: "short", day: "2-digit", year: "numeric" });
}

function formatOrderTimeLabel(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

function timeAgoLabel(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function paymentMethodFromApi(paymentType: ApiOrder["payment_type"], providerGuess?: string) {
  if (paymentType === "cod") return "COD";
  const p = (providerGuess || "").toLowerCase();
  if (p === "bkash") return "BKASH";
  if (p === "nagad") return "NAGAD";
  if (p === "rocket") return "ROCKET";
  return "CARD";
}

function providerGuessFromPayments(payments: ApiOrder["payments"]) {
  const last = [...(payments ?? [])].reverse().find((x) => x?.provider);
  return last?.provider ?? "";
}

function mapApiItemsToRowItems(items: any[]): OrderItemRow[] {
  if (!Array.isArray(items)) return [];

  return items.map((it) => {
    const name = (it?.product_name ?? "").trim() || "—";
    const img = it?.product_image ? toPublicUrl(it.product_image) : null;

    const qty = Number(it?.quantity ?? 0) || 0;

    const unitPrice = Number(it?.final_unit_price ?? it?.selling_price ?? 0) || 0;
    const lineTotal = Number(it?.line_total ?? unitPrice * qty) || 0;

    return {
      id: String(it?.id ?? `${it?.order_id ?? "x"}-${it?.product_id ?? "p"}-${it?.product_sku_id ?? "s"}`),

      productId: typeof it?.product_id === "number" ? it.product_id : undefined,
      skuId: typeof it?.product_sku_id === "number" ? it.product_sku_id : undefined,

      name,
      image: img,

      brandName: it?.brand_name ?? null,

      colorName: it?.color_name ?? null,
      colorHex: it?.color_hex ?? null,

      size: it?.variant_name ?? null,
      code: it?.sku ?? null,

      qty,

      price: unitPrice,
      total: lineTotal,
    };
  });
}

export default function AllOrdersView() {
  const queryClient = useQueryClient();

  const [status, setStatus] = useState<OrderStatus>("all");

  const [search, setSearch] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

  const [orderType, setOrderType] = useState<"all" | "regular">("all");

  const [paymentStatus, setPaymentStatus] = useState<"all" | "unpaid" | "partial_paid" | "paid">(
    "all"
  );

  const [paymentType, setPaymentType] = useState<"all" | "gateway" | "cod" | "mixed">("all");

  const [paymentProvider, setPaymentProvider] = useState<
    "all" | "sslcommerz" | "bkash" | "nagad" | "shurjopay" | "rocket"
  >("all");

  const [fraud, setFraud] = useState<"all" | "0" | "1">("all");

  const [minTotal, setMinTotal] = useState<string>("");
  const [maxTotal, setMaxTotal] = useState<string>("");

  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  const [limit, setLimit] = useState<number>(20);
  const [offset, setOffset] = useState<number>(0);

  const [refreshedAt, setRefreshedAt] = useState(nowLabel());

  useEffect(() => {
    const q = search.trim();
    if (!q) {
      setCustomerPhone("");
      setCustomerEmail("");
      return;
    }
    if (q.includes("@")) {
      setCustomerEmail(q);
      setCustomerPhone("");
      return;
    }
    setCustomerPhone(q);
    setCustomerEmail("");
  }, [search]);

  const listParams = useMemo(() => {
    return {
      order_type: orderType === "all" ? undefined : orderType,
      customer_phone: customerPhone || undefined,
      customer_email: customerEmail || undefined,

      order_status: status === "all" ? undefined : status,
      payment_status: paymentStatus === "all" ? undefined : paymentStatus,
      payment_provider: paymentProvider === "all" ? undefined : paymentProvider,
      payment_type: paymentType === "all" ? undefined : paymentType,

      is_fraud: fraud === "all" ? undefined : fraud,
      min_total: minTotal ? Number(minTotal) : undefined,
      max_total: maxTotal ? Number(maxTotal) : undefined,

      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,

      limit,
      offset,
    };
  }, [
    orderType,
    customerPhone,
    customerEmail,
    status,
    paymentStatus,
    paymentProvider,
    paymentType,
    fraud,
    minTotal,
    maxTotal,
    dateFrom,
    dateTo,
    limit,
    offset,
  ]);

  const ordersQuery = useQuery({
    queryKey: ordersKeys.list(listParams),
    queryFn: () => getAdminOrders(listParams),
    placeholderData: keepPreviousData,
    retry: 1,
  });

  const countQueries = useQueries({
    queries: STATUS_OPTIONS.filter((x) => x.id !== "all").map((opt) => ({
      queryKey: ordersKeys.list({
        ...listParams,
        order_status: opt.id,
        limit: 1,
        offset: 0,
      }),
      queryFn: () =>
        getAdminOrders({
          ...listParams,
          order_status: opt.id,
          limit: 1,
          offset: 0,
        }),
      enabled: true,
      retry: 1,
      staleTime: 30_000,
    })),
  });

  const counts = useMemo(() => {
    const base: Record<OrderStatus, number> = {
      all: ordersQuery.data?.pagination?.total ?? 0,

      new: 0,
      approved: 0,
      processing: 0,
      packaging: 0,
      shipped: 0,
      out_for_delivery: 0,
      delivered: 0,
      returned: 0,
      cancelled: 0,
      on_hold: 0,
      trash: 0,
    };

    STATUS_OPTIONS.filter((x) => x.id !== "all").forEach((opt, idx) => {
      const q = countQueries[idx];
      const total = q?.data?.pagination?.total;
      if (typeof total === "number") base[opt.id as Exclude<OrderStatus, "all">] = total;
    });

    return base;
  }, [ordersQuery.data?.pagination?.total, countQueries]);

  const rows: OrderRow[] = useMemo(() => {
    const data = ordersQuery.data?.data ?? [];
    const courierOption = ordersQuery.data?.courierOption;

    return data.map((o: any) => {
      const providerGuess = providerGuessFromPayments(o.payments);
      const method = paymentMethodFromApi(o.payment_type, providerGuess);

      const apiItems = Array.isArray(o.items) ? o.items : [];
      const rowItems = mapApiItemsToRowItems(apiItems);

      const itemsCount = rowItems.length;
      const qtyCount = rowItems.reduce((s, it) => s + (Number(it.qty) || 0), 0);

      const mainCourier = (o.couriers ?? [])[0];
      const courierProvider = (mainCourier?.courier_provider || "").toLowerCase();

      const autoList =
        courierOption?.available_providers?.map((p: any) => ({
          providerId: (String(p.provider || "").toLowerCase() as any),
          providerName: p.provider,
          connected: Number(p.is_auto_available) === 1,
        })) ?? [];

      const apiConnected = autoList.some((x: any) => x.providerId === courierProvider && x.connected);

      const shippingLocation = `${o.city ?? ""} ${o.full_address ?? ""}`.trim() || "—";

      return {
        id: String(o.id),

        customerName: (o.customer_name || "").trim() || "—",
        customerPhone: o.customer_phone || "—",

        // ✅ your API uses customer_img
        customerImage: toPublicUrl(o.customer_img ?? null) ?? undefined,

        fraudLevel: o.is_fraud ? "high" : "safe",

        paymentMethod: method,
        paymentStatus: o.payment_status,

        status: o.order_status,

        itemsAmount: itemsCount,
        totalItems: qtyCount,
        total: Number(o.grand_total ?? 0),
        currencySymbol: "৳",

        orderDateLabel: formatOrderDateLabel(o.created_at),
        orderTimeLabel: formatOrderTimeLabel(o.created_at),
        relativeTimeLabel: timeAgoLabel(o.created_at),

        orderNote: o.note ?? undefined,

        shippingLocation,
        shippingAddress: `${o.full_address ?? ""}`.trim() || "—",
        shippingArea: `${o.city ?? ""}`.trim() || "—",

        email: o.customer_email ?? undefined,

        paidAmount: Number(o.paid_amount ?? 0),
        shippingCost: Number(o.delivery_charge ?? 0),
        discount: Number(o.discount_total ?? 0),

        paymentType: o.payment_type,
        paymentProvider: providerGuess,

        // ✅ IMPORTANT: modal reads these
        items: rowItems,

        courier: {
          providerId: (courierProvider as any) || (mainCourier ? "manual" : "select"),
          providerName: mainCourier?.courier_provider ?? undefined,
          memoNo: mainCourier?.memo ?? undefined,
          trackingNo: mainCourier?.tracking_number ?? undefined,
          apiConfigured: Boolean(courierOption?.any_auto_available),
          apiConnected,
          availableAutoCouriers: autoList as any,
        },
      };
    });
  }, [ordersQuery.data, ordersQuery.data?.courierOption]);

  const pagination = ordersQuery.data?.pagination;
  const total = pagination?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const currentPage = offset + 1;

  useEffect(() => {
    if (!ordersQuery.isSuccess) return;
    setRefreshedAt(nowLabel());
  }, [ordersQuery.dataUpdatedAt]); // eslint-disable-line react-hooks/exhaustive-deps

  const onClear = () => {
    setStatus("all");
    setSearch("");
    setOrderType("all");
    setPaymentStatus("all");
    setPaymentType("all");
    setPaymentProvider("all");
    setFraud("all");
    setMinTotal("");
    setMaxTotal("");
    setDateFrom("");
    setDateTo("");
    setLimit(20);
    setOffset(0);
  };

  const onRefresh = async () => {
    try {
      await queryClient.invalidateQueries({ queryKey: ordersKeys.lists() });
      setRefreshedAt(nowLabel());
      toast.success("Orders refreshed");
    } catch {
      toast.error("Failed to refresh");
    }
  };

  return (
    <div className="space-y-4">
      {/* Title bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Order Management
          </h1>

          <div className="mt-2 flex flex-wrap gap-5 text-sm">
            {(
              [
                { label: "Total", value: counts.all },
                {
                  label: "Pending",
                  value:
                    counts.new +
                    counts.approved +
                    counts.processing +
                    counts.packaging +
                    counts.shipped +
                    counts.out_for_delivery,
                },
                { label: "Complete", value: counts.delivered },
                { label: "Cancelled", value: counts.cancelled },
              ] as const
            ).map((x) => (
              <span key={x.label} className="text-gray-500 dark:text-gray-400">
                <span className="text-brand-500 font-semibold">{x.label}</span>{" "}
                <span className="text-gray-900 dark:text-white">({x.value})</span>
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="hidden sm:inline">Data Refreshed</span>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-white/[0.03]"
              onClick={onRefresh}
              aria-label="Refresh"
            >
              <RefreshCw size={16} />
            </button>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200">
            {refreshedAt}
          </div>
        </div>
      </div>

      {/* Filters */}
      <OrderFiltersBar
        status={status}
        setStatus={(s) => {
          setStatus(s);
          setOffset(0);
        }}
        counts={counts}
        statusOptions={STATUS_OPTIONS}
        search={search}
        setSearch={(v) => {
          setSearch(v);
          setOffset(0);
        }}
        orderType={orderType}
        setOrderType={(v) => {
          setOrderType(v);
          setOffset(0);
        }}
        paymentStatus={paymentStatus}
        setPaymentStatus={(v) => {
          setPaymentStatus(v);
          setOffset(0);
        }}
        paymentType={paymentType}
        setPaymentType={(v) => {
          setPaymentType(v);
          setOffset(0);
        }}
        paymentProvider={paymentProvider}
        setPaymentProvider={(v) => {
          setPaymentProvider(v);
          setOffset(0);
        }}
        fraud={fraud}
        setFraud={(v) => {
          setFraud(v);
          setOffset(0);
        }}
        minTotal={minTotal}
        setMinTotal={(v) => {
          setMinTotal(v);
          setOffset(0);
        }}
        maxTotal={maxTotal}
        setMaxTotal={(v) => {
          setMaxTotal(v);
          setOffset(0);
        }}
        dateFrom={dateFrom}
        setDateFrom={(v) => {
          setDateFrom(v);
          setOffset(0);
        }}
        dateTo={dateTo}
        setDateTo={(v) => {
          setDateTo(v);
          setOffset(0);
        }}
        limit={limit}
        setLimit={(v) => {
          setLimit(v);
          setOffset(0);
        }}
        onClear={onClear}
        uiOptions={{
          orderType: ORDER_TYPE_OPTIONS,
          paymentStatus: PAYMENT_STATUS_OPTIONS,
          paymentType: PAYMENT_TYPE_OPTIONS,
          paymentProvider: PAYMENT_PROVIDER_OPTIONS,
          fraud: FRAUD_OPTIONS,
        }}
        loading={ordersQuery.isFetching}
      />

      {/* Table */}
      <OrdersTable rows={rows} />

      {/* Pagination */}
      <div className="flex flex-col gap-3 rounded-[4px] border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-gray-600 dark:text-gray-300">
          Page{" "}
          <span className="font-semibold text-gray-900 dark:text-white">{currentPage}</span> of{" "}
          <span className="font-semibold text-gray-900 dark:text-white">{totalPages}</span> Total{" "}
          <span className="font-semibold text-gray-900 dark:text-white">{total}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="h-10 rounded-lg border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-200 dark:hover:bg-white/[0.03]"
            onClick={() => setOffset((p) => Math.max(0, p - 1))}
            disabled={offset <= 0 || ordersQuery.isFetching}
          >
            Prev
          </button>

          <button
            type="button"
            className="h-10 rounded-lg border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-200 dark:hover:bg-white/[0.03]"
            onClick={() => setOffset((p) => (p + 1 < totalPages ? p + 1 : p))}
            disabled={currentPage >= totalPages || ordersQuery.isFetching}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
