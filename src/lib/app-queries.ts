import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import type { KosRow } from "@/lib/kos-queries";

// ========================
// Wishlist
// ========================

export type WishlistItem = {
  id: string;
  kos: KosRow;
};

export async function fetchWishlist(tenantId: string): Promise<WishlistItem[]> {
  const { data, error } = await supabase.from("wishlist").select("id, kos(*)").eq("tenant_id", tenantId);
  if (error) throw error;
  return (data ?? []).map((item: any) => ({ id: item.id, kos: item.kos }));
}

export async function removeWishlist(tenantId: string, kosId: string) {
  const { error } = await supabase.from("wishlist").delete().eq("tenant_id", tenantId).eq("kos_id", kosId);
  if (error) throw error;
}

// ========================
// Admin: Kos CRUD
// ========================

export async function createKosListing(options: {
  owner_id: string;
  name: string;
  area: string;
  address: string;
  price: number;
  price_period: string;
  price_type: string;
  price_max?: number | null;
  type: string;
  description: string;
  facilities: string[];
  owner_name: string;
  owner_whatsapp: string;
  photos?: string[];
}) {
  const helpers = (value: string) =>
    value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 64);

  const slug = `${helpers(options.name) || "kos"}-${Math.random().toString(36).slice(2, 7)}`;

  const { data, error } = await supabase
    .from("kos")
    .insert({
      owner_id: options.owner_id,
      name: options.name,
      area: options.area,
      address: options.address,
      price: options.price,
      price_period: options.price_period,
      price_type: options.price_type,
      price_max: options.price_max ?? null,
      type: options.type as any,
      description: options.description,
      facilities: options.facilities,
      all_facilities: options.facilities,
      gallery: options.photos || [],
      photos: options.photos || [],
      image: options.photos?.[0] || null,
      rules: [],
      slug,
      status: "approved",
      verified: true,
      available: 1,
      rating: 0,
      reviews_count: 0,
      owner_name: options.owner_name,
      owner_whatsapp: options.owner_whatsapp,
    })
    .select("*")
    .maybeSingle();

  if (error) throw error;
  return data as KosRow;
}

export async function updateKosListing(kosId: string, updates: Partial<Database["public"]["Tables"]["kos"]["Update"]>) {
  const { error } = await supabase.from("kos").update(updates).eq("id", kosId);
  if (error) throw error;
}

export async function updateKosPhotos(kosId: string, photos: string[]) {
  const { error } = await supabase
    .from("kos")
    .update({ photos, gallery: photos, image: photos[0] || null })
    .eq("id", kosId);
  if (error) throw new Error(error.message);
}

export async function deleteKosListing(kosId: string) {
  const { error } = await supabase.from("kos").delete().eq("id", kosId);
  if (error) throw error;
}

// ========================
// Admin: User Management
// ========================

export async function fetchAllUsers() {
  const { data, error } = await supabase
    .from("profiles")
    .select("*, user_roles(role)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// ========================
// Admin: Review Management
// ========================

export async function fetchAllReviews() {
  const { data, error } = await supabase
    .from("reviews")
    .select("*, profiles:tenant_id(full_name, avatar_url), kos:kos_id(name, slug)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function updateReviewStatus(reviewId: string, status: Database["public"]["Enums"]["review_status"]) {
  const { error } = await supabase.from("reviews").update({ status }).eq("id", reviewId);
  if (error) throw error;
}

export async function deleteReview(reviewId: string) {
  const { error } = await supabase.from("reviews").delete().eq("id", reviewId);
  if (error) throw error;
}

// ========================
// Admin: Statistics
// ========================

export async function fetchStats() {
  const [kosResult, userResult, reviewResult] = await Promise.all([
    supabase.from("kos").select("id, area, status", { count: "exact" }),
    supabase.from("profiles").select("id", { count: "exact" }),
    supabase.from("reviews").select("id", { count: "exact" }),
  ]);
  return {
    totalKos: kosResult.count ?? 0,
    totalUsers: userResult.count ?? 0,
    totalReviews: reviewResult.count ?? 0,
    kosByArea: (kosResult.data ?? []).reduce((acc: Record<string, number>, k: any) => {
      acc[k.area] = (acc[k.area] || 0) + 1;
      return acc;
    }, {}),
  };
}