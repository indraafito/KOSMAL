import { useEffect, useState } from "react";
import { Home, ShieldCheck, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export function Stats() {
  const [statsData, setStatsData] = useState({
    registered: 0,
    verified: 0,
    users: 0,
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        const [
          { count: registeredCount },
          { count: verifiedCount },
          { count: usersCount }
        ] = await Promise.all([
          supabase.from("kos").select("*", { count: "exact", head: true }).eq("status", "approved"),
          supabase.from("kos").select("*", { count: "exact", head: true }).eq("status", "approved").eq("verified", true),
          supabase.from("profiles").select("*", { count: "exact", head: true })
        ]);

        setStatsData({
          registered: registeredCount || 0,
          verified: verifiedCount || 0,
          users: usersCount || 0,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    }

    fetchStats();
  }, []);

  const stats = [
    { icon: Home, value: statsData.registered.toLocaleString("id-ID"), label: "Kos Terdaftar" },
    { icon: ShieldCheck, value: statsData.verified.toLocaleString("id-ID"), label: "Kos Terverifikasi" },
    { icon: Users, value: statsData.users.toLocaleString("id-ID"), label: "Pengguna Terdaftar" },
  ];

  return (
    <section className="mx-auto relative z-10 mt-8 max-w-6xl px-4 sm:px-6 lg:-mt-12 xl:-mt-16 lg:px-8">
      <div className="grid gap-4 rounded-2xl border border-border bg-card p-4 shadow-card sm:grid-cols-3 sm:p-6">
        {stats.map((s) => (
          <div key={s.label} className="flex items-center gap-4 rounded-xl p-2">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-primary">
              <s.icon className="h-6 w-6" />
            </div>
            <div>
              <div className="font-display text-2xl font-extrabold text-foreground">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
