import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { KosCard } from "@/components/kosmal/KosCard";
import { useQuery } from "@tanstack/react-query";
import { fetchKosList, kosRowToCard } from "@/lib/kos-queries";

export function Recommendations() {
  const { data, isLoading } = useQuery({
    queryKey: ["kos", "recommendations"],
    queryFn: () => fetchKosList({ sort: "rating" }),
  });
  const items = (data ?? []).slice(0, 4).map(kosRowToCard);

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">Pilihan Terbaik</span>
          <h2 className="mt-1 font-display text-2xl font-extrabold text-foreground sm:text-3xl">Rekomendasi Kos Untukmu</h2>
          <p className="mt-1 text-sm text-muted-foreground">Kos terverifikasi dengan rating tertinggi minggu ini.</p>
        </div>
        <Link to="/cari" className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:underline sm:inline-flex">
          Lihat Semua <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      {isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-[4/5] animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
          Belum ada listing yang disetujui. Pemilik kos dapat menambahkan listing kapan saja.
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((k) => <KosCard key={k.id} kos={k} />)}
        </div>
      )}
    </section>
  );
}
