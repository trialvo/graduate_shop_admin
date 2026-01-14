import * as React from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

type QuickAccessCardProps = {
  title: string;
  imgUrl?: string;
  path?: string | null;
};

const QuickAccessCard: React.FC<QuickAccessCardProps> = ({ title, imgUrl, path }) => {
  const navigate = useNavigate();

  const clickable = Boolean(path);

  return (
    <button
      type="button"
      onClick={() => {
        if (path) navigate(path);
      }}
      disabled={!clickable}
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-xl border bg-white p-3 shadow-theme-xs transition",
        "hover:shadow-theme-md dark:border-gray-800 dark:bg-gray-900",
        clickable ? "cursor-pointer" : "cursor-not-allowed opacity-70",
        "min-h-[92px] sm:min-h-[104px]"
      )}
      aria-label={clickable ? `Open ${title}` : `${title} (no link)`}
    >
      <div
        className={cn(
          "flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border bg-gray-50",
          "dark:border-gray-800 dark:bg-gray-800"
        )}
      >
        {imgUrl ? (
          <img src={imgUrl} alt={title} className="h-full w-full object-contain" loading="lazy" />
        ) : (
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-300">
            {title.slice(0, 2).toUpperCase()}
          </span>
        )}
      </div>

      <span className="line-clamp-1 text-xs font-medium text-gray-800 dark:text-gray-100 sm:text-sm">
        {title}
      </span>
    </button>
  );
};

export default QuickAccessCard;
