import React from "react";

import ProductSelectionPanel from "@/components/sales/ProductSelectionPanel";
import BillingPanel from "@/components/sales/BillingPanel";
import type { CartItem } from "@/components/sales/types";

const NewSalePage: React.FC = () => {
  const [cart, setCart] = React.useState<CartItem[]>([]);

  React.useEffect(() => {
    const onClear = () => setCart([]);
    window.addEventListener("new-sale-clear-cart", onClear as any);
    return () => window.removeEventListener("new-sale-clear-cart", onClear as any);
  }, []);

  const addToCart = React.useCallback((item: CartItem) => {
    setCart((prev) => {
      const found = prev.find((x) => x.key === item.key);
      if (!found) return [...prev, item];
      return prev.map((x) => (x.key === item.key ? { ...x, qty: x.qty + item.qty } : x));
    });
  }, []);

  const updateQty = React.useCallback((key: string, qty: number) => {
    setCart((prev) => prev.map((i) => (i.key === key ? { ...i, qty } : i)));
  }, []);

  const removeItem = React.useCallback((key: string) => {
    setCart((prev) => prev.filter((i) => i.key !== key));
  }, []);

  // Fit height on desktop: this ensures panels stretch nicely within viewport.
  // Adjust the 24/28 if your layout header height differs.
  const containerClass = "grid grid-cols-12 gap-4 md:gap-6 xl:min-h-[calc(100vh-120px)]";

  return (
    <div className={containerClass}>
      {/* 70% */}
      <div className="col-span-12 xl:col-span-6">
        <ProductSelectionPanel onAddToCart={addToCart} />
      </div>

      {/* 30% */}
      <div className="col-span-12 xl:col-span-6">
        <BillingPanel cart={cart} onUpdateQty={updateQty} onRemove={removeItem} />
      </div>
    </div>
  );
};

export default NewSalePage;
