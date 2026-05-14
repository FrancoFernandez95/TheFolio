import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Nav from '../components/Nav';
import QuoteCard from '../components/QuoteCard';
import BookCover from '../components/BookCover';
import { api } from '../services/api';
import { Plus, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();
  const [lastSession, setLastSession] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [books, setBooks] = useState([]);
  
  useEffect(() => {
    async function loadData() {
      try {
        const [sessionsData, leaderData, booksData] = await Promise.all([
          api('/sessions'),
          api('/user/leaderboard'),
          api('/books')
        ]);
        if (sessionsData.sessions && sessionsData.sessions.length > 0) {
          setLastSession(sessionsData.sessions[0]);
        }
        if (leaderData.users) {
          setLeaderboard(leaderData.users);
        }
        if (booksData.books) {
          setBooks(booksData.books);
        }
      } catch {
        // error handled
      }
    }
    loadData();
  }, []);

  const currentBookId = lastSession?.bookId;
  const currentBook = books.find(b => b._id === currentBookId) || books[0];
  const reflection = currentBook?.lastSummary || "Aún no has escrito ningún resumen para este libro. ¡Continúa leyendo para agregar uno!";

  return (
    <main className="screen withNav" style={{ background: '#faf9f5' }}>
      <Header />

      <div className="homeDashboard">
        {/* LEFT COLUMN */}
        <div className="homeLeft">
          <div className="sectionHeader">
            <small>EN CURSO</small>
            <h2>Lectura Actual</h2>
          </div>
          
          {currentBook ? (
            <div className="currentBookHero">
              <BookCover book={currentBook} />
              <div className="heroInfo">
                <h3>{currentBook.title}</h3>
                <p className="authorText">{currentBook.author}</p>
                
                <div className="heroQuote">
                  "{reflection}"
                </div>
                
                <div className="heroActions">
                  <Link to={`/reading/${currentBook._id}`} className="blackBtn">Continuar lectura</Link>
                  <Link to="/" className="outlineBtn">Ver resumen</Link>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--muted)', background: '#f3f2eb', borderRadius: '4px', border: '1px solid var(--line)' }}>
              <BookOpen size={48} style={{ margin: '0 auto 16px', opacity: 0.3, display: 'block' }} />
              <h3 style={{ fontFamily: '"Playfair Display", serif', fontSize: '24px', margin: '0 0 10px', color: 'var(--ink)' }}>No tienes ningún libro</h3>
              <p style={{ margin: 0 }}>¡Agrega el primero para empezar a leer y sumar puntos!</p>
              <Link to="/" className="blackBtn" style={{ display: 'inline-flex', marginTop: '20px' }}>Ir a mi biblioteca</Link>
            </div>
          )}

          <div className="sectionHeader flexBetween" style={{ marginTop: '50px' }}>
            <h2>Biblioteca reciente</h2>
            <Link to="/" className="linkBtn">Ver todo</Link>
          </div>

          <div className="gridBooks">
             {books.slice(0, 3).map(book => (
                <article className="bookCard" key={book._id}>
                  <BookCover book={book} />
                  <h3>{book.title}</h3>
                  <p>{book.author}</p>
                </article>
             ))}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="homeRight">
          <div className="statBox">
            <div className="statHeader">
              <h3>Resumen Semanal</h3>
              <span className="starIcon">★</span>
            </div>
            
            <div className="statRow">
              <div className="statIcon num">{user?.streak || 0}</div>
              <div>
                <strong>RACHA</strong>
                <p>Días seguidos</p>
              </div>
            </div>
            <div className="statRow">
              <div className="statIcon">⏱️</div>
              <div>
                <strong>TIEMPO</strong>
                <p>{user?.totalMinutes || 0} minutos leídos</p>
              </div>
            </div>
            <div className="statRow">
              <div className="statIcon">📄</div>
              <div>
                <strong>PALABRAS</strong>
                <p>{user?.totalWords || 0} procesadas</p>
              </div>
            </div>
          </div>

          <div className="circleBox">
            <h3>Círculo de Lectura</h3>
            <div className="circleList">
               {leaderboard.slice(0,3).map((friend, idx) => (
                 <Link to={`/user/${friend._id}`} className="circleItem" key={friend._id} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: '1px solid var(--line)' }}>
                   <img src={friend.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop'} alt="avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                   <div className="circleInfo" style={{ flex: 1 }}>
                     <strong style={{ display: 'block', fontSize: '14px' }}>{friend.username}</strong>
                     <p style={{ margin: 0, fontSize: '12px', color: 'var(--muted)' }}>Leyendo: {friend.currentBookTitle}</p>
                   </div>
                   <div style={{ textAlign: 'right' }}>
                     <span className="rank" style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 'bold' }}>#{idx + 1}</span>
                     <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#111', marginTop: '4px' }}>{friend.points || 0} pts</div>
                   </div>
                 </Link>
               ))}
            </div>
          </div>

          <div className="quoteBox">
            <small>Cita del día</small>
            <QuoteCard style={{ margin: '16px 0 0', padding: '0', background: 'transparent', border: 'none', boxShadow: 'none' }} />
          </div>
        </div>
      </div>

      <Link to="/" className="fabBtn"><Plus size={24} color="white" /></Link>
      
      <Nav />
    </main>
  );
}
