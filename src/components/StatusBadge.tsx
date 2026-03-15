import { GankStatus } from "@/lib/types";

const statusStyles: Record<GankStatus, string> = {
  pending: "bg-amber-100 text-amber-700",
  accepted: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

export default function StatusBadge({ status }: { status: GankStatus }) {
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
}
