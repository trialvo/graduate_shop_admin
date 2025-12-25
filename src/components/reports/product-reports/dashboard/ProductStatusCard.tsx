"use client";

import React from "react";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";

import ComponentCard from "@/components/common/ComponentCard";

import type { ProductStatusSummary } from "../types";

const fmtMoney = (value: number) => {
  return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

type Props = {
  summary: ProductStatusSummary;
};

const ProductStatusCard: React.FC<Props> = ({ summary }) => {
  const [isDark, setIsDark] = React.useState(false);

  React.useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const series = [summary.published, summary.draft, summary.trash, summary.coupon];

  const options: ApexOptions = {
    chart: {
      type: "donut",
      toolbar: { show: false },
    },
    labels: ["Published", "Draft", "Trash", "Coupon"],
    stroke: { width: 0 },
    dataLabels: { enabled: false },
    legend: { show: false },
    plotOptions: {
      pie: {
        donut: {
          size: "72%",
          labels: {
            show: true,
            name: { show: false },
            value: {
              show: true,
              fontSize: "22px",
              fontWeight: 800,
              color: isDark ? "#FFFFFF" : "#111827",
              offsetY: 8,
              formatter: () => fmtMoney(summary.inventoryValue),
            },
          },
        },
      },
    },
    colors: ["#465FFF", "#7C3AED", "#EF4444", "#10B981"],
    tooltip: {
      enabled: true,
      y: { formatter: (v) => String(v) },
    },
    theme: { mode: isDark ? "dark" : "light" },
    responsive: [
      {
        breakpoint: 768,
        options: { chart: { height: 260 } },
      },
    ],
  };

  const rows = [
    { label: "Published", value: summary.published },
    { label: "Draft", value: summary.draft },
    { label: "Trash", value: summary.trash },
    { label: "Coupon", value: summary.coupon },
  ];

  return (
    <ComponentCard title="Product Status" className="h-full">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-12 md:items-center">
        <div className="md:col-span-5">
          <div className="space-y-3">
            {rows.map((r) => (
              <div key={r.label} className="flex items-center justify-between">
                <div className="text-sm font-medium text-gray-600 dark:text-gray-300">{r.label}:</div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  {String(r.value).padStart(2, "0")}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="md:col-span-7">
          <div className="w-full max-w-full overflow-x-auto custom-scrollbar">
            <div className="min-w-[320px]">
              <Chart options={options} series={series} type="donut" height={260} />
            </div>
          </div>
        </div>
      </div>
    </ComponentCard>
  );
};

export default ProductStatusCard;
