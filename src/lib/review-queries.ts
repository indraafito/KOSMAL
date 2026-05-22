import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type ReviewRow = Database["public"]["Tables"]["reviews"]["Row"];

export type ReviewWithProfile = ReviewRow & {
  profiles?: { full_name: string | null; avatar_url: string | null } | null;
};

export async function fetchKosReviews(kosId: string): Promise<ReviewWithProfile[]> {
  // Fetch reviews without relational join (no FK from tenant_id to profiles)
  const { data: reviews, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("kos_id", kosId)
    .eq("status", "visible")
    .order("created_at", { ascending: false });
  if (error) throw error;
  if (!reviews || reviews.length === 0) return [];

  // Fetch profiles separately for all unique tenant_ids
  const tenantIds = [...new Set(reviews.map((r) => r.tenant_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url")
    .in("id", tenantIds);

  const profileMap = new Map(
    (profiles ?? []).map((p) => [p.id, { full_name: p.full_name, avatar_url: p.avatar_url }])
  );

  return reviews.map((r) => ({
    ...r,
    profiles: profileMap.get(r.tenant_id) ?? null,
  }));
}

export async function fetchReviewStats(kosId: string) {
  const { data, error } = await supabase
    .from("reviews")
    .select("rating")
    .eq("kos_id", kosId)
    .eq("status", "visible");
  if (error) throw error;
  const ratings = (data ?? []).map((r) => r.rating);
  const count = ratings.length;
  const avg = count > 0 ? ratings.reduce((a, b) => a + b, 0) / count : 0;
  return { count, avg: Math.round(avg * 10) / 10 };
}

export async function hasUserReviewed(kosId: string, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from("reviews")
    .select("id")
    .eq("kos_id", kosId)
    .eq("tenant_id", userId)
    .maybeSingle();
  return !!data;
}

export async function submitReview(kosId: string, userId: string, rating: number, text: string) {
  const { error } = await supabase.from("reviews").insert({
    kos_id: kosId,
    tenant_id: userId,
    rating,
    text,
    status: "visible",
  });
  if (error) {
    if (error.code === "23505") throw new Error("Kamu sudah pernah memberikan review untuk kos ini.");
    throw error;
  }

  // Update kos reviews_count and rating
  const stats = await fetchReviewStats(kosId);
  await supabase.from("kos").update({
    reviews_count: stats.count,
    rating: stats.avg,
  }).eq("id", kosId);
}

export async function deleteReview(reviewId: string, kosId: string) {
  const { error } = await supabase.from("reviews").delete().eq("id", reviewId);
  if (error) throw error;

  // Recalculate kos reviews_count and rating
  const stats = await fetchReviewStats(kosId);
  await supabase.from("kos").update({
    reviews_count: stats.count,
    rating: stats.count > 0 ? stats.avg : 0,
  }).eq("id", kosId);
}

export async function updateReview(reviewId: string, rating: number, text: string, kosId: string) {
  const editedSuffix = " (diedit)";
  let finalText = text;
  if (!finalText.endsWith(editedSuffix)) {
    finalText = finalText + editedSuffix;
  }
  const { error } = await supabase
    .from("reviews")
    .update({
      rating,
      text: finalText,
    })
    .eq("id", reviewId);
  if (error) throw error;

  // Recalculate kos reviews_count and rating
  const stats = await fetchReviewStats(kosId);
  await supabase.from("kos").update({
    reviews_count: stats.count,
    rating: stats.count > 0 ? stats.avg : 0,
  }).eq("id", kosId);
}

/** Sync the cached rating/reviews_count on the kos table with actual review data */
export async function syncKosReviewStats(kosId: string) {
  const stats = await fetchReviewStats(kosId);
  await supabase.from("kos").update({
    reviews_count: stats.count,
    rating: stats.count > 0 ? stats.avg : 0,
  }).eq("id", kosId);
  return stats;
}
