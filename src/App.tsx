import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";

import SignIn from "./pages/AuthPages/SignIn";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";

import Home from "./pages/Dashboard/Home";
import NewSale from "./pages/Sales/NewSale";

import AllOrders from "./pages/Orders/AllOrders";
import GuestOrders from "./pages/Orders/GuestOrders";
import OrderEditor from "./pages/Orders/OrderEditor";

import AllProducts from "./pages/Products/AllProducts";
import ProductCategory from "./pages/Products/ProductCategory";
import ProductAttributes from "./pages/Products/ProductAttributes";
import CreateProduct from "./pages/Products/CreateProduct";

import CustomersList from "./pages/Customers/CustomersList";
import CreateCustomerPage from "./pages/Customers/CreateCustomerPage";

import AdminsList from "./pages/Admins/AdminsList";
import CreateAdmin from "./pages/Admins/CreateAdmin";

import DeliverySettings from "./pages/BusinessSettings/DeliverySettings";
import CurrierSettings from "./pages/BusinessSettings/CurrierSettings";
import CouponCode from "./pages/BusinessSettings/CouponCode";
import PaymentSettings from "./pages/BusinessSettings/PaymentSettings";

import BannersSettings from "./pages/WebsiteSettings/BannersSettings";
import ContactPage from "./pages/WebsiteSettings/ContactPage";
import FooterSettings from "./pages/WebsiteSettings/footer-settings";

import MyProfile from "./pages/MyProfile/MyProfile";

import ProductReports from "./pages/Reports/ProductReports";
import OrderReport from "./pages/Reports/OrderReport";
import StockReport from "./pages/Reports/StockReport";
import VisitorReport from "./pages/Reports/VisitorReport";

import NotFound from "./pages/OtherPage/NotFound";

// ✅ NEW (you should have these from the auth setup)
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicOnlyRoute from "./routes/PublicOnlyRoute";
import OrderInvoice from "./pages/Orders/OrderInvoice";

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <ScrollToTop />

        <Routes>
        {/* ✅ Public-only: login page (if already logged in -> redirect to /dashboard) */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/" element={<SignIn />} />
        </Route>

        {/* ✅ Auth required for everything inside */}
        <Route element={<ProtectedRoute redirectTo="/" />}>
          <Route path="/order-invoice/:orderId" element={<OrderInvoice />} />

          <Route element={<AppLayout />}>
            {/* Dashboard */}
            <Route path="/dashboard" element={<Home />} />
            <Route path="/new-sale" element={<NewSale />} />

            {/* Orders */}
            <Route path="/all-orders" element={<AllOrders />} />
            <Route path="/order-editor" element={<OrderEditor />} />
            <Route path="/guest-orders" element={<GuestOrders />} />

            {/* Products */}
            <Route path="/all-products" element={<AllProducts />} />
            <Route path="/product-category" element={<ProductCategory />} />
            <Route path="/product-attributes" element={<ProductAttributes />} />
            <Route path="/create-product" element={<CreateProduct />} />

            {/* Customers */}
            <Route path="/customers-list" element={<CustomersList />} />
            <Route path="/create-customer" element={<CreateCustomerPage />} />

            {/* Website Settings */}
            <Route path="/banners-settings" element={<BannersSettings />} />
            <Route path="/contact-page" element={<ContactPage />} />
            <Route path="/footer-settings" element={<FooterSettings />} />

            {/* Reports */}
            <Route path="/product-reports" element={<ProductReports />} />
            <Route path="/order-reports" element={<OrderReport />} />
            <Route path="/stock-reports" element={<StockReport />} />
            <Route path="/visitor-report" element={<VisitorReport />} />

            {/* Profile */}
            <Route path="/my-profile" element={<MyProfile />} />

            {/* ✅ Admin & Permission (example: SUPER_ADMIN + admin.manage permission) */}
            <Route
              element={
                <ProtectedRoute
                  roles={["SUPER_ADMIN"]}
                  permissions={["admin.manage"]}
                  redirectTo="/"
                />
              }
            >
              <Route path="/admins-list" element={<AdminsList />} />
              <Route path="/create-admin" element={<CreateAdmin />} />
            </Route>

            {/* Business Settings (keep protected; you can add more permissions later) */}
            <Route path="/delivery-settings" element={<DeliverySettings />} />
            <Route path="/currier-settings" element={<CurrierSettings />} />
            <Route path="/coupon-code" element={<CouponCode />} />
            <Route path="/payment-settings" element={<PaymentSettings />} />
          </Route>
        </Route>

        {/* Fallback Route */}
        <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
