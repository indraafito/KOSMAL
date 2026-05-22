import { useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchKosList, kosRowToCard } from "@/lib/kos-queries";
import { KosCard } from "@/components/kosmal/KosCard";
import { toMonthlyPrice, type PricePeriod } from "@/lib/price-utils";
import { Search as SearchIcon, MapPin, Loader2, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Daftar kecamatan Malang — sesuaikan dengan data kamu
const KECAMATAN = [
  "Lowokwaru", "Blimbing", "Klojen", "Sukun", "Kedungkandang",
];

export function Search() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get("q") ?? undefined;
  const area = searchParams.get("area") ?? undefined;
  const sort = searchParams.get("sort") as "recommended" | "price-asc" | "price-desc" | "rating" | null;

  // Active Filter states
  const [selectedKecamatan, setSelectedKecamatan] = useState<string>("");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [pricePeriod, setPricePeriod] = useState<PricePeriod>("bulan");
  const [isFiltered, setIsFiltered] = useState(false);

  // Dialog temp states
  const [openFilterDialog, setOpenFilterDialog] = useState(false);
  const [tempKecamatan, setTempKecamatan] = useState<string>("");
  const [tempMin, setTempMin] = useState<string>("");
  const [tempMax, setTempMax] = useState<string>("");
  const [tempPeriod, setTempPeriod] = useState<PricePeriod>("bulan");

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
        const minVal = Number(minPrice) || 0;
        const maxVal = Number(maxPrice) || Infinity;
        const minPerBulan = toMonthlyPrice(minVal, pricePeriod);
        const maxPerBulan = toMonthlyPrice(maxVal, pricePeriod);

        const hargaBulan = toMonthlyPrice(kos.price, (kos.price_period as PricePeriod) ?? "bulan");
        if (hargaBulan < minPerBulan) return false;
        if (hargaBulan > maxPerBulan) return false;
      }

      return true;
    });
  }, [data, selectedKecamatan, minPrice, maxPrice, pricePeriod, isFiltered]);

  const heading = area ? `Kos di ${area}` : "Semua Kos";

  const handleOpenFilter = () => {
    setTempKecamatan(selectedKecamatan);
    setTempMin(minPrice);
    setTempMax(maxPrice);
    setTempPeriod(pricePeriod);
    setOpenFilterDialog(true);
  };

  const handleApplyFilter = () => {
    setSelectedKecamatan(tempKecamatan);
    setMinPrice(tempMin);
    setMaxPrice(tempMax);
    setPricePeriod(tempPeriod);
    setIsFiltered(!!tempMin || !!tempMax || !!tempKecamatan);
    setOpenFilterDialog(false);
  };

  const handleResetFilter = () => {
    setSelectedKecamatan("");
    setMinPrice("");
    setMaxPrice("");
    setPricePeriod("bulan");
    setIsFiltered(false);

    setTempKecamatan("");
    setTempMin("");
    setTempMax("");
    setTempPeriod("bulan");
    setOpenFilterDialog(false);
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
          </div>
        </div>

        {/* Tombol toggle filter */}
        <div className="mt-4 flex items-center gap-2">
          <Button
            variant="outline"
            className="flex items-center gap-2 rounded-full"
            onClick={handleOpenFilter}
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

      {/* Pop up filter */}
      <Dialog open={openFilterDialog} onOpenChange={setOpenFilterDialog}>
        <DialogContent className="sm:max-w-[440px] rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold text-foreground">Filter Pencarian</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Filter kecamatan */}
            <div>
              <p className="text-sm font-semibold text-foreground mb-3">Area / Kecamatan</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setTempKecamatan("")}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition-all ${
                    tempKecamatan === ""
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  Semua
                </button>
                {KECAMATAN.map((k) => (
                  <button
                    type="button"
                    key={k}
                    onClick={() => setTempKecamatan(k)}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold transition-all ${
                      tempKecamatan === k
                        ? "border-primary bg-primary text-primary-foreground shadow-sm"
                        : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {k}
                  </button>
                ))}
              </div>
            </div>

            <hr className="border-border/60" />

            {/* Filter harga */}
            <div>
              <p className="text-sm font-semibold text-foreground mb-3">Harga Sewa</p>
              <div className="mb-3">
                <select
                  value={tempPeriod}
                  onChange={(e) => setTempPeriod(e.target.value as PricePeriod)}
                  className="w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="bulan">per Bulan</option>
                  <option value="semester">per Semester</option>
                  <option value="tahun">per Tahun</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <span className="text-xs text-muted-foreground">Min (Rp)</span>
                  <input
                    type="number"
                    value={tempMin}
                    onChange={(e) => setTempMin(e.target.value)}
                    className="mt-1 flex h-10 w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                    placeholder="0"
                  />
                </div>
                <div className="flex-1">
                  <span className="text-xs text-muted-foreground">Max (Rp)</span>
                  <input
                    type="number"
                    value={tempMax}
                    onChange={(e) => setTempMax(e.target.value)}
                    className="mt-1 flex h-10 w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                    placeholder="Semua"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleResetFilter}
              className="flex-1 rounded-full py-5 text-sm font-semibold border-primary/20 text-primary hover:bg-brand-soft/20 hover:text-primary"
            >
              Reset
            </Button>
            <Button
              type="button"
              onClick={handleApplyFilter}
              className="flex-1 rounded-full py-5 text-sm font-semibold bg-gradient-cta text-white"
            >
              Terapkan
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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