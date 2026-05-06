"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Send } from "lucide-react";
import { useSession } from "next-auth/react";
import { trpc } from "@/lib/trpc";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";

export default function CommentsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const [text, setText] = useState("");
  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.comments.list.useQuery({ incidentId: id });
  const createMutation = trpc.comments.create.useMutation({
    onSuccess: () => {
      setText("");
      utils.comments.list.invalidate({ incidentId: id });
    },
  });

  const handleSubmit = () => {
    if (!text.trim()) return;
    createMutation.mutate({ incidentId: id, text: text.trim() });
  };

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex-1 overflow-auto">
        <div className="max-w-2xl mx-auto p-4 space-y-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={16} /> Volver a la incidencia
          </button>

          <h1 className="text-lg font-bold">Comentarios</h1>

          {isLoading && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          )}

          {data?.items.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No hay comentarios todavía. ¡Sé el primero!
            </p>
          )}

          <div className="space-y-3">
            {data?.items.map((comment) => (
              <div
                key={comment.id}
                className="p-3 rounded-lg border border-border space-y-1"
              >
                <div className="flex items-center gap-2">
                  {comment.user.image && (
                    <img
                      src={comment.user.image}
                      alt=""
                      className="w-6 h-6 rounded-full"
                    />
                  )}
                  <span className="text-sm font-medium">
                    {comment.user.name || "Anónimo"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(comment.createdAt).toLocaleDateString("es-ES")}
                  </span>
                </div>
                <p className="text-sm">{comment.text}</p>
              </div>
            ))}
          </div>

          {session && (
            <div className="flex gap-2 sticky bottom-4">
              <Textarea
                placeholder="Escribe un comentario..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={2}
                className="flex-1"
                maxLength={500}
              />
              <Button
                size="icon"
                onClick={handleSubmit}
                disabled={!text.trim() || createMutation.isPending}
              >
                <Send size={16} />
              </Button>
            </div>
          )}

          {!session && (
            <p className="text-sm text-muted-foreground text-center">
              <button
                onClick={() => router.push("/signin")}
                className="text-primary hover:underline"
              >
                Inicia sesión
              </button>{" "}
              para comentar.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
