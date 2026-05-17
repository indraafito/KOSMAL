// src/lib/price-utils.ts

export type PricePeriod = "bulan" | "semester" | "tahun";

export function toMonthlyPrice(price: number, period: PricePeriod): number {
  if (period === "semester") return price / 6;
  if (period === "tahun") return price / 12;
  return price;
}

export function formatPrice(price: number, period: PricePeriod): string {
  return `Rp ${price.toLocaleString("id-ID")} / ${period}`;
}