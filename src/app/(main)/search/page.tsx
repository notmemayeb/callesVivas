"use client";

import { Suspense, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Search as SearchIcon } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Header } from "@/components/layout/Header";
import { Input } from "@/components/ui/input";
import { IncidentCard } from "@/components/incidents/IncidentCard";
import type { MacroCategoryKey, IncidentStatusKey } from "@/lib/constants";

export default function SearchPage() {
  return (
    <Suspense>
      <SearchContent />
    </Suspense>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const { data: results, isLoading } = trpc.incidents.search.useQuery(
    { query: debouncedQuery },
    { enabled: debouncedQuery.length >= 1 }
  );

  const handleSearch = (value: string) => {
    setQuery(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQuery(value), 300);
  };

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex-1 overflow-auto">
        <div className="max-w-2xl mx-auto p-4 space-y-4">
          <div className="relative">
            <SearchIcon
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              placeholder="Buscar incidencias..."
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9"
              autoFocus
            />
          </div>

          {isLoading && debouncedQuery && (
            <p className="text-sm text-muted-foreground">Buscando...</p>
          )}

          {results && results.length === 0 && debouncedQuery && (
            <p className="text-sm text-muted-foreground">
              No se encontraron resultados para &quot;{debouncedQuery}&quot;
            </p>
          )}

          <div className="space-y-3">
            {results?.map((incident) => (
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
