import { Badge } from "@/components/ui/badge";

const statusVariantMap: Record<string, "default" | "warning" | "success" | "info"> = {
  active: "success",
  paused: "warning",
  queued: "info",
  scripting: "info",
  captions: "info",
  assembling: "info",
  processing: "info",
  complete: "success",
  draft: "default",
  failed: "warning"
};

export function StatusBadge({ status }: { status: string }) {
  return <Badge variant={statusVariantMap[status] ?? "default"}>{status}</Badge>;
}
