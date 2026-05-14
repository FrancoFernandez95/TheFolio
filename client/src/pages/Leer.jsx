import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Nav from '../components/Nav';
import BookCover from '../components/BookCover';
import { api } from '../services/api';

export default function Leer() {
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState('');
  const [duration, setDuration] = useState(15);
  const navigate = useNavigate();

  useEffect(() => {
    api('/books').then(data => {
      setBooks(data.books);
      setSelectedBook(data.books[0]?._id || '');
    });
  }, []);

  async function startSession() {
    if (!selectedBook) return alert('Agregá un libro primero');
    const data = await api('/sessions', {
      method: 'POST',
      body: JSON.stringify({ bookId: selectedBook, duration })
    });
    navigate(`/finalizar/${data.session._id}`);
  }

  const book = books.find(b => b._id === selectedBook);

  return (
    <main className="screen withNav">
      <Header />
      
      <section style={{ padding: '40px 0 24px' }}>
        <h1 style={{ fontSize: '44px', lineHeight: '1.1', margin: '0 0 16px', fontWeight: 'bold', fontFamily: '"Playfair Display", serif', letterSpacing: '-0.5px' }}>¿Qué vas a leer<br/>hoy?</h1>
        <p style={{ fontStyle: 'italic', fontFamily: '"Playfair Display", serif', color: '#555', fontSize: '16px', margin: 0 }}>Continúa tu progreso de lectura</p>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '20px', alignItems: 'flex-start', padding: '24px', background: 'white', border: '1px solid var(--line)', borderRadius: '2px', marginBottom: '32px' }}>
        {book && <BookCover book={book} style={{ width: '100%', height: 'auto', borderRadius: '2px', boxShadow: '2px 4px 12px rgba(0,0,0,0.1)' }} />}
        <div style={{ paddingTop: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <div style={{ width: '4px', height: '14px', background: '#647363' }}></div>
            <small style={{ fontSize: '11px', letterSpacing: '1px', fontWeight: '700', color: '#555', margin: 0, textTransform: 'uppercase' }}>ÚLTIMO LEÍDO</small>
          </div>
          <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: '22px', fontWeight: '500', margin: '0 0 8px', lineHeight: '1.3', letterSpacing: '-0.3px' }}>{book?.title || 'Selecciona un libro'}</h2>
          <p style={{ margin: '0 0 24px', fontSize: '14px', color: '#333' }}>{book?.author}</p>
          <div style={{ display: 'flex', gap: '24px' }}>
            <a href="/" style={{ fontSize: '14px', color: '#111', textDecoration: 'underline', fontStyle: 'italic', fontFamily: '"Playfair Display", serif' }}>Ver último resumen</a>
            <a href="/" style={{ fontSize: '14px', color: '#111', textDecoration: 'underline', fontStyle: 'italic', fontFamily: '"Playfair Display", serif' }}>Cambiar libro</a>
          </div>
        </div>
      </section>

      <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: '22px', fontWeight: '500', margin: '0 0 16px' }}>Tiempo de lectura</h2>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', border: '1px solid var(--line)', borderRadius: '2px', height: '64px', background: 'white', marginBottom: '32px' }}>
        <input 
          type="number" 
          value={duration} 
          onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value) || 1))} 
          style={{ width: '60px', textAlign: 'right', fontSize: '20px', border: 'none', outline: 'none', background: 'transparent', fontFamily: '"Inter", sans-serif' }}
        />
        <span style={{ fontSize: '16px', color: '#666' }}>min</span>
      </div>

      <button className="blackBtn big" onClick={startSession} style={{ borderRadius: '2px', minHeight: '64px', fontSize: '18px', letterSpacing: '0px', textTransform: 'none', fontFamily: '"Playfair Display", serif' }}>Empezar lectura</button>
      <Nav />
    </main>
  );
}
