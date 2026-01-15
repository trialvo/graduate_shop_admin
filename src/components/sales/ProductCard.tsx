import { cn } from "@/lib/utils";
import { toPublicUrl } from "@/utils/toPublicUrl";
import type { Product } from "@/api/products.api";

interface Props {
  product: Product;
  onClick: () => void;
}

export default function ProductCard({ product, onClick }: Props) {
  const image =
    product.images?.[0]?.path ||
    product.product_images?.[0]?.path ||
    null;

  const minPrice = Math.min(
    ...product.variations.map(v => v.selling_price - v.discount)
  );

  const maxPrice = Math.max(
    ...product.variations.map(v => v.selling_price - v.discount)
  );

  const totalStock = product.variations.reduce(
    (sum, v) => sum + v.stock,
    0
  );

  return (
    <button
      onClick={onClick}
      className="group relative rounded-xl border border-gray-200 bg-white p-3 text-left shadow-theme-xs transition hover:shadow-theme-md dark:border-gray-800 dark:bg-white/[0.03]"
    >
      {/* Featured */}
      {product.featured && (
        <span className="absolute left-2 top-2 rounded bg-brand-500 px-2 py-0.5 text-xs text-white">
          Featured
        </span>
      )}

      {/* Image */}
      <div className="flex h-28 items-center justify-center">
        {image ? (
          <img
            src={toPublicUrl(image)}
            alt={product.name}
            className="h-24 w-24 object-contain transition group-hover:scale-105"
          />
        ) : (
          <div className="h-24 w-24 rounded bg-gray-100 dark:bg-gray-800" />
        )}
      </div>

      {/* Info */}
      <div className="mt-3 space-y-1">
        <p className="truncate text-sm font-semibold text-gray-800 dark:text-white">
          {product.name}
        </p>

        <p className="text-xs text-gray-500">
          SKU: {product.variations[0]?.sku ?? "—"}
        </p>

        <p className="text-sm font-semibold text-brand-600">
          ৳ {minPrice}
          {minPrice !== maxPrice && ` - ৳ ${maxPrice}`}
        </p>

        <p
          className={cn(
            "text-xs",
            totalStock > 0 ? "text-green-600" : "text-red-600"
          )}
        >
          {totalStock > 0 ? `${totalStock} in stock` : "Out of stock"}
        </p>
      </div>
    </button>
  );
}
