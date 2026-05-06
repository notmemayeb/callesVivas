"use client";

import Link from "next/link";
import { Star, ChevronRight } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { CATEGORY_CONFIG, type MacroCategoryKey } from "@/lib/constants";

interface Top5Item {
  id: string;
  title: string;
  neighborhoodName: string;
  macroCategory: MacroCategoryKey;
  votesCount: number;
  thumbnailUrl?: string | null;
}

interface Top5BarProps {
  items: Top5Item[];
}

export function Top5Bar({ items }: Top5BarProps) {
  if (items.length === 0) return null;

  return (
    <div className="bg-card border-t border-border shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
      <div className="flex items-center gap-3 px-4 py-2">
        <Link
          href="/top/week"
          className="text-xs font-bold text-primary uppercase shrink-0 flex items-center gap-0.5"
        >
          Top 5 <ChevronRight size={14} />
        </Link>

        <ScrollArea className="flex-1">
          <div className="flex gap-3 pb-1">
            {items.map((item) => {
              const catConfig = CATEGORY_CONFIG[item.macroCategory];
              return (
                <Link
                  key={item.id}
                  href={`/incidents/${item.id}`}
                  className="flex gap-2 items-center p-2 rounded-lg border border-border hover:border-primary/30 transition-colors shrink-0 w-60"
                >
                  {item.thumbnailUrl ? (
                    <img
                      src={item.thumbnailUrl}
                      alt=""
                      className="w-12 h-12 rounded object-cover"
                    />
                  ) : (
                    <div
                      className="w-12 h-12 rounded flex items-center justify-center shrink-0"
                      style={{ backgroundColor: catConfig.color + "20" }}
                    >
                      <catConfig.icon
                        size={20}
                        style={{ color: catConfig.color }}
                      />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate">{item.title}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {item.neighborhoodName}
                    </p>
                    <span className="flex items-center gap-0.5 text-[11px] text-muted-foreground">
                      <Star size={10} /> {item.votesCount}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
}
