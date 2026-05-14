import { useEffect, useState } from 'react';
import Header from '../components/Header';
import QuoteCard from '../components/QuoteCard';
import BookCover from '../components/BookCover';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { User } from 'lucide-react';

export default function Points() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  useEffect(() => { api('/sessions').then(data => setSessions(data.sessions)); }, []);
  const last = sessions[0];

  return (
    <main className="screen pointsScreen">
      <Header />
      <h1>Puntos<br />conseguidos</h1>
      <div className="readerAvatar" style={{ position: 'relative', placeItems: 'center', overflow: 'hidden' }}>
        {user?.avatar ? (
          <img src={user.avatar} style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover' }} alt="Avatar" />
        ) : (
          <User size={48} color="#555" />
        )}
        <div style={{ position: 'absolute', bottom: '8px', right: '8px', background: '#222', borderRadius: '50%', padding: '4px', display: 'grid', placeItems: 'center' }}>
          <span style={{ color: '#d5ad22', fontSize: '14px', lineHeight: 1 }}>★</span>
        </div>
      </div>
      {last?.bookId && <section className="panel pointBook">
        <BookCover book={last.bookId} style={{ width: '80px', height: '106px', objectFit: 'cover' }} className="bookCoverImg" />
        <div><h2>{last.bookId.title}</h2><p>{last.bookId.author}</p></div>
      </section>}
      <div className="pointsAmount">+{last?.pointsEarned || 0}<span>PTS</span></div>
      <p className="italic centerText">Sesión de lectura completada</p>
      <QuoteCard />
      <a className="outlineBtn" href="/">Volver a biblioteca</a>
    </main>
  );
}
