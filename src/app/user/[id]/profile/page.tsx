"use client";

import { useParams } from "next/navigation";
import { MapPin, Star, MessageSquare, FileText, Calendar } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Header } from "@/components/layout/Header";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const ROLE_LABELS: Record<string, string> = {
  CITIZEN: "Ciudadano",
  MODERATOR: "Moderador",
  JOURNALIST: "Periodista",
  COORDINATOR: "Coordinador",
};

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { data: user, isLoading } = trpc.users.byId.useQuery({ id });

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
        <div className="max-w-lg mx-auto p-4 space-y-6">
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
        </div>
      </div>
    </div>
  );
}
