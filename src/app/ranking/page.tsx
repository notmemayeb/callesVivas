"use client";

import { useMemo } from "react";
import Link from "next/link";
import { TrendingUp, ThumbsUp } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CATEGORY_CONFIG,
  type MacroCategoryKey,
} from "@/lib/constants";

export default function RankingPage() {
  const { data, isLoading } = trpc.incidents.list.useQuery({
    limit: 50,
    status: "PUBLISHED",
  });

  const sorted = useMemo(() => {
    if (!data?.items) return [];
    return [...data.items].sort((a, b) => b.votesCount - a.votesCount);
  }, [data]);

  const totalVotes = useMemo(() => {
    return sorted.reduce((sum, i) => sum + i.votesCount, 0);
  }, [sorted]);

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex-1 overflow-auto pb-20 lg:pb-4">
        <div className="max-w-3xl mx-auto p-4 space-y-6">
          <h1 className="text-2xl font-bold">Ranking de Incidencias</h1>

          <div className="grid grid-cols-2 gap-3">
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
                {sorted.length}
              </p>
              <p className="text-[10px] text-muted-foreground font-medium">
                Incidencias publicadas
              </p>
            </div>
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
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {sorted.length === 0 && !isLoading && (
            <p className="text-sm text-muted-foreground text-center py-8">
              No hay incidencias publicadas.
            </p>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
