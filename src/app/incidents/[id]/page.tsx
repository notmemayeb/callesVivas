"use client";

import { useState, useRef } from "react";
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
  Trash2,
  Upload,
  Loader2,
  Download,
  FolderOpen,
  Pencil,
  Save,
  X,
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
import { Textarea } from "@/components/ui/textarea";
import { MediaUpload } from "@/components/media/MediaUpload";
import { CATEGORY_CONFIG, STATUS_CONFIG, LIMITS } from "@/lib/constants";
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

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: "", description: "" });

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

  const deleteMutation = trpc.incidents.delete.useMutation({
    onSuccess: () => {
      router.push("/");
    },
  });

  const updateMutation = trpc.incidents.update.useMutation({
    onSuccess: () => {
      setIsEditing(false);
      utils.incidents.byId.invalidate({ id });
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

  const role = session?.user?.role;
  const isAuthor = session?.user?.id === incident.authorId;
  const isModerator = role === "MODERATOR" || role === "COORDINATOR";
  const isJournalist = role === "JOURNALIST" || role === "COORDINATOR";
  const canEdit = isModerator || (isAuthor && incident.status === "DETECTED");

  const startEditing = () => {
    setEditForm({ title: incident.title, description: incident.description });
    setIsEditing(true);
  };

  const saveEdit = () => {
    updateMutation.mutate({
      id,
      title: editForm.title,
      description: editForm.description,
    });
  };

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
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold leading-tight flex-1">
                    {incident.title}
                  </h1>
                  {canEdit && !isEditing && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0"
                      onClick={startEditing}
                    >
                      <Pencil size={14} />
                    </Button>
                  )}
                </div>
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

          {/* Media */}
          {incident.media.length > 0 && (
            <div className="space-y-3">
              {incident.media.filter((m) => m.type === "PHOTO").length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {incident.media
                    .filter((m) => m.type === "PHOTO")
                    .map((m) => (
                      <div key={m.id} className="relative shrink-0">
                        <img
                          src={m.url}
                          alt=""
                          className="h-48 rounded-lg object-cover"
                        />
                        {(isAuthor || isModerator) && (
                          <MediaDeleteButton
                            mediaId={m.id}
                            onDeleted={() => utils.incidents.byId.invalidate({ id })}
                          />
                        )}
                      </div>
                    ))}
                </div>
              )}
              {incident.media
                .filter((m) => m.type === "VIDEO")
                .map((m) => (
                  <div key={m.id} className="relative">
                    <video
                      src={m.url}
                      controls
                      className="w-full rounded-lg max-h-80"
                    />
                    {(isAuthor || isModerator) && (
                      <MediaDeleteButton
                        mediaId={m.id}
                        onDeleted={() => utils.incidents.byId.invalidate({ id })}
                      />
                    )}
                  </div>
                ))}
            </div>
          )}

          {/* Description / Edit form */}
          {isEditing ? (
            <div className="space-y-3 border border-primary/30 rounded-lg p-3 bg-primary/5">
              <div>
                <Label className="text-xs">Título</Label>
                <Input
                  value={editForm.title}
                  onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                  maxLength={LIMITS.TITLE_MAX_LENGTH}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {editForm.title.length}/{LIMITS.TITLE_MAX_LENGTH}
                </p>
              </div>
              <div>
                <Label className="text-xs">Descripción</Label>
                <Textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                  maxLength={LIMITS.DESCRIPTION_MAX_LENGTH}
                  rows={4}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {editForm.description.length}/{LIMITS.DESCRIPTION_MAX_LENGTH}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="gap-1"
                  disabled={updateMutation.isPending || editForm.title.length < 5 || editForm.description.length < 10}
                  onClick={saveEdit}
                >
                  <Save size={14} /> Guardar
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="gap-1"
                  onClick={() => setIsEditing(false)}
                >
                  <X size={14} /> Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm leading-relaxed">{incident.description}</p>
          )}

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
          {isAuthor && (
            <MediaUpload
              incidentId={id}
              onUploadComplete={() => utils.incidents.byId.invalidate({ id })}
            />
          )}

          {/* Delete Incident */}
          {(isAuthor || isModerator) && (
            <div className="space-y-2">
              {showDeleteConfirm ? (
                <div className="border border-red-500/30 rounded-lg p-3 space-y-2 bg-red-500/5">
                  <p className="text-xs text-red-600 font-medium">
                    ¿Seguro que quieres eliminar esta incidencia? Esta acción no se puede deshacer.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="destructive"
                      className="gap-1"
                      disabled={deleteMutation.isPending}
                      onClick={() => deleteMutation.mutate({ id })}
                    >
                      <Trash2 size={14} /> Eliminar
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowDeleteConfirm(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1 text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 size={14} /> Eliminar incidencia
                </Button>
              )}
            </div>
          )}

          {/* Moderator Actions */}
          {isModerator && (
            <ModeratorActions
              incidentId={id}
              currentStatus={incident.status as IncidentStatusKey}
              onSuccess={() => utils.incidents.byId.invalidate({ id })}
            />
          )}

          {/* Journalist Actions */}
          {isJournalist && (
            <JournalistActions
              incidentId={id}
              currentStatus={incident.status as IncidentStatusKey}
              onSuccess={() => utils.incidents.byId.invalidate({ id })}
            />
          )}

          {/* Journalistic Content */}
          {incident.journalisticContent.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-sm font-semibold flex items-center gap-1">
                <Newspaper size={14} /> Contenido periodístico
              </h2>
              <div className="space-y-3">
                {incident.journalisticContent.map((content) => (
                  <JournalisticContentItem
                    key={content.id}
                    content={content}
                    canManage={
                      isJournalist &&
                      (content.journalistId === session?.user?.id || role === "COORDINATOR")
                    }
                    onDeleted={() => utils.incidents.byId.invalidate({ id })}
                  />
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

const JOURNALIST_STATUS_TRANSITIONS: Record<string, string[]> = {
  PUBLISHED: ["IN_CONTACT"],
  IN_CONTACT: ["ADMIN_CONTACT", "RESOLVED"],
  ADMIN_CONTACT: ["MEASURES_ANNOUNCED", "AWAITING_RESPONSE", "RESOLVED"],
  MEASURES_ANNOUNCED: ["RESOLVED", "AWAITING_RESPONSE"],
  AWAITING_RESPONSE: ["RESOLVED"],
};

function JournalistActions({
  incidentId,
  currentStatus,
  onSuccess,
}: {
  incidentId: string;
  currentStatus: IncidentStatusKey;
  onSuccess: () => void;
}) {
  const [showContent, setShowContent] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [contentTitle, setContentTitle] = useState("");
  const [contentType, setContentType] = useState<"VIDEO_REPORT" | "ARTICLE" | "DOCUMENTATION">("ARTICLE");
  const [contentUrl, setContentUrl] = useState("");
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [statusNote, setStatusNote] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingVideo(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("incidentId", incidentId);
      formData.append("contentOnly", "true");
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (res.ok) {
        const data = await res.json();
        const url = data.media?.url ?? data.url;
        setUploadedVideoUrl(url);
        setContentUrl(url);
      }
    } catch {
      // upload failed
    }
    setIsUploadingVideo(false);
    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  const changeStatusMutation = trpc.journalist.changeStatus.useMutation({
    onSuccess: () => {
      setSelectedStatus("");
      setStatusNote("");
      onSuccess();
    },
  });
  const [agency, setAgency] = useState("");
  const [contactType, setContactType] = useState<"EMAIL" | "CALL" | "VISIT" | "OFFICIAL_FILING">("EMAIL");
  const [summary, setSummary] = useState("");

  const addContentMutation = trpc.journalist.addContent.useMutation({
    onSuccess: () => {
      setShowContent(false);
      setContentTitle("");
      setContentUrl("");
      setUploadedVideoUrl(null);
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
            disabled={!!uploadedVideoUrl}
          />
          {(contentType === "VIDEO_REPORT" || contentType === "DOCUMENTATION") && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                O subir {contentType === "VIDEO_REPORT" ? "vídeo" : "documento"} directamente
              </p>
              <input
                ref={videoInputRef}
                type="file"
                accept={contentType === "VIDEO_REPORT"
                  ? "video/mp4,video/webm,video/quicktime"
                  : ".pdf,.doc,.docx,.xls,.xlsx"}
                className="hidden"
                onChange={handleVideoUpload}
              />
              {uploadedVideoUrl ? (
                <div className="flex items-center gap-2">
                  {contentType === "VIDEO_REPORT" ? (
                    <video src={uploadedVideoUrl} className="h-20 rounded-md" controls />
                  ) : (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground border border-border rounded-md px-2 py-1">
                      <FileText size={14} />
                      Documento subido
                    </div>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setUploadedVideoUrl(null);
                      setContentUrl("");
                    }}
                  >
                    Quitar
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1"
                  disabled={isUploadingVideo}
                  onClick={() => videoInputRef.current?.click()}
                >
                  {isUploadingVideo ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Upload size={14} />
                  )}
                  {isUploadingVideo
                    ? "Subiendo..."
                    : contentType === "VIDEO_REPORT"
                      ? "Subir vídeo (máx 100MB)"
                      : "Subir documento (máx 20MB)"}
                </Button>
              )}
            </div>
          )}
          <Button
            size="sm"
            disabled={!contentTitle.trim() || addContentMutation.isPending || isUploadingVideo}
            onClick={() =>
              addContentMutation.mutate({
                incidentId,
                type: contentType,
                title: contentTitle,
                contentUrl: contentUrl || undefined,
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

      {/* Status Change */}
      {(JOURNALIST_STATUS_TRANSITIONS[currentStatus]?.length ?? 0) > 0 && (
        <div className="space-y-2 pt-2 border-t border-blue-500/20">
          <p className="text-xs text-muted-foreground">Cambiar estado</p>
          <div className="flex gap-2 flex-wrap">
            {JOURNALIST_STATUS_TRANSITIONS[currentStatus]?.map((s) => {
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
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                className="text-sm"
              />
              <Button
                size="sm"
                disabled={changeStatusMutation.isPending}
                onClick={() =>
                  changeStatusMutation.mutate({
                    incidentId,
                    status: selectedStatus as IncidentStatusKey,
                    note: statusNote || undefined,
                  })
                }
              >
                Cambiar a {STATUS_CONFIG[selectedStatus as IncidentStatusKey]?.label}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function JournalisticContentItem({
  content,
  canManage,
  onDeleted,
}: {
  content: {
    id: string;
    type: string;
    title: string;
    newspaperUrl: string | null;
    contentUrl: string | null;
    journalistId: string;
  };
  canManage: boolean;
  onDeleted: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(content.title);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const updateMutation = trpc.journalist.updateContent.useMutation({
    onSuccess: () => {
      setIsEditing(false);
      onDeleted();
    },
  });

  const deleteMutation = trpc.journalist.deleteContent.useMutation({
    onSuccess: onDeleted,
  });

  return (
    <div className="p-3 rounded-md border border-border text-sm space-y-2">
      <div className="flex items-center gap-2">
        {content.type === "VIDEO_REPORT" ? (
          <Video size={14} className="text-red-500 shrink-0" />
        ) : content.type === "DOCUMENTATION" ? (
          <FolderOpen size={14} className="text-amber-500 shrink-0" />
        ) : (
          <FileText size={14} className="text-blue-500 shrink-0" />
        )}
        {isEditing ? (
          <Input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="flex-1 h-7 text-sm"
          />
        ) : (
          <span className="flex-1 font-medium truncate">{content.title}</span>
        )}
        {content.newspaperUrl && !isEditing && (
          <a
            href={content.newspaperUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary shrink-0"
          >
            <ExternalLink size={14} />
          </a>
        )}
        {canManage && !isEditing && !showDeleteConfirm && (
          <>
            <button
              onClick={() => { setEditTitle(content.title); setIsEditing(true); }}
              className="text-muted-foreground hover:text-foreground shrink-0"
            >
              <Pencil size={12} />
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="text-muted-foreground hover:text-destructive shrink-0"
            >
              <Trash2 size={12} />
            </button>
          </>
        )}
      </div>
      {isEditing && (
        <div className="flex gap-2">
          <Button
            size="sm"
            className="gap-1 h-7 text-xs"
            disabled={!editTitle.trim() || updateMutation.isPending}
            onClick={() => updateMutation.mutate({ id: content.id, title: editTitle })}
          >
            <Save size={12} /> Guardar
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs"
            onClick={() => setIsEditing(false)}
          >
            Cancelar
          </Button>
        </div>
      )}
      {showDeleteConfirm && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-destructive">¿Eliminar?</span>
          <Button
            size="sm"
            variant="destructive"
            className="h-6 text-xs px-2"
            disabled={deleteMutation.isPending}
            onClick={() => deleteMutation.mutate({ id: content.id })}
          >
            Sí
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 text-xs px-2"
            onClick={() => setShowDeleteConfirm(false)}
          >
            No
          </Button>
        </div>
      )}
      {content.contentUrl && content.type === "VIDEO_REPORT" && (
        <video
          src={content.contentUrl}
          controls
          className="w-full rounded-md max-h-64"
        />
      )}
      {content.contentUrl && content.type === "DOCUMENTATION" && (
        <a
          href={content.contentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
          <Download size={12} /> Descargar documento
        </a>
      )}
    </div>
  );
}

function MediaDeleteButton({
  mediaId,
  onDeleted,
}: {
  mediaId: string;
  onDeleted: () => void;
}) {
  const [confirm, setConfirm] = useState(false);
  const deleteMutation = trpc.incidents.deleteMedia.useMutation({
    onSuccess: onDeleted,
  });

  if (confirm) {
    return (
      <div className="absolute top-1 right-1 flex gap-1">
        <Button
          size="sm"
          variant="destructive"
          className="h-6 text-xs px-2"
          disabled={deleteMutation.isPending}
          onClick={() => deleteMutation.mutate({ id: mediaId })}
        >
          Sí
        </Button>
        <Button
          size="sm"
          variant="secondary"
          className="h-6 text-xs px-2"
          onClick={() => setConfirm(false)}
        >
          No
        </Button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirm(true)}
      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-destructive transition-colors"
    >
      <X size={14} />
    </button>
  );
}
