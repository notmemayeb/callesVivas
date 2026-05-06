"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Search, Menu, LogIn, X, Bell } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { MobileMenu } from "./MobileMenu";

const NAV_LINKS = [
  { href: "/", label: "Mapa" },
  { href: "/ranking", label: "Ranking" },
  { href: "/multimedia", label: "Multimedia" },
];

export function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 h-14 bg-card border-b border-border flex items-center px-4 gap-4">
      <Link href="/" className="font-bold text-lg text-primary shrink-0">
        CallesVivas
      </Link>

      <nav className="hidden md:flex items-center gap-1 ml-4">
        {NAV_LINKS.map((link) => {
          const isActive =
            link.href === "/"
              ? pathname === "/"
              : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                isActive
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
        {(session?.user?.role === "MODERATOR" ||
          session?.user?.role === "COORDINATOR") && (
          <Link
            href="/admin"
            className={`px-3 py-1.5 text-sm font-medium transition-colors ${
              pathname.startsWith("/admin")
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Moderación
          </Link>
        )}
        {(session?.user?.role === "JOURNALIST" ||
          session?.user?.role === "COORDINATOR") && (
          <Link
            href="/journalist"
            className={`px-3 py-1.5 text-sm font-medium transition-colors ${
              pathname.startsWith("/journalist")
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Periodista
          </Link>
        )}
      </nav>

      <div className="hidden md:flex flex-1 max-w-sm ml-auto mr-2">
        <Link
          href="/search"
          className="flex items-center gap-2 w-full px-3 py-1.5 rounded-md border border-border text-muted-foreground text-sm hover:border-primary/50 transition-colors"
        >
          <Search size={16} />
          <span>Buscar incidencias...</span>
        </Link>
      </div>

      <div className="flex items-center gap-2 ml-auto md:ml-0">
        <Link href="/search" className="md:hidden">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Search size={20} />
          </Button>
        </Link>

        {session?.user ? (
          <div className="hidden md:flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Bell size={18} />
            </Button>
            <Link
              href={`/user/${session.user.id}/profile`}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {session.user.name}
            </Link>
            <Button variant="ghost" size="sm" onClick={() => signOut()}>
              Salir
            </Button>
          </div>
        ) : (
          <Link href="/signin" className="hidden md:block">
            <Button variant="outline" size="sm" className="gap-1.5">
              <LogIn size={16} />
              Iniciar sesión
            </Button>
          </Link>
        )}

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 md:hidden"
          onClick={() => setMenuOpen(true)}
        >
          <Menu size={20} />
        </Button>
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetContent side="right" className="w-80 p-0">
            <MobileMenu onClose={() => setMenuOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
