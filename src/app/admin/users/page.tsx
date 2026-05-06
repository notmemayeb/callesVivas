"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Crown,
  Search,
  User,
  Newspaper,
  Shield,
  Star,
  MessageSquare,
  FileText,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ROLE_CONFIG = {
  CITIZEN: { label: "Ciudadano", icon: User, color: "#6B7280" },
  MODERATOR: { label: "Moderador", icon: Shield, color: "#F59E0B" },
  JOURNALIST: { label: "Periodista", icon: Newspaper, color: "#3B82F6" },
  COORDINATOR: { label: "Coordinador", icon: Crown, color: "#8B5CF6" },
} as const;

type RoleKey = keyof typeof ROLE_CONFIG;

export default function CoordinatorUsersPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const utils = trpc.useUtils();

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleKey | "">("");

  const authorized = session?.user?.role === "COORDINATOR";

  const { data: stats } = trpc.users.stats.useQuery(undefined, {
    enabled: authorized,
  });

  const { data: users, isLoading } = trpc.users.list.useQuery(
    {
      search: search || undefined,
      role: (roleFilter || undefined) as RoleKey | undefined,
      limit: 30,
    },
    { enabled: authorized }
  );

  const changeRoleMutation = trpc.users.changeRole.useMutation({
    onSuccess: () => {
      utils.users.list.invalidate();
      utils.users.stats.invalidate();
    },
  });

  if (!authorized) {
    return (
      <div className="flex flex-col h-screen">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Crown size={48} className="mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">
              Acceso restringido a coordinadores
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
          <h1 className="text-xl font-bold">Gestión de usuarios</h1>

          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <Card className="p-3 text-center">
                <p className="text-xl font-bold">{stats.total}</p>
                <p className="text-[10px] text-muted-foreground">Total</p>
              </Card>
              {(
                Object.entries(ROLE_CONFIG) as [RoleKey, (typeof ROLE_CONFIG)[RoleKey]][]
              ).map(([key, cfg]) => (
                <Card key={key} className="p-3 text-center">
                  <p
                    className="text-xl font-bold"
                    style={{ color: cfg.color }}
                  >
                    {stats[
                      (key.toLowerCase() + "s") as keyof typeof stats
                    ] ?? 0}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {cfg.label}s
                  </p>
                </Card>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                placeholder="Buscar por nombre o email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as RoleKey | "")}
              className="border border-border rounded-md px-3 text-sm bg-background"
            >
              <option value="">Todos los roles</option>
              {(Object.entries(ROLE_CONFIG) as [RoleKey, (typeof ROLE_CONFIG)[RoleKey]][]).map(
                ([key, cfg]) => (
                  <option key={key} value={key}>
                    {cfg.label}
                  </option>
                )
              )}
            </select>
          </div>

          {isLoading && (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          )}

          <div className="space-y-2">
            {users?.items.map((user) => {
              const roleCfg = ROLE_CONFIG[user.role as RoleKey];
              const RoleIcon = roleCfg.icon;

              return (
                <Card key={user.id} className="p-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.image ?? undefined} />
                      <AvatarFallback>
                        {user.name?.charAt(0)?.toUpperCase() ?? "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {user.name ?? "Sin nombre"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                      <div className="flex items-center gap-3 mt-0.5 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-0.5">
                          <FileText size={10} /> {user._count.incidents}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <Star size={10} /> {user._count.votes}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <MessageSquare size={10} /> {user._count.comments}
                        </span>
                      </div>
                    </div>
                    <select
                      value={user.role}
                      onChange={(e) =>
                        changeRoleMutation.mutate({
                          userId: user.id,
                          role: e.target.value as RoleKey,
                        })
                      }
                      disabled={
                        changeRoleMutation.isPending ||
                        user.id === session?.user?.id
                      }
                      className="border border-border rounded-md px-2 py-1 text-xs bg-background"
                      style={{ color: roleCfg.color }}
                    >
                      {(Object.entries(ROLE_CONFIG) as [RoleKey, (typeof ROLE_CONFIG)[RoleKey]][]).map(
                        ([key, cfg]) => (
                          <option key={key} value={key}>
                            {cfg.label}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </Card>
              );
            })}
          </div>

          {users?.items.length === 0 && (
            <Card className="p-8 text-center">
              <p className="text-sm text-muted-foreground">
                No se encontraron usuarios
              </p>
            </Card>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
