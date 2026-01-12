// src/components/orders/order-editor/OrderEditorPage.tsx

import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import OrderEditorHeader from "./OrderEditorHeader";
import OrderFormCard from "./OrderFormCard";
import ProductCalculationsCard from "./ProductCalculationsCard";
import SidebarCourierCard from "./SidebarCourierCard";
import SidebarCustomerHistoryCard from "./SidebarCustomerHistoryCard";
import SidebarInfoCard from "./SidebarInfoCard";
import SidebarShippingStickerCard from "./SidebarShippingStickerCard";

import type { OrderEditorData, OrderProductLine } from "./types";


import {
  getAdminOrderById,
  ordersKeys,
  patchOrderPaymentStatus,
  patchOrderStatus,
  type ApiOrder,
} from "@/api/orders.api";
import { toPublicUrl } from "@/utils/toPublicUrl";

const statusLabel = (status: OrderEditorData["orderStatus"]): string => {
  return status
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

const formatDateLabel = (iso: string): string => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTimeLabel = (iso?: string): string | undefined => {
  if (!iso) return undefined;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "long",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const timeAgoLabel = (iso: string) => {
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
};

const calcLineTotals = (p: OrderProductLine): { base: number; tax: number } => {
  const base = Math.max(0, p.unitPrice - p.discount) * p.quantity;
  const tax = (base * p.taxPercent) / 100;
  return { base, tax };
};

function paymentLabelFromOrder(o: ApiOrder) {
  if (o.payment_type === "cod") return "Payment via Cash on delivery";
  const provider = (o.payments ?? []).slice(-1)[0]?.provider ?? "gateway";
  return `Payment via ${provider} gateway`;
}

function mapApiOrderToEditorData(o: ApiOrder): OrderEditorData {
  const deliveryType = (o.city || "").toLowerCase().includes("dhaka")
    ? "inside_dhaka"
    : "out_of_dhaka";

  const products: OrderProductLine[] = (o.items ?? []).map((it) => ({
    id: String(it.id),
    sku: it.sku ? String(it.sku) : `#${it.product_sku_id}`,
    serialNo: it.brand_name ? String(it.brand_name) : it.product_name,
    name: it.product_name,
    imageUrl: toPublicUrl(it.product_image ?? null) ?? undefined,
    color: it.color_name ?? "—",
    size: it.variant_name ?? it.attribute_name ?? "—",
    discount: Number(it.discount ?? 0),
    unitPrice: Number(it.selling_price ?? 0),
    quantity: Number(it.quantity ?? 1),
    taxPercent: 0,
  }));

  const firstCourier = (o.couriers ?? [])[0];

  return {
    orderId: String(o.id),
    orderNumber: String(o.id),
    orderDate: o.created_at,

    billingName: (o.customer_name || "").trim() || "—",
    email: o.customer_email || "—",

    shippingAddress: o.full_address || "—",
    city: o.city || "—",
    postalCode: o.zip_code || "—",

    phone: o.customer_phone || "—",
    altPhone: "",

    orderStatus: o.order_status,
    paymentStatus: o.payment_status,
    deliveryType,
    paymentMethod: o.payment_type,

    note: o.note ?? "",

    products,

    deliveryCharge: Number(o.delivery_charge ?? 0),
    specialDiscount: Number(o.discount_total ?? 0),
    advancePayment: Number(o.paid_amount ?? 0),

    courier: {
      method: firstCourier?.courier_provider ?? "manual",
      consignmentId:
        firstCourier?.reference_id !== null && firstCourier?.reference_id !== undefined
          ? String(firstCourier.reference_id)
          : firstCourier?.memo ?? "",
      trackingUrl: firstCourier?.tracking_number
        ? `Tracking: ${firstCourier.tracking_number}`
        : undefined,
      lastUpdatedAt: firstCourier?.created_at,
    },

    customerInfo: {
      name: (o.customer_name || "").trim() || "—",
      phone: o.customer_phone || "—",
      email: o.customer_email || "—",
      address: `${o.city ?? ""} ${o.full_address ?? ""}`.trim() || "—",
    },

    // backend doesn’t provide history; using current order as placeholder
    customerHistory: {
      orderId: `#${o.id}`,
      shipping: deliveryType === "inside_dhaka" ? "Inside Dhaka" : "Out of Dhaka",
      orderDate: o.created_at,
      totalAmount: Number(o.grand_total ?? 0),
      timeAgo: timeAgoLabel(o.created_at),
      orderStatus: o.order_status,
      sentBy: "manually",
      altPhone: "",
      additionalNotes: o.note ?? "—",
    },
  };
}

type Props = { orderId: number | null };

const OrderEditorPage: React.FC<Props> = ({ orderId }) => {
  const queryClient = useQueryClient();
  const hydratedRef = useRef(false);

  const detailQuery = useQuery({
    queryKey: ordersKeys.detail(orderId ?? "none"),
    queryFn: () => {
      if (!orderId) throw new Error("orderId missing");
      return getAdminOrderById(orderId);
    },
    enabled: Boolean(orderId),
    retry: 1,
  });

  const [data, setData] = useState<OrderEditorData | null>(null);

  const snapshotRef = useRef<{ orderStatus?: string; paymentStatus?: string }>({
    orderStatus: undefined,
    paymentStatus: undefined,
  });

  useEffect(() => {
    if (!detailQuery.data?.success) return;
    if (hydratedRef.current) return;

    const mapped = mapApiOrderToEditorData(detailQuery.data.data);
    setData(mapped);

    snapshotRef.current = {
      orderStatus: mapped.orderStatus,
      paymentStatus: mapped.paymentStatus,
    };

    hydratedRef.current = true;
  }, [detailQuery.data]);

  const totals = useMemo(() => {
    if (!data) {
      return { itemCount: 0, subTotal: 0, taxTotal: 0, grandTotal: 0, payable: 0 };
    }

    const lineTotals = data.products.map(calcLineTotals);
    const subTotal = lineTotals.reduce((sum, t) => sum + t.base, 0);
    const taxTotal = lineTotals.reduce((sum, t) => sum + t.tax, 0);
    const items = data.products.reduce((sum, p) => sum + p.quantity, 0);

    const grandTotal = subTotal + taxTotal + (Number(data.deliveryCharge) || 0);
    const payable =
      grandTotal -
      (Number(data.specialDiscount) || 0) -
      (Number(data.advancePayment) || 0);

    return {
      itemCount: items,
      subTotal,
      taxTotal,
      grandTotal,
      payable: Math.max(0, payable),
    };
  }, [data]);

  const paymentMutation = useMutation({
    mutationFn: (payload: { orderId: number; new_payment_status: "unpaid" | "partial_paid" | "paid" }) =>
      patchOrderPaymentStatus(payload.orderId, payload.new_payment_status),
    onSuccess: async () => {
      toast.success("Payment status updated");
      await queryClient.invalidateQueries({ queryKey: ordersKeys.details() });
      await queryClient.invalidateQueries({ queryKey: ordersKeys.lists() });
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.error ??
        err?.response?.data?.message ??
        "Failed to update payment status";
      toast.error(msg);
    },
  });

  const statusMutation = useMutation({
    mutationFn: (payload: { orderId: number; new_status: ApiOrder["order_status"] }) =>
      patchOrderStatus(payload.orderId, payload.new_status),
    onSuccess: async () => {
      toast.success("Order status updated");
      await queryClient.invalidateQueries({ queryKey: ordersKeys.details() });
      await queryClient.invalidateQueries({ queryKey: ordersKeys.lists() });
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.error ??
        err?.response?.data?.message ??
        "Failed to update order status";
      toast.error(msg);
    },
  });

  const handleChangeForm = <K extends keyof OrderEditorData>(key: K, value: OrderEditorData[K]) => {
    setData((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const handleSubmitTop = async () => {
    if (!data || !orderId) return;

    const prev = snapshotRef.current;
    const nextStatus = data.orderStatus;
    const nextPay = data.paymentStatus;

    const jobs: Promise<any>[] = [];

    if (prev.orderStatus !== nextStatus) {
      jobs.push(statusMutation.mutateAsync({ orderId, new_status: nextStatus }));
    }

    if (prev.paymentStatus !== nextPay) {
      jobs.push(paymentMutation.mutateAsync({ orderId, new_payment_status: nextPay }));
    }

    if (!jobs.length) {
      toast("Nothing changed");
      return;
    }

    await Promise.all(jobs);

    snapshotRef.current = {
      orderStatus: nextStatus,
      paymentStatus: nextPay,
    };

    toast.success("Order updated");
  };

  const handleChangeLine = (id: string, patch: Partial<OrderProductLine>) => {
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        products: prev.products.map((p) => (p.id === id ? { ...p, ...patch } : p)),
      };
    });
  };

  const handleDeleteLine = (id: string) => {
    setData((prev) => {
      if (!prev) return prev;
      return { ...prev, products: prev.products.filter((p) => p.id !== id) };
    });
  };

  const handleAddLine = () => {
    setData((prev) => {
      if (!prev) return prev;
      const nextIndex = prev.products.length + 1;
      const id = `line-${Date.now()}`;
      const newLine: OrderProductLine = {
        id,
        sku: `#NEW${nextIndex}`,
        serialNo: "New product serial",
        name: "New Product",
        imageUrl: "",
        color: "Black",
        size: "M",
        discount: 0,
        unitPrice: 0,
        quantity: 1,
        taxPercent: 0,
      };
      return { ...prev, products: [newLine, ...prev.products] };
    });
  };

  const handleChangeTotals = (patch: {
    deliveryCharge?: number;
    specialDiscount?: number;
    advancePayment?: number;
  }) => {
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        deliveryCharge:
          patch.deliveryCharge !== undefined ? Number(patch.deliveryCharge) || 0 : prev.deliveryCharge,
        specialDiscount:
          patch.specialDiscount !== undefined ? Number(patch.specialDiscount) || 0 : prev.specialDiscount,
        advancePayment:
          patch.advancePayment !== undefined ? Number(patch.advancePayment) || 0 : prev.advancePayment,
      };
    });
  };

  const handleSubmitProducts = () => {
    toast("No API for products update yet");
  };

  const handleCourierChange = (patch: { method?: string; consignmentId?: string }) => {
    setData((prev) => {
      if (!prev) return prev;
      return { ...prev, courier: { ...prev.courier, ...patch } };
    });
  };

  const handleCourierSend = () => toast("No courier API endpoint provided yet");
  const handleCourierComplete = () => toast("No courier complete endpoint provided yet");
  const handleCourierInvoice = () => toast("No courier invoice endpoint provided yet");
  const handleInvoiceDownload = () => toast("No invoice endpoint provided yet");
  const handleOpenStickerGenerator = () => toast("Sticker generator not implemented yet");

  if (!orderId) {
    return (
      <div className="min-h-screen bg-gray-50 pb-10 dark:bg-gray-950">
        <div className="mx-auto w-full max-w-[1280px] space-y-6 px-4 pt-6 md:px-6">
          <div className="rounded-[4px] border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Missing orderId in URL. Example: <span className="font-semibold">/order-editor?orderId=23</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (detailQuery.isLoading || !data) {
    return (
      <div className="min-h-screen bg-gray-50 pb-10 dark:bg-gray-950">
        <div className="mx-auto w-full max-w-[1280px] space-y-6 px-4 pt-6 md:px-6">
          <div className="rounded-[4px] border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <div className="text-sm text-gray-600 dark:text-gray-300">Loading order...</div>
          </div>
        </div>
      </div>
    );
  }

  const apiOrder = detailQuery.data?.data;
  const paymentLabel = apiOrder ? paymentLabelFromOrder(apiOrder) : "Payment";

  return (
    <div className="min-h-screen bg-gray-50 pb-10 dark:bg-gray-950">
      <div className="mx-auto w-full max-w-[1280px] space-y-6 px-4 pt-6 md:px-6">
        <OrderEditorHeader
          orderNumber={data.orderNumber}
          orderStatus={data.orderStatus}
          paymentStatus={data.paymentStatus}
          orderDateLabel={formatDateLabel(data.orderDate)}
          paymentLabel={paymentLabel}
          statusLabel={statusLabel(data.orderStatus)}
          customerIp={data.customerIp}
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8 space-y-6">
            <OrderFormCard
              values={{
                billingName: data.billingName,
                shippingAddress: data.shippingAddress,
                orderStatus: data.orderStatus,
                phone: data.phone,
                altPhone: data.altPhone,
                paymentStatus: data.paymentStatus,
                deliveryType: data.deliveryType,
                city: data.city,
                postalCode: data.postalCode,
                email: data.email,
                paymentMethod: data.paymentMethod,
                note: data.note,
              }}
              onChange={(key, value) => handleChangeForm(key, value as never)}
              onSubmit={handleSubmitTop}
            />

            <ProductCalculationsCard
              products={data.products}
              onChangeLine={handleChangeLine}
              onDeleteLine={handleDeleteLine}
              onAddLine={handleAddLine}
              deliveryCharge={data.deliveryCharge}
              specialDiscount={data.specialDiscount}
              advancePayment={data.advancePayment}
              onChangeTotals={handleChangeTotals}
              totals={{
                itemCount: totals.itemCount,
                subTotal: totals.subTotal,
                taxTotal: totals.taxTotal,
                grandTotal: totals.grandTotal,
                payable: totals.payable,
              }}
              onSubmit={handleSubmitProducts}
            />
          </div>

          <div className="lg:col-span-4 space-y-6">
            <SidebarInfoCard
              name={data.customerInfo.name}
              phone={data.customerInfo.phone}
              email={data.customerInfo.email}
              address={data.customerInfo.address}
            />

            <SidebarCourierCard
              method={data.courier.method}
              consignmentId={data.courier.consignmentId}
              trackingUrl={data.courier.trackingUrl}
              lastUpdatedAtLabel={formatDateTimeLabel(data.courier.lastUpdatedAt)}
              onChange={handleCourierChange}
              onSend={handleCourierSend}
              onComplete={handleCourierComplete}
              onDownloadInvoice={handleCourierInvoice}
            />

            <SidebarCustomerHistoryCard
              orderId={data.customerHistory.orderId}
              shipping={data.customerHistory.shipping}
              orderDateLabel={formatDateLabel(data.customerHistory.orderDate)}
              totalAmount={data.customerHistory.totalAmount}
              timeAgo={data.customerHistory.timeAgo}
              orderStatus={data.customerHistory.orderStatus}
              sentBy={data.customerHistory.sentBy}
              altPhone={data.customerHistory.altPhone}
              additionalNotes={data.customerHistory.additionalNotes}
              onDownloadInvoice={handleInvoiceDownload}
            />

            <SidebarShippingStickerCard onOpenGenerator={handleOpenStickerGenerator} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderEditorPage;
