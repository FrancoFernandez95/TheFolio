import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import { api } from '../services/api';
import BookCover from '../components/BookCover';
import { User as UserIcon } from 'lucide-react';

export default function UserProfile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFriend, setIsFriend] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [addingBook, setAddingBook] = useState(null);

  const addToLibrary = async (book) => {
    if (!book) return;
    setAddingBook(book._id);
    try {
      await api('/books', {
        method: 'POST',
        body: JSON.stringify({
          title: book.title,
          author: book.author,
          cover: book.cover,
          source: book.source,
          year: book.year,
          isbn: book.isbn,
          externalId: book.externalId
        })
      });
      alert('¡Libro agregado a tu biblioteca!');
    } catch (err) {
      alert('Error al agregar: ' + err.message);
    } finally {
      setAddingBook(null);
    }
  };

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await api(`/user/profile/${id}`);
        setProfile(data.user);
        setSessions(data.recentSessions || []);
        setIsFriend(data.isFriend || false);
      } catch {
        // ignored
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [id]);

  if (loading) return <main className="screen center">Cargando...</main>;
  if (!profile) return <main className="screen center">Usuario no encontrado</main>;

  function triggerRemoveConfirm() {
    setShowConfirm(true);
    setIsLeaving(false);
  }

  function handleConfirmChoice(confirmed) {
    setIsLeaving(true);
    setTimeout(async () => {
      setShowConfirm(false);
      setIsLeaving(false);
      if (confirmed) {
        setRemoving(true);
        try {
          await api('/user/friends/remove', {
            method: 'POST',
            body: JSON.stringify({ targetUserId: profile._id })
          });
          setIsFriend(false);
        } catch (err) {
          alert(err.message);
        }
        setRemoving(false);
      }
    }, 300);
  }

  return (
    <main className="screen" style={{ background: '#faf9f5' }}>
      <Header close />
      
      <div style={{ textAlign: 'center', marginTop: '40px', marginBottom: '40px' }}>
        <div style={{ width: '100px', height: '100px', borderRadius: '50%', overflow: 'hidden', margin: '0 auto 16px', background: '#e0dfdb', display: 'grid', placeItems: 'center', border: '3px solid white', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
          {profile.avatar ? <img src={profile.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <UserIcon size={48} color="#aaa" />}
        </div>
        <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: '28px', margin: '0 0 8px' }}>{profile.username}</h2>
        <div style={{ background: 'black', color: 'white', display: 'inline-block', padding: '4px 12px', borderRadius: '100px', fontSize: '12px', letterSpacing: '1px', fontWeight: 'bold' }}>
          {profile.points?.toLocaleString() || 0} PTS
        </div>
        {isFriend && (
          <div style={{ marginTop: '16px' }}>
            <button 
              onClick={triggerRemoveConfirm} 
              disabled={removing}
              style={{ background: 'transparent', border: '1px solid #d9534f', color: '#d9534f', padding: '6px 16px', borderRadius: '100px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              {removing ? 'Eliminando...' : 'Eliminar amigo'}
            </button>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '40px', padding: '0 5%' }}>
        <div style={{ background: 'white', border: '1px solid var(--line)', padding: '16px 8px', textAlign: 'center', borderRadius: '12px' }}>
          <div style={{ fontFamily: '"Playfair Display", serif', fontSize: '24px', color: 'var(--ink)' }}>{profile.streak || 0}</div>
          <div style={{ fontSize: '9px', textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '1px', marginTop: '4px' }}>Racha</div>
        </div>
        <div style={{ background: 'white', border: '1px solid var(--line)', padding: '16px 8px', textAlign: 'center', borderRadius: '12px' }}>
          <div style={{ fontFamily: '"Playfair Display", serif', fontSize: '24px', color: 'var(--ink)' }}>{profile.totalMinutes || 0}</div>
          <div style={{ fontSize: '9px', textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '1px', marginTop: '4px' }}>Minutos</div>
        </div>
        <div style={{ background: 'white', border: '1px solid var(--line)', padding: '16px 8px', textAlign: 'center', borderRadius: '12px' }}>
          <div style={{ fontFamily: '"Playfair Display", serif', fontSize: '24px', color: 'var(--ink)' }}>{profile.totalWords || 0}</div>
          <div style={{ fontSize: '9px', textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '1px', marginTop: '4px' }}>Palabras</div>
        </div>
      </div>

      {sessions.length > 0 && (
        <div style={{ padding: '0 5%', marginBottom: '40px' }}>
          <h3 style={{ fontFamily: '"Playfair Display", serif', fontSize: '20px', borderBottom: '1px solid var(--line)', paddingBottom: '12px', marginBottom: '20px' }}>Leyendo actualmente</h3>
          <div className="currentBookHero" style={{ background: 'white', borderRadius: '12px', border: '1px solid var(--line)', marginBottom: '16px' }}>
            <div className="bookCoverImgWrapper" style={{ alignSelf: 'center', margin: '0 auto', width: '100%' }}>
              <BookCover book={sessions[0].bookId} className="bookCoverImg" />
            </div>
            <div className="heroInfo" style={{ display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontFamily: '"Playfair Display", serif', fontSize: '22px', margin: '0 0 4px', color: 'var(--ink)' }}>{sessions[0].bookId?.title || 'Libro desconocido'}</h3>
              <p style={{ margin: '0 0 16px 0', color: 'var(--muted)', fontSize: '14px' }}>{sessions[0].bookId?.author}</p>
              
              {sessions[0].reflection && (
                <div className="heroQuote" style={{ fontSize: '14px', fontStyle: 'italic', background: '#faf9f5', padding: '16px', borderLeft: '3px solid #111', margin: '0 0 16px 0', color: '#444', lineHeight: '1.5' }}>
                  "{sessions[0].reflection}"
                </div>
              )}

              <div style={{ display: 'flex', gap: '16px', color: 'var(--muted)', fontSize: '11px', textTransform: 'uppercase', marginBottom: '24px', letterSpacing: '1px', fontWeight: '600' }}>
                 <span>{new Date(sessions[0].createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                 <span>•</span>
                 <span>{sessions[0].duration} MINUTOS</span>
              </div>
              
              <div className="heroActions" style={{ marginTop: 'auto' }}>
                <button 
                  className="blackBtn" 
                  onClick={() => addToLibrary(sessions[0].bookId)}
                  disabled={addingBook === sessions[0].bookId?._id}
                  style={{ border: 'none', cursor: addingBook === sessions[0].bookId?._id ? 'not-allowed' : 'pointer', width: '100%', padding: '12px' }}
                >
                  {addingBook === sessions[0].bookId?._id ? 'Agregando...' : 'Agregar a mi biblioteca'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {sessions.length > 1 && (
        <div style={{ padding: '0 5%', paddingBottom: '40px' }}>
          <h3 style={{ fontFamily: '"Playfair Display", serif', fontSize: '20px', borderBottom: '1px solid var(--line)', paddingBottom: '12px', marginBottom: '20px' }}>Últimas lecturas</h3>
          <div style={{ display: 'grid', gap: '16px' }}>
            {sessions.slice(1).map(s => (
              <div key={s._id} className="currentBookHero" style={{ background: 'white', borderRadius: '12px', border: '1px solid var(--line)' }}>
                <div className="bookCoverImgWrapper" style={{ alignSelf: 'center', margin: '0 auto', width: '100%' }}>
                  <BookCover book={s.bookId} className="bookCoverImg" />
                </div>
                <div className="heroInfo" style={{ display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontFamily: '"Playfair Display", serif', fontSize: '22px', margin: '0 0 4px', color: 'var(--ink)' }}>{s.bookId?.title || 'Libro desconocido'}</h3>
                  <p style={{ margin: '0 0 16px 0', color: 'var(--muted)', fontSize: '14px' }}>{s.bookId?.author}</p>
                  
                  {s.reflection && (
                    <div className="heroQuote" style={{ fontSize: '14px', fontStyle: 'italic', background: '#faf9f5', padding: '16px', borderLeft: '3px solid #111', margin: '0 0 16px 0', color: '#444', lineHeight: '1.5' }}>
                      "{s.reflection}"
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '16px', color: 'var(--muted)', fontSize: '11px', textTransform: 'uppercase', marginBottom: '24px', letterSpacing: '1px', fontWeight: '600' }}>
                     <span>{new Date(s.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                     <span>•</span>
                     <span>{s.duration} MINUTOS</span>
                  </div>
                  
                  <div className="heroActions" style={{ marginTop: 'auto' }}>
                    <button 
                      className="blackBtn" 
                      onClick={() => addToLibrary(s.bookId)}
                      disabled={addingBook === s.bookId?._id}
                      style={{ border: 'none', cursor: addingBook === s.bookId?._id ? 'not-allowed' : 'pointer', width: '100%', padding: '12px' }}
                    >
                      {addingBook === s.bookId?._id ? 'Agregando...' : 'Agregar a mi biblioteca'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {showConfirm && (
        <div className="confirmModalOverlay">
          <div className={`confirmModal ${isLeaving ? 'leaving' : ''}`}>
            <h3 style={{ fontFamily: '"Playfair Display", serif', fontSize: '20px', margin: '0 0 12px' }}>¿Eliminar amigo?</h3>
            <p style={{ margin: '0 0 24px', color: 'var(--muted)', fontSize: '14px', lineHeight: '1.4' }}>
              ¿Estás seguro de que quieres eliminar a <strong>{profile.username}</strong> de tus amigos?
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => handleConfirmChoice(false)} style={{ flex: 1, background: 'transparent', border: '1px solid var(--line)', color: 'var(--ink)', padding: '12px', borderRadius: '100px', fontWeight: 'bold', cursor: 'pointer' }}>No</button>
              <button onClick={() => handleConfirmChoice(true)} style={{ flex: 1, background: '#d9534f', border: 'none', color: 'white', padding: '12px', borderRadius: '100px', fontWeight: 'bold', cursor: 'pointer' }}>Sí, eliminar</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
