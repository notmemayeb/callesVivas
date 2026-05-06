"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useSession } from "next-auth/react";
import { trpc } from "@/lib/trpc";
import { Header } from "@/components/layout/Header";
import { IncidentCard } from "@/components/incidents/IncidentCard";
import { Skeleton } from "@/components/ui/skeleton";
import type { MacroCategoryKey, IncidentStatusKey } from "@/lib/constants";

export default function FollowedIncidentsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { data, isLoading } = trpc.users.myFollowed.useQuery(
    { limit: 50 },
    { enabled: status === "authenticated" }
  );

  if (status === "unauthenticated") {
    router.push("/signin");
    return null;
  }

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex-1 overflow-auto">
        <div className="max-w-2xl mx-auto p-4 space-y-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={16} /> Volver
          </button>

          <h1 className="text-lg font-bold">Incidencias seguidas</h1>

          {isLoading && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full rounded-lg" />
              ))}
            </div>
          )}

          {data?.items.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No estás siguiendo ninguna incidencia todavía.
            </p>
          )}

          <div className="space-y-3">
            {data?.items.map((incident) => (
              <IncidentCard
                key={incident.id}
                id={incident.id}
                title={incident.title}
                neighborhoodName={incident.neighborhood.name}
                macroCategory={incident.category.macroCategory as MacroCategoryKey}
                status={incident.status as IncidentStatusKey}
                votesCount={incident.votesCount}
                thumbnailUrl={incident.media[0]?.thumbnailUrl ?? incident.media[0]?.url ?? null}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
