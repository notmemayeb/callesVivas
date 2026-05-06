"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  XCircle,
  RefreshCw,
  Clock,
  Shield,
  Eye,
  ChevronRight,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { StatusBadge } from "@/components/incidents/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { CATEGORY_CONFIG } from "@/lib/constants";
import type { MacroCategoryKey, IncidentStatusKey } from "@/lib/constants";

export default function AdminPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const utils = trpc.useUtils();

  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const role = session?.user?.role;
  const authorized = role === "MODERATOR" || role === "COORDINATOR";

  const { data: stats } = trpc.moderation.stats.useQuery(undefined, {
    enabled: authorized,
  });
  const { data: queue, isLoading } = trpc.moderation.queue.useQuery(
    { limit: 20 },
    { enabled: authorized }
  );

  const approveMutation = trpc.moderation.approve.useMutation({
    onSuccess: () => {
      utils.moderation.queue.invalidate();
      utils.moderation.stats.invalidate();
    },
  });

  const rejectMutation = trpc.moderation.reject.useMutation({
    onSuccess: () => {
      setRejectingId(null);
      setRejectReason("");
      utils.moderation.queue.invalidate();
      utils.moderation.stats.invalidate();
    },
  });

  if (!authorized) {
    return (
      <div className="flex flex-col h-screen">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Shield size={48} className="mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">
              Acceso restringido a moderadores
            </p>
            <Button variant="outline" onClick={() => router.push("/")}>
              Volver al mapa
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex-1 overflow-auto pb-20 lg:pb-4">
        <div className="max-w-3xl mx-auto p-4 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">Panel de moderación</h1>
            <StatusBadge status={"DETECTED" as IncidentStatusKey} />
          </div>

          {/* Stats cards */}
          {stats && (
            <div className="grid grid-cols-3 gap-3">
              <Card className="p-4 text-center">
                <p className="text-2xl font-bold text-amber-500">
                  {stats.pending}
                </p>
                <p className="text-xs text-muted-foreground">Pendientes</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-2xl font-bold text-green-500">
                  {stats.approved}
                </p>
                <p className="text-xs text-muted-foreground">Publicadas</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </Card>
            </div>
          )}

          <Separator />

          <h2 className="text-sm font-semibold flex items-center gap-2">
            <Clock size={16} /> Cola de moderación
          </h2>

          {isLoading && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 w-full rounded-lg" />
              ))}
            </div>
          )}

          {queue?.items.length === 0 && (
            <Card className="p-8 text-center">
              <CheckCircle2
                size={40}
                className="mx-auto text-green-500 mb-2"
              />
              <p className="text-sm text-muted-foreground">
                No hay incidencias pendientes de moderación
              </p>
            </Card>
          )}

          <div className="space-y-3">
            {queue?.items.map((incident) => {
              const catConfig =
                CATEGORY_CONFIG[
                  incident.category.macroCategory as MacroCategoryKey
                ];
              const CatIcon = catConfig.icon;
              const isRejecting = rejectingId === incident.id;

              return (
                <Card key={incident.id} className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: catConfig.color + "20" }}
                    >
                      <CatIcon
                        size={20}
                        style={{ color: catConfig.color }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{incident.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {incident.neighborhood.name} · {catConfig.label}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Por {incident.author.name ?? incident.author.email} ·{" "}
                        {new Date(incident.createdAt).toLocaleDateString(
                          "es-ES"
                        )}
                      </p>
                    </div>
                    {incident.media.length > 0 && (
                      <img
                        src={incident.media[0].thumbnailUrl ?? incident.media[0].url}
                        alt=""
                        className="w-16 h-16 rounded-md object-cover shrink-0"
                      />
                    )}
                  </div>

                  <p className="text-xs leading-relaxed line-clamp-3">
                    {incident.description}
                  </p>

                  {isRejecting ? (
                    <div className="space-y-2">
                      <textarea
                        placeholder="Motivo del rechazo..."
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        className="w-full text-sm border border-border rounded-md p-2 bg-background resize-none"
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={
                            !rejectReason.trim() || rejectMutation.isPending
                          }
                          onClick={() =>
                            rejectMutation.mutate({
                              id: incident.id,
                              reason: rejectReason,
                            })
                          }
                        >
                          Confirmar rechazo
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setRejectingId(null);
                            setRejectReason("");
                          }}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        className="gap-1"
                        disabled={approveMutation.isPending}
                        onClick={() =>
                          approveMutation.mutate({ id: incident.id })
                        }
                      >
                        <CheckCircle2 size={14} /> Aprobar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="gap-1"
                        onClick={() => setRejectingId(incident.id)}
                      >
                        <XCircle size={14} /> Rechazar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1"
                        onClick={() =>
                          router.push(`/incidents/${incident.id}`)
                        }
                      >
                        <Eye size={14} /> Ver
                      </Button>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
