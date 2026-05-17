export const formatRupiah = (n: number) => "Rp" + n.toLocaleString("id-ID");
export const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");