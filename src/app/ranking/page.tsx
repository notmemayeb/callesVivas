"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { TrendingUp, ThumbsUp } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CATEGORY_CONFIG,
  STATUS_CONFIG,
  type MacroCategoryKey,
  type IncidentStatusKey,
} from "@/lib/constants";

type TabKey = "all" | "untouched" | "in_progress" | "resolved" | "abandoned";

const TABS: { key: TabKey; label: string }[] = [
  { key: "all", label: "Todas" },
  { key: "untouched", label: "Sin atender" },
  { key: "in_progress", label: "En progreso" },
  { key: "resolved", label: "Resueltas" },
  { key: "abandoned", label: "Abandonadas" },
];

const UNTOUCHED_STATUSES = new Set(["PUBLISHED"]);
const IN_PROGRESS_STATUSES = new Set([
  "IN_CONTACT",
  "ADMIN_CONTACT",
  "MEASURES_ANNOUNCED",
  "AWAITING_RESPONSE",
]);
const VALIDATED_STATUSES = new Set([
  "PUBLISHED",
  "IN_CONTACT",
  "ADMIN_CONTACT",
  "MEASURES_ANNOUNCED",
  "AWAITING_RESPONSE",
  "RESOLVED",
  "ABANDONED",
]);

export default function RankingPage() {
  const [tab, setTab] = useState<TabKey>("all");
  const { data, isLoading } = trpc.incidents.list.useQuery({ limit: 50 });

  const validated = useMemo(() => {
    if (!data?.items) return [];
    return data.items.filter((i) => VALIDATED_STATUSES.has(i.status));
  }, [data]);

  const sorted = useMemo(() => {
    const filtered = validated.filter((i) => {
      if (tab === "untouched") return UNTOUCHED_STATUSES.has(i.status);
      if (tab === "in_progress") return IN_PROGRESS_STATUSES.has(i.status);
      if (tab === "resolved") return i.status === "RESOLVED";
      if (tab === "abandoned") return i.status === "ABANDONED";
      return true;
    });
    return [...filtered].sort((a, b) => b.votesCount - a.votesCount);
  }, [validated, tab]);

  const totalVotes = useMemo(() => {
    return validated.reduce((sum, i) => sum + i.votesCount, 0);
  }, [validated]);

  const counts = useMemo(() => {
    const c = { untouched: 0, inProgress: 0, resolved: 0, abandoned: 0 };
    for (const i of validated) {
      if (UNTOUCHED_STATUSES.has(i.status)) c.untouched++;
      else if (IN_PROGRESS_STATUSES.has(i.status)) c.inProgress++;
      else if (i.status === "RESOLVED") c.resolved++;
      else if (i.status === "ABANDONED") c.abandoned++;
    }
    return c;
  }, [validated]);

  const total = validated.length || 1;
  const resolutionPct = Math.round((counts.resolved / total) * 100);

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex-1 overflow-auto pb-20 lg:pb-4">
        <div className="max-w-3xl mx-auto p-4 space-y-6">
          <h1 className="text-2xl font-bold">Ranking de Incidencias</h1>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="p-3 rounded-xl border border-border bg-card text-center">
              <p className="text-2xl font-bold text-primary">
                {totalVotes.toLocaleString()}
              </p>
              <p className="text-[10px] text-muted-foreground font-medium flex items-center justify-center gap-0.5">
                <TrendingUp size={10} /> Votos totales
              </p>
            </div>
            <div className="p-3 rounded-xl border border-border bg-card text-center">
              <p className="text-2xl font-bold text-amber-500">
                {counts.untouched}
              </p>
              <p className="text-[10px] text-muted-foreground font-medium">
                Sin atender
              </p>
            </div>
            <div className="p-3 rounded-xl border border-border bg-card text-center">
              <p className="text-2xl font-bold text-blue-500">
                {counts.inProgress}
              </p>
              <p className="text-[10px] text-muted-foreground font-medium">
                En progreso
              </p>
            </div>
            <div className="p-3 rounded-xl border border-border bg-card text-center">
              <p className="text-2xl font-bold text-green-600">
                {counts.resolved}
              </p>
              <p className="text-[10px] text-muted-foreground font-medium">
                Resueltas
              </p>
            </div>
            <div className="p-3 rounded-xl border border-border bg-card text-center col-span-2 md:col-span-1">
              <div className="w-full bg-muted h-2 rounded-full mb-1">
                <div
                  className="bg-green-600 h-full rounded-full transition-all"
                  style={{ width: `${resolutionPct}%` }}
                />
              </div>
              <p className="text-lg font-bold text-green-600">{resolutionPct}%</p>
              <p className="text-[10px] text-muted-foreground font-medium">
                Resolución
              </p>
            </div>
          </div>

          <div className="flex gap-1 border-b border-border overflow-x-auto">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                  tab === t.key
                    ? "text-primary border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {isLoading && (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-24 w-full rounded-xl" />
              ))}
            </div>
          )}

          <div className="space-y-3">
            {sorted.map((incident, idx) => {
              const catConfig =
                CATEGORY_CONFIG[
                  incident.category.macroCategory as MacroCategoryKey
                ];
              const statusConfig =
                STATUS_CONFIG[incident.status as IncidentStatusKey];
              const CatIcon = catConfig.icon;
              const isFirst = idx === 0;

              return (
                <Link key={incident.id} href={`/incidents/${incident.id}`}>
                  <div
                    className={`group flex flex-col md:flex-row items-start md:items-center gap-3 p-4 rounded-xl bg-card transition-shadow ${
                      isFirst
                        ? "shadow-md border-l-4"
                        : "shadow-sm border border-border hover:shadow-md"
                    }`}
                    style={
                      isFirst ? { borderLeftColor: catConfig.color } : undefined
                    }
                  >
                    <span
                      className={`text-2xl font-bold min-w-[40px] text-center ${
                        isFirst
                          ? "text-primary"
                          : "text-muted-foreground/30"
                      }`}
                    >
                      {String(idx + 1).padStart(2, "0")}
                    </span>

                    {incident.media[0] ? (
                      <img
                        src={
                          incident.media[0].thumbnailUrl ||
                          incident.media[0].url
                        }
                        alt=""
                        className="w-full md:w-28 h-20 rounded-lg object-cover shrink-0"
                      />
                    ) : (
                      <div
                        className="w-full md:w-28 h-20 rounded-lg shrink-0 flex items-center justify-center"
                        style={{ backgroundColor: catConfig.color + "15" }}
                      >
                        <CatIcon
                          size={28}
                          style={{ color: catConfig.color }}
                        />
                      </div>
                    )}

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {isFirst && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-red-100 text-red-600">
                            Prioridad Alta
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground font-medium">
                          {incident.neighborhood.name}
                        </span>
                      </div>
                      <h3 className="font-semibold text-sm leading-tight truncate">
                        {incident.title}
                      </h3>
                      <div className="flex items-center gap-1.5">
                        <CatIcon
                          size={14}
                          style={{ color: catConfig.color }}
                        />
                        <span className="text-xs text-muted-foreground">
                          {catConfig.label}
                        </span>
                      </div>
                    </div>

                    <div className="flex md:flex-col items-center md:items-end gap-2 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-border">
                      <div
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold ${
                          isFirst
                            ? "bg-primary/10 text-primary"
                            : "bg-muted/50 text-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors"
                        }`}
                      >
                        <ThumbsUp size={16} />
                        {incident.votesCount.toLocaleString()}
                      </div>
                      <Badge
                        variant="outline"
                        className="text-[10px]"
                        style={{
                          borderColor: statusConfig.color,
                          color: statusConfig.color,
                          backgroundColor: statusConfig.color + "15",
                        }}
                      >
                        {statusConfig.label}
                      </Badge>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {sorted.length === 0 && !isLoading && (
            <p className="text-sm text-muted-foreground text-center py-8">
              No hay incidencias en esta categoría.
            </p>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
