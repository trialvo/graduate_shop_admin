export type MetricsRange = "day" | "week" | "month" | "year";

export interface MetricsData {
  totalOrder: number;
  totalAmount: number;
  cancelOrder: number;
  totalVisitor: number;
}

export const metricsByRange: Record<MetricsRange, MetricsData> = {
  day: {
    totalOrder: 120,
    totalAmount: 24500,
    cancelOrder: 5,
    totalVisitor: 980,
  },
  week: {
    totalOrder: 860,
    totalAmount: 186000,
    cancelOrder: 42,
    totalVisitor: 6540,
  },
  month: {
    totalOrder: 3420,
    totalAmount: 745000,
    cancelOrder: 210,
    totalVisitor: 28400,
  },
  year: {
    totalOrder: 41250,
    totalAmount: 9250000,
    cancelOrder: 1960,
    totalVisitor: 356000,
  },
};
