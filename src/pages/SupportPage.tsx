import React from "react";
import { Link } from "react-router-dom";
import { Headset, Mail, Phone, Clock, ShieldCheck, LifeBuoy, ArrowLeft } from "lucide-react";

const COMPANY_NAME = "Trialvo.com";
const COMPANY_TAGLINE = "IT Farm & Web Solutions";
const SUPPORT_EMAIL = "support@trialvo.com";
const SUPPORT_PHONE = "+8801799345499";

const SupportPage: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-900">
      {/* Top header */}
      <div className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Support</h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Need help? Contact the team behind this admin dashboard.
              </p>
            </div>

            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-white/5"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        {/* Hero */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-sm dark:border-gray-800 dark:bg-gray-dark sm:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-300">
                <ShieldCheck className="h-4 w-4" />
                Official Support — {COMPANY_NAME}
              </div>

              <h2 className="mt-4 text-2xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
                We build & support professional web systems
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
                This website is developed and maintained by <span className="font-medium">{COMPANY_NAME}</span> —{" "}
                <span className="font-medium">{COMPANY_TAGLINE}</span>. Reach us for technical support, feature requests,
                bug reports, or account assistance.
              </p>
            </div>

            <div className="grid w-full gap-3 md:w-auto">
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-theme-xs hover:bg-brand-600 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20"
              >
                <Mail className="h-4 w-4" />
                Email Support
              </a>

              <a
                href={`tel:${SUPPORT_PHONE.replace(/\s+/g, "")}`}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-50 dark:border-gray-800 dark:bg-white/[0.03] dark:text-white/90 dark:hover:bg-white/5"
              >
                <Phone className="h-4 w-4" />
                Call Support
              </a>
            </div>
          </div>
        </div>

        {/* Contact cards */}
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-sm dark:border-gray-800 dark:bg-gray-dark">
            <div className="flex items-start gap-3">
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-2 dark:border-gray-800 dark:bg-white/[0.03]">
                <Mail className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Email</p>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  <a className="font-medium text-brand-600 dark:text-brand-400" href={`mailto:${SUPPORT_EMAIL}`}>
                    {SUPPORT_EMAIL}
                  </a>
                </p>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                  Best for tickets, screenshots, and detailed issues.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-sm dark:border-gray-800 dark:bg-gray-dark">
            <div className="flex items-start gap-3">
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-2 dark:border-gray-800 dark:bg-white/[0.03]">
                <Phone className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Phone</p>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  <a
                    className="font-medium text-brand-600 dark:text-brand-400"
                    href={`tel:${SUPPORT_PHONE.replace(/\s+/g, "")}`}
                  >
                    {SUPPORT_PHONE}
                  </a>
                </p>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                  For urgent operational help & quick guidance.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-sm dark:border-gray-800 dark:bg-gray-dark">
            <div className="flex items-start gap-3">
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-2 dark:border-gray-800 dark:bg-white/[0.03]">
                <Clock className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Support Hours</p>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Sat–Thu: 10:00 AM – 8:00 PM</p>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                  Response time: usually within 2–6 hours (business hours).
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-sm dark:border-gray-800 dark:bg-gray-dark sm:p-8">
          <div className="flex items-center gap-2">
            <LifeBuoy className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Quick Help</h3>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-white/[0.03]">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">I can’t login</p>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Please confirm your email and password. If you still face issues, email us with your account email and a
                screenshot of the error.
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-white/[0.03]">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Dashboard is slow / not loading</p>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Share your internet speed and the exact page URL. If possible, provide browser console logs and the time
                you faced the issue.
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-white/[0.03]">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Need a new feature</p>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Send requirements (what, why, expected workflow). We’ll review and share an estimate & delivery plan.
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-white/[0.03]">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Security / access issue</p>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Report immediately via email with “SECURITY” in subject. Include affected account and what happened.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 text-center shadow-theme-sm dark:border-gray-800 dark:bg-gray-dark">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-2">
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
              <Headset className="h-4 w-4" />
              Powered by {COMPANY_NAME}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              © {new Date().getFullYear()} {COMPANY_NAME}. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;
