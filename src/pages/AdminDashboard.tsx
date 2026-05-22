import { useEffect, useState } from "react";
import { fetchStats } from "@/lib/app-queries";
import { Link } from "react-router-dom";
import { Building, Users, Star, ArrowRight, Loader2 } from "lucide-react";

export function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats().then(setStats).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-7rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const cards = [
    { title: "Total Kos", value: stats.totalKos, icon: Building, link: "/admin/kos", color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Total Pengguna", value: stats.totalUsers, icon: Users, link: "/admin/users", color: "text-green-500", bg: "bg-green-500/10" },
    { title: "Total Ulasan", value: stats.totalReviews, icon: Star, link: "/admin/reviews", color: "text-yellow-500", bg: "bg-yellow-500/10" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-display font-extrabold text-foreground">Dashboard Admin</h1>
      <p className="mt-2 text-muted-foreground">Ringkasan sistem KOSMAL</p>

      <div className="mt-8 grid gap-6 sm:grid-cols-3">
        {cards.map((c) => (
          <div key={c.title} className="rounded-3xl border border-border bg-card p-6 shadow-soft">
            <div className="flex items-center gap-4">
              <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${c.bg}`}>
                <c.icon className={`h-6 w-6 ${c.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{c.title}</p>
                <p className="text-3xl font-display font-extrabold text-foreground">{c.value}</p>
              </div>
            </div>
            <div className="mt-6">
              <Link to={c.link} className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
                Kelola <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12">
        <h2 className="text-xl font-bold text-foreground">Distribusi Kos Berdasarkan Area</h2>
        <div className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-soft">
          {Object.keys(stats.kosByArea).length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(stats.kosByArea).map(([area, count]) => (
                <div key={area} className="flex items-center justify-between rounded-2xl border border-border bg-background p-4">
                  <span className="font-medium text-foreground">{area}</span>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary">{count as React.ReactNode} kos</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">Belum ada data kos.</p>
          )}
        </div>
      </div>
    </div>
  );
}
