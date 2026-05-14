import express from 'express';

const router = express.Router();

const commonAccentFixes = {
  arbol: "árbol",
  accion: "acción",
  cancion: "canción",
  corazon: "corazón",
  dificil: "difícil",
  facil: "fácil",
  lapiz: "lápiz",
  cafe: "café",
  telefono: "teléfono",
  musica: "música",
  pagina: "página",
  rapido: "rápido",
  ultimo: "último",
  pais: "país",
  raiz: "raíz",
  tambien: "también",
  despues: "después",
  mas: "más",
  que: "qué",
  como: "cómo",
  cuando: "cuándo",
  donde: "dónde",
  murcielago: "murciélago"
};

router.get('/:word', async (req, res) => {
  try {
    const originalWord = req.params.word;
    const cleanWord = originalWord.trim().toLowerCase();
    const apiKey = process.env.RAE_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'RAE_API_KEY no está configurada.' });
    }

    const variants = [cleanWord, commonAccentFixes[cleanWord]].filter(Boolean);

    for (const variant of variants) {
      const response = await fetch(
        `https://rae-api.com/api/words/${encodeURIComponent(variant)}?api_key=${apiKey}`
      );

      if (response.ok) {
        const data = await response.json();

        if (
          data.ok &&
          data.data &&
          data.data.meanings &&
          data.data.meanings.length > 0
        ) {
          data.matchedWord = variant;
          data.originalWord = originalWord;
          return res.json(data);
        }
      }
    }

    return res.status(404).json({ error: 'No encontramos esta palabra.' });
  } catch (error) {
    console.error('Error fetching dictionary:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;