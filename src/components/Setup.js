import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/GameContext';
import styles from './Setup.module.css';

const CORRECT_OPTIONS = ['A', 'B', 'C', 'D'];

function emptyQuestion(id) {
  return { id, text: '', options: { A: '', B: '', C: '', D: '' }, correct: 'A' };
}

export default function Setup() {
  const { dispatch } = useGame();
  const [questions, setQuestions] = useState(
    Array.from({ length: 10 }, (_, i) => emptyQuestion(i + 1))
  );
  const [error, setError] = useState('');

  function updateQuestion(id, field, value) {
    setQuestions(qs =>
      qs.map(q => q.id === id ? { ...q, [field]: value } : q)
    );
  }

  function updateOption(id, letter, value) {
    setQuestions(qs =>
      qs.map(q =>
        q.id === id ? { ...q, options: { ...q.options, [letter]: value } } : q
      )
    );
  }

  function addQuestion() {
    setQuestions(qs => [...qs, emptyQuestion(Date.now())]);
  }

  function removeQuestion(id) {
    if (questions.length <= 1) return;
    setQuestions(qs => qs.filter(q => q.id !== id));
  }

  function handleStart() {
    for (const q of questions) {
      if (!q.text.trim()) { setError('Todas las preguntas deben tener texto.'); return; }
      for (const letter of CORRECT_OPTIONS) {
        if (!q.options[letter].trim()) {
          setError(`La pregunta "${q.text.slice(0, 30)}..." tiene opciones vacías.`);
          return;
        }
      }
    }
    setError('');
    dispatch({ type: 'SET_QUESTIONS', payload: questions });
  }

  return (
    <div className={styles.page}>
      <motion.div
        className={styles.header}
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <span className={styles.potato}>🥔</span>
        <h1>Papa Caliente <span className={styles.accent}>Trivia</span></h1>
        <p className={styles.sub}>Configura las preguntas antes de empezar</p>
      </motion.div>

      <div className={styles.list}>
        <AnimatePresence>
          {questions.map((q, idx) => (
            <motion.div
              key={q.id}
              className={styles.card}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.3, delay: idx * 0.04 }}
              layout
            >
              <div className={styles.cardHeader}>
                <span className={styles.num}>#{idx + 1}</span>
                <button
                  className={styles.removeBtn}
                  onClick={() => removeQuestion(q.id)}
                  title="Eliminar pregunta"
                >✕</button>
              </div>

              <textarea
                className={styles.questionInput}
                placeholder="Escribe la pregunta aquí…"
                value={q.text}
                onChange={e => updateQuestion(q.id, 'text', e.target.value)}
                rows={2}
              />

              <div className={styles.optionsGrid}>
                {CORRECT_OPTIONS.map(letter => (
                  <div key={letter} className={styles.optionRow}>
                    <span className={`${styles.optionLabel} ${q.correct === letter ? styles.optionLabelActive : ''}`}>
                      {letter}
                    </span>
                    <input
                      className={styles.optionInput}
                      placeholder={`Opción ${letter}`}
                      value={q.options[letter]}
                      onChange={e => updateOption(q.id, letter, e.target.value)}
                    />
                    <input
                      type="radio"
                      name={`correct-${q.id}`}
                      checked={q.correct === letter}
                      onChange={() => updateQuestion(q.id, 'correct', letter)}
                      title="Respuesta correcta"
                      className={styles.radio}
                    />
                  </div>
                ))}
              </div>
              <p className={styles.correctHint}>
                ✓ Marca el radio de la opción correcta
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className={styles.actions}>
        <motion.button
          className={styles.addBtn}
          onClick={addQuestion}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
        >
          + Agregar pregunta
        </motion.button>

        {error && (
          <motion.p
            className={styles.error}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >{error}</motion.p>
        )}

        <motion.button
          className={styles.startBtn}
          onClick={handleStart}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
        >
          🥔 Guardar y Comenzar
        </motion.button>
      </div>
    </div>
  );
}