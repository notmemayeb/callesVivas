"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { IncidentCard } from "@/components/incidents/IncidentCard";
import { Skeleton } from "@/components/ui/skeleton";
import type { MacroCategoryKey, IncidentStatusKey } from "@/lib/constants";

const PERIOD_LABELS: Record<string, string> = {
  today: "Hoy",
  week: "Esta semana",
  month: "Este mes",
};

export default function TopPeriodPage() {
  const { period } = useParams<{ period: string }>();
  const router = useRouter();

  const validPeriod = (["today", "week", "month"] as const).includes(
    period as "today" | "week" | "month"
  )
    ? (period as "today" | "week" | "month")
    : "week";

  const { data, isLoading } = trpc.incidents.top.useQuery({
    period: validPeriod,
  });

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex-1 overflow-auto pb-20 lg:pb-4">
        <div className="max-w-2xl mx-auto p-4 space-y-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={16} /> Volver
          </button>

          <h1 className="text-lg font-bold">
            Top 5 — {PERIOD_LABELS[validPeriod] || validPeriod}
          </h1>

          {isLoading && (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-20 w-full rounded-lg" />
              ))}
            </div>
          )}

          {data?.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No hay incidencias en este período.
            </p>
          )}

          <div className="space-y-3">
            {data?.map((incident, idx) => (
              <div key={incident.id} className="flex items-start gap-3">
                <span className="text-xl font-bold text-muted-foreground/40 min-w-[28px] text-right mt-2">
                  {idx + 1}
                </span>
                <div className="flex-1">
                  <IncidentCard
                    id={incident.id}
                    title={incident.title}
                    neighborhoodName={incident.neighborhood.name}
                    macroCategory={
                      incident.category.macroCategory as MacroCategoryKey
                    }
                    status={incident.status as IncidentStatusKey}
                    votesCount={incident.votesCount}
                    thumbnailUrl={
                      incident.media[0]?.thumbnailUrl ??
                      incident.media[0]?.url ??
                      null
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
