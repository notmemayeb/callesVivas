"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { CATEGORY_CONFIG } from "@/lib/constants";
import type { IncidentStatusKey, MacroCategoryKey } from "@/lib/constants";
import { Card } from "@/components/ui/card";

interface IncidentCardProps {
  id: string;
  title: string;
  neighborhoodName: string;
  macroCategory: MacroCategoryKey;
  status: IncidentStatusKey;
  votesCount: number;
  thumbnailUrl?: string | null;
  className?: string;
}

export function IncidentCard({
  id,
  title,
  neighborhoodName,
  macroCategory,
  status,
  votesCount,
  thumbnailUrl,
  className,
}: IncidentCardProps) {
  const catConfig = CATEGORY_CONFIG[macroCategory];

  return (
    <Link href={`/incidents/${id}`}>
      <Card className="flex gap-3 p-3 hover:-translate-y-px hover:shadow-md transition-all cursor-pointer overflow-hidden">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt=""
            className="w-12 h-12 rounded-md object-cover shrink-0"
          />
        ) : (
          <div
            className="w-12 h-12 rounded-md shrink-0 flex items-center justify-center"
            style={{ backgroundColor: catConfig.color + "20" }}
          >
            <catConfig.icon size={20} style={{ color: catConfig.color }} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{title}</p>
          <p className="text-xs text-muted-foreground">
            {neighborhoodName} · {catConfig.label}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
              <Star size={12} /> {votesCount}
            </span>
            <StatusBadge status={status} />
          </div>
        </div>
      </Card>
    </Link>
  );
}
