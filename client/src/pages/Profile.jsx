import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { api, fileToBase64 } from '../services/api';
import { Camera, LogOut } from 'lucide-react';

export default function Profile() {
  const { user, setUser, logout } = useAuth();
  const [form, setForm] = useState({ username: user?.username || '', avatar: user?.avatar || '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSave(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api('/user/profile', {
        method: 'PUT',
        body: JSON.stringify(form)
      });
      setUser({ ...user, ...data.user });
      navigate(-1);
    } catch (err) {
      alert(err.message);
    }
    setLoading(false);
  }

  async function handleFile(e) {
    const file = e.target.files[0];
    if (file) {
      const base64 = await fileToBase64(file);
      setForm({ ...form, avatar: base64 });
    }
  }

  return (
    <main className="screen">
      <Header close />
      <section className="sectionIntro" style={{ textAlign: 'center', marginTop: '20px' }}>
        <h2 style={{ fontSize: '32px' }}>Mi Perfil</h2>
        <p className="italic">Configura tu cuenta</p>
      </section>

      <form className="panel form" onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
        <div style={{ position: 'relative', cursor: 'pointer' }}>
          <label style={{ cursor: 'pointer' }}>
            <input type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
            <div style={{ width: '120px', height: '120px', borderRadius: '50%', backgroundColor: '#222', overflow: 'hidden', display: 'grid', placeItems: 'center' }}>
              {form.avatar ? <img src={form.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Camera color="#fff" size={32} />}
            </div>
            <div style={{ position: 'absolute', bottom: '0', right: '0', background: '#dcebdc', padding: '8px', borderRadius: '50%' }}>
              <Camera size={16} color="#000" />
            </div>
          </label>
        </div>

        <div style={{ width: '100%', marginTop: '20px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', color: '#66716a', letterSpacing: '1px' }}>NOMBRE DE USUARIO</label>
          <input 
            value={form.username} 
            onChange={e => setForm({ ...form, username: e.target.value })} 
            placeholder="Tu nombre"
            style={{ width: '100%', padding: '12px 0', borderBottom: '1px solid var(--line)', background: 'transparent' }}
          />
        </div>

        <button className="blackBtn" disabled={loading} style={{ width: '100%', marginTop: '10px' }}>
          {loading ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>

      <button className="outlineBtn" onClick={() => { logout(); navigate('/login'); }} style={{ color: '#9b1c1c', borderColor: '#9b1c1c', marginTop: '40px' }}>
        <LogOut size={18} /> Cerrar sesión
      </button>
    </main>
  );
}
