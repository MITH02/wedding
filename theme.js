(() => {
  const root = document.documentElement;
  const preference = window.matchMedia('(prefers-color-scheme: dark)');
  const storageKey = 'wedding-theme';
  let selectedTheme;
  try {
    const saved = window.localStorage.getItem(storageKey);
    if (saved === 'light' || saved === 'dark') selectedTheme = saved;
  } catch { /* The theme still works when storage is disabled. */ }

  function applyTheme(theme) {
    root.dataset.theme = theme;
    const dark = theme === 'dark';
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', dark ? '#201b1e' : '#faf7f1');
    const button = document.getElementById('theme-toggle');
    if (button) {
      const label = `Switch to ${dark ? 'light' : 'dark'} mode`;
      button.setAttribute('aria-label', label);
      button.setAttribute('title', label);
      button.setAttribute('aria-pressed', String(dark));
      document.getElementById('theme-label').textContent = dark ? 'Light' : 'Dark';
    }
  }

  applyTheme(selectedTheme || (preference.matches ? 'dark' : 'light'));
  document.addEventListener('DOMContentLoaded', () => {
    applyTheme(root.dataset.theme);
    document.getElementById('theme-toggle').addEventListener('click', () => {
      selectedTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
      applyTheme(selectedTheme);
      try { window.localStorage.setItem(storageKey, selectedTheme); } catch { /* Keep the selection for this visit. */ }
    });
  });
  preference.addEventListener('change', event => {
    if (!selectedTheme) applyTheme(event.matches ? 'dark' : 'light');
  });
  window.addEventListener('storage', event => {
    if (event.key !== storageKey && event.key !== null) return;
    selectedTheme = event.newValue === 'light' || event.newValue === 'dark' ? event.newValue : undefined;
    applyTheme(selectedTheme || (preference.matches ? 'dark' : 'light'));
  });
})();
