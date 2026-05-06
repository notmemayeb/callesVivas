"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Plus, ClipboardList, Eye } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { CategoryFilters } from "@/components/layout/CategoryFilters";
import { Top5Bar } from "@/components/incidents/Top5Bar";
import { InteractiveMap } from "@/components/map/InteractiveMap";
import { Button } from "@/components/ui/button";
import { BottomNav } from "@/components/layout/BottomNav";
import { trpc } from "@/lib/trpc";
import type { MacroCategoryKey } from "@/lib/constants";

export default function HomePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [selectedCategories, setSelectedCategories] = useState<
    MacroCategoryKey[]
  >([]);

  const { data: incidentsData } = trpc.incidents.list.useQuery({ limit: 50 });
  const { data: top5Data } = trpc.incidents.top.useQuery({ period: "week" });

  const mapIncidents = useMemo(() => {
    if (!incidentsData?.items) return [];
    return incidentsData.items.map((i) => ({
      id: i.id,
      latitude: i.latitude,
      longitude: i.longitude,
      title: i.title,
      macroCategory: i.category.macroCategory as MacroCategoryKey,
      status: i.status,
      votesCount: i.votesCount,
    }));
  }, [incidentsData]);

  const top5Items = useMemo(() => {
    if (!top5Data) return [];
    return top5Data.map((i) => ({
      id: i.id,
      title: i.title,
      neighborhoodName: i.neighborhood.name,
      macroCategory: i.category.macroCategory as MacroCategoryKey,
      votesCount: i.votesCount,
      thumbnailUrl: i.media[0]?.thumbnailUrl ?? i.media[0]?.url ?? null,
    }));
  }, [top5Data]);

  const toggleCategory = (cat: MacroCategoryKey) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleIncidentClick = useCallback(
    (id: string) => {
      router.push(`/incidents/${id}`);
    },
    [router]
  );

  const handleMapLongPress = useCallback(
    (lat: number, lng: number) => {
      router.push(`/incidents/new?lat=${lat}&lng=${lng}`);
    },
    [router]
  );

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <CategoryFilters
        selected={selectedCategories}
        onToggle={toggleCategory}
      />

      {session?.user && (
        <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-card">
          <Link href={`/user/${session.user.id}/my-incidents`}>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <ClipboardList size={14} />
              Mis incidencias
            </Button>
          </Link>
          <Link href={`/user/${session.user.id}/followed`}>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <Eye size={14} />
              Seguidas
            </Button>
          </Link>
        </div>
      )}

      <div className="flex-1 relative min-h-0 overflow-hidden">
        <InteractiveMap
          incidents={mapIncidents}
          selectedCategories={selectedCategories}
          onIncidentClick={handleIncidentClick}
          onMapLongPress={handleMapLongPress}
        />

        <Link
          href="/incidents/new"
          className="md:hidden absolute bottom-20 right-4 z-10"
        >
          <Button
            size="icon"
            className="h-14 w-14 rounded-full shadow-[0_4px_12px_rgba(26,86,219,0.4)]"
          >
            <Plus size={24} />
          </Button>
        </Link>

        <Link
          href="/incidents/new"
          className="hidden md:block absolute bottom-6 right-6 z-10"
        >
          <Button className="gap-2 shadow-lg">
            <Plus size={18} />
            Añadir incidencia
          </Button>
        </Link>
      </div>

      <Top5Bar items={top5Items} />
      <BottomNav />
    </div>
  );
}
