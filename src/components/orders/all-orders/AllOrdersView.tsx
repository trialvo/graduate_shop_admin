import { useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { keepPreviousData, useQuery, useQueries, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

import OrdersTable from "./OrdersTable";
import OrderFiltersBar from "./OrderFiltersBar";
import { Pagination } from "@/components/ui";

import type { OrderRow, OrderStatus, OrderItemRow, FraudCheckSummary, FraudLevel } from "./types";
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
  return `${date} at ${time} `;
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

function timeAgoLabelI18n(iso: string, t: (key: string, opts?: any) => string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return t("orders.justNow");
  if (mins < 60) return t("orders.minutesAgo", { count: mins });
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return t("orders.hoursAgo", { count: hrs });
  const days = Math.floor(hrs / 24);
  return t("orders.daysAgo", { count: days });
}

const FRAUD_CANCEL_THRESHOLD = 0.4;
const FRAUD_SAFE_THRESHOLD = 0.8;

function clamp01(value: number) {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function toNumber(value: unknown) {
  const num = Number(value ?? 0);
  return Number.isFinite(num) ? num : 0;
}

function parseFraudResults(raw: unknown): FraudCheckSummary | null {
  if (raw === null || raw === undefined || raw === "") return null;

  let parsed: any = raw;
  if (typeof raw === "string") {
    try {
      parsed = JSON.parse(raw);
    } catch (err: any) {
      return {
        success: false,
        status: "not_found",
        totalParcels: 0,
        totalDelivered: 0,
        totalCancel: 0,
        deliveryRatio: null,
        cancelRatio: null,
        systemNote: "Invalid fraud check response",
        providers: [],
      };
    }
  }

  if (!parsed || typeof parsed !== "object") return null;

  const success = Boolean(parsed.success);
  const totalParcels = toNumber(parsed.total_parcels);
  const totalDelivered = toNumber(parsed.total_delivered);
  const totalCancel = toNumber(parsed.total_cancel);

  const deliveryRatio = totalParcels > 0 ? clamp01(totalDelivered / totalParcels) : null;
  const cancelRatio = totalParcels > 0 ? clamp01(totalCancel / totalParcels) : null;

  let status: FraudLevel = "medium";
  if (!success || totalParcels <= 0) status = "not_found";
  else if ((cancelRatio ?? 0) >= FRAUD_CANCEL_THRESHOLD) status = "high";
  else if ((deliveryRatio ?? 0) >= FRAUD_SAFE_THRESHOLD) status = "safe";
  else status = "medium";

  const apis = parsed.apis && typeof parsed.apis === "object" ? parsed.apis : {};
  const providers = Object.entries(apis).map(([key, value]) => {
    const stats = value as any;
    const total = toNumber(stats?.total_parcels);
    const delivered = toNumber(stats?.total_delivered_parcels);
    const cancelled = toNumber(stats?.total_cancelled_parcels);
    return {
      id: key,
      name: stats?.courier_name || key,
      total,
      delivered,
      cancelled,
      ratio: total > 0 ? clamp01(delivered / total) : null,
      status: stats?.status ?? null,
    };
  });

  return {
    success,
    status,
    mobileNumber: parsed.mobile_number,
    totalParcels,
    totalDelivered,
    totalCancel,
    deliveryRatio,
    cancelRatio,
    systemNote: parsed.system_note,
    checkedAt: parsed.checked_at,
    providers,
  };
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
      id: String(it?.id ?? `${it?.order_id ?? "x"} -${it?.product_id ?? "p"} -${it?.product_sku_id ?? "s"} `),

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
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [status, setStatus] = useState<OrderStatus>("new");

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
    refetchInterval: 30_000,
    refetchIntervalInBackground: true,
    retry: 1,
  });

  // Separate unfiltered query just for global summary (not affected by any filters)
  const summaryQuery = useQuery({
    queryKey: ordersKeys.list({ limit: 1, offset: 0 }),
    queryFn: () => getAdminOrders({ limit: 1, offset: 0 }),
    refetchInterval: 30_000,
    refetchIntervalInBackground: true,
    retry: 1,
    staleTime: 30_000,
  });

  // Global counts per status — NOT affected by any filters
  const countQueries = useQueries({
    queries: STATUS_OPTIONS.filter((x) => x.id !== "all").map((opt) => ({
      queryKey: ordersKeys.list({
        order_status: opt.id,
        limit: 1,
        offset: 0,
      }),
      queryFn: () =>
        getAdminOrders({
          order_status: opt.id,
          limit: 1,
          offset: 0,
        }),
      enabled: true,
      refetchInterval: 30_000,
      refetchIntervalInBackground: true,
      retry: 1,
      staleTime: 30_000,
    })),
  });

  const counts = useMemo(() => {
    const base: Record<OrderStatus, number> = {
      all: summaryQuery.data?.summary?.total ?? summaryQuery.data?.pagination?.total ?? 0,

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
  }, [summaryQuery.data, countQueries]);

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
        courierOption?.available_providers?.map((p: any, idx: number) => ({
          providerId: (String(p.provider || "").toLowerCase() as any),
          providerName: p.provider,
          connected: Number(p.is_auto_available) === 1,
          isDefault: idx === 0,
          image: p.image || null,
        })) ?? [];

      const apiConnected = autoList.some((x: any) => x.providerId === courierProvider && x.connected);

      const fraudCheck = parseFraudResults(o.fraud_test_results);
      const fraudLevel: FraudLevel = fraudCheck ? fraudCheck.status : o.is_fraud ? "high" : "safe";

      const shippingLocation = `${o.city ?? ""} ${o.full_address ?? ""} `.trim() || "—";

      return {
        id: String(o.id),

        customerName: (o.customer_name || "").trim() || "—",
        customerPhone: o.customer_phone || "—",

        customerImage: toPublicUrl(o.customer_img ?? null) ?? undefined,

        fraudLevel,
        fraudCheck: fraudCheck ?? undefined,

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
        dueAmount: Number(o.due_amount ?? 0),

        paymentType: o.payment_type,
        paymentProvider: providerGuess,

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
    setStatus("new");
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
      toast.success(t("orders.ordersRefreshed"));
    } catch {
      toast.error(t("orders.failedRefresh"));
    }
  };

  return (
    <div className="space-y-2">
      {/* ─── Header ─── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        {/* Left: title + metric pills */}
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            {([
              { label: t("orders.total"), value: summaryQuery.data?.summary?.total ?? counts.all, dot: "bg-gray-800 dark:bg-gray-300", valueColor: "text-gray-900 dark:text-white" },
              { label: t("orders.newOrders", "New"), value: summaryQuery.data?.summary?.new ?? counts.new, dot: "bg-brand-500", valueColor: "text-brand-600 dark:text-brand-400" },
              { label: t("orders.complete"), value: summaryQuery.data?.summary?.delivered ?? counts.delivered, dot: "bg-success-500", valueColor: "text-success-600 dark:text-success-400" },
              { label: t("orders.cancelled"), value: summaryQuery.data?.summary?.cancelled ?? counts.cancelled, dot: "bg-error-500", valueColor: "text-error-600 dark:text-error-400" },
              { label: t("orders.others", "Others"), value: summaryQuery.data?.summary?.others ?? 0, dot: "bg-gray-300 dark:bg-gray-600", valueColor: "text-gray-500 dark:text-gray-400" },
            ] as const).map((x) => (
              <div
                key={x.label}
                className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 transition-shadow hover:shadow-sm dark:border-gray-800 dark:bg-gray-900"
              >
                <span className={`inline-block h-2 w-2 shrink-0 rounded-full ${x.dot}`} />
                <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500">{x.label}</span>
                <span className={`text-[15px] font-bold tabular-nums leading-none ${x.valueColor}`}>{x.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: refresh + live indicator */}
        <div className="flex items-center gap-2 self-start rounded-lg border border-gray-200 bg-white px-3 py-1.5 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-success-500" />
            </span>
            <span className="hidden text-[11px] font-medium text-gray-500 dark:text-gray-400 sm:inline">
              Live
            </span>
          </div>
          <div className="h-4 w-px bg-gray-200 dark:bg-gray-700" />
          <span className="hidden text-[11px] text-gray-400 dark:text-gray-500 sm:inline">
            {refreshedAt}
          </span>
          <button
            type="button"
            className="inline-flex h-6 w-6 items-center justify-center rounded-md text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/[0.06] dark:hover:text-gray-200"
            onClick={onRefresh}
            aria-label="Refresh"
          >
            <RefreshCw size={13} />
          </button>
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
      <Pagination
        totalItems={total}
        page={currentPage}
        pageSize={limit}
        onPageChange={(nextPage) => setOffset(Math.max(0, nextPage - 1))}
        onPageSizeChange={(nextPageSize) => {
          setLimit(nextPageSize);
          setOffset(0);
        }}
        pageSizeOptions={[5, 10, 20, 50]}
        className="shadow-none"
      />
    </div>
  );
}
