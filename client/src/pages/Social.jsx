import { useEffect, useState } from 'react';
import Header from '../components/Header';
import Nav from '../components/Nav';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Search, UserPlus, Check, X, User as UserIcon } from 'lucide-react';

export default function Social() {
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [toastVisible, setToastVisible] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const [lbData, reqData] = await Promise.all([
        api('/user/leaderboard'),
        api('/user/requests')
      ]);
      setFriends(lbData.users || []);
      setRequests(reqData.requests || []);
    } catch {
      // ignored
    }
  }

  async function handleSearch(e) {
    const q = e.target.value;
    setSearchQuery(q);
    if (q.length > 2) {
      try {
        const data = await api(`/user/search?q=${q}`);
        setSearchResults(data.users || []);
      } catch {
        // ignored
      }
    } else {
      setSearchResults([]);
    }
  }

  async function sendRequest(targetUserId) {
    try {
      await api('/user/friends/request', { method: 'POST', body: JSON.stringify({ targetUserId }) });
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 3600);
      setSearchQuery('');
      setSearchResults([]);
    } catch (err) {
      alert(err.message || 'Error al enviar solicitud');
    }
  }

  async function acceptRequest(senderId) {
    try {
      await api('/user/friends/accept', { method: 'POST', body: JSON.stringify({ senderId }) });
      loadData();
    } catch (err) {
      alert(err.message);
    }
  }

  async function rejectRequest(senderId) {
    try {
      await api('/user/friends/reject', { method: 'POST', body: JSON.stringify({ senderId }) });
      loadData();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <main className="screen withNav" style={{ paddingTop: '20px' }}>
      <Header />
      
      <div className="searchBox" style={{ marginBottom: '20px', borderRadius: '8px' }}>
        <Search size={20} color="#888" style={{ marginRight: '10px' }} />
        <input placeholder="Buscar amigos por nombre..." value={searchQuery} onChange={handleSearch} />
      </div>

      {searchResults.length > 0 && (
        <div style={{ background: 'white', padding: '16px', border: '1px solid var(--line)', marginBottom: '30px', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 12px', fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Resultados de búsqueda</h4>
          {searchResults.map(u => (
            <div key={u._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden', background: '#eee', display: 'grid', placeItems: 'center' }}>
                  {u.avatar ? <img src={u.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <UserIcon size={16} color="#aaa" />}
                </div>
                <strong style={{ fontSize: '14px' }}>{u.username}</strong>
              </div>
              <button onClick={() => sendRequest(u._id)} style={{ border: 'none', background: 'var(--ink)', color: 'white', padding: '8px 14px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase', fontWeight: 'bold' }}>
                <UserPlus size={14} /> Agregar
              </button>
            </div>
          ))}
        </div>
      )}

      {requests.length > 0 && (
        <div style={{ background: '#f6f7f6', padding: '16px', border: '1px solid #dcebdc', marginBottom: '30px', borderRadius: '8px' }}>
          <h3 style={{ margin: '0 0 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            <span style={{ background: '#d34343', color: 'white', borderRadius: '50%', width: '18px', height: '18px', display: 'grid', placeItems: 'center', fontSize: '10px' }}>{requests.length}</span>
            Solicitudes pendientes
          </h3>
          {requests.map(req => (
            <div key={req._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden', background: '#e0dfdb', display: 'grid', placeItems: 'center' }}>
                  {req.avatar ? <img src={req.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <UserIcon size={20} color="#aaa" />}
                </div>
                <strong style={{ fontSize: '14px' }}>{req.username}</strong>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => acceptRequest(req._id)} style={{ background: 'black', color: 'white', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'grid', placeItems: 'center', cursor: 'pointer' }}><Check size={16} /></button>
                <button onClick={() => rejectRequest(req._id)} style={{ background: 'white', border: '1px solid #ccc', color: 'black', width: '32px', height: '32px', borderRadius: '50%', display: 'grid', placeItems: 'center', cursor: 'pointer' }}><X size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <h2 className="sectionTitle" style={{ marginBottom: '20px', fontSize: '24px' }}>Tus Amigos</h2>
      <section className="leaderboard">
        {friends.length <= 1 ? (
          <p style={{ color: 'var(--muted)', fontStyle: 'italic', textAlign: 'center', padding: '40px 0' }}>Aún no tienes amigos agregados. Busca usuarios para empezar a competir.</p>
        ) : (
          friends.map((u, i) => (
            <div className="rankRow" key={u._id} onClick={() => navigate(`/user/${u._id}`)} style={{ gridTemplateColumns: '30px 36px 1fr auto', gap: '12px', padding: '0 12px', cursor: 'pointer' }}>
              <span style={{ color: 'var(--muted)', fontStyle: 'italic', fontFamily: '"Playfair Display", serif', fontSize: '16px' }}>#{i + 1}</span>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden', background: '#e0dfdb', display: 'grid', placeItems: 'center' }}>
                {u.avatar ? <img src={u.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <UserIcon size={20} color="#aaa" />}
              </div>
              <strong style={{ fontSize: '14px' }}>{u.username} {u._id === user?._id && <span style={{ fontSize: '10px', color: 'gray', fontWeight: 'normal' }}>(Tú)</span>}</strong>
              <b style={{ fontSize: '12px' }}>{u.points?.toLocaleString() || 0} PTS</b>
            </div>
          ))
        )}
      </section>
      <Nav />

      {toastVisible && (
        <div className="successToast">
          <div className="iconWrap"><Check size={18} strokeWidth={3} /></div>
          <div className="typewriter">Solicitud enviada</div>
        </div>
      )}
    </main>
  );
}
