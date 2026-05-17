import { type ReactNode } from "react";
import { useAuth, type AppRole } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RoleGuard({ allow, children }: { allow: AppRole[]; children: ReactNode }) {
  const { roles, loading } = useAuth();
  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Memuat…</div>;
  }
  const ok = allow.some((r) => roles.includes(r));
  if (!ok) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-md rounded-2xl border border-border bg-card p-8 text-center">
          <ShieldAlert className="mx-auto h-12 w-12 text-destructive" />
          <h1 className="mt-3 font-display text-xl font-bold">Akses Ditolak</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Halaman ini hanya untuk: <span className="font-semibold uppercase">{allow.join(", ")}</span>
          </p>
          <Link to="/">
            <Button className="mt-4 bg-gradient-cta">Kembali ke Beranda</Button>
          </Link>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
