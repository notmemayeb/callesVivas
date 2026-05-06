"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import {
  Map,
  BarChart3,
  Film,
  ClipboardList,
  LogOut,
  LogIn,
  UserPlus,
  X,
  User,
  Shield,
  Newspaper,
  Crown,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MobileMenuProps {
  onClose: () => void;
}

const menuItems = [
  { href: "/", label: "Mapa", icon: Map },
  { href: "/ranking", label: "Ranking", icon: BarChart3 },
  { href: "/multimedia", label: "Multimedia", icon: Film },
];

export function MobileMenu({ onClose }: MobileMenuProps) {
  const { data: session } = useSession();

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <span className="font-bold text-lg text-primary">CallesVivas</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onClose}
        >
          <X size={20} />
        </Button>
      </div>

      {session?.user ? (
        <div className="p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={session.user.image ?? undefined} />
              <AvatarFallback>
                {session.user.name?.charAt(0)?.toUpperCase() ?? "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{session.user.name}</p>
              <p className="text-xs text-muted-foreground">
                {session.user.email}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 flex flex-col gap-2">
          <Button onClick={() => signIn()} className="w-full gap-2">
            <LogIn size={16} />
            Iniciar sesión
          </Button>
          <Link href="/signup" onClick={onClose}>
            <Button variant="outline" className="w-full gap-2">
              <UserPlus size={16} />
              Registrarse
            </Button>
          </Link>
        </div>
      )}

      <Separator />

      <nav className="flex-1 p-2">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm hover:bg-muted transition-colors"
          >
            <item.icon size={20} className="text-muted-foreground" />
            {item.label}
          </Link>
        ))}

        {session?.user && (
          <>
            <Separator className="my-2" />
            <Link
              href={`/user/${session.user.id}/my-incidents`}
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm hover:bg-muted transition-colors"
            >
              <ClipboardList size={20} className="text-muted-foreground" />
              Mis incidencias
            </Link>
            <Link
              href={`/user/${session.user.id}/followed`}
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm hover:bg-muted transition-colors"
            >
              <Eye size={20} className="text-muted-foreground" />
              Incidencias seguidas
            </Link>
            <Link
              href={`/user/${session.user.id}/profile`}
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm hover:bg-muted transition-colors"
            >
              <User size={20} className="text-muted-foreground" />
              Mi perfil
            </Link>

            {(session.user.role === "MODERATOR" ||
              session.user.role === "COORDINATOR") && (
              <Link
                href="/admin"
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm hover:bg-muted transition-colors"
              >
                <Shield size={20} className="text-amber-500" />
                Moderación
              </Link>
            )}

            {(session.user.role === "JOURNALIST" ||
              session.user.role === "COORDINATOR") && (
              <Link
                href="/journalist"
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm hover:bg-muted transition-colors"
              >
                <Newspaper size={20} className="text-blue-500" />
                Panel periodista
              </Link>
            )}

            {session.user.role === "COORDINATOR" && (
              <Link
                href="/admin/users"
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm hover:bg-muted transition-colors"
              >
                <Crown size={20} className="text-purple-500" />
                Gestión usuarios
              </Link>
            )}
          </>
        )}
      </nav>

      {session?.user && (
        <>
          <Separator />
          <div className="p-2">
            <button
              onClick={() => signOut()}
              className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm hover:bg-muted transition-colors w-full"
            >
              <LogOut size={20} className="text-muted-foreground" />
              Cerrar sesión
            </button>
          </div>
        </>
      )}
    </div>
  );
}
