import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type KosRow = Database["public"]["Tables"]["kos"]["Row"];
export type BookingRow = Database["public"]["Tables"]["bookings"]["Row"];

export type KosFilters = {
  q?: string;
  area?: string;
  tipe?: string;
  min?: number;
  max?: number;
  fas?: string[];
  sort?: "recommended" | "price-asc" | "price-desc" | "rating";
};

export async function fetchKosList(filters: KosFilters = {}): Promise<KosRow[]> {
  let q = supabase.from("kos").select("*").eq("status", "approved");
  if (filters.q) q = q.or(`name.ilike.%${filters.q}%,area.ilike.%${filters.q}%,address.ilike.%${filters.q}%`);
  if (filters.area) q = q.eq("area", filters.area);
  if (filters.tipe) q = q.eq("type", filters.tipe as KosRow["type"]);
  if (filters.min) q = q.gte("price", filters.min);
  if (filters.max && filters.max < 5_000_000) q = q.lte("price", filters.max);
  if (filters.fas?.length) q = q.contains("facilities", filters.fas);
  if (filters.sort === "price-asc") q = q.order("price", { ascending: true });
  else if (filters.sort === "price-desc") q = q.order("price", { ascending: false });
  else if (filters.sort === "rating") q = q.order("rating", { ascending: false });
  else q = q.order("created_at", { ascending: false });
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function fetchKosBySlug(slug: string): Promise<KosRow | null> {
  const { data } = await supabase.from("kos").select("*").eq("slug", slug).maybeSingle();
  return data;
}

export async function fetchOwnerKos(ownerId: string) {
  const { data, error } = await supabase.from("kos").select("*").eq("owner_id", ownerId).order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export const facilityLabels: Record<string, string> = {
  wifi: "WiFi", ac: "AC", bath: "KM Dalam", parking: "Parkir", kitchen: "Dapur",
};

export type KosCardData = {
  id: string; slug: string; name: string; area: string; price: number;
  rating: number; reviews: number; type: "Putra" | "Putri" | "Campur";
  image: string; verified: boolean; facilities: string[];
};

export const kosRowToCard = (k: KosRow): KosCardData => ({
  id: k.id, slug: k.slug, name: k.name, area: k.area, price: k.price,
  rating: Number(k.rating), reviews: k.reviews_count,
  type: k.type as "Putra" | "Putri" | "Campur",
  image: k.image || "/placeholder.svg",
  verified: k.verified, facilities: k.facilities ?? [],
});