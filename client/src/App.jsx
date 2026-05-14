import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Biblioteca from './pages/Biblioteca';
import Leer from './pages/Leer';
import ReadingPage from './pages/ReadingPage';
import EndSession from './pages/EndSession';
import Points from './pages/Points';
import Social from './pages/Social';
import Profile from './pages/Profile';
import Home from './pages/Home';
import UserProfile from './pages/UserProfile';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <main className="screen center">Cargando...</main>;
  return user ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<PrivateRoute><Biblioteca /></PrivateRoute>} />
      <Route path="/leer" element={<PrivateRoute><Leer /></PrivateRoute>} />
      <Route path="/reading/:bookId" element={<PrivateRoute><ReadingPage /></PrivateRoute>} />
      <Route path="/finalizar/:sessionId" element={<PrivateRoute><EndSession /></PrivateRoute>} />
      <Route path="/puntos/:sessionId" element={<PrivateRoute><Points /></PrivateRoute>} />
      <Route path="/social" element={<PrivateRoute><Social /></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
      <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
      <Route path="/user/:id" element={<PrivateRoute><UserProfile /></PrivateRoute>} />
    </Routes>
  );
}
