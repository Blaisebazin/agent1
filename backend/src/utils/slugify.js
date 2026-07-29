const DIACRITIQUES = new RegExp('[̀-ͯ]', 'g');

export function slugifier(texte) {
  const base = (texte || '')
    .normalize('NFD')
    .replace(DIACRITIQUES, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const suffixe = Date.now().toString(36);
  return `${base}-${suffixe}`;
}
