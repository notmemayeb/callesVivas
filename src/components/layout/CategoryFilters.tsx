"use client";

import { CATEGORY_CONFIG, type MacroCategoryKey } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface CategoryFiltersProps {
  selected: MacroCategoryKey[];
  onToggle: (category: MacroCategoryKey) => void;
}

export function CategoryFilters({ selected, onToggle }: CategoryFiltersProps) {
  const categories = Object.entries(CATEGORY_CONFIG) as [
    MacroCategoryKey,
    (typeof CATEGORY_CONFIG)[MacroCategoryKey],
  ][];

  return (
    <div className="bg-card border-b border-border px-4 py-2">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-2">
          {categories.map(([key, config]) => {
            const isActive = selected.includes(key);
            const Icon = config.filterIcon;
            return (
              <button
                key={key}
                onClick={() => onToggle(key)}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                  "border shrink-0",
                  isActive
                    ? "text-white border-transparent"
                    : "bg-card text-foreground border-border hover:border-primary/30"
                )}
                style={
                  isActive
                    ? { backgroundColor: config.color, borderColor: config.color }
                    : undefined
                }
              >
                <Icon size={16} />
                {config.label}
              </button>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
