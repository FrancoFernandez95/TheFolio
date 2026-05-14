import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import { api } from '../services/api';
import BookCover from '../components/BookCover';
import ActiveReading from '../components/ActiveReading';

export default function ReadingPage() {
  const { bookId } = useParams();
  const [book, setBook] = useState(null);
  const [duration, setDuration] = useState(15);
  const [session, setSession] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api('/books').then(data => {
      const b = data.books.find(x => x._id === bookId);
      if (b) setBook(b);
    });
  }, [bookId]);



  async function startSession() {
    if (!book) return;
    const data = await api('/sessions', {
      method: 'POST',
      body: JSON.stringify({ bookId: book._id, duration })
    });
    setSession(data.session);
  }

  function handleFinish(minutesRead, askedWords) {
    if (session) {
      navigate(`/finalizar/${session._id}`, { state: { minutesRead, askedWords } });
    }
  }

  function handleCancel() {
    navigate('/');
  }

  if (!book) return <main className="screen center">Cargando...</main>;

  if (session) {
    return <ActiveReading book={book} session={session} duration={duration} onFinish={handleFinish} />;
  }

  return (
    <main className="screen">
      <Header />
      <section className="readHero">
        <h1>¿Qué vas a leer hoy?</h1>
        <p className="italic">Preparando tu sesión de lectura</p>
      </section>

      <div className="currentBookHero" style={{ marginBottom: '32px' }}>
        {book && <BookCover book={book} />}
        <div className="heroInfo">
          <small style={{ color: '#666', fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>LIBRO SELECCIONADO</small>
          <h3>{book.title}</h3>
          <p className="authorText">{book.author}</p>
        </div>
      </div>

      <h2 className="sectionTitle">Tiempo de lectura</h2>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', border: '1px solid var(--line)', borderRadius: '2px', height: '64px', background: 'white', maxWidth: '300px', margin: '0 auto 20px' }}>
        <input 
          type="number" 
          value={duration} 
          onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value) || 1))} 
          style={{ width: '60px', textAlign: 'right', fontSize: '20px', border: 'none', outline: 'none', background: 'transparent', fontFamily: '"Inter", sans-serif' }}
        />
        <span style={{ fontSize: '16px', color: '#666' }}>min</span>
      </div>

      <button className="blackBtn big" onClick={startSession} style={{ maxWidth: '300px', width: '100%', margin: '20px auto 0', display: 'block' }}>Iniciar sesión de lectura</button>
      <button className="outlineBtn" onClick={handleCancel} style={{ maxWidth: '300px', width: '100%', margin: '10px auto 20px', display: 'block' }}>Cancelar</button>
    </main>
  );
}
