import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import type { KosRow } from "@/lib/kos-queries";

export type WishlistItem = {
  id: string;
  kos: KosRow;
};

export type BookingRow = Database["public"]["Tables"]["bookings"]["Row"];
export type ConversationRow = Database["public"]["Tables"]["conversations"]["Row"];
export type MessageRow = Database["public"]["Tables"]["messages"]["Row"];

export async function fetchWishlist(tenantId: string): Promise<WishlistItem[]> {
  const { data, error } = await supabase.from("wishlist").select("id, kos(*)").eq("tenant_id", tenantId);
  if (error) throw error;
  return (data ?? []).map((item: any) => ({ id: item.id, kos: item.kos }));
}

export async function removeWishlist(tenantId: string, kosId: string) {
  const { error } = await supabase.from("wishlist").delete().eq("tenant_id", tenantId).eq("kos_id", kosId);
  if (error) throw error;
}

export async function fetchTenantBookings(tenantId: string): Promise<(BookingRow & { kos?: { name?: string; area?: string; image?: string } })[]> {
  const { data, error } = await supabase.from("bookings").select("*, kos(name, area, image)").eq("tenant_id", tenantId).order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createBooking(payload: {
  tenant_id: string;
  owner_id: string;
  kos_id: string;
  check_in: string;
  duration_months: number;
  notes?: string | null;
  total_price: number;
}) {
  const { error } = await supabase.from("bookings").insert({
    ...payload,
    status: "pending",
  });
  if (error) throw error;
}

export async function fetchOwnerBookings(ownerId: string): Promise<(BookingRow & { kos?: { name?: string; area?: string; image?: string } })[]> {
  const { data, error } = await supabase.from("bookings").select("*, kos(name, area, image)").eq("owner_id", ownerId).order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function updateBookingStatus(bookingId: string, status: Database["public"]["Enums"]["booking_status"]) {
  const { error } = await supabase.from("bookings").update({ status }).eq("id", bookingId);
  if (error) throw error;
}

export async function findOrCreateConversation(tenantId: string, ownerId: string, kosId: string) {
  const { data: existing, error: findError } = await supabase
    .from("conversations")
    .select("*")
    .match({ tenant_id: tenantId, owner_id: ownerId, kos_id: kosId })
    .maybeSingle();
  if (findError) throw findError;
  if (existing) return existing as ConversationRow;

  const { data: created, error: insertError } = await supabase
    .from("conversations")
    .insert({ tenant_id: tenantId, owner_id: ownerId, kos_id: kosId, last_message_at: new Date().toISOString() })
    .select("*")
    .maybeSingle();
  if (insertError) throw insertError;
  return created as ConversationRow;
}

export async function fetchConversations(mode: "tenant" | "owner", userId: string) {
  const query = mode === "tenant"
    ? supabase.from("conversations").select("*, kos(name, area, image)").eq("tenant_id", userId)
    : supabase.from("conversations").select("*, kos(name, area, image)").eq("owner_id", userId);
  const { data, error } = await query.order("last_message_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchMessages(conversationId: string): Promise<MessageRow[]> {
  const { data, error } = await supabase.from("messages").select("*").eq("conversation_id", conversationId).order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function sendMessage(conversationId: string, senderId: string, content: string) {
  const timestamp = new Date().toISOString();
  const [{ error: messageError }, { error: conversationError }] = await Promise.all([
    supabase.from("messages").insert({ conversation_id: conversationId, sender_id: senderId, content, created_at: timestamp }),
    supabase.from("conversations").update({ last_message_at: timestamp }).eq("id", conversationId),
  ]);

  if (messageError) throw messageError;
  if (conversationError) throw conversationError;
}

export async function createKosListing(options: {
  owner_id: string;
  name: string;
  area: string;
  address: string;
  price: number;
  type: string;
  description: string;
  facilities: string[];
}) {
  const helpers = (value: string) =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 64);

  const slug = `${helpers(options.name) || "kos"}-${Math.random().toString(36).slice(2, 7)}`;
  const { data, error } = await supabase
    .from("kos")
    .insert({
      owner_id: options.owner_id,
      name: options.name,
      area: options.area,
      address: options.address,
      price: options.price,
      type: options.type as any,
      description: options.description,
      facilities: options.facilities,
      all_facilities: options.facilities,
      gallery: [],
      rules: [],
      slug,
      status: "pending",
      verified: false,
      available: 1,
      rating: 0,
      reviews_count: 0,
    })
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return data as KosRow;
}

export async function deleteKosListing(kosId: string) {
  const { error } = await supabase.from("kos").delete().eq("id", kosId);
  if (error) throw error;
}
