import PageMeta from "@/components/common/PageMeta";
import ContactPageSettingsPage from "@/components/website-settings/contact-page/ContactPageSettingsPage";

export default function ContactPage() {
  return (
    <>
      <PageMeta
        title="Contact Page"
        description="Admin - Contact page settings"
      />
      <ContactPageSettingsPage />
    </>
  );
}
