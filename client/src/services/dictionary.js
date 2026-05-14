import { api } from './api';

export async function getSpanishDefinition(word) {
  if (!word) return null;
  const normalizedWord = word.trim().toLowerCase();
  if (!normalizedWord) return null;

  try {
    const json = await api(`/dictionary/${encodeURIComponent(normalizedWord)}`);
    
    if (!json || !json.ok || !json.data || !json.data.meanings || json.data.meanings.length === 0) {
      return null;
    }
    
    const firstMeaning = json.data.meanings[0];
    if (!firstMeaning.senses || firstMeaning.senses.length === 0) return null;

    const firstSense = firstMeaning.senses[0];
    
    return {
      word: json.matchedWord || json.data.word || normalizedWord,
      originalWord: json.originalWord || normalizedWord,
      definition: firstSense.description,
      example: firstSense.examples?.[0] || null,
      source: "RAE"
    };
  } catch (err) {
    return null;
  }
}
