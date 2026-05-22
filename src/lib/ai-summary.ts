const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

import { supabase } from "@/integrations/supabase/client";

/**
 * Generate an AI summary of reviews for a kos listing using Gemini.
 * Only regenerates if there are new reviews since the last summary.
 */
export async function generateReviewSummary(kosId: string): Promise<string | null> {
  // 1. Fetch kos data to check if regeneration is needed
  const { data: kos } = await supabase
    .from("kos")
    .select("ai_review_summary, ai_summary_review_count, reviews_count, name")
    .eq("id", kosId)
    .maybeSingle();

  if (!kos) return null;

  // Skip if no new reviews since last summary
  if (kos.ai_review_summary && kos.ai_summary_review_count >= kos.reviews_count) {
    return kos.ai_review_summary;
  }

  // 2. Fetch all visible reviews
  const { data: reviews } = await supabase
    .from("reviews")
    .select("rating, text")
    .eq("kos_id", kosId)
    .eq("status", "visible")
    .order("created_at", { ascending: false });

  if (!reviews || reviews.length === 0) return null;

  // 3. Build prompt
  const reviewTexts = reviews.map((r, i) => `Review ${i + 1} (Rating ${r.rating}/5): ${r.text}`).join("\n");

  const prompt = `Kamu adalah asisten AI untuk marketplace kos di Malang bernama KOSMAL.
Berikut adalah kumpulan review dari pengguna untuk kos "${kos.name}":

${reviewTexts}

Buatkan ringkasan singkat (2-4 kalimat) dalam Bahasa Indonesia yang menggambarkan opini umum pengguna tentang kos ini. Fokus pada hal-hal positif dan negatif yang sering disebutkan. Tulis dengan nada netral dan informatif.`;

  try {
    // 4. Call Gemini API
    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 256,
        },
      }),
    });

    if (!response.ok) {
      console.error("Gemini API error:", response.status, await response.text());
      return null;
    }

    const result = await response.json();
    const summary = result.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!summary) return null;

    // 5. Save summary to database
    await supabase.from("kos").update({
      ai_review_summary: summary,
      ai_summary_review_count: reviews.length,
    }).eq("id", kosId);

    return summary;
  } catch (err) {
    console.error("Failed to generate AI summary:", err);
    return null;
  }
}
