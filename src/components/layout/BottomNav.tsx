"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, BarChart3, Film, Building2, PlusCircle } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Mapa", icon: Map },
  { href: "/ranking", label: "Ranking", icon: BarChart3 },
  { href: "/multimedia", label: "Multimedia", icon: Film },
  { href: "/incidents/new", label: "Reportar", icon: PlusCircle },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center pt-2 pb-[env(safe-area-inset-bottom,8px)] px-2 lg:hidden bg-card border-t border-border shadow-lg">
      {NAV_ITEMS.map((item) => {
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center px-3 py-1 rounded-xl transition-colors ${
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground"
            }`}
          >
            <item.icon size={20} />
            <span className="text-[10px] mt-0.5">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
