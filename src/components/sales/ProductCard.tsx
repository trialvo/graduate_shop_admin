import type { SaleProduct } from "./types";

interface Props {
  product: SaleProduct;
  onClick: () => void;
}

const ProductCard = ({ product, onClick }: Props) => {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-theme-xs transition hover:shadow-theme-md dark:border-gray-800 dark:bg-white/[0.03]"
    >
      <div className="flex items-center justify-center">
        <img
          src={product.image}
          alt={product.title}
          className="h-20 w-20 rounded-xl object-cover"
        />
      </div>

      <div className="mt-3">
        <p className="truncate text-sm font-semibold text-gray-800 dark:text-white/90">
          {product.title}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {product.id} • {product.sku}
        </p>
        <p className="mt-1 text-sm font-semibold text-brand-500">
          ${product.price.toFixed(2)}
        </p>
      </div>
    </button>
  );
};

export default ProductCard;
