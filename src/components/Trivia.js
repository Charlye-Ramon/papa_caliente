import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/GameContext';
import styles from './Trivia.module.css';

const LETTERS = ['A', 'B', 'C', 'D'];

// Option state: null | 'pending' | 'correct' | 'incorrect' | 'revealed'
export default function Trivia() {
  const { state, dispatch } = useGame();
  const question = state.currentQuestion;

  const [chosen, setChosen] = useState(null);       // letter
  const [optionState, setOptionState] = useState({}); // { A: 'pending'|'correct'|'incorrect', ... }
  const [resolved, setResolved] = useState(false);

  if (!question) {
    return (
      <div className={styles.page}>
        <p style={{ color: 'var(--bark)', fontSize: '1.1rem' }}>No hay pregunta seleccionada.</p>
        <button className={styles.backBtn} onClick={() => dispatch({ type: 'SET_SCREEN', payload: 'hotpotato' })}>
          ← Volver
        </button>
      </div>
    );
  }

  function handleAnswer(letter) {
    if (chosen || resolved) return;
    setChosen(letter);
    setOptionState({ [letter]: 'pending' });

    // 2.5 s suspense
    setTimeout(() => {
      const isCorrect = letter === question.correct;
      const newState = {};
      if (isCorrect) {
        newState[letter] = 'correct';
      } else {
        newState[letter] = 'incorrect';
        newState[question.correct] = 'revealed';
      }
      setOptionState(newState);
      setResolved(true);
    }, 2500);
  }

  function handleNext() {
    dispatch({ type: 'MARK_USED', payload: question.id });
  }

  const isCorrect = resolved && optionState[chosen] === 'correct';

  return (
    <div className={styles.page}>
      <motion.div
        className={styles.card}
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className={styles.questionBox}>
          <span className={styles.questionIcon}>❓</span>
          <p className={styles.questionText}>{question.text}</p>
        </div>

        <div className={styles.optionsGrid}>
          {LETTERS.map(letter => {
            const st = optionState[letter];
            return (
              <motion.button
                key={letter}
                className={`${styles.option} ${st ? styles[`option_${st}`] : ''}`}
                onClick={() => handleAnswer(letter)}
                disabled={!!chosen}
                whileHover={!chosen ? { scale: 1.03 } : {}}
                whileTap={!chosen ? { scale: 0.97 } : {}}
                animate={
                  st === 'pending'
                    ? { scale: [1, 1.04, 1, 1.04, 1] }
                    : st === 'correct'
                    ? { scale: [1, 1.1, 0.95, 1.05, 1] }
                    : {}
                }
                transition={{ duration: st === 'pending' ? 0.5 : 0.4, repeat: st === 'pending' ? Infinity : 0 }}
              >
                <span className={styles.optionLetter}>{letter}</span>
                <span className={styles.optionText}>{question.options[letter]}</span>
                {st === 'correct' || st === 'revealed' ? <span className={styles.icon}>✓</span> : null}
                {st === 'incorrect' ? <span className={styles.icon}>✗</span> : null}
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence>
          {resolved && (
            <motion.div
              className={`${styles.result} ${isCorrect ? styles.resultCorrect : styles.resultIncorrect}`}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 18 }}
            >
              {isCorrect ? (
                <>
                  <span className={styles.resultEmoji}>🎉</span>
                  <div>
                    <p className={styles.resultTitle}>¡Correcto!</p>
                    <p className={styles.resultSub}>¡Excelente respuesta!</p>
                  </div>
                </>
              ) : (
                <>
                  <span className={styles.resultEmoji}>😬</span>
                  <div>
                    <p className={styles.resultTitle}>¡Incorrecto!</p>
                    <p className={styles.resultSub}>La correcta era <strong>{question.correct}</strong>: {question.options[question.correct]}</p>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {resolved && (
          <motion.button
            className={styles.nextBtn}
            onClick={handleNext}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
          >
            🥔 Siguiente ronda →
          </motion.button>
        )}
      </motion.div>
    </div>
  );
}