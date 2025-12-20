import { useEffect, useState } from "react";
import PageMeta from "@/components/common/PageMeta";
import ProductSelectionPanel from "@/components/sales/ProductSelectionPanel";
import BillingPanel from "@/components/sales/BillingPanel";
import type { CartItem, Customer } from "@/components/sales/types";
import { categories, customers as seedCustomers, deliveryMethods, products } from "./newSaleData";

const NewSale = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerList, setCustomerList] = useState<Customer[]>(seedCustomers);

  useEffect(() => {
    const onClear = () => setCart([]);
    window.addEventListener("new-sale-clear-cart", onClear as any);
    return () => window.removeEventListener("new-sale-clear-cart", onClear as any);
  }, []);

  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const found = prev.find((x) => x.key === item.key);
      if (!found) return [...prev, item];
      return prev.map((x) => (x.key === item.key ? { ...x, qty: x.qty + item.qty } : x));
    });
  };

  const updateQty = (key: string, qty: number) => {
    setCart((prev) => prev.map((i) => (i.key === key ? { ...i, qty } : i)));
  };

  const removeItem = (key: string) => setCart((prev) => prev.filter((i) => i.key !== key));

  // Fit height on desktop: this ensures panels stretch nicely within viewport.
  // Adjust the 24/28 if your layout header height differs.
  const containerClass = "grid grid-cols-12 gap-4 md:gap-6 xl:min-h-[calc(100vh-120px)]";

  return (
    <>
      <PageMeta title="New Sale" description="Create a new sale order" />

      <div className={containerClass}>
        {/* 70% */}
        <div className="col-span-12 xl:col-span-8">
          <ProductSelectionPanel
            products={products}
            categories={categories}
            onAddToCart={addToCart}
          />
        </div>

        {/* 30% */}
        <div className="col-span-12 xl:col-span-4">
          <BillingPanel
            customers={customerList}
            setCustomers={setCustomerList}
            cart={cart}
            onUpdateQty={updateQty}
            onRemove={removeItem}
            deliveryMethods={deliveryMethods}
          />
        </div>
      </div>
    </>
  );
};

export default NewSale;
