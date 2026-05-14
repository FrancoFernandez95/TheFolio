const fallbacks = [
  {
    text: "Leer un poco también es avanzar.",
    author: "The Folio"
  },
  {
    text: "No se trata de leer más, sino de volver a leer.",
    author: "The Folio"
  },
  {
    text: "Una página hoy vale más que una intención para mañana.",
    author: "The Folio"
  }
];

export async function getRandomQuote() {
  try {
    const response = await fetch('https://www.positive-api.online/api/quotes/random?lang=es');
    if (!response.ok) throw new Error('API Error');
    
    const data = await response.json();
    return {
      text: data.text || data.quote || fallbacks[0].text,
      author: data.author || 'Anónimo'
    };
  } catch (err) {
    console.error('Error fetching quote, using fallback:', err);
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }
}
