import React, { createContext, useContext, useReducer } from 'react';

// ─── Initial State ────────────────────────────────────────────────────────────
const initialState = {
  screen: 'setup',           // 'setup' | 'hotpotato' | 'roulette' | 'trivia'
  questions: [],             // Array of { id, text, options:[A,B,C,D], correct:'A'|'B'|'C'|'D' }
  usedQuestions: [],         // IDs of already-answered questions
  currentQuestion: null,     // Question object being answered right now
  students: [],              // Names for the name roulette
  lastLoser: null,           // Name/label of whoever got burned
};

// ─── Reducer ──────────────────────────────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {
    case 'SET_QUESTIONS':
      return { ...state, questions: action.payload, screen: 'hotpotato' };

    case 'SET_SCREEN':
      return { ...state, screen: action.payload };

    case 'SET_STUDENTS':
      return { ...state, students: action.payload };

    case 'SET_LOSER':
      return { ...state, lastLoser: action.payload };

    case 'PICK_QUESTION': {
      const remaining = state.questions.filter(
        q => !state.usedQuestions.includes(q.id)
      );
      if (remaining.length === 0) return { ...state, currentQuestion: null, screen: 'finished' };
      const picked = remaining[Math.floor(Math.random() * remaining.length)];
      return { ...state, currentQuestion: picked };
    }

    // Used by Roulette to override the specific question visually chosen
    case 'SET_SELECTED_QUESTION':
      return { ...state, currentQuestion: action.payload };

    case 'MARK_USED':
      return {
        ...state,
        usedQuestions: [...state.usedQuestions, action.payload],
        screen: 'hotpotato',
        currentQuestion: null,
      };

    case 'RESET':
      return { ...initialState };

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────
const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  return useContext(GameContext);
}