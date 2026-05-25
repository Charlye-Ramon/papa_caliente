import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { GameProvider, useGame } from './context/GameContext';
import Setup from './components/Setup';
import HotPotato from './components/HotPotato';
import Roulette from './components/Roulette';
import Trivia from './components/Trivia';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -12, transition: { duration: 0.3, ease: 'easeIn' } },
};

function Router() {
  const { state } = useGame();

  const screens = {
    setup:      <Setup />,
    hotpotato:  <HotPotato />,
    roulette:   <Roulette />,
    trivia:     <Trivia />,
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={state.screen}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{ minHeight: '100vh' }}
      >
        {screens[state.screen] ?? <Setup />}
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <GameProvider>
      <Router />
    </GameProvider>
  );
}