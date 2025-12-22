import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import SignIn from "./pages/AuthPages/SignIn";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import NewSale from "./pages/Sales/NewSale";
import AllOrders from "./pages/Orders/AllOrders";
import GuestOrders from "./pages/Orders/GuestOrders";
import AllProducts from "./pages/Products/AllProducts";
import OrderEditor from "./pages/Orders/OrderEditor";
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

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          <Route index path="/" element={<SignIn />} />
          <Route element={<AppLayout />}>
            <Route index path="/dashboard" element={<Home />} />
            <Route path="/new-sale" element={<NewSale />} />

            {/* Orders */}
            <Route path="/all-orders" element={<AllOrders />} />
            <Route path="/order-editor" element={<OrderEditor />} />
            <Route path="/guest-orders" element={<GuestOrders />} />

            {/* ✅ Products */}
            <Route path="/all-products" element={<AllProducts />} />
            <Route path="/product-category" element={<ProductCategory />} />
            <Route path="/product-attributes" element={<ProductAttributes />} />
            <Route path="/create-product" element={<CreateProduct />} />

            {/* Customers */}
            <Route path="/customers-list" element={<CustomersList />} />
            <Route path="/create-customer" element={<CreateCustomerPage />} />

            {/* Admin & Permission */}
            <Route path="/admins-list" element={<AdminsList />} />
            <Route path="/create-admin" element={<CreateAdmin />} />

            <Route path="/delivery-settings" element={<DeliverySettings />} />
            <Route path="/currier-settings" element={<CurrierSettings />} />
            <Route path="/coupon-code" element={<CouponCode />} />

            {/* Others Page */}
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/blank" element={<Blank />} />

            {/* Forms */}
            <Route path="/form-elements" element={<FormElements />} />

            {/* Tables */}
            <Route path="/basic-tables" element={<BasicTables />} />

            {/* Ui Elements */}
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/avatars" element={<Avatars />} />
            <Route path="/badge" element={<Badges />} />
            <Route path="/buttons" element={<Buttons />} />
            <Route path="/images" element={<Images />} />
            <Route path="/videos" element={<Videos />} />

            {/* Charts */}
            <Route path="/line-chart" element={<LineChart />} />
            <Route path="/bar-chart" element={<BarChart />} />
          </Route>
          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
