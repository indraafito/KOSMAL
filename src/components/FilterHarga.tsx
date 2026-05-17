import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toMonthlyPrice, type PricePeriod } from "@/lib/price-utils";

interface FilterHargaProps {
  onFilter: (minPerBulan: number, maxPerBulan: number) => void;
  onReset: () => void;
}

export function FilterHarga({ onFilter, onReset }: FilterHargaProps) {
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");
  const [period, setPeriod] = useState<PricePeriod>("bulan");

  const handleApply = () => {
    const minVal = Number(min) || 0;
    const maxVal = Number(max) || Infinity;
    // Konversi ke /bulan agar apples-to-apples
    onFilter(
      toMonthlyPrice(minVal, period),
      toMonthlyPrice(maxVal, period)
    );
  };

  const handleReset = () => {
    setMin("");
    setMax("");
    setPeriod("bulan");
    onReset();
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-4">
      <p className="mb-3 text-sm font-semibold text-foreground">Filter Harga</p>

      <div className="mb-3">
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as PricePeriod)}
          className="w-full rounded-3xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="bulan">per Bulan</option>
          <option value="semester">per Semester</option>
          <option value="tahun">per Tahun</option>
        </select>
      </div>

      <div className="flex gap-2">
        <div className="flex-1">
          <Label htmlFor="min-price" className="text-xs">Min</Label>
          <Input
            id="min-price"
            type="number"
            value={min}
            onChange={(e) => setMin(e.target.value)}
            className="mt-1"
            placeholder="0"
          />
        </div>
        <div className="flex-1">
          <Label htmlFor="max-price" className="text-xs">Max</Label>
          <Input
            id="max-price"
            type="number"
            value={max}
            onChange={(e) => setMax(e.target.value)}
            className="mt-1"
            placeholder="∞"
          />
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <Button onClick={handleApply} className="flex-1 bg-gradient-cta text-sm">
          Terapkan
        </Button>
        <Button onClick={handleReset} variant="outline" className="flex-1 text-sm">
          Reset
        </Button>
      </div>
    </div>
  );
}