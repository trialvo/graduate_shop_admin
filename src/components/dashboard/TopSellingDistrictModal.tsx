import { useMemo, useState } from "react";
import { MapPin } from "lucide-react";
import { Modal } from "../ui/modal";
import PaginationFooter from "./PaginationFooter";
import { topSellingDistricts } from "../../pages/Dashboard/dashboardSection4Data";

interface Props {
  open: boolean;
  onClose: () => void;
}

const PAGE_SIZE = 10;

const TopSellingDistrictModal = ({ open, onClose }: Props) => {
  const [page, setPage] = useState(1);

  const total = topSellingDistricts.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const maxPercent = Math.max(...topSellingDistricts.map((d) => d.percent));

  const rows = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return topSellingDistricts.slice(start, start + PAGE_SIZE);
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
          Top Selling by District
        </h3>
      </div>

      <div className="max-h-[calc(700px-72px)] overflow-y-auto px-6 py-4">
        <div className="divide-y divide-gray-200 dark:divide-gray-800">
          {rows.map((d) => (
            <div key={d.id} className="flex items-center gap-4 py-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full ring-1 ring-gray-200 dark:ring-gray-800">
                <MapPin className="text-brand-500" size={18} />
              </div>

              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
                  {d.name}
                </p>

                <div className="mt-2 flex items-center gap-3">
                  <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-800">
                    <div
                      className="h-2 rounded-full bg-brand-500"
                      style={{ width: `${(d.percent / maxPercent) * 100}%` }}
                    />
                  </div>

                  <p className="w-[64px] text-right text-sm text-gray-600 dark:text-gray-300">
                    {d.percent.toFixed(2)}%
                  </p>
                </div>
              </div>

              <p className="w-[44px] text-right text-sm font-semibold text-gray-800 dark:text-white/90">
                {d.amount}
              </p>
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

export default TopSellingDistrictModal;
