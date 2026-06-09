// SEO-friendly slug generation for car names.
// "MG4 Electric 2026" -> "mg4-electric-2026"
// Romanian diacritics (ă â î ș ț) are transliterated via NFKD decomposition.
export function slugify(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
