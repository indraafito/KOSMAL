import { useEffect, useState } from "react";
import { fetchAllUsers } from "@/lib/app-queries";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchAllUsers();
      setUsers(data);
    } catch (err) {
      toast.error("Gagal memuat pengguna");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleAdmin = async (userId: string, currentRoles: { role: string }[]) => {
    if (confirm("Apakah anda yakin mengubah status admin pengguna ini?")) {
      const isAdmin = currentRoles.some(r => r.role === "admin");
      try {
        if (isAdmin) {
          await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", "admin");
        } else {
          await supabase.from("user_roles").insert({ user_id: userId, role: "admin" });
        }
        toast.success("Role berhasil diupdate");
        loadData();
      } catch (err: any) {
        toast.error("Gagal update role: " + err.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-7rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-display font-extrabold text-foreground">Kelola Pengguna</h1>
      
      <div className="mt-8 overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-semibold">Nama</th>
                <th className="px-6 py-4 font-semibold">Kontak</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((u) => {
                const isAdmin = u.user_roles?.some((r: any) => r.role === "admin");
                return (
                  <tr key={u.id} className="transition-colors hover:bg-muted/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 overflow-hidden rounded-full bg-muted">
                          {u.avatar_url ? <img src={u.avatar_url} alt="" className="h-full w-full object-cover"/> : <div className="h-full w-full bg-primary/20"></div>}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{u.full_name || "Tanpa Nama"}</p>
                          <p className="text-xs text-muted-foreground">Terdaftar: {new Date(u.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{u.phone || "-"}</td>
                    <td className="px-6 py-4">
                      {isAdmin ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary"><ShieldAlert className="h-3 w-3" /> Admin</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">User</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="outline" size="sm" onClick={() => toggleAdmin(u.id, u.user_roles)}>
                        {isAdmin ? "Cabut Admin" : "Jadikan Admin"}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
