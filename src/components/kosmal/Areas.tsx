import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export function Areas() {
  const [areas, setAreas] = useState<{name: string, count: number}[]>([
    { name: "Lowokwaru", count: 0 },
    { name: "Klojen", count: 0 },
    { name: "Blimbing", count: 0 },
    { name: "Sukun", count: 0 },
    { name: "Kedungkandang", count: 0 },
  ]);

  useEffect(() => {
    async function fetchAreas() {
      try {
        const { data, error } = await supabase
          .from("kos")
          .select("area")
          .eq("status", "approved");

        if (error) throw error;

        const defaultAreas = ["Lowokwaru", "Klojen", "Blimbing", "Sukun", "Kedungkandang"];
        const counts: Record<string, number> = {};

        defaultAreas.forEach((area) => {
          counts[area] = 0;
        });

        (data || []).forEach((item) => {
          if (item.area) {
            const areaName = item.area.trim();
            const formattedAreaName = areaName
              .split(" ")
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
              .join(" ");
            counts[formattedAreaName] = (counts[formattedAreaName] || 0) + 1;
          }
        });

        const sortedAreas = Object.entries(counts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count);

        setAreas(sortedAreas);
      } catch (error) {
        console.error("Error fetching areas:", error);
      }
    }

    fetchAreas();
  }, []);

  return (
    <section className="bg-brand-soft/40 py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">Telusuri Area</span>
          <h2 className="mt-1 font-display text-2xl font-extrabold text-foreground sm:text-3xl">Kos per Kecamatan di Malang</h2>
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {areas.map((a) => (
            <Link
              key={a.name}
              to={`/cari?area=${encodeURIComponent(a.name)}`}
              className="group inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-brand-soft hover:text-primary"
            >
              <MapPin className="h-4 w-4 text-primary" />
              {a.name}
              <span className="ml-1 rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-bold text-primary group-hover:bg-card">
                {a.count}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
