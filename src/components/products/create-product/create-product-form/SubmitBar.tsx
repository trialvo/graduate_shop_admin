import Button from "@/components/ui/button/Button";
import { CheckCircle2 } from "lucide-react";

function SubmitBar({
  onSubmit,
  loading,
}: {
  onSubmit: () => void;
  loading: boolean;
}) {
  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
      <Button onClick={onSubmit} disabled={loading} startIcon={<CheckCircle2 size={16} />}>
        {loading ? "Creating..." : "Create Product"}
      </Button>
    </div>
  );
}

export default SubmitBar;