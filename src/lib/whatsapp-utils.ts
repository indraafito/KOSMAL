/**
 * Build a WhatsApp deep-link with a pre-filled message.
 * @param phone – owner's WhatsApp number (e.g. "081234567890" or "+6281234567890")
 * @param message – the pre-filled message text
 */
export function buildWhatsAppUrl(phone: string | null | undefined, message: string): string {
  if (!phone) return "#";
  // Normalize: strip spaces, dashes; ensure starts with country code
  let cleaned = String(phone).replace(/[\s\-()]/g, "");
  if (cleaned.startsWith("0")) cleaned = "62" + cleaned.slice(1);
  if (cleaned.startsWith("+")) cleaned = cleaned.slice(1);
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`;
}

export function buildKosContactMessage(kosName: string, area: string): string {
  return `Halo, saya tertarik dengan kos "${kosName}" di ${area} yang ada di KOSMAL. Apakah masih tersedia?`;
}

export function buildKosBookingMessage(kosName: string, area: string): string {
  return `Halo, saya ingin memesan kos "${kosName}" di ${area} yang ada di KOSMAL. Bisa dibantu prosesnya?`;
}
