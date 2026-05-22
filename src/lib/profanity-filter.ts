/**
 * Daftar kata tidak pantas (bahasa Indonesia & umum).
 * Kata-kata ini dilarang dalam ulasan pengguna.
 */
const BANNED_WORDS: string[] = [
  // Makian kasar
  "anjing", "anjir", "anjg", "anying",
  "bangsat", "bgs", "bgst",
  "babi", "babi hutan",
  "bajingan", "bajigur",
  "keparat", "kepret",
  "sial", "sialan",
  "bedebah", "brengsek",
  "kampret", "kampung",
  "goblok", "goblog", "goblogs",
  "tolol", "tolo",
  "idiot", "idot",
  "bodoh",
  "dungu",
  "asu",
  "celeng",
  "tai", "taik",
  "tahi",
  "kotoran",
  "berengsek",
  "setan",
  "iblis",
  "laknat",
  "terkutuk",
  "kurang ajar",
  "kurangajar",
  "biadab",

  // Kata vulgar/seksual
  "kontol", "kontoll", "kntl",
  "memek", "mmk",
  "pepek",
  "titit",
  "ngentot", "ngentod", "ngentotin",
  "entot", "entod",
  "jancok", "jancuk", "janc0k", "jancog",
  "asu", "asuw",
  "coli", "ngocol",
  "colmek",
  "crot",
  "cokil",
  "ngewe", "diwe", "diwe",
  "ngocok",
  "bokep", "b0kep",
  "porn", "porno",
  "bugil",
  "telanjang",
  "payudara", "toket",
  "vagina", "penis", "dick", "cock",
  "pussy", "fuck", "fucking", "fucker", "fuk", "f*ck",
  "shit", "bullshit", "asshole", "ass",
  "bitch", "bastard", "damn", "crap",
  "whore", "slut",

  // Penghinaan SARA / diskriminasi
  "kafir",
  "bangke", "bangkai",
  "monyet",
  "kera",
  "bego", "begu",
  "geblek",
  "perek",
  "lonte", "lonthe",
  "pelacur",
  "sundal",
  "jalang",
  "lacur",
  "bajingan",
  "pecundang",
  "pengecut",
  "penghianat",

  // Variasi umum dengan angka/simbol
  "4nj1ng",
  "b4ngsat",
  "k0ntol",
  "m3m3k",
  "j4nc0k",
];

/**
 * Normalisasi teks agar deteksi lebih akurat:
 * - Lowercase
 * - Ganti angka yang menyerupai huruf (leet-speak)
 */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/4/g, "a")
    .replace(/3/g, "e")
    .replace(/1/g, "i")
    .replace(/0/g, "o")
    .replace(/\*/g, "")
    .replace(/@/g, "a")
    .replace(/\$/g, "s")
    .replace(/[^a-z\s]/g, ""); // hanya huruf & spasi
}

/**
 * Cek apakah teks mengandung kata tidak pantas.
 * Returns the first found bad word, or null if clean.
 */
export function detectProfanity(text: string): string | null {
  const normalized = normalize(text);

  for (const word of BANNED_WORDS) {
    const normalizedWord = normalize(word);
    // Cek sebagai kata utuh menggunakan word boundary
    const regex = new RegExp(`(?<![a-z])${normalizedWord}(?![a-z])`, "i");
    if (regex.test(normalized)) {
      return word;
    }
  }
  return null;
}

/**
 * Return true jika teks bersih (tidak mengandung kata terlarang).
 */
export function isTextClean(text: string): boolean {
  return detectProfanity(text) === null;
}
