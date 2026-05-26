import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { useAudio } from '../hooks/useAudio';
import styles from './HotPotato.module.css';

const MIN_MS = 10000;  // 10 segundos mínimo
const MAX_MS = 30000;  // 30 segundos máximo

function randomMs() {
  return Math.floor(Math.random() * (MAX_MS - MIN_MS + 1)) + MIN_MS;
}

export default function HotPotato() {
  const { state, dispatch } = useGame();
  const { play, stop } = useAudio();

  const [phase, setPhase] = useState('idle'); // 'idle' | 'playing' | 'burned'
  const timerRef = useRef(null);

  const remaining = state.questions.filter(q => !state.usedQuestions.includes(q.id));
  const allDone = remaining.length === 0;

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  function handleStart() {
    setPhase('playing');
    play();
    timerRef.current = setTimeout(() => {
      stop();
      setPhase('burned');
    }, randomMs());
  }

  function handleContinue() {
    setPhase('idle');
    dispatch({ type: 'SET_SCREEN', payload: 'roulette' });
  }

  function handleRoulette() {
    dispatch({ type: 'SET_SCREEN', payload: 'roulette' });
  }

  if (allDone) {
    return (
      <div className={styles.page}>
        <motion.div
          className={styles.finishBox}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 18 }}
        >
          <span style={{ fontSize: '4rem' }}>🎉</span>
          <h2>¡Se acabaron las preguntas!</h2>
          <p>Han respondido todas las preguntas del set.</p>
          <motion.button
            className={styles.primaryBtn}
            onClick={() => dispatch({ type: 'RESET' })}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
          >Reiniciar Juego</motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={styles.page}>

      {/* ── Barra de progreso ── */}
      <div className={styles.progressBar}>
        <div
          className={styles.progressFill}
          style={{
            width: `${((state.questions.length - remaining.length) / state.questions.length) * 100}%`
          }}
        />
      </div>
      <p className={styles.progressLabel}>
        {state.questions.length - remaining.length} / {state.questions.length} preguntas respondidas
      </p>

      <motion.div
        className={styles.header}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1>🥔 Papa <span className={styles.accent}>Caliente</span></h1>
      </motion.div>

      <AnimatePresence mode="wait">

        {/* ── IDLE ── */}
        {phase === 'idle' && (
          <motion.div
            key="idle"
            className={styles.center}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4 }}
          >
            <motion.div
              className={styles.bigPotato}
              animate={{ rotate: [-2, 2, -2], y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
            >🥔</motion.div>

            <motion.button
              className={styles.startBtn}
              onClick={handleStart}
              whileHover={{ scale: 1.06, boxShadow: '0 16px 40px rgba(74,47,26,0.28)' }}
              whileTap={{ scale: 0.96 }}
            >
              Iniciar Papa Caliente
            </motion.button>

            <button className={styles.altBtn} onClick={handleRoulette}>
              Usar ruleta de nombres →
            </button>
          </motion.div>
        )}

        {/* ── PLAYING ── */}
        {phase === 'playing' && (
          <motion.div
            key="playing"
            className={styles.center}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={styles.bigPotato}
              animate={{
                rotate: [0, -8, 8, -6, 6, -4, 4, 0],
                scale: [1, 1.08, 0.96, 1.06, 0.97, 1.04, 0.98, 1],
              }}
              transition={{ repeat: Infinity, duration: 0.6, ease: 'easeInOut' }}
            >🥔</motion.div>

            <motion.p
              className={styles.playingText}
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
            >
              ¡Pásala rápido!
            </motion.p>

            <div className={styles.flames}>🔥🔥🔥</div>
          </motion.div>
        )}

        {/* ── BURNED ── */}
        {phase === 'burned' && (
          <motion.div
            key="burned"
            className={styles.burnedWrapper}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className={styles.burnedEmoji}
              animate={{ rotate: [-10, 10, -10], scale: [1, 1.15, 0.95, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 0.5 }}
            >💥</motion.div>

            <motion.h2
              className={styles.burnedTitle}
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.1 }}
            >
              ¡Se quemó la papa!
            </motion.h2>

            <motion.p
              className={styles.burnedSub}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Quien tenga la papa responde una pregunta de trivia
            </motion.p>

            <motion.button
              className={styles.primaryBtn}
              onClick={handleContinue}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
            >
              🎯 Girar ruleta de preguntas
            </motion.button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}