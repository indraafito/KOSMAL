import { MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const areas = [
  { name: "Lowokwaru", count: 184 },
  { name: "Klojen", count: 132 },
  { name: "Blimbing", count: 96 },
  { name: "Sukun", count: 71 },
  { name: "Kedungkandang", count: 48 },
];

export function Areas() {
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
