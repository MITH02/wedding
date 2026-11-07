(() => {
  const audio = document.getElementById('wedding-music');
  const button = document.getElementById('music-toggle');
  const label = document.getElementById('music-label');
  let enabled = true;
  let pending = false;
  let unavailable = false;
  audio.volume = 0.35;

  function render() {
    const playing = !audio.paused && !unavailable;
    const text = unavailable ? 'Music unavailable' : playing ? 'Mute music' : 'Play music';
    label.textContent = text;
    button.dataset.playing = String(playing);
    button.setAttribute('aria-pressed', String(playing));
    button.setAttribute('aria-label', unavailable ? text : playing ? 'Mute background music' : 'Play background music');
    button.setAttribute('title', unavailable ? text : playing ? 'Mute background music' : 'Play background music');
    button.disabled = unavailable;
  }

  async function startMusic() {
    if (!enabled || pending || unavailable || !audio.paused) return;
    pending = true;
    try {
      await audio.play();
      // Honour a mute chosen while an earlier play request was still pending.
      if (!enabled) audio.pause();
    } catch {
      // Audible autoplay may require a guest's first interaction.
    } finally {
      pending = false;
      render();
    }
  }

  button.addEventListener('click', () => {
    if (!audio.paused || pending) {
      enabled = false;
      audio.pause();
      render();
    } else {
      enabled = true;
      startMusic();
    }
  });
  function onInteraction(event) {
    if (event.target?.closest?.('#music-toggle')) return;
    if (event.type === 'keydown' && (event.ctrlKey || event.metaKey || event.altKey)) return;
    startMusic();
  }
  document.addEventListener('pointerdown', onInteraction);
  document.addEventListener('keydown', onInteraction);
  audio.addEventListener('play', render);
  audio.addEventListener('pause', render);
  audio.addEventListener('error', () => {
    unavailable = true;
    enabled = false;
    render();
  });
  render();
  startMusic();
})();
