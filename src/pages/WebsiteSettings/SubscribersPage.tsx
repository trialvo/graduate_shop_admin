import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import SubscribersManager from "../../components/subscribers/SubscribersManager";

export default function SubscribersPage() {
  return (
    <>
      <PageMeta
        title="Subscribers | Graduate Fashion Admin"
        description="Manage newsletter subscribers — view, toggle subscription, ban/unban."
      />
      <PageBreadcrumb pageTitle="Subscribers" />
      <div className="space-y-6">
        <SubscribersManager />
      </div>
    </>
  );
}
