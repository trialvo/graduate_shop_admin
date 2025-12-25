"use client";

import React from "react";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";

import ComponentCard from "@/components/common/ComponentCard";

type Props = {
  periodLabel: string;
};

const OverallTrendsChart: React.FC<Props> = ({ periodLabel }) => {
  const [isDark, setIsDark] = React.useState(false);

  React.useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const options: ApexOptions = {
    chart: {
      type: "area",
      height: 320,
      toolbar: { show: false },
      fontFamily: "Outfit, sans-serif",
    },
    colors: ["#A855F7", "#60A5FA", "#10B981"],
    stroke: { curve: "smooth", width: 3 },
    fill: {
      type: "gradient",
      gradient: { opacityFrom: 0.45, opacityTo: 0.02 },
    },
    dataLabels: { enabled: false },
    grid: {
      borderColor: isDark ? "rgba(255,255,255,0.10)" : "rgba(17,24,39,0.10)",
      strokeDashArray: 6,
    },
    xaxis: {
      categories: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: isDark ? "rgba(255,255,255,0.60)" : "rgba(75,85,99,1)" } },
    },
    yaxis: {
      labels: { style: { colors: isDark ? "rgba(255,255,255,0.60)" : "rgba(75,85,99,1)" } },
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
      labels: { colors: isDark ? "rgba(255,255,255,0.75)" : "rgba(17,24,39,0.85)" },
      markers: { radius: 12 },
    },
    tooltip: { theme: isDark ? "dark" : "light" },
  };

  const series = [
    { name: "2020", data: [45, 55, 50, 62, 60, 74, 80, 92, 86, 83, 88, 95] },
    { name: "2021", data: [30, 40, 35, 45, 48, 60, 70, 88, 84, 74, 80, 90] },
    { name: "2022", data: [20, 28, 25, 38, 35, 48, 55, 70, 65, 60, 66, 76] },
  ];

  return (
    <ComponentCard title="Overall" desc={periodLabel} className="h-full">
      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[920px] xl:min-w-full">
          <Chart options={options} series={series} type="area" height={320} />
        </div>
      </div>
    </ComponentCard>
  );
};

export default OverallTrendsChart;
