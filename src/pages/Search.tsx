import { useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchKosList, kosRowToCard } from "@/lib/kos-queries";
import { KosCard } from "@/components/kosmal/KosCard";
import { FilterHarga } from "@/components/FilterHarga";
import { toMonthlyPrice, type PricePeriod } from "@/lib/price-utils";
import { Search as SearchIcon, MapPin, Loader2, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";

// Daftar kecamatan Malang — sesuaikan dengan data kamu
const KECAMATAN = [
  "Lowokwaru", "Blimbing", "Klojen", "Sukun", "Kedungkandang",
];

export function Search() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get("q") ?? undefined;
  const area = searchParams.get("area") ?? undefined;
  const sort = searchParams.get("sort") as "recommended" | "price-asc" | "price-desc" | "rating" | null;

  // State filter
  const [showFilter, setShowFilter] = useState(false);
  const [selectedKecamatan, setSelectedKecamatan] = useState<string>("");
  const [minPerBulan, setMinPerBulan] = useState<number>(0);
  const [maxPerBulan, setMaxPerBulan] = useState<number>(Infinity);
  const [isFiltered, setIsFiltered] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["kos", "search", q, area, sort],
    queryFn: () => fetchKosList({ q: q || undefined, area: area || undefined, sort: sort ?? "recommended" }),
  });

  const items = useMemo(() => {
    const all = (data ?? []).map(kosRowToCard);

    return all.filter((kos) => {
      // Filter kecamatan
      if (selectedKecamatan && kos.area !== selectedKecamatan) return false;

      // Filter harga — normalisasi ke /bulan
      if (isFiltered) {
        const hargaBulan = toMonthlyPrice(kos.price, (kos.price_period as PricePeriod) ?? "bulan");
        if (hargaBulan < minPerBulan) return false;
        if (hargaBulan > maxPerBulan) return false;
      }

      return true;
    });
  }, [data, selectedKecamatan, minPerBulan, maxPerBulan, isFiltered]);

  const heading = area ? `Kos di ${area}` : "Semua Kos";

  const handleFilter = (min: number, max: number) => {
    setMinPerBulan(min);
    setMaxPerBulan(max);
    setIsFiltered(true);
  };

  const handleResetFilter = () => {
    setMinPerBulan(0);
    setMaxPerBulan(Infinity);
    setSelectedKecamatan("");
    setIsFiltered(false);
  };

  const activeFilterCount = [
    selectedKecamatan !== "",
    isFiltered,
  ].filter(Boolean).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
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

        {/* Tombol toggle filter */}
        <div className="mt-4 flex items-center gap-2">
          <Button
            variant="outline"
            className="flex items-center gap-2 rounded-full"
            onClick={() => setShowFilter((v) => !v)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filter
            {activeFilterCount > 0 && (
              <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                {activeFilterCount}
              </span>
            )}
          </Button>

          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              className="flex items-center gap-1 rounded-full text-xs text-muted-foreground"
              onClick={handleResetFilter}
            >
              <X className="h-3 w-3" /> Reset filter
            </Button>
          )}

          <span className="ml-auto text-sm text-muted-foreground">
            {items.length} kos ditemukan
          </span>
        </div>
      </div>

      {/* Panel filter */}
      {showFilter && (
        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          {/* Filter kecamatan */}
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="mb-3 text-sm font-semibold text-foreground">Area / Kecamatan</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedKecamatan("")}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  selectedKecamatan === ""
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground hover:bg-muted"
                }`}
              >
                Semua
              </button>
              {KECAMATAN.map((k) => (
                <button
                  key={k}
                  onClick={() => setSelectedKecamatan(k)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    selectedKecamatan === k
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:bg-muted"
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>
          </div>

          {/* Filter harga */}
          <FilterHarga onFilter={handleFilter} onReset={handleResetFilter} />
        </div>
      )}

      {/* Hasil */}
      {isLoading ? (
        <div className="flex min-h-[240px] items-center justify-center rounded-2xl border border-border bg-card p-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
          <SearchIcon className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-4">Belum ada kos yang cocok dengan filter saat ini.</p>
          {activeFilterCount > 0 && (
            <button
              onClick={handleResetFilter}
              className="mt-3 text-primary underline underline-offset-2"
            >
              Hapus semua filter
            </button>
          )}
          <Link to="/" className="mt-4 inline-flex rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
            Kembali ke Beranda
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((kos) => <KosCard key={kos.id} kos={kos} />)}
        </div>
      )}
    </div>
  );
}