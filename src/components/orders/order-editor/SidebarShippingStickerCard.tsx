import type React from "react";
import Button from "@/components/ui/button/Button";

interface SidebarShippingStickerCardProps {
  onOpenGenerator: () => void;
}

const SidebarShippingStickerCard: React.FC<SidebarShippingStickerCardProps> = ({
  onOpenGenerator,
}) => {
  return (
    <div className="rounded-[4px] border border-gray-200 bg-white/70 p-5 shadow-theme-xs backdrop-blur dark:border-gray-800 dark:bg-gray-900/60">
      <div className="text-sm font-extrabold uppercase tracking-wide text-gray-900 dark:text-white">
        Generate Shipping Sticker
      </div>

      <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
        <div className="text-sm text-gray-600 dark:text-gray-300">
          Create professional shipping labels with multiple design variants.
          Select a design, customize if needed, and print or download your
          sticker.
        </div>

        <div className="flex items-center gap-4">
          <Button onClick={onOpenGenerator} size="sm" variant="primary">
            Sticker Generator
          </Button>

          <div className="ml-auto rounded-[4px] border border-gray-200 bg-white p-2 dark:border-gray-800 dark:bg-gray-900">
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
