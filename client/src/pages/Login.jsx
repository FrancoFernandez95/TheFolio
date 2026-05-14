import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';

export default function Login() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const { login, register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      if (mode === 'register') await register(form);
      else await login({ email: form.email, password: form.password });
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="screen">
      <Header />
      <section className="heroLogin">
        <p>Biblioteca</p>
        <h1>Entrá a tu folio de lectura</h1>
        <p className="italic">Tus lecturas, resúmenes y progreso.</p>
      </section>
      <form className="panel form" onSubmit={handleSubmit}>
        {mode === 'register' && <input placeholder="Nombre" onChange={(e) => setForm({ ...form, username: e.target.value })} />}
        <input placeholder="Email" type="email" onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input placeholder="Contraseña" type="password" onChange={(e) => setForm({ ...form, password: e.target.value })} />
        {error && <small className="error">{error}</small>}
        <button className="blackBtn">{mode === 'register' ? 'Crear cuenta' : 'Ingresar'}</button>
        <button type="button" className="linkBtn" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
          {mode === 'login' ? 'Crear cuenta nueva' : 'Ya tengo cuenta'}
        </button>
      </form>
    </main>
  );
}
