import { useRef, useCallback } from 'react';

/**
 * useAudio — hook para manejar la música de fondo de la Papa Caliente.
 *
 * Para agregar tu archivo MP3:
 *   1. Copia tu archivo a /public/music.mp3
 *   2. El hook lo cargará automáticamente desde esa ruta.
 *
 * Si no hay archivo, las llamadas a play/stop son silenciosas (no hay error).
 */
export function useAudio(src = '/music.mp3') {
  const audioRef = useRef(null);

  const play = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(src);
      audioRef.current.loop = true;
    }
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {
      // El navegador puede bloquear audio sin interacción del usuario.
      // El primer clic en "Iniciar Papa Caliente" cuenta como interacción,
      // así que normalmente esto funcionará bien.
      console.warn('[useAudio] No se pudo reproducir el audio. Asegúrate de que /public/music.mp3 existe.');
    });
  }, [src]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  return { play, stop };
}