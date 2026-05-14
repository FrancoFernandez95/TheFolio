import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../components/Header';
import { api } from '../services/api';

export default function EndSession() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { minutesRead, askedWords } = location.state || { minutesRead: 1, askedWords: [] };

  const [reflection, setReflection] = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [stage, setStage] = useState('form'); // 'form' | 'animating' | 'done'

  
  const [breakdown, setBreakdown] = useState(null);

  const [animPhaseIndex, setAnimPhaseIndex] = useState(0);
  const [showIndicator, setShowIndicator] = useState(false);
  const [currentTotal, setCurrentTotal] = useState(0);
  const [currentLabel, setCurrentLabel] = useState('Puntos totales');

  async function calculatePoints() {
    setLoading(true);
    try {
      const data = await api(`/sessions/${sessionId}/finish`, {
        method: 'PATCH',
        body: JSON.stringify({ reflection, minutesRead, askedWords })
      });
      setBreakdown({ 
        pointsEarned: data.pointsEarned,
        streakEarned: data.streakEarned,
        newStreak: data.newStreak,
        previousStreak: data.previousStreak
      });
      setSaved(true);
      setStage('animating');
    } catch {
      // ignore
    }
    setLoading(false);
  }

  const phases = useMemo(() => {
    if (!breakdown) return [];
    const p = [
      {
        label: "Puntos totales",
        title: "Puntos ganados",
        value: `+${breakdown.pointsEarned}`,
        apply: () => {
          setCurrentLabel("Puntos totales");
          setCurrentTotal(breakdown.pointsEarned);
        }
      }
    ];
    if (breakdown.streakEarned > 0) {
      p.push({
        label: "Días de racha",
        title: "Racha extendida",
        value: `+${breakdown.streakEarned}`,
        apply: () => {
          setCurrentLabel("Días de racha");
          setCurrentTotal(breakdown.newStreak);
        }
      });
    }
    return p;
  }, [breakdown]);

  useEffect(() => {
    if (stage !== 'animating' || !breakdown) return;

    if (animPhaseIndex >= phases.length) {
      setTimeout(() => setStage('done'), 600);
      return;
    }

    const currentPhase = phases[animPhaseIndex];
    if (currentPhase.value === "x1" || currentPhase.value === "+0") {
      // Skip phase if no change
      setAnimPhaseIndex(prev => prev + 1);
      return;
    }

    // 1. Show indicator
    setShowIndicator(true);

    // 2. Hide indicator (slide up)
    const t1 = setTimeout(() => {
      setShowIndicator(false);
    }, 1000);

    // 3. Apply points when indicator hits the total
    const t2 = setTimeout(() => {
      currentPhase.apply();
    }, 1300);

    // 4. Move to next phase
    const t3 = setTimeout(() => {
      setAnimPhaseIndex(prev => prev + 1);
    }, 1600);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [animPhaseIndex, stage, breakdown, phases]);

  if (stage === 'form') {
    return (
      <main className="screen" style={{ background: '#fdfcf7', minHeight: '100vh', padding: '24px', boxSizing: 'border-box' }}>
        <Header close />
        <section style={{ marginTop: '40px', marginBottom: '32px' }}>
          <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: '40px', margin: 0, lineHeight: 1.1, fontWeight: 'bold', color: '#111' }}>Reflexión<br />final</h1>
          <div style={{ width: '40px', height: '4px', background: '#e0dfd5', marginTop: '16px' }} />
        </section>

        <p style={{ fontSize: '16px', color: '#555', marginBottom: '24px', lineHeight: 1.5 }}>
          Escribe una pequeña reflexión sobre lo que acabas de leer. Obtendrás un bono en tus puntos si superas los 30 caracteres.
        </p>

        <textarea 
          maxLength="200" 
          placeholder="Escribe tus reflexiones aquí..." 
          value={reflection} 
          onChange={(e) => setReflection(e.target.value)} 
          style={{ width: '100%', height: '180px', background: 'white', border: '1px solid var(--line)', borderRadius: '4px', padding: '20px', fontFamily: '"Playfair Display", serif', fontSize: '18px', resize: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', boxSizing: 'border-box' }}
        />
        
        <div style={{ textAlign: 'right', fontSize: '12px', color: '#999', marginTop: '8px' }}>
          {reflection.length}/200 caracteres
        </div>

        <button 
          className="blackBtn big" 
          disabled={loading} 
          onClick={calculatePoints}
          style={{ marginTop: '40px', width: '100%', borderRadius: '4px', height: '64px', fontSize: '18px', fontFamily: 'Inter, sans-serif' }}
        >
          {reflection.length > 0 ? "Calcular puntos" : "Saltar y calcular"}
        </button>
      </main>
    );
  }

  const currentPhase = phases[Math.min(animPhaseIndex, phases.length - 1)];

  return (
    <main className="screen" style={{ background: '#fdfcf7', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', boxSizing: 'border-box' }}>
      <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '2px', color: '#888', marginBottom: '40px', fontWeight: 600 }}>
        {currentLabel}
      </h2>

      <div style={{ position: 'relative', width: '100%', height: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div
          key={currentTotal}
          initial={{ scale: 1.2, opacity: 0, y: -10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          style={{ zIndex: 10 }}
        >
          <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: '120px', fontWeight: '300', margin: 0, color: '#111', lineHeight: 1 }}>
            {currentTotal}
          </h1>
        </motion.div>

        <AnimatePresence>
          {showIndicator && currentPhase && (
            <motion.div
              key={animPhaseIndex}
              initial={{ y: 60, opacity: 0, scale: 0.8 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -80, opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              style={{ position: 'absolute', bottom: '0', textAlign: 'center', width: '100%' }}
            >
              <span style={{ fontSize: '36px', fontWeight: '500', color: '#647363', display: 'block', marginBottom: '8px', fontFamily: '"Playfair Display", serif' }}>
                {currentPhase.value}
              </span>
              <span style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>
                {currentPhase.title}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {stage === 'done' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              style={{ position: 'absolute', bottom: '0', textAlign: 'center', width: '100%' }}
            >
              <span style={{ fontSize: '14px', color: '#444', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>
                Puntaje final
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {stage === 'done' && (
          <motion.button
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            onClick={() => navigate('/')}
            style={{ position: 'absolute', bottom: '40px', width: 'calc(100% - 48px)', maxWidth: '400px', background: '#111', color: 'white', border: 'none', borderRadius: '4px', padding: '20px', fontSize: '16px', fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
          >
            Aceptar
          </motion.button>
        )}
      </AnimatePresence>
    </main>
  );
}
