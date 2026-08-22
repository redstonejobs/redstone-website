import { STATUS_STYLES, labelForStatus } from "@/lib/admin/status";

type StatusBadgeProps = {
  status: string | null | undefined;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const key = status ?? "draft";
  const classes = STATUS_STYLES[key] ?? STATUS_STYLES.draft;

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${classes}`}>
      {labelForStatus(status)}
    </span>
  );
}

