import type React from "react";
import Button from "@/components/ui/button/Button";

interface SidebarShippingStickerCardProps {
  onOpenGenerator: () => void;
}

const SidebarShippingStickerCard: React.FC<SidebarShippingStickerCardProps> = ({
  onOpenGenerator,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-[0_12px_30px_-20px_rgba(15,23,42,0.5)] backdrop-blur dark:border-gray-800 dark:bg-gray-900/70">
      <div className="text-[11px] font-semibold uppercase tracking-[0.25em] text-gray-500 dark:text-gray-400">
        Shipping Labels
      </div>
      <div className="text-lg font-semibold text-gray-900 dark:text-white">
        Generate sticker
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
        <div className="text-sm text-gray-600 dark:text-gray-300">
          Create professional shipping labels with multiple design variants.
          Select a design, customize if needed, and print or download your
          sticker.
        </div>

        <div className="flex items-center gap-4">
          <Button onClick={onOpenGenerator} size="sm" variant="primary">
            Sticker Generator
          </Button>

          <div className="ml-auto rounded-xl border border-slate-200/80 bg-white p-2 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center gap-2">
              <div className="grid h-[72px] w-[72px] grid-cols-9 gap-[2px] rounded-lg bg-gray-900/5 p-2 dark:bg-white/5">
                {Array.from({ length: 81 }).map((_, i) => (
                  <span
                    key={i}
                    className="rounded-[2px] bg-gray-900 dark:bg-white"
                    style={{
                      opacity: i % 3 === 0 || i % 8 === 0 ? 0.95 : 0.1,
                    }}
                  />
                ))}
              </div>
              <div className="text-[11px] text-gray-500 dark:text-gray-400">
                <div className="font-semibold text-gray-900 dark:text-white">
                  Sticker preview
                </div>
                <div className="mt-0.5">12 variants</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidebarShippingStickerCard;
