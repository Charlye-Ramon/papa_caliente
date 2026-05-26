/**
 * useAudio — instancia GLOBAL del audio, vive fuera de React.
 * Al estar fuera del árbol de componentes, nunca se destruye
 * aunque HotPotato se desmonte al cambiar de pantalla.
 *
 * play()  → reanuda exactamente donde se pausó
 * stop()  → pausa y conserva la posición
 * loop: true → al llegar al final retoma desde el inicio
 *
 * Coloca tu archivo en /public/music.mp3
 */

// Objeto Audio único para toda la sesión
let _audio = null;

function getAudio() {
  if (!_audio) {
    _audio = new Audio('/music.mp3');
    _audio.loop = true;
  }
  return _audio;
}

export function useAudio() {
  function play() {
    const audio = getAudio();
    audio.play().catch(() =>
      console.warn('[useAudio] No se pudo reproducir. ¿Existe /public/music.mp3?')
    );
  }

  function stop() {
    const audio = getAudio();
    audio.pause();
    // NO tocamos currentTime → la posición queda guardada para la próxima ronda
  }

  return { play, stop };
}