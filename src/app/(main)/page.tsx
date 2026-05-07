"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Plus } from "lucide-react";
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

  const utils = trpc.useUtils();
  const { data: incidentsData } = trpc.incidents.list.useQuery({ limit: 50 });
  const { data: top5Data } = trpc.incidents.top.useQuery({ period: "week" });

  const { data: votedIdsData } = trpc.votes.myVotedIds.useQuery(undefined, {
    enabled: !!session,
  });
  const { data: followedIdsData } = trpc.votes.myFollowedIds.useQuery(undefined, {
    enabled: !!session,
  });

  const votedIds = useMemo(() => new Set(votedIdsData ?? []), [votedIdsData]);
  const followedIds = useMemo(() => new Set(followedIdsData ?? []), [followedIdsData]);

  const voteMutation = trpc.votes.vote.useMutation({
    onMutate: async ({ incidentId }) => {
      await utils.votes.myVotedIds.cancel();
      await utils.incidents.list.cancel();
      const prevVoted = utils.votes.myVotedIds.getData();
      const prevList = utils.incidents.list.getData({ limit: 50 });
      const wasVoted = prevVoted?.includes(incidentId);
      utils.votes.myVotedIds.setData(undefined,
        wasVoted ? (prevVoted ?? []).filter((id) => id !== incidentId) : [...(prevVoted ?? []), incidentId]
      );
      utils.incidents.list.setData({ limit: 50 }, (old) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((i) =>
            i.id === incidentId
              ? { ...i, votesCount: i.votesCount + (wasVoted ? -1 : 1) }
              : i
          ),
        };
      });
      return { prevVoted, prevList };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prevVoted) utils.votes.myVotedIds.setData(undefined, ctx.prevVoted);
      if (ctx?.prevList) utils.incidents.list.setData({ limit: 50 }, ctx.prevList);
    },
    onSettled: () => {
      utils.incidents.list.invalidate();
      utils.votes.myVotedIds.invalidate();
    },
  });
  const followMutation = trpc.votes.follow.useMutation({
    onMutate: async ({ incidentId }) => {
      await utils.votes.myFollowedIds.cancel();
      const prev = utils.votes.myFollowedIds.getData();
      const wasFollowed = prev?.includes(incidentId);
      utils.votes.myFollowedIds.setData(undefined,
        wasFollowed ? (prev ?? []).filter((id) => id !== incidentId) : [...(prev ?? []), incidentId]
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) utils.votes.myFollowedIds.setData(undefined, ctx.prev);
    },
    onSettled: () => utils.votes.myFollowedIds.invalidate(),
  });

  const mapIncidents = useMemo(() => {
    if (!incidentsData?.items) return [];
    return incidentsData.items
      .filter((i) => i.status === "PUBLISHED")
      .map((i) => ({
        id: i.id,
        latitude: i.latitude,
        longitude: i.longitude,
        title: i.title,
        macroCategory: i.category.macroCategory as MacroCategoryKey,
        status: i.status,
        votesCount: i.votesCount,
        thumbnailUrl: i.media[0]?.thumbnailUrl ?? i.media[0]?.url ?? null,
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

  const handleVote = useCallback(
    (id: string) => {
      if (!session) {
        router.push("/signin");
        return;
      }
      voteMutation.mutate({ incidentId: id });
    },
    [session, router, voteMutation]
  );

  const handleFollow = useCallback(
    (id: string) => {
      if (!session) {
        router.push("/signin");
        return;
      }
      followMutation.mutate({ incidentId: id });
    },
    [session, router, followMutation]
  );

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <CategoryFilters
        selected={selectedCategories}
        onToggle={toggleCategory}
      />


      <div className="flex-1 relative min-h-0 overflow-hidden">
        <InteractiveMap
          incidents={mapIncidents}
          selectedCategories={selectedCategories}
          votedIds={votedIds}
          followedIds={followedIds}
          onIncidentClick={handleIncidentClick}
          onMapLongPress={handleMapLongPress}
          onVote={handleVote}
          onFollow={handleFollow}
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
