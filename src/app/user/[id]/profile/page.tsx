"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { MapPin, Star, MessageSquare, FileText, Calendar, ClipboardList, Eye } from "lucide-react";
import { useSession } from "next-auth/react";
import { trpc } from "@/lib/trpc";
import { Header } from "@/components/layout/Header";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { IncidentCard } from "@/components/incidents/IncidentCard";
import type { MacroCategoryKey, IncidentStatusKey } from "@/lib/constants";

const ROLE_LABELS: Record<string, string> = {
  CITIZEN: "Ciudadano",
  MODERATOR: "Moderador",
  JOURNALIST: "Periodista",
  COORDINATOR: "Coordinador",
};

type Tab = "info" | "my-incidents" | "followed";

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();
  const { data: user, isLoading } = trpc.users.byId.useQuery({ id });

  const isOwnProfile = session?.user?.id === id;
  const [tab, setTab] = useState<Tab>(isOwnProfile ? "my-incidents" : "info");

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen">
        <Header />
        <div className="flex-1 p-4 space-y-4 max-w-lg mx-auto w-full">
          <Skeleton className="h-20 w-20 rounded-full mx-auto" />
          <Skeleton className="h-6 w-48 mx-auto" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col h-screen">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Usuario no encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex-1 overflow-auto">
        <div className="max-w-2xl mx-auto p-4 space-y-6">
          {/* Profile header */}
          <div className="text-center space-y-2">
            {user.image ? (
              <img
                src={user.image}
                alt=""
                className="w-20 h-20 rounded-full mx-auto"
              />
            ) : (
              <div className="w-20 h-20 rounded-full mx-auto bg-muted flex items-center justify-center text-2xl font-bold text-muted-foreground">
                {(user.name || "?")[0].toUpperCase()}
              </div>
            )}
            <h1 className="text-xl font-bold">{user.name || "Ciudadano anónimo"}</h1>
            <div className="flex items-center justify-center gap-2">
              <Badge variant="outline">{ROLE_LABELS[user.role] || user.role}</Badge>
              {user.neighborhood && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin size={12} /> {user.neighborhood.name}
                </span>
              )}
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 rounded-lg border border-border">
              <FileText size={18} className="mx-auto text-muted-foreground mb-1" />
              <p className="text-lg font-bold">{user._count.incidents}</p>
              <p className="text-xs text-muted-foreground">Incidencias</p>
            </div>
            <div className="text-center p-3 rounded-lg border border-border">
              <Star size={18} className="mx-auto text-muted-foreground mb-1" />
              <p className="text-lg font-bold">{user._count.votes}</p>
              <p className="text-xs text-muted-foreground">Votos</p>
            </div>
            <div className="text-center p-3 rounded-lg border border-border">
              <MessageSquare size={18} className="mx-auto text-muted-foreground mb-1" />
              <p className="text-lg font-bold">{user._count.comments}</p>
              <p className="text-xs text-muted-foreground">Comentarios</p>
            </div>
          </div>

          {/* Tabs — only show my-incidents/followed for own profile */}
          {isOwnProfile ? (
            <>
              <div className="flex border-b border-border">
                <button
                  onClick={() => setTab("my-incidents")}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                    tab === "my-incidents"
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <ClipboardList size={16} />
                  Mis incidencias
                </button>
                <button
                  onClick={() => setTab("followed")}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                    tab === "followed"
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Eye size={16} />
                  Seguidas
                </button>
                <button
                  onClick={() => setTab("info")}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                    tab === "info"
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Info
                </button>
              </div>

              {tab === "my-incidents" && <MyIncidentsTab />}
              {tab === "followed" && <FollowedTab />}
              {tab === "info" && <InfoSection user={user} />}
            </>
          ) : (
            <InfoSection user={user} />
          )}
        </div>
      </div>
    </div>
  );
}

function InfoSection({ user }: { user: { activityPoints: number; createdAt: Date | string } }) {
  return (
    <div className="space-y-2 text-sm">
      <div className="flex items-center justify-between p-3 rounded-lg border border-border">
        <span className="text-muted-foreground">Puntos de actividad</span>
        <span className="font-medium">{user.activityPoints}</span>
      </div>
      <div className="flex items-center justify-between p-3 rounded-lg border border-border">
        <span className="text-muted-foreground">Miembro desde</span>
        <span className="font-medium flex items-center gap-1">
          <Calendar size={14} />
          {new Date(user.createdAt).toLocaleDateString("es-ES", {
            month: "long",
            year: "numeric",
          })}
        </span>
      </div>
    </div>
  );
}

function MyIncidentsTab() {
  const { data, isLoading } = trpc.users.myIncidents.useQuery({ limit: 50 });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (!data?.items.length) {
    return (
      <p className="text-sm text-muted-foreground py-4">
        No has creado ninguna incidencia todavía.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {data.items.map((incident) => (
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
  );
}

function FollowedTab() {
  const { data, isLoading } = trpc.users.myFollowed.useQuery({ limit: 50 });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (!data?.items.length) {
    return (
      <p className="text-sm text-muted-foreground py-4">
        No estás siguiendo ninguna incidencia todavía.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {data.items.map((incident) => (
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
  );
}
