import { useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchKosList, kosRowToCard } from "@/lib/kos-queries";
import { KosCard } from "@/components/kosmal/KosCard";
import { Search as SearchIcon, MapPin, Loader2 } from "lucide-react";

export function Search() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get("q") ?? undefined;
  const area = searchParams.get("area") ?? undefined;
  const sort = searchParams.get("sort") as "recommended" | "price-asc" | "price-desc" | "rating" | null;

  const { data, isLoading } = useQuery({
    queryKey: ["kos", "search", q, area, sort],
    queryFn: () => fetchKosList({ q: q || undefined, area: area || undefined, sort: sort ?? "recommended" }),
  });

  const items = useMemo(() => (data ?? []).map(kosRowToCard), [data]);
  const heading = area ? `Kos di ${area}` : "Semua Kos";

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 rounded-2xl border border-border bg-card p-6 shadow-soft">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">Cari Kos</p>
            <h1 className="mt-2 text-3xl font-display font-extrabold text-foreground">{heading}</h1>
            <p className="mt-1 text-sm text-muted-foreground">Temukan kos terverifikasi di Malang.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            {q && <span>Hasil untuk <strong>{q}</strong></span>}
            {area && <span><MapPin className="inline-block h-4 w-4" /> {area}</span>}
            {!q && !area && <span>Gunakan formulir di beranda untuk penyaringan cepat.</span>}
          </div>
        </div>
      </div>
      {isLoading ? (
        <div className="flex min-h-[240px] items-center justify-center rounded-2xl border border-border bg-card p-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
          <SearchIcon className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-4">Belum ada kos yang cocok dengan filter saat ini.</p>
          <Link to="/" className="mt-4 inline-flex rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">Kembali ke Beranda</Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((kos) => <KosCard key={kos.id} kos={kos} />)}
        </div>
      )}
    </div>
  );
}
