import { type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth, type AppRole } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

export function RoleGuard({ allow, children }: { allow: AppRole[]; children: ReactNode }) {
  const { user, roles, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-7rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  const hasAccess = allow.some((r) => roles.includes(r));
  if (!hasAccess) return <Navigate to="/" replace />;

  return <>{children}</>;
}
