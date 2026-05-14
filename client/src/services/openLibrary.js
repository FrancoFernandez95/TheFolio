export async function searchBooks(query) {
  if (!query || query.trim() === '') return [];
  
  try {
    const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}+language:spa&limit=12`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Error al consultar Open Library');
    
    const data = await response.json();
    
    return data.docs.map(book => ({
      externalId: book.key,
      title: book.title,
      author: book.author_name?.[0] || 'Autor desconocido',
      year: book.first_publish_year || null,
      isbn: book.isbn?.[0] || null,
      cover: book.cover_i 
        ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`
        : '',
      source: 'open-library'
    }));
  } catch (error) {
    console.error('Open Library API Error:', error);
    throw error;
  }
}
