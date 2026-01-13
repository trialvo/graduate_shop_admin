import { cn } from "@/lib/utils";

function Section({
  title,
  description,
  children,
  className,
  headerRight,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  headerRight?: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "rounded-[4px] border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900",
        className,
      )}
    >
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
          {description ? <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p> : null}
        </div>
        {headerRight ? <div className="shrink-0">{headerRight}</div> : null}
      </div>

      <div className="mt-6">{children}</div>
    </section>
  );
}
export default Section;