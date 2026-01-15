import { useEffect, useState } from "react";
import PageMeta from "@/components/common/PageMeta";
import ProductSelectionPanel from "@/components/sales/ProductSelectionPanel";
import BillingPanel from "@/components/sales/BillingPanel";
import type { CartItem, Customer } from "@/components/sales/types";

/**
 * NewSale Page
 * - Left: Product selection (API driven)
 * - Right: Billing & order summary
 * - Layout only (no business logic here)
 */
const NewSale = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]); // will be API-driven in billing phase

  /* =========================
   * Cart helpers
   * ========================= */

  useEffect(() => {
    const clearHandler = () => setCart([]);
    window.addEventListener("new-sale-clear-cart", clearHandler as EventListener);
    return () =>
      window.removeEventListener("new-sale-clear-cart", clearHandler as EventListener);
  }, []);

  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const existing = prev.find(
        (i) => i.productVariationId === item.productVariationId
      );

      if (!existing) return [...prev, item];

      return prev.map((i) =>
        i.productVariationId === item.productVariationId
          ? { ...i, qty: i.qty + item.qty }
          : i
      );
    });
  };

  const updateQty = (key: string, qty: number) => {
    setCart((prev) =>
      prev.map((i) => (i.key === key ? { ...i, qty } : i))
    );
  };

  const removeItem = (key: string) => {
    setCart((prev) => prev.filter((i) => i.key !== key));
  };

  /* =========================
   * Layout
   * ========================= */

  return (
    <>
      <PageMeta title="New Sale" description="Create a new sale order" />

      <div className="grid grid-cols-12 gap-4 md:gap-6 xl:min-h-[calc(100vh-120px)]">
        {/* Product Section (Left) */}
        <div className="col-span-12 xl:col-span-8">
          <ProductSelectionPanel onAddToCart={addToCart} />
        </div>

        {/* Billing Section (Right) */}
        <div className="col-span-12 xl:col-span-4">
          <BillingPanel
            customers={customers}
            setCustomers={setCustomers}
            cart={cart}
            onUpdateQty={updateQty}
            onRemove={removeItem}
            deliveryMethods={[]} // will be API-driven in billing phase
          />
        </div>
      </div>
    </>
  );
};

export default NewSale;
