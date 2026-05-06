"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Newspaper,
  Video,
  Phone,
  Plus,
  Star,
  ExternalLink,
  FileText,
  FolderOpen,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { StatusBadge } from "@/components/incidents/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { CATEGORY_CONFIG } from "@/lib/constants";
import type { MacroCategoryKey, IncidentStatusKey } from "@/lib/constants";

const CONTENT_TYPES = [
  { value: "VIDEO_REPORT", label: "Vídeo reportaje", icon: Video },
  { value: "ARTICLE", label: "Artículo", icon: FileText },
  { value: "DOCUMENTATION", label: "Documentación", icon: FolderOpen },
] as const;

const CONTACT_TYPES = [
  { value: "EMAIL", label: "Email" },
  { value: "CALL", label: "Llamada" },
  { value: "VISIT", label: "Visita" },
  { value: "OFFICIAL_FILING", label: "Expediente oficial" },
] as const;

export default function JournalistPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const utils = trpc.useUtils();

  const role = session?.user?.role;
  const authorized = role === "JOURNALIST" || role === "COORDINATOR";

  const [addingContentFor, setAddingContentFor] = useState<string | null>(null);
  const [addingContactFor, setAddingContactFor] = useState<string | null>(null);

  const [contentForm, setContentForm] = useState({
    type: "ARTICLE" as "VIDEO_REPORT" | "ARTICLE" | "DOCUMENTATION",
    title: "",
    newspaperUrl: "",
    contentUrl: "",
  });

  const [contactForm, setContactForm] = useState({
    agency: "",
    contactPerson: "",
    type: "EMAIL" as "EMAIL" | "CALL" | "VISIT" | "OFFICIAL_FILING",
    summary: "",
    response: "",
  });

  const { data: assigned, isLoading } = trpc.journalist.assigned.useQuery(
    { limit: 10 },
    { enabled: authorized }
  );

  const addContentMutation = trpc.journalist.addContent.useMutation({
    onSuccess: () => {
      setAddingContentFor(null);
      setContentForm({ type: "ARTICLE", title: "", newspaperUrl: "", contentUrl: "" });
      utils.journalist.assigned.invalidate();
    },
  });

  const addContactMutation = trpc.journalist.addAdminContact.useMutation({
    onSuccess: () => {
      setAddingContactFor(null);
      setContactForm({ agency: "", contactPerson: "", type: "EMAIL", summary: "", response: "" });
      utils.journalist.assigned.invalidate();
    },
  });

  if (!authorized) {
    return (
      <div className="flex flex-col h-screen">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Newspaper size={48} className="mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">
              Acceso restringido a periodistas
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
          <h1 className="text-xl font-bold">Panel de periodista</h1>
          <p className="text-sm text-muted-foreground">
            Incidencias con más votos pendientes de investigación
          </p>

          {isLoading && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-28 w-full rounded-lg" />
              ))}
            </div>
          )}

          {assigned?.length === 0 && (
            <Card className="p-8 text-center">
              <p className="text-sm text-muted-foreground">
                No hay incidencias publicadas para investigar
              </p>
            </Card>
          )}

          <div className="space-y-4">
            {assigned?.map((incident, idx) => {
              const catConfig =
                CATEGORY_CONFIG[
                  incident.category.macroCategory as MacroCategoryKey
                ];
              const CatIcon = catConfig.icon;
              const isAddingContent = addingContentFor === incident.id;
              const isAddingContact = addingContactFor === incident.id;

              return (
                <Card key={incident.id} className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="text-lg font-bold text-muted-foreground/40 min-w-[24px] text-right mt-1">
                      {idx + 1}
                    </span>
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: catConfig.color + "20" }}
                    >
                      <CatIcon size={20} style={{ color: catConfig.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/incidents/${incident.id}`}
                        className="font-medium text-sm hover:underline"
                      >
                        {incident.title}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {incident.neighborhood.name} · {catConfig.label}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                          <Star size={12} /> {incident.votesCount}
                        </span>
                        <StatusBadge
                          status={incident.status as IncidentStatusKey}
                        />
                        {incident._count.adminContacts > 0 && (
                          <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                            <Phone size={10} /> {incident._count.adminContacts}
                          </span>
                        )}
                      </div>
                    </div>
                    {incident.media[0] && (
                      <img
                        src={
                          incident.media[0].thumbnailUrl ??
                          incident.media[0].url
                        }
                        alt=""
                        className="w-14 h-14 rounded-md object-cover shrink-0"
                      />
                    )}
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1"
                      onClick={() =>
                        setAddingContentFor(
                          isAddingContent ? null : incident.id
                        )
                      }
                    >
                      <Plus size={14} /> Contenido
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1"
                      onClick={() =>
                        setAddingContactFor(
                          isAddingContact ? null : incident.id
                        )
                      }
                    >
                      <Phone size={14} /> Contacto admin
                    </Button>
                  </div>

                  {/* Add Content Form */}
                  {isAddingContent && (
                    <div className="border border-border rounded-lg p-3 space-y-3">
                      <p className="text-xs font-semibold">
                        Añadir contenido periodístico
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {CONTENT_TYPES.map((ct) => (
                          <button
                            key={ct.value}
                            type="button"
                            onClick={() =>
                              setContentForm((f) => ({
                                ...f,
                                type: ct.value,
                              }))
                            }
                            className={`flex flex-col items-center gap-1 p-2 rounded-md border text-xs transition-colors ${
                              contentForm.type === ct.value
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/30"
                            }`}
                          >
                            <ct.icon size={16} />
                            {ct.label}
                          </button>
                        ))}
                      </div>
                      <div>
                        <Label className="text-xs">Título</Label>
                        <Input
                          value={contentForm.title}
                          onChange={(e) =>
                            setContentForm((f) => ({
                              ...f,
                              title: e.target.value,
                            }))
                          }
                          placeholder="Título del contenido"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">URL del periódico</Label>
                        <Input
                          value={contentForm.newspaperUrl}
                          onChange={(e) =>
                            setContentForm((f) => ({
                              ...f,
                              newspaperUrl: e.target.value,
                            }))
                          }
                          placeholder="https://eldiario.es/..."
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">URL del contenido</Label>
                        <Input
                          value={contentForm.contentUrl}
                          onChange={(e) =>
                            setContentForm((f) => ({
                              ...f,
                              contentUrl: e.target.value,
                            }))
                          }
                          placeholder="https://..."
                          className="mt-1"
                        />
                      </div>
                      <Button
                        size="sm"
                        disabled={
                          !contentForm.title.trim() ||
                          addContentMutation.isPending
                        }
                        onClick={() =>
                          addContentMutation.mutate({
                            incidentId: incident.id,
                            type: contentForm.type,
                            title: contentForm.title,
                            newspaperUrl: contentForm.newspaperUrl || undefined,
                            contentUrl: contentForm.contentUrl || undefined,
                          })
                        }
                      >
                        Guardar contenido
                      </Button>
                    </div>
                  )}

                  {/* Add Admin Contact Form */}
                  {isAddingContact && (
                    <div className="border border-border rounded-lg p-3 space-y-3">
                      <p className="text-xs font-semibold">
                        Registrar contacto administrativo
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {CONTACT_TYPES.map((ct) => (
                          <button
                            key={ct.value}
                            type="button"
                            onClick={() =>
                              setContactForm((f) => ({
                                ...f,
                                type: ct.value,
                              }))
                            }
                            className={`p-2 rounded-md border text-xs text-center transition-colors ${
                              contactForm.type === ct.value
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/30"
                            }`}
                          >
                            {ct.label}
                          </button>
                        ))}
                      </div>
                      <div>
                        <Label className="text-xs">Organismo</Label>
                        <Input
                          value={contactForm.agency}
                          onChange={(e) =>
                            setContactForm((f) => ({
                              ...f,
                              agency: e.target.value,
                            }))
                          }
                          placeholder="Ej: Ayuntamiento de Madrid"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">
                          Persona de contacto (opcional)
                        </Label>
                        <Input
                          value={contactForm.contactPerson}
                          onChange={(e) =>
                            setContactForm((f) => ({
                              ...f,
                              contactPerson: e.target.value,
                            }))
                          }
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Resumen</Label>
                        <textarea
                          value={contactForm.summary}
                          onChange={(e) =>
                            setContactForm((f) => ({
                              ...f,
                              summary: e.target.value,
                            }))
                          }
                          placeholder="Resumen de la comunicación..."
                          className="w-full text-sm border border-border rounded-md p-2 bg-background resize-none mt-1"
                          rows={2}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">
                          Respuesta recibida (opcional)
                        </Label>
                        <textarea
                          value={contactForm.response}
                          onChange={(e) =>
                            setContactForm((f) => ({
                              ...f,
                              response: e.target.value,
                            }))
                          }
                          className="w-full text-sm border border-border rounded-md p-2 bg-background resize-none mt-1"
                          rows={2}
                        />
                      </div>
                      <Button
                        size="sm"
                        disabled={
                          !contactForm.agency.trim() ||
                          addContactMutation.isPending
                        }
                        onClick={() =>
                          addContactMutation.mutate({
                            incidentId: incident.id,
                            agency: contactForm.agency,
                            contactPerson:
                              contactForm.contactPerson || undefined,
                            type: contactForm.type,
                            summary: contactForm.summary || undefined,
                            response: contactForm.response || undefined,
                          })
                        }
                      >
                        Guardar contacto
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
