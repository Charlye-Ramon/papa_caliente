import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/GameContext';
import styles from './Setup.module.css';

const CORRECT_OPTIONS = ['A', 'B', 'C', 'D'];

function emptyQuestion() {
  return { id: Date.now() + Math.random(), text: '', options: { A: '', B: '', C: '', D: '' }, correct: 'A' };
}

export default function Setup() {
  const { dispatch } = useGame();
  const [questions, setQuestions] = useState(
    Array.from({ length: 10 }, () => emptyQuestion())
  );
  const [error, setError] = useState('');
  const [countInput, setCountInput] = useState('');

  // ── Atajo: genera N tarjetas de golpe ──────────────────────────────────────
  function applyCount() {
    const n = parseInt(countInput, 10);
    if (!n || n < 1 || n > 60) return;
    setQuestions(prev => {
      if (n > prev.length) {
        const extras = Array.from({ length: n - prev.length }, () => emptyQuestion());
        return [...prev, ...extras];
      }
      return prev.slice(0, n);
    });
    setCountInput('');
  }

  function handleCountKey(e) {
    if (e.key === 'Enter') applyCount();
  }

  // ── CRUD de preguntas ──────────────────────────────────────────────────────
  function updateQuestion(id, field, value) {
    setQuestions(qs => qs.map(q => q.id === id ? { ...q, [field]: value } : q));
  }

  function updateOption(id, letter, value) {
    setQuestions(qs =>
      qs.map(q => q.id === id ? { ...q, options: { ...q.options, [letter]: value } } : q)
    );
  }

  function addQuestion() {
    setQuestions(qs => [...qs, emptyQuestion()]);
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
          setError(`La pregunta "${q.text.slice(0, 30)}…" tiene opciones vacías.`);
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

      {/* ── ATAJO DE CANTIDAD ─────────────────────────────────────── */}
      <motion.div
        className={styles.quickCount}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <span className={styles.quickCountLabel}>¿Cuántas preguntas necesitas?</span>
        <div className={styles.quickCountRow}>
          <input
            className={styles.countInput}
            type="number"
            min="1"
            max="60"
            placeholder={questions.length}
            value={countInput}
            onChange={e => setCountInput(e.target.value)}
            onKeyDown={handleCountKey}
          />
          <motion.button
            className={styles.countBtn}
            onClick={applyCount}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Generar tarjetas
          </motion.button>
        </div>
        <p className={styles.quickCountHint}>
          Actualmente: <strong>{questions.length}</strong> tarjeta{questions.length !== 1 ? 's' : ''} · Escribe un número y presiona Enter o el botón
        </p>
      </motion.div>

      {/* ── LISTA DE PREGUNTAS ────────────────────────────────────── */}
      <div className={styles.list}>
        <AnimatePresence>
          {questions.map((q, idx) => (
            <motion.div
              key={q.id}
              className={styles.card}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.3, delay: Math.min(idx * 0.03, 0.3) }}
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
              <p className={styles.correctHint}>✓ Marca el radio de la opción correcta</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ── ACCIONES ─────────────────────────────────────────────── */}
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