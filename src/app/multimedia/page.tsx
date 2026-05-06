"use client";

import { useState } from "react";
import Link from "next/link";
import { Play, ExternalLink, FileText, FolderOpen } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { Skeleton } from "@/components/ui/skeleton";

type TabKey = "videos" | "articles" | "docs";

const TABS: { key: TabKey; label: string; type: string }[] = [
  { key: "videos", label: "Videos", type: "VIDEO_REPORT" },
  { key: "articles", label: "Artículos", type: "ARTICLE" },
  { key: "docs", label: "Documentación", type: "DOCUMENTATION" },
];

export default function MultimediaPage() {
  const [tab, setTab] = useState<TabKey>("videos");

  const currentType = TABS.find((t) => t.key === tab)!.type;

  const { data: content, isLoading } = trpc.journalist.listContent.useQuery({
    type: currentType as "VIDEO_REPORT" | "ARTICLE" | "DOCUMENTATION",
    limit: 50,
  });

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex-1 overflow-auto pb-20 lg:pb-4">
        <div className="max-w-4xl mx-auto p-4 space-y-6">
          <h1 className="text-2xl font-bold">Multimedia e Investigación</h1>

          <div className="flex gap-1 border-b border-border">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-56 w-full rounded-xl" />
              ))}
            </div>
          )}

          {tab === "videos" && !isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {content?.map((item) => {
                const thumb =
                  item.incident.media?.[0]?.thumbnailUrl ||
                  item.incident.media?.[0]?.url;
                const isLocalVideo = item.contentUrl?.startsWith("/uploads/");
                return (
                  <div
                    key={item.id}
                    className="bg-card rounded-xl overflow-hidden border border-border shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="relative aspect-video bg-muted">
                      {isLocalVideo ? (
                        <video
                          src={item.contentUrl!}
                          controls
                          className="w-full h-full object-contain"
                        />
                      ) : thumb ? (
                        <>
                          <img
                            src={thumb}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                          {item.contentUrl && (
                            <a
                              href={item.contentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="absolute inset-0 flex items-center justify-center"
                            >
                              <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center text-primary shadow-lg">
                                <Play size={20} fill="currentColor" />
                              </div>
                            </a>
                          )}
                        </>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Play size={32} className="text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="p-3 space-y-2">
                      <h4 className="text-sm font-semibold leading-tight line-clamp-2">
                        {item.title}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {item.journalist.name} ·{" "}
                        {new Date(item.createdAt).toLocaleDateString("es-ES")}
                      </p>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/incidents/${item.incident.id}`}
                          className="text-xs text-primary font-medium hover:underline"
                        >
                          Ver incidencia
                        </Link>
                        {item.newspaperUrl && (
                          <a
                            href={item.newspaperUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-0.5"
                          >
                            eldiario.es <ExternalLink size={10} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {content?.length === 0 && (
                <p className="text-sm text-muted-foreground col-span-full text-center py-8">
                  No hay videos disponibles.
                </p>
              )}
            </div>
          )}

          {tab === "articles" && !isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {content?.map((item) => {
                const thumb =
                  item.incident.media?.[0]?.thumbnailUrl ||
                  item.incident.media?.[0]?.url;
                return (
                  <article
                    key={item.id}
                    className="flex flex-col md:flex-row gap-3 bg-card p-4 rounded-xl border border-border shadow-sm hover:border-primary/30 transition-colors"
                  >
                    {thumb ? (
                      <img
                        src={thumb}
                        alt=""
                        className="w-full md:w-28 h-28 rounded-lg object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-full md:w-28 h-28 rounded-lg shrink-0 bg-muted flex items-center justify-center">
                        <FileText size={24} className="text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex flex-col flex-1 min-w-0">
                      <p className="text-[10px] text-muted-foreground mb-1">
                        {item.journalist.name} ·{" "}
                        {new Date(item.createdAt).toLocaleDateString("es-ES")}
                      </p>
                      <h4 className="text-sm font-semibold leading-tight line-clamp-2">
                        {item.title}
                      </h4>
                      <Link
                        href={`/incidents/${item.incident.id}`}
                        className="text-xs text-muted-foreground mt-1 hover:text-primary"
                      >
                        {item.incident.title}
                      </Link>
                      <div className="flex items-center gap-2 mt-auto pt-2">
                        {item.newspaperUrl && (
                          <a
                            href={item.newspaperUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary font-medium flex items-center gap-1"
                          >
                            eldiario.es <ExternalLink size={10} />
                          </a>
                        )}
                        {item.contentUrl && (
                          <a
                            href={item.contentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                          >
                            Leer más <ExternalLink size={10} />
                          </a>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}

              {content?.length === 0 && (
                <p className="text-sm text-muted-foreground col-span-full text-center py-8">
                  No hay artículos disponibles.
                </p>
              )}
            </div>
          )}

          {tab === "docs" && !isLoading && (
            <div className="space-y-3">
              {content?.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <FolderOpen size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium truncate">
                      {item.title}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {item.journalist.name} ·{" "}
                      {new Date(item.createdAt).toLocaleDateString("es-ES")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/incidents/${item.incident.id}`}
                      className="text-xs text-primary font-medium hover:underline"
                    >
                      Incidencia
                    </Link>
                    {item.contentUrl && (
                      <a
                        href={item.contentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-0.5"
                      >
                        Abrir <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                </div>
              ))}

              {content?.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No hay documentación disponible.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
