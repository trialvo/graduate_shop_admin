import { useMemo, useState } from "react";
import { Modal } from "../ui/modal";
import PaginationFooter from "./PaginationFooter";
import { topViewProducts } from "../../pages/Dashboard/dashboardSection4Data";

interface Props {
  open: boolean;
  onClose: () => void;
}

const PAGE_SIZE = 10;

const TopViewProductsModal = ({ open, onClose }: Props) => {
  const [page, setPage] = useState(1);

  const total = topViewProducts.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const rows = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return topViewProducts.slice(start, start + PAGE_SIZE);
  }, [page]);

  const onPrev = () => setPage((p) => Math.max(1, p - 1));
  const onNext = () => setPage((p) => Math.min(totalPages, p + 1));

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      className="w-full max-w-[900px] max-h-[700px] overflow-hidden"
    >
      <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Top View Products
        </h3>
      </div>

      <div className="max-h-[calc(700px-72px)] overflow-y-auto px-6 py-4">
        <div className="grid grid-cols-12 rounded-lg bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 dark:bg-white/[0.04] dark:text-gray-200">
          <div className="col-span-6">Product</div>
          <div className="col-span-2 text-center">View</div>
          <div className="col-span-4 text-right">Last visit at</div>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-800">
          {rows.map((p) => (
            <div key={p.id} className="grid grid-cols-12 gap-2 px-4 py-4">
              <div className="col-span-6 flex items-center gap-3">
                <img
                  src={p.image}
                  alt={p.title}
                  className="h-12 w-12 rounded-lg object-cover ring-1 ring-gray-200 dark:ring-gray-800"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-brand-500">
                    {p.title}
                  </p>
                  <p className="text-xs text-brand-500">SKU: {p.sku}</p>
                  <p className="text-xs text-gray-400">Order: {p.id}</p>
                </div>
              </div>

              <div className="col-span-2 flex items-center justify-center text-sm font-medium text-gray-800 dark:text-white/90">
                {p.views}
              </div>

              <div className="col-span-4 flex items-center justify-end text-sm text-gray-700 dark:text-gray-300">
                {p.lastVisit}
              </div>
            </div>
          ))}
        </div>

        <PaginationFooter
          total={total}
          page={page}
          pageSize={PAGE_SIZE}
          onPrev={onPrev}
          onNext={onNext}
        />
      </div>
    </Modal>
  );
};

export default TopViewProductsModal;
