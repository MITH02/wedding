const weddingTime = Date.parse('2026-12-10T12:30:00+05:30');
const timerFields = ['days', 'hours', 'minutes', 'seconds'].map(id => document.getElementById(id));
function updateCountdown(now = Date.now()) {
  const remaining = Math.max(0, Math.floor((weddingTime - now) / 1000));
  const values = [Math.floor(remaining / 86400), Math.floor(remaining / 3600) % 24, Math.floor(remaining / 60) % 60, remaining % 60];
  timerFields.forEach((field, index) => { field.textContent = String(values[index]).padStart(2, '0'); });
  if (now >= weddingTime) document.getElementById('countdown-message').textContent = 'Celebrating a beautiful beginning. With love, always.';
}
updateCountdown();
setInterval(updateCountdown, 1000);

if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
  document.documentElement.classList.add('js-motion');
}

let toastTimeout;
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove('visible'), 3500);
}
function showCopyField() {
  const field = document.getElementById('share-url');
  document.getElementById('share-fallback').hidden = false;
  field.value = window.location.href.split('#')[0];
  field.focus();
  field.select();
}
async function copyInvitation() {
  try {
    if (!navigator.clipboard) throw new Error('Clipboard unavailable');
    await navigator.clipboard.writeText(window.location.href.split('#')[0]);
    showToast('Invitation link copied. Share the love!');
  } catch { showCopyField(); showToast('Select and copy the invitation link below.'); }
}
document.getElementById('share-button').addEventListener('click', async () => {
  if (navigator.share) {
    try {
      await navigator.share({ title: 'Vaibhav & Apurva — You’re invited', text: 'Join us for the wedding celebrations of Vaibhav & Apurva on 9 & 10 December 2026 in Nagpur. We would love to celebrate with you!', url: window.location.href.split('#')[0] });
      return;
    } catch (error) { if (error.name === 'AbortError') return; }
  }
  await copyInvitation();
});
document.getElementById('copy-link').addEventListener('click', copyInvitation);
