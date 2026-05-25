import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/GameContext';
import styles from './Roulette.module.css';

// ── Name Roulette ────────────────────────────────────────────────────────────
function NameRoulette({ onLoserPicked }) {
  const [namesInput, setNamesInput] = useState('');
  const [names, setNames] = useState([]);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const intervalRef = useRef(null);

  function handleAddNames() {
    const list = namesInput.split('\n').map(s => s.trim()).filter(Boolean);
    if (list.length < 2) return;
    setNames(list);
    setWinner(null);
  }

  function spin() {
    if (names.length < 2 || spinning) return;
    setSpinning(true);
    setWinner(null);
    let count = 0;
    const totalTicks = 30 + Math.floor(Math.random() * 20);
    let delay = 60;

    function tick() {
      setDisplayName(names[Math.floor(Math.random() * names.length)]);
      count++;
      if (count >= totalTicks) {
        const picked = names[Math.floor(Math.random() * names.length)];
        setDisplayName(picked);
        setWinner(picked);
        setSpinning(false);
        return;
      }
      // Ease out: slow down toward end
      if (count > totalTicks * 0.6) delay = Math.min(delay * 1.18, 400);
      intervalRef.current = setTimeout(tick, delay);
    }
    tick();
  }

  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>🎰 Ruleta de Nombres <span className={styles.badge}>Plan B</span></h3>

      {names.length === 0 ? (
        <div className={styles.namesSetup}>
          <textarea
            className={styles.textarea}
            placeholder={"Escribe un nombre por línea:\nAna\nBeto\nCarlos\n..."}
            value={namesInput}
            onChange={e => setNamesInput(e.target.value)}
            rows={5}
          />
          <motion.button
            className={styles.secondaryBtn}
            onClick={handleAddNames}
            whileTap={{ scale: 0.97 }}
          >Cargar nombres</motion.button>
        </div>
      ) : (
        <div className={styles.rouletteArea}>
          <div className={styles.namesList}>
            {names.map((n, i) => (
              <span key={i} className={`${styles.nameTag} ${winner === n ? styles.nameTagWinner : ''}`}>{n}</span>
            ))}
          </div>

          <motion.div
            className={styles.spinDisplay}
            animate={spinning ? { scale: [1, 1.04, 0.98, 1.04, 1], color: ['#4A2F1A', '#9B7A56', '#4A2F1A'] } : {}}
            transition={{ repeat: Infinity, duration: 0.3 }}
          >
            {displayName || '?'}
          </motion.div>

          <AnimatePresence>
            {winner && (
              <motion.div
                className={styles.winnerBanner}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 220, damping: 16 }}
              >
                🎯 ¡{winner}!
              </motion.div>
            )}
          </AnimatePresence>

          <div className={styles.btnRow}>
            <motion.button
              className={styles.spinBtn}
              onClick={spin}
              disabled={spinning}
              whileHover={!spinning ? { scale: 1.05 } : {}}
              whileTap={{ scale: 0.97 }}
            >{spinning ? 'Girando…' : '🎰 Girar'}</motion.button>

            {winner && (
              <motion.button
                className={styles.primaryBtn}
                onClick={() => onLoserPicked(winner)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
              >Seleccionar pregunta →</motion.button>
            )}
          </div>

          <button className={styles.resetLink} onClick={() => { setNames([]); setWinner(null); setDisplayName(''); }}>
            Cambiar lista
          </button>
        </div>
      )}
    </div>
  );
}

// ── Question Roulette ────────────────────────────────────────────────────────
function QuestionRoulette() {
  const { state, dispatch } = useGame();
  const [spinning, setSpinning] = useState(false);
  const [displayQ, setDisplayQ] = useState(null);
  const intervalRef = useRef(null);

  const remaining = state.questions.filter(q => !state.usedQuestions.includes(q.id));

  function spin() {
    if (remaining.length === 0 || spinning) return;
    setSpinning(true);
    let count = 0;
    const totalTicks = 25 + Math.floor(Math.random() * 15);
    let delay = 70;

    function tick() {
      const rnd = remaining[Math.floor(Math.random() * remaining.length)];
      setDisplayQ(rnd);
      count++;
      if (count >= totalTicks) {
        const picked = remaining[Math.floor(Math.random() * remaining.length)];
        setDisplayQ(picked);
        setSpinning(false);
        // Set in context and go to trivia
        dispatch({ type: 'PICK_QUESTION' });
        // Override with the one we visually picked
        setTimeout(() => {
          dispatch({ type: 'SET_SELECTED_QUESTION', payload: picked });
          dispatch({ type: 'SET_SCREEN', payload: 'trivia' });
        }, 700);
        return;
      }
      if (count > totalTicks * 0.6) delay = Math.min(delay * 1.2, 450);
      intervalRef.current = setTimeout(tick, delay);
    }
    tick();
  }

  if (remaining.length === 0) {
    return (
      <div className={styles.section}>
        <p className={styles.emptyMsg}>🎉 ¡Todas las preguntas han sido respondidas!</p>
      </div>
    );
  }

  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>🎯 Ruleta de Preguntas</h3>
      <p className={styles.remaining}>{remaining.length} pregunta{remaining.length !== 1 ? 's' : ''} disponible{remaining.length !== 1 ? 's' : ''}</p>

      <AnimatePresence mode="wait">
        {displayQ && (
          <motion.div
            key={displayQ.id}
            className={`${styles.qPreview} ${spinning ? styles.qPreviewSpin : ''}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.1 }}
          >
            {displayQ.text}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        className={styles.spinBtnLarge}
        onClick={spin}
        disabled={spinning}
        whileHover={!spinning ? { scale: 1.06 } : {}}
        whileTap={{ scale: 0.97 }}
      >
        {spinning ? 'Eligiendo…' : '🎯 Elegir Pregunta'}
      </motion.button>
    </div>
  );
}

// ── Main Roulette Screen ─────────────────────────────────────────────────────
export default function Roulette() {
  const { dispatch } = useGame();
  const [tab, setTab] = useState('question'); // 'names' | 'question'

  function handleLoserPicked(name) {
    dispatch({ type: 'SET_LOSER', payload: name });
    setTab('question');
  }

  return (
    <div className={styles.page}>
      <motion.div
        className={styles.header}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1>🎰 Ruletas</h1>
        <button className={styles.backBtn} onClick={() => dispatch({ type: 'SET_SCREEN', payload: 'hotpotato' })}>
          ← Volver a Papa Caliente
        </button>
      </motion.div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${tab === 'question' ? styles.tabActive : ''}`}
          onClick={() => setTab('question')}
        >Preguntas</button>
        <button
          className={`${styles.tab} ${tab === 'names' ? styles.tabActive : ''}`}
          onClick={() => setTab('names')}
        >Nombres</button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, x: tab === 'question' ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {tab === 'question' && <QuestionRoulette />}
          {tab === 'names' && <NameRoulette onLoserPicked={handleLoserPicked} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}