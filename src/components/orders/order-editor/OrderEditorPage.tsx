import type React from "react";
import { useMemo, useState } from "react";

import OrderEditorHeader from "./OrderEditorHeader";
import OrderFormCard from "./OrderFormCard";
import ProductCalculationsCard from "./ProductCalculationsCard";
import SidebarCourierCard from "./SidebarCourierCard";
import SidebarCustomerHistoryCard from "./SidebarCustomerHistoryCard";
import SidebarInfoCard from "./SidebarInfoCard";
import SidebarShippingStickerCard from "./SidebarShippingStickerCard";

import type { OrderEditorData, OrderProductLine } from "./types";

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

const calcLineTotals = (p: OrderProductLine): { base: number; tax: number } => {
  const base = Math.max(0, p.unitPrice - p.discount) * p.quantity;
  const tax = (base * p.taxPercent) / 100;
  return { base, tax };
};

const makeMockData = (): OrderEditorData => ({
  orderId: "15986",
  orderNumber: "15986",
  orderDate: "2025-09-24T00:00:00.000Z",
  customerIp: "49.0.34.69",

  billingName: "Nazmul Hasan",
  email: "demo@gmail.com",

  shippingAddress: "Gazipur dhaka , Bangladesh konabari",
  city: "Gazipur",
  postalCode: "1346",

  phone: "01903527399",
  altPhone: "01903527399",

  orderStatus: "processing",
  paymentStatus: "unpaid",
  deliveryType: "out_of_dhaka",
  paymentMethod: "cod",

  note: "",

  products: [
    {
      id: "line-1",
      sku: "#7802",
      serialNo: '15ABR8 Ryzen 5 5625U 15.6" Laptop',
      name: "Lenovo IdeaPad Slim 3",
      imageUrl: "",
      color: "Red",
      size: "XL",
      discount: 0,
      unitPrice: 70000,
      quantity: 2,
      taxPercent: 0,
    },
    {
      id: "line-2",
      sku: "#5002",
      serialNo: '22B20JH2 22" 100Hz 1ms IPS FHD Monitor',
      name: "AOC 22B20JH2",
      imageUrl: "",
      color: "Silver",
      size: "M",
      discount: 0,
      unitPrice: 9800,
      quantity: 1,
      taxPercent: 0,
    },
    {
      id: "line-3",
      sku: "#2002",
      serialNo: "Intel 13th Gen Core i5 13600K Raptor Lake Processor",
      name: "Intel 13th Gen Core i5 13600K",
      imageUrl: "",
      color: "Black",
      size: "36",
      discount: 0,
      unitPrice: 28000,
      quantity: 1,
      taxPercent: 0,
    },
  ],

  deliveryCharge: 120,
  specialDiscount: 0,
  advancePayment: 0,

  courier: {
    method: "Stead Fast",
    consignmentId: "854848932",
    trackingUrl: "http://steadfast/orders/84965445",
    lastUpdatedAt: "2025-09-12T06:48:00.000Z",
  },

  customerInfo: {
    name: "Rooney Hossain",
    phone: "01903527399",
    email: "demo@gmail.com",
    address: "Gazipur, Konabari, Purbapara 1349",
  },

  customerHistory: {
    orderId: "#15986",
    shipping: "Inside dhaka",
    orderDate: "2025-12-10T11:51:00.000Z",
    totalAmount: 107800,
    timeAgo: "10m ago",
    orderStatus: "processing",
    sentBy: "manually",
    altPhone: "0157/1455066",
    additionalNotes:
      "Payment to be made upon delivery. Order status changed from Pending payment to Processing.",
  },
});

const OrderEditorPage: React.FC = () => {
  const [data, setData] = useState<OrderEditorData>(() => makeMockData());

  const totals = useMemo(() => {
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
  }, [
    data.advancePayment,
    data.deliveryCharge,
    data.products,
    data.specialDiscount,
  ]);

  const handleChangeForm = <K extends keyof OrderEditorData>(
    key: K,
    value: OrderEditorData[K],
  ) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmitTop = () => {
    // Hook API here
    // eslint-disable-next-line no-console
    console.log("Update order meta", data);
  };

  const handleChangeLine = (id: string, patch: Partial<OrderProductLine>) => {
    setData((prev) => ({
      ...prev,
      products: prev.products.map((p) =>
        p.id === id ? { ...p, ...patch } : p,
      ),
    }));
  };

  const handleDeleteLine = (id: string) => {
    setData((prev) => ({
      ...prev,
      products: prev.products.filter((p) => p.id !== id),
    }));
  };

  const handleAddLine = () => {
    const nextIndex = data.products.length + 1;
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
    setData((prev) => ({ ...prev, products: [newLine, ...prev.products] }));
  };

  const handleChangeTotals = (patch: {
    deliveryCharge?: number;
    specialDiscount?: number;
    advancePayment?: number;
  }) => {
    setData((prev) => ({
      ...prev,
      deliveryCharge:
        patch.deliveryCharge !== undefined
          ? Number(patch.deliveryCharge) || 0
          : prev.deliveryCharge,
      specialDiscount:
        patch.specialDiscount !== undefined
          ? Number(patch.specialDiscount) || 0
          : prev.specialDiscount,
      advancePayment:
        patch.advancePayment !== undefined
          ? Number(patch.advancePayment) || 0
          : prev.advancePayment,
    }));
  };

  const handleSubmitProducts = () => {
    // Hook API here
    // eslint-disable-next-line no-console
    console.log("Update product calculations", data.products);
  };

  const handleCourierChange = (patch: {
    method?: string;
    consignmentId?: string;
  }) => {
    setData((prev) => ({
      ...prev,
      courier: { ...prev.courier, ...patch },
    }));
  };

  const handleCourierSend = () => {
    // Hook API here
    // eslint-disable-next-line no-console
    console.log("Courier send", data.courier);
  };

  const handleCourierComplete = () => {
    // Hook API here
    // eslint-disable-next-line no-console
    console.log("Courier complete");
  };

  const handleCourierInvoice = () => {
    // Hook API here
    // eslint-disable-next-line no-console
    console.log("Download courier invoice");
  };

  const handleInvoiceDownload = () => {
    // Hook API here
    // eslint-disable-next-line no-console
    console.log("Download invoice");
  };

  const handleOpenStickerGenerator = () => {
    // Hook modal/page here
    // eslint-disable-next-line no-console
    console.log("Open sticker generator");
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10 dark:bg-gray-950">
      <div className="mx-auto w-full max-w-[1280px] space-y-6 px-4 pt-6 md:px-6">
        <OrderEditorHeader
          orderNumber={data.orderNumber}
          orderStatus={data.orderStatus}
          paymentStatus={data.paymentStatus}
          orderDateLabel={formatDateLabel(data.orderDate)}
          paymentLabel="Payment via Cash on delivery"
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

            <SidebarShippingStickerCard
              onOpenGenerator={handleOpenStickerGenerator}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderEditorPage;
