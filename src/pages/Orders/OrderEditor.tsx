import PageMeta from "@/components/common/PageMeta";
import OrderEditorPage from "@/components/orders/order-editor/OrderEditorPage";

export default function OrderEditor() {
  return (
    <>
      <PageMeta
        title="Order Editor"
        description="Order Management - Order Editor"
      />
      <OrderEditorPage />
    </>
  );
}
