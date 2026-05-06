import { STATUS_CONFIG, type IncidentStatusKey } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";

interface StatusBadgeProps {
  status: IncidentStatusKey;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
        status === "AWAITING_RESPONSE" && "animate-pulse",
        className
      )}
      style={{
        backgroundColor:
          config.variant === "outline" ? "transparent" : config.color,
        color: config.variant === "outline" ? config.color : "#FFFFFF",
        border:
          config.variant === "outline" ? `1px solid ${config.color}` : "none",
      }}
    >
      {status === "RESOLVED" && <Check size={12} />}
      {status === "ABANDONED" && <X size={12} />}
      {config.label}
    </span>
  );
}
