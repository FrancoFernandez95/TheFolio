import { BookOpen, PencilLine, Users } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export default function Nav() {
  return (
    <nav className="bottomNav">
      <NavLink to="/"><BookOpen size={22} /><span>Biblioteca</span></NavLink>
      <NavLink to="/leer" className="main"><PencilLine size={28} /><span>Leer</span></NavLink>
      <NavLink to="/social"><Users size={22} /><span>Social</span></NavLink>
    </nav>
  );
}
