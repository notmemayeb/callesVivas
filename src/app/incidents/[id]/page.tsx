"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Star,
  Bell,
  BellOff,
  MessageSquare,
  Eye,
  Clock,
  Share2,
  Shield,
  Newspaper,
  CheckCircle2,
  XCircle,
  Phone,
  Video,
  FileText,
  ExternalLink,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { trpc } from "@/lib/trpc";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { MediaUpload } from "@/components/media/MediaUpload";
import { CATEGORY_CONFIG, STATUS_CONFIG } from "@/lib/constants";
import type { MacroCategoryKey, IncidentStatusKey } from "@/lib/constants";

export default function IncidentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const utils = trpc.useUtils();

  const { data: incident, isLoading } = trpc.incidents.byId.useQuery({ id });
  const { data: hasVoted } = trpc.votes.hasVoted.useQuery(
    { incidentId: id },
    { enabled: !!session }
  );
  const { data: isFollowing } = trpc.votes.isFollowing.useQuery(
    { incidentId: id },
    { enabled: !!session }
  );

  const voteMutation = trpc.votes.vote.useMutation({
    onSuccess: () => {
      utils.incidents.byId.invalidate({ id });
      utils.votes.hasVoted.invalidate({ incidentId: id });
    },
  });

  const followMutation = trpc.votes.follow.useMutation({
    onSuccess: () => {
      utils.incidents.byId.invalidate({ id });
      utils.votes.isFollowing.invalidate({ incidentId: id });
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen">
        <Header />
        <div className="flex-1 overflow-auto p-4 space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="flex flex-col h-screen">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">Incidencia no encontrada</p>
            <Button variant="outline" onClick={() => router.push("/")}>
              Volver al mapa
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const catConfig = CATEGORY_CONFIG[incident.category.macroCategory as MacroCategoryKey];
  const statusConfig = STATUS_CONFIG[incident.status as IncidentStatusKey];
  const CatIcon = catConfig.icon;

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex-1 overflow-auto">
        <div className="max-w-2xl mx-auto p-4 space-y-6">
          {/* Back + Title */}
          <div className="space-y-3">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft size={16} /> Volver
            </button>

            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: catConfig.color + "20" }}
              >
                <CatIcon size={20} style={{ color: catConfig.color }} />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl font-bold leading-tight">
                  {incident.title}
                </h1>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <Badge
                    variant={statusConfig.variant}
                    style={{
                      borderColor: statusConfig.color,
                      color: statusConfig.variant === "outline" ? statusConfig.color : undefined,
                      backgroundColor: statusConfig.variant === "default" ? statusConfig.color : undefined,
                    }}
                  >
                    {statusConfig.label}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {incident.neighborhood.name}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Photos */}
          {incident.media.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {incident.media
                .filter((m) => m.type === "PHOTO")
                .map((m) => (
                  <img
                    key={m.id}
                    src={m.url}
                    alt=""
                    className="h-48 rounded-lg object-cover shrink-0"
                  />
                ))}
            </div>
          )}

          {/* Description */}
          <p className="text-sm leading-relaxed">{incident.description}</p>

          {/* Meta */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin size={12} /> {incident.addressText || incident.neighborhood.name}
            </span>
            <span className="flex items-center gap-1">
              <Eye size={12} /> {incident.visitsCount}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={12} />{" "}
              {new Date(incident.createdAt).toLocaleDateString("es-ES")}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <Button
              variant={hasVoted ? "default" : "outline"}
              size="sm"
              className="gap-1"
              onClick={() => voteMutation.mutate({ incidentId: id })}
              disabled={!session || voteMutation.isPending}
            >
              <Star size={14} /> {incident.votesCount}
            </Button>
            <Button
              variant={isFollowing ? "default" : "outline"}
              size="sm"
              className="gap-1"
              onClick={() => followMutation.mutate({ incidentId: id })}
              disabled={!session || followMutation.isPending}
            >
              {isFollowing ? <BellOff size={14} /> : <Bell size={14} />}
              {incident._count.follows}
            </Button>
            <Link href={`/incidents/${id}/comments`}>
              <Button variant="outline" size="sm" className="gap-1">
                <MessageSquare size={14} /> {incident._count.comments}
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ url: window.location.href }).catch(() => {});
                } else {
                  navigator.clipboard.writeText(window.location.href);
                }
              }}
            >
              <Share2 size={14} />
            </Button>
          </div>

          <Separator />

          {/* Author */}
          <div className="flex items-center gap-2">
            {incident.author.image && (
              <img
                src={incident.author.image}
                alt=""
                className="w-8 h-8 rounded-full"
              />
            )}
            <div>
              <p className="text-sm font-medium">
                {incident.author.name || "Ciudadano anónimo"}
              </p>
              <p className="text-xs text-muted-foreground">Reportado por</p>
            </div>
          </div>

          {/* Upload for author */}
          {session?.user?.id === incident.authorId && (
            <MediaUpload
              incidentId={id}
              onUploadComplete={() => utils.incidents.byId.invalidate({ id })}
            />
          )}

          {/* Moderator Actions */}
          {(session?.user?.role === "MODERATOR" ||
            session?.user?.role === "COORDINATOR") && (
            <ModeratorActions
              incidentId={id}
              currentStatus={incident.status as IncidentStatusKey}
              onSuccess={() => utils.incidents.byId.invalidate({ id })}
            />
          )}

          {/* Journalist Actions */}
          {(session?.user?.role === "JOURNALIST" ||
            session?.user?.role === "COORDINATOR") && (
            <JournalistActions
              incidentId={id}
              onSuccess={() => utils.incidents.byId.invalidate({ id })}
            />
          )}

          {/* Journalistic Content */}
          {incident.journalisticContent.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-sm font-semibold flex items-center gap-1">
                <Newspaper size={14} /> Contenido periodístico
              </h2>
              <div className="space-y-2">
                {incident.journalisticContent.map((content) => (
                  <div
                    key={content.id}
                    className="flex items-center gap-2 p-2 rounded-md border border-border text-sm"
                  >
                    {content.type === "VIDEO_REPORT" ? (
                      <Video size={14} className="text-red-500 shrink-0" />
                    ) : (
                      <FileText size={14} className="text-blue-500 shrink-0" />
                    )}
                    <span className="flex-1 truncate">{content.title}</span>
                    {content.newspaperUrl && (
                      <a
                        href={content.newspaperUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary"
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Admin Contacts */}
          {incident.adminContacts.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-sm font-semibold flex items-center gap-1">
                <Phone size={14} /> Contactos administrativos
              </h2>
              <div className="space-y-2">
                {incident.adminContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="p-2 rounded-md border border-border text-xs space-y-1"
                  >
                    <div className="flex justify-between">
                      <span className="font-medium">{contact.agency}</span>
                      <span className="text-muted-foreground">
                        {new Date(contact.contactDate).toLocaleDateString("es-ES")}
                      </span>
                    </div>
                    {contact.summary && (
                      <p className="text-muted-foreground">{contact.summary}</p>
                    )}
                    {contact.response && (
                      <p className="text-green-600">↪ {contact.response}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status Timeline */}
          {incident.statusHistory.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-sm font-semibold">Historial</h2>
              <div className="space-y-3 border-l-2 border-border pl-4">
                {incident.statusHistory.map((entry) => {
                  const entryStatus = STATUS_CONFIG[entry.newStatus as IncidentStatusKey];
                  return (
                    <div key={entry.id} className="relative">
                      <div
                        className="absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 border-background"
                        style={{ backgroundColor: entryStatus.color }}
                      />
                      <p className="text-xs font-medium">{entryStatus.label}</p>
                      {entry.note && (
                        <p className="text-xs text-muted-foreground">
                          {entry.note}
                        </p>
                      )}
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(entry.createdAt).toLocaleDateString("es-ES")} — {entry.author.name}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const STATUS_TRANSITIONS: Record<string, string[]> = {
  DETECTED: ["PUBLISHED", "ABANDONED"],
  PUBLISHED: ["IN_CONTACT", "ABANDONED"],
  IN_CONTACT: ["ADMIN_CONTACT", "RESOLVED", "ABANDONED"],
  ADMIN_CONTACT: ["MEASURES_ANNOUNCED", "AWAITING_RESPONSE", "RESOLVED", "ABANDONED"],
  MEASURES_ANNOUNCED: ["RESOLVED", "AWAITING_RESPONSE", "ABANDONED"],
  AWAITING_RESPONSE: ["RESOLVED", "ABANDONED"],
};

function ModeratorActions({
  incidentId,
  currentStatus,
  onSuccess,
}: {
  incidentId: string;
  currentStatus: IncidentStatusKey;
  onSuccess: () => void;
}) {
  const [note, setNote] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const updateMutation = trpc.incidents.updateStatus.useMutation({
    onSuccess: () => {
      setNote("");
      setSelectedStatus("");
      onSuccess();
    },
  });

  const transitions = STATUS_TRANSITIONS[currentStatus] ?? [];
  if (transitions.length === 0) return null;

  return (
    <div className="border border-amber-500/30 rounded-lg p-3 space-y-3 bg-amber-500/5">
      <p className="text-xs font-semibold flex items-center gap-1">
        <Shield size={14} className="text-amber-500" /> Acciones de moderador
      </p>
      <div className="flex gap-2 flex-wrap">
        {transitions.map((s) => {
          const cfg = STATUS_CONFIG[s as IncidentStatusKey];
          return (
            <button
              key={s}
              type="button"
              onClick={() => setSelectedStatus(s === selectedStatus ? "" : s)}
              className={`px-2 py-1 rounded-md border text-xs transition-colors ${
                selectedStatus === s
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/30"
              }`}
            >
              {cfg.label}
            </button>
          );
        })}
      </div>
      {selectedStatus && (
        <div className="space-y-2">
          <Input
            placeholder="Nota (opcional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="text-sm"
          />
          <Button
            size="sm"
            disabled={updateMutation.isPending}
            onClick={() =>
              updateMutation.mutate({
                id: incidentId,
                status: selectedStatus as IncidentStatusKey,
                note: note || undefined,
              })
            }
          >
            Cambiar a {STATUS_CONFIG[selectedStatus as IncidentStatusKey]?.label}
          </Button>
        </div>
      )}
    </div>
  );
}

function JournalistActions({
  incidentId,
  onSuccess,
}: {
  incidentId: string;
  onSuccess: () => void;
}) {
  const [showContent, setShowContent] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [contentTitle, setContentTitle] = useState("");
  const [contentType, setContentType] = useState<"VIDEO_REPORT" | "ARTICLE" | "DOCUMENTATION">("ARTICLE");
  const [contentUrl, setContentUrl] = useState("");
  const [agency, setAgency] = useState("");
  const [contactType, setContactType] = useState<"EMAIL" | "CALL" | "VISIT" | "OFFICIAL_FILING">("EMAIL");
  const [summary, setSummary] = useState("");

  const addContentMutation = trpc.journalist.addContent.useMutation({
    onSuccess: () => {
      setShowContent(false);
      setContentTitle("");
      setContentUrl("");
      onSuccess();
    },
  });

  const addContactMutation = trpc.journalist.addAdminContact.useMutation({
    onSuccess: () => {
      setShowContact(false);
      setAgency("");
      setSummary("");
      onSuccess();
    },
  });

  return (
    <div className="border border-blue-500/30 rounded-lg p-3 space-y-3 bg-blue-500/5">
      <p className="text-xs font-semibold flex items-center gap-1">
        <Newspaper size={14} className="text-blue-500" /> Acciones de periodista
      </p>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          className="gap-1"
          onClick={() => { setShowContent(!showContent); setShowContact(false); }}
        >
          <FileText size={14} /> Añadir contenido
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="gap-1"
          onClick={() => { setShowContact(!showContact); setShowContent(false); }}
        >
          <Phone size={14} /> Contacto admin
        </Button>
      </div>

      {showContent && (
        <div className="space-y-2">
          <div className="flex gap-2">
            {(["ARTICLE", "VIDEO_REPORT", "DOCUMENTATION"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setContentType(t)}
                className={`px-2 py-1 rounded-md border text-xs ${
                  contentType === t ? "border-primary bg-primary/10" : "border-border"
                }`}
              >
                {t === "ARTICLE" ? "Artículo" : t === "VIDEO_REPORT" ? "Vídeo" : "Documentación"}
              </button>
            ))}
          </div>
          <Input
            placeholder="Título"
            value={contentTitle}
            onChange={(e) => setContentTitle(e.target.value)}
            className="text-sm"
          />
          <Input
            placeholder="URL (opcional)"
            value={contentUrl}
            onChange={(e) => setContentUrl(e.target.value)}
            className="text-sm"
          />
          <Button
            size="sm"
            disabled={!contentTitle.trim() || addContentMutation.isPending}
            onClick={() =>
              addContentMutation.mutate({
                incidentId,
                type: contentType,
                title: contentTitle,
                newspaperUrl: contentUrl || undefined,
              })
            }
          >
            Guardar
          </Button>
        </div>
      )}

      {showContact && (
        <div className="space-y-2">
          <div className="flex gap-2 flex-wrap">
            {(["EMAIL", "CALL", "VISIT", "OFFICIAL_FILING"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setContactType(t)}
                className={`px-2 py-1 rounded-md border text-xs ${
                  contactType === t ? "border-primary bg-primary/10" : "border-border"
                }`}
              >
                {t === "EMAIL" ? "Email" : t === "CALL" ? "Llamada" : t === "VISIT" ? "Visita" : "Expediente"}
              </button>
            ))}
          </div>
          <Input
            placeholder="Organismo"
            value={agency}
            onChange={(e) => setAgency(e.target.value)}
            className="text-sm"
          />
          <textarea
            placeholder="Resumen..."
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="w-full text-sm border border-border rounded-md p-2 bg-background resize-none"
            rows={2}
          />
          <Button
            size="sm"
            disabled={!agency.trim() || addContactMutation.isPending}
            onClick={() =>
              addContactMutation.mutate({
                incidentId,
                agency,
                type: contactType,
                summary: summary || undefined,
              })
            }
          >
            Guardar
          </Button>
        </div>
      )}
    </div>
  );
}
