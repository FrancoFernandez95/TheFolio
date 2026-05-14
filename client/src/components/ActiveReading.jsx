import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Square, Mic, Search } from 'lucide-react';
import { getSpanishDefinition } from '../services/dictionary';

const TypewriterText = ({ text, delay = 0, className = '', style = {} }) => {
  return (
    <motion.span
      key={text}
      className={className}
      style={style}
      initial="hidden"
      animate="visible"
      variants={{
        visible: { transition: { staggerChildren: 0.04, delayChildren: delay } },
        hidden: {},
      }}
    >
      {text.split('').map((char, index) => (
        <motion.span
          key={index}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1 },
          }}
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  );
};

export default function ActiveReading({ book, session, duration, onFinish }) {
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [isPaused, setIsPaused] = useState(false);
  const [isIdle, setIsIdle] = useState(false);
  const [stage, setStage] = useState('reading'); // 'reading' | 'ending' | 'summary'
  const [minutesRead, setMinutesRead] = useState(0);
  const [askedWords, setAskedWords] = useState([]);

  const timerRef = useRef(null);
  const idleTimerRef = useRef(null);
  const recognitionRef = useRef(null);
  const [dictMode, setDictMode] = useState('idle'); // 'idle' | 'input' | 'result'
  const [manualWord, setManualWord] = useState('');
  const [dictStatus, setDictStatus] = useState('idle');
  const [dictResult, setDictResult] = useState(null);

  const handleSearchWord = async (word) => {
    if (!word || !word.trim()) return;
    setDictMode('result');
    setDictStatus('searching');
    setDictResult(null);
    const def = await getSpanishDefinition(word);
    if (def) {
      setDictResult(def);
      setDictStatus('success');
      setAskedWords(prev => {
        if (!prev.find(w => w.word.toLowerCase() === def.word.toLowerCase())) {
          return [...prev, def];
        }
        return prev;
      });
    } else {
      setDictResult({ error: 'No encontramos una definición para esta palabra.' });
      setDictStatus('error');
    }
  };

  const startMic = useCallback(() => {
    setDictMode('input');
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setDictStatus('unsupported');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => { setDictStatus('listening'); setManualWord(''); };
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      const firstWord = transcript.trim().split(' ')[0];
      setManualWord(firstWord);
      handleSearchWord(firstWord);
    };

    recognition.onerror = (event) => {
      setDictResult({ error: event.error });
      setDictStatus('error');
    };

    recognition.onnomatch = () => {
      setDictResult({ error: 'No se reconoció ninguna palabra.' });
      setDictStatus('error');
    };

    recognition.onend = () => {
      setDictStatus((prev) => {
        // Si terminó y seguía escuchando, es que no hubo resultados ni errores
        if (prev === 'listening') {
          return 'idle';
        }
        return prev;
      });
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, []);

  const closeDictionary = () => {
    if (recognitionRef.current) recognitionRef.current.abort();
    setDictMode('idle');
    setDictStatus('idle');
    setManualWord('');
    setDictResult(null);
  };

  const handleStop = useCallback(() => {
    if (stage !== 'reading') return;
    setIsPaused(true);
    setStage('ending');
    
    const elapsedSeconds = (duration * 60) - timeLeft;
    const mins = Math.max(1, Math.round(elapsedSeconds / 60));
    setMinutesRead(mins);
  }, [stage, duration, timeLeft]);

  useEffect(() => {
    if (stage !== 'reading') return;

    if (!isPaused && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleStop();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timeLeft <= 0) {
      clearInterval(timerRef.current);
      handleStop();
    }
    return () => clearInterval(timerRef.current);
  }, [isPaused, timeLeft, stage, handleStop]);

  const resetIdleTimer = useCallback(() => {
    setIsIdle(false);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      setIsIdle(true);
    }, 10000);
  }, []);

  useEffect(() => {
    if (stage !== 'reading') {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      return;
    }
    resetIdleTimer();
    const events = ['mousemove', 'mousedown', 'touchstart', 'keydown'];
    const handler = () => resetIdleTimer();
    events.forEach(e => window.addEventListener(e, handler));
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      events.forEach(e => window.removeEventListener(e, handler));
    };
  }, [resetIdleTimer, stage]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const containerStyle = {
    background: stage === 'summary' ? '#fdfcf7' : (isIdle ? '#030303' : '#0a0a0a'),
    color: stage === 'summary' ? '#111' : 'white',
    position: 'fixed',
    top: 0, left: 0, width: '100%', height: '100%',
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    transition: 'background 1.5s ease-in-out, color 1.5s ease-in-out',
    padding: '40px 20px',
    boxSizing: 'border-box',
    overflowY: 'auto'
  };

  const contentOpacity = isIdle ? 0.25 : 1;
  const contentTransition = { duration: 1.5, ease: 'easeInOut' };

  const readingVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
    exit: { opacity: 0, transition: { staggerChildren: 0.1, staggerDirection: -1 } }
  };

  const childVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 1.2, ease: 'easeInOut' } },
    exit: { opacity: 0, y: 40, transition: { duration: 0.8, ease: 'easeInOut' } }
  };

  return (
    <div style={containerStyle}>
      <AnimatePresence mode="wait" onExitComplete={() => { if (stage === 'ending') setStage('summary'); }}>
        {stage === 'reading' && (
          <motion.div
            key="reading"
            variants={readingVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
          >
            <motion.div variants={childVariants} style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 10000, opacity: contentOpacity, transition: 'opacity 1.5s ease-in-out' }}>
              <button 
                onClick={() => setTimeLeft(prev => Math.max(0, prev - 60))}
                style={{ background: '#ff5722', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 10px rgba(255,87,34,0.4)' }}
              >
                TEST: +1 Min (Avanzar)
              </button>
            </motion.div>

            {dictMode === 'idle' && (
              <>
                <motion.div variants={childVariants} style={{ display: 'flex', justifyContent: 'center', position: 'relative', opacity: contentOpacity, transition: 'opacity 1.5s ease-in-out' }}>
                  <p style={{ fontFamily: '"Playfair Display", serif', fontStyle: 'italic', color: '#999', fontSize: '20px', margin: 0, textAlign: 'center', lineHeight: '1.4' }}>
                    <TypewriterText text={book?.title || 'Libro desconocido'} delay={0.5} />
                    <br/>
                    <span style={{ fontSize: '14px', color: '#666', fontStyle: 'normal', fontFamily: 'Inter, sans-serif' }}>
                      <TypewriterText text={book?.author || ''} delay={1.5} />
                    </span>
                  </p>
                </motion.div>

                <motion.div variants={childVariants} style={{ flex: 1, display: 'grid', placeItems: 'center', opacity: isIdle ? 0.5 : 1, transition: 'opacity 1.5s ease-in-out' }}>
                  <div style={{ textAlign: 'center' }}>
                    <h1 style={{ fontSize: 'max(12vw, 80px)', fontWeight: '200', margin: '0', letterSpacing: '-2px', color: '#fff', fontVariantNumeric: 'tabular-nums' }}>
                      {formatTime(timeLeft)}
                    </h1>
                    <p style={{ letterSpacing: '4px', color: '#666', fontSize: '12px', textTransform: 'uppercase', margin: '16px 0 0' }}>
                      <TypewriterText text={isPaused ? "Lectura pausada" : "Sesión en curso"} delay={2.5} />
                    </p>
                  </div>
                </motion.div>

                <motion.div variants={childVariants} style={{ display: 'flex', justifyContent: 'center', gap: '32px', alignItems: 'flex-end', paddingBottom: '40px', opacity: contentOpacity, transition: 'opacity 1.5s ease-in-out' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                    <motion.button animate={{ scale: isIdle ? 0.85 : 1, backgroundColor: isIdle ? '#050505' : '#1a1a1a' }} transition={contentTransition} onClick={startMic} style={{ border: '1px solid #333', borderRadius: '16px', width: '56px', height: '56px', color: 'white', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
                      <Mic size={20} />
                    </motion.button>
                    <span style={{ fontSize: '10px', letterSpacing: '1px', color: '#666', textTransform: 'uppercase', fontWeight: 600 }}>Consultar</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                    <motion.button animate={{ scale: isIdle ? 0.85 : 1, backgroundColor: isIdle ? '#222' : '#fff', color: isIdle ? '#888' : '#000', boxShadow: isIdle ? 'none' : '0 4px 20px rgba(255,255,255,0.15)' }} transition={contentTransition} onClick={() => setIsPaused(!isPaused)} style={{ border: 'none', borderRadius: '24px', width: '72px', height: '72px', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
                      {isPaused ? <Play size={32} /> : <Pause size={32} />}
                    </motion.button>
                    <span style={{ fontSize: '10px', letterSpacing: '1px', color: isIdle ? '#888' : '#fff', textTransform: 'uppercase', fontWeight: 600, transition: 'color 1.5s ease-in-out' }}>{isPaused ? 'Reanudar' : 'Pausar'}</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                    <motion.button animate={{ scale: isIdle ? 0.85 : 1, backgroundColor: isIdle ? '#050505' : '#1a1a1a' }} transition={contentTransition} onClick={handleStop} style={{ border: '1px solid #333', borderRadius: '16px', width: '56px', height: '56px', color: 'white', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
                      <Square size={20} />
                    </motion.button>
                    <span style={{ fontSize: '10px', letterSpacing: '1px', color: '#666', textTransform: 'uppercase', fontWeight: 600 }}>Terminar</span>
                  </div>
                </motion.div>
              </>
            )}

            {dictMode === 'input' && (
              <motion.div
                key="dict-input"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeDictionary}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)', zIndex: 100 }}
              >
                <div onClick={(e) => e.stopPropagation()} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                  <button 
                    onClick={startMic}
                    style={{ 
                      background: 'transparent', 
                      border: 'none', 
                      color: dictStatus === 'listening' ? '#ff5722' : 'white', 
                      cursor: 'pointer', 
                      marginBottom: '40px',
                      display: 'grid', placeItems: 'center',
                      transform: dictStatus === 'listening' ? 'scale(1.1)' : 'scale(1)',
                      transition: 'transform 0.3s ease, color 0.3s ease'
                    }}
                  >
                    <Mic size={64} />
                  </button>
                  
                  <form 
                    onSubmit={(e) => { e.preventDefault(); handleSearchWord(manualWord); }} 
                    style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #555', width: '100%', maxWidth: '300px' }}
                  >
                    <input 
                      type="text" 
                      value={manualWord} 
                      onChange={e => setManualWord(e.target.value)} 
                      placeholder={dictStatus === 'listening' ? 'Escuchando...' : 'Escribe aquí...'}
                      style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#555', fontSize: '24px', fontFamily: '"Inter", sans-serif', padding: '8px 0' }}
                      autoFocus
                    />
                    <button type="submit" style={{ background: 'transparent', border: 'none', color: '#555', cursor: 'pointer', padding: '8px' }}>
                      <Search size={24} />
                    </button>
                  </form>
                  {dictStatus === 'unsupported' && <p style={{ color: '#888', marginTop: '16px' }}>Voz no soportada. Escriba la palabra.</p>}
                  {dictStatus === 'error' && <p style={{ color: '#888', marginTop: '16px' }}>Error del micrófono: {dictResult?.error || 'desconocido'}</p>}
                </div>
              </motion.div>
            )}

            {dictMode === 'result' && (
              <motion.div
                key="dict-result"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeDictionary}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 20px', background: 'rgba(0,0,0,0.9)', zIndex: 100 }}
              >
                {dictStatus === 'searching' && <p style={{ color: '#888', fontSize: '20px' }}>Buscando...</p>}
                {dictStatus === 'error' && <p style={{ color: '#888', fontSize: '20px' }}>{dictResult?.error || 'No se entendió el audio.'}</p>}
                {dictStatus === 'success' && dictResult && (
                  <div>
                    {dictResult.word.toLowerCase() !== dictResult.originalWord.toLowerCase() && (
                      <span style={{ fontSize: '14px', color: '#ffb347', marginBottom: '8px', display: 'block', fontStyle: 'italic' }}>
                        Mostrando resultado para: {dictResult.word}
                      </span>
                    )}
                    <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: '48px', color: 'white', margin: '0 0 16px', textTransform: 'capitalize' }}>
                      {dictResult.word}
                    </h2>
                    <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '2px', color: '#666', fontWeight: 600, display: 'block', marginBottom: '16px' }}>
                      Definición
                    </span>
                    <p style={{ fontSize: '20px', lineHeight: 1.5, color: '#aaa', margin: 0, maxWidth: '500px' }}>
                      {dictResult.definition}
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        )}

        {stage === 'summary' && (
          <motion.div
            key="summary"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', maxWidth: '500px', margin: '0 auto', width: '100%' }}
          >
            <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: '32px', marginBottom: '32px', fontWeight: '500' }}>Sesión finalizada</h2>
            
            <div style={{ background: 'white', border: '1px solid var(--line)', borderRadius: '12px', padding: '24px', width: '100%', marginBottom: '24px', boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
              <h3 style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 8px', fontWeight: 700 }}>Minutos leídos</h3>
              <p style={{ fontSize: '48px', fontWeight: '300', margin: 0, fontFamily: '"Playfair Display", serif', lineHeight: 1 }}>{minutesRead}</p>
            </div>

            <div style={{ background: 'white', border: '1px solid var(--line)', borderRadius: '12px', padding: '24px', width: '100%', marginBottom: '40px', boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
              <h3 style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 16px', fontWeight: 700 }}>Consultadas en la lección</h3>
              {askedWords.length > 0 ? (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {askedWords.map((item, idx) => (
                    <li key={idx} style={{ marginBottom: idx === askedWords.length - 1 ? 0 : '16px' }}>
                      <strong style={{ display: 'block', fontSize: '16px', marginBottom: '4px', fontFamily: '"Playfair Display", serif', fontWeight: 600 }}>{item.word}</strong>
                      <span style={{ fontSize: '14px', color: '#555', lineHeight: '1.5', display: 'block' }}>{item.definition}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>No preguntaste palabras en esta sesión.</p>
              )}
            </div>

            <button onClick={() => onFinish(minutesRead, askedWords)} style={{ width: '100%', background: '#111', color: 'white', border: 'none', borderRadius: '4px', padding: '20px', fontSize: '16px', fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
              OK
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
