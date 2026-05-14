import { BookOpen, Settings, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Header({ close = false }) {
  const { user, logout } = useAuth();
  return (
    <header className="topbar">
      <Link to="/home" className="brand">
        {close ? <X size={22} /> : <BookOpen size={24} />}
        <span>The Folio</span>
      </Link>
      {user ? (
        <Link className="iconBtn" to="/profile" title="Mi Perfil">
          {user.avatar ? <img src={user.avatar} alt="avatar" /> : <Settings size={22} />}
        </Link>
      ) : null}
    </header>
  );
}
