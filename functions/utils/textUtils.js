// Mapeo básico de caracteres especiales
const charMap = {
  'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u',
  'Á': 'A', 'É': 'E', 'Í': 'I', 'Ó': 'O', 'Ú': 'U',
  'ñ': 'n', 'Ñ': 'N',
  '¿': '?', '¡': '!',
  '…': '...',
  '—': '-',
  '–': '-'
};

/**
 * Normaliza el texto reemplazando caracteres especiales
 */
export function normalizeText(text) {
  return text.replace(/[^\x00-\x7F]/g, char => charMap[char] || char);
} 