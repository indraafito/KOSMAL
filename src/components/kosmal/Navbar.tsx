import { Link } from "react-router-dom";
import { KosmalLogo } from "./Logo";
import { Button } from "@/components/ui/button";
import { Menu, User as UserIcon, LogOut, LayoutDashboard, Heart, MessageCircle, Building2 } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, profile, roles, signOut, hasRole } = useAuth();
  const links = [
    { to: "/", label: "Beranda" },
    { to: "/cari", label: "Cari Kos" },
    ...(!user ? [{ to: "/register?role=owner", label: "Untuk Pemilik" }] : []),
  ];
  const dashboardTo = hasRole("admin") ? "/admin/dashboard" : hasRole("owner") ? "/owner/dashboard" : "/dashboard";
  const initial = (profile?.full_name || user?.email || "U").charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/">
          <KosmalLogo />
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link key={l.label} to={l.to} className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          {!user ? (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">Masuk</Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="bg-gradient-cta shadow-soft hover:opacity-95">Daftar</Button>
              </Link>
            </>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full bg-brand-soft px-3 py-1.5 text-sm font-semibold text-primary hover:opacity-90">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-cta text-xs text-primary-foreground">{initial}</span>
                  <span className="max-w-[120px] truncate">{profile?.full_name || user.email}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="text-xs">
                  Login sebagai <span className="font-bold uppercase text-primary">{roles[0] ?? "tenant"}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to={dashboardTo}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />Dashboard
                  </Link>
                </DropdownMenuItem>
                {hasRole("tenant") && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/wishlist">
                        <Heart className="mr-2 h-4 w-4" />Wishlist
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/booking">
                        <Building2 className="mr-2 h-4 w-4" />Booking Saya
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/chat">
                        <MessageCircle className="mr-2 h-4 w-4" />Chat
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                {hasRole("owner") && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/owner/kos">
                        <Building2 className="mr-2 h-4 w-4" />Kelola Kos
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/owner/booking">
                        <LayoutDashboard className="mr-2 h-4 w-4" />Booking Masuk
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/owner/chat">
                        <MessageCircle className="mr-2 h-4 w-4" />Chat
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuItem asChild>
                  <Link to="/profile">
                    <UserIcon className="mr-2 h-4 w-4" />Profil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        <button onClick={() => setOpen(!open)} className="md:hidden" aria-label="menu">
          <Menu className="h-6 w-6 text-foreground" />
        </button>
      </div>
      {open && (
        <div className="border-t border-border bg-card md:hidden">
          <div className="flex flex-col gap-1 p-4">
            {links.map((l) => (
              <Link key={l.label} to={l.to} className="rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-muted">
                {l.label}
              </Link>
            ))}
            {!user ? (
              <div className="mt-2 flex gap-2">
                <Link to="/login" className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">Masuk</Button>
                </Link>
                <Link to="/register" className="flex-1">
                  <Button size="sm" className="w-full bg-gradient-cta">Daftar</Button>
                </Link>
              </div>
            ) : (
              <>
                <Link to={dashboardTo} className="rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-muted">Dashboard</Link>
                <Link to="/profile" className="rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-muted">Profil</Link>
                <button onClick={() => signOut()} className="rounded-lg px-3 py-2 text-left text-sm font-medium text-destructive hover:bg-muted">Keluar</button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}


