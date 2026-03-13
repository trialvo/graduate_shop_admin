import { useState } from "react";
import toast from "react-hot-toast";
import { Flame, ToggleLeft, ToggleRight, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import {
  useFirebaseCredential,
  useSaveFirebaseCredential,
  useToggleFirebaseCredential,
} from "@/hooks/useFirebaseConfig";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";

export default function FirebaseCredentialSettings() {
  const { data: credential, isLoading, isError } = useFirebaseCredential();
  const saveMutation = useSaveFirebaseCredential();
  const toggleMutation = useToggleFirebaseCredential();

  const [jsonText, setJsonText] = useState("");
  const [jsonError, setJsonError] = useState("");

  const validateAndSave = async () => {
    setJsonError("");
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      setJsonError("Invalid JSON. Please paste a valid Firebase service account JSON.");
      return;
    }
    // Auto-unwrap if user pasted the full API payload { "credential_json": {...} }
    if (parsed.credential_json && typeof parsed.credential_json === "object") {
      parsed = parsed.credential_json as Record<string, unknown>;
    }
    const missing = ["project_id", "private_key", "client_email"].filter((k) => !parsed[k]);
    if (missing.length > 0) {
      setJsonError(`Missing required fields: ${missing.join(", ")}.`);
      return;
    }
    try {
      const res = await saveMutation.mutateAsync({ credential_json: parsed });
      toast.success(res.message || "Firebase credential saved!");
      setJsonText("");
    } catch (err: any) {
      toast.error(err?.response?.data?.error || err?.message || "Failed to save credential.");
    }
  };


  const handleToggle = async () => {
    try {
      const res = await toggleMutation.mutateAsync();
      toast.success(res.message || "Toggled.");
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to toggle.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Credential Card */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center gap-3 border-b border-gray-200 px-5 py-4 dark:border-gray-800">
          <Flame className="text-orange-500" size={18} />
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Current Firebase Credential</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Active FCM service account for push notifications.</p>
          </div>
        </div>
        <div className="p-5">
          {isLoading ? (
            <p className="text-sm text-gray-500">Loading...</p>
          ) : isError || !credential ? (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <XCircle size={16} className="text-error-400" />
              No Firebase credential configured yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Project ID</p>
                <p className="mt-1 text-sm font-medium font-mono text-gray-900 dark:text-white">
                  {credential.project_id ?? <span className="text-gray-400 italic">Unknown</span>}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                <div className="mt-1 flex items-center gap-2">
                  {credential.is_active ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-success-50 px-2.5 py-1 text-xs font-semibold text-success-700 dark:bg-success-500/10 dark:text-success-400">
                      <CheckCircle2 size={12} /> Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-error-50 px-2.5 py-1 text-xs font-semibold text-error-700 dark:bg-error-500/10 dark:text-error-300">
                      <XCircle size={12} /> Inactive
                    </span>
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Saved At</p>
                <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                  {new Date(credential.created_at).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Last Updated</p>
                <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                  {new Date(credential.updated_at).toLocaleString()}
                </p>
              </div>
            </div>
          )}

          {credential && (
            <div className="mt-5 flex justify-end">
              <Button
                variant="outline"
                onClick={handleToggle}
                disabled={toggleMutation.isPending}
                startIcon={credential.is_active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
              >
                {toggleMutation.isPending
                  ? "Toggling..."
                  : credential.is_active
                  ? "Deactivate"
                  : "Activate"}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Create / Update Credential */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {credential ? "Replace Credential" : "Add Credential"}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Paste your Firebase service account JSON (from Google Cloud → Service Accounts → Generate Key → JSON).
            {credential && " This will replace the current credential and reactivate it."}
          </p>
        </div>
        <div className="p-5 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="fcm-json">Service Account JSON <span className="text-error-500">*</span></Label>
            <textarea
              id="fcm-json"
              rows={12}
              value={jsonText}
              onChange={(e) => { setJsonText(e.target.value); setJsonError(""); }}
              placeholder={'{\n  "type": "service_account",\n  "project_id": "my-project",\n  "private_key": "-----BEGIN RSA PRIVATE KEY-----\\n...",\n  "client_email": "firebase-adminsdk@my-project.iam.gserviceaccount.com",\n  ...\n}'}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 font-mono text-xs text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:bg-gray-800/40 dark:text-gray-200"
            />
            {jsonError && <p className="text-xs text-error-500">{jsonError}</p>}
          </div>
          <div className="flex justify-end">
            <Button
              onClick={validateAndSave}
              disabled={saveMutation.isPending || !jsonText.trim()}
              startIcon={saveMutation.isPending ? <RefreshCw size={14} className="animate-spin" /> : undefined}
            >
              {saveMutation.isPending ? "Saving..." : credential ? "Replace Credential" : "Save Credential"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
