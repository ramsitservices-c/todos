// Random Joke Generator using icanhazdadjoke.com
// - Fetches jokes from https://icanhazdadjoke.com/ (CORS-enabled)
// - Copy, favorite, and auto-refresh support
// - Favorites persisted in localStorage under key: jokes.favorites.v1

const API_URL = 'https://icanhazdadjoke.com/';
const FAVORITES_KEY = 'jokes.favorites.v1';

const $ = (sel) => document.querySelector(sel);

let autoTimer = null;

async function fetchJoke() {
  setStatus('Loading...', false);
  try {
    const res = await fetch(API_URL, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data && data.joke) {
      showJoke(data.joke);
      setStatus('', false);
      return data.joke;
    }
    throw new Error('Invalid response');
  } catch (err) {
    console.error('Failed to fetch joke', err);
    setStatus('Failed to fetch joke. Try again.', true);
    showJoke('Sorry — could not fetch a joke.');
    return null;
  }
}

function showJoke(text) {
  const el = $('#joke');
  el.textContent = text || '—';
}

function setStatus(text, isError = false) {
  const s = $('#status');
  s.textContent = text;
  s.classList.toggle('error', !!isError);
}

function loadFavorites() {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to load favorites', e);
    return [];
  }
}

function saveFavorites(favs) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
}

function renderFavorites() {
  const list = $('#favorites-list');
  const favs = loadFavorites();
  list.innerHTML = '';
  if (favs.length === 0) {
    list.innerHTML = '<li class="empty">No favorites yet.</li>';
    return;
  }
  for (const joke of favs) {
    const li = document.createElement('li');
    li.className = 'fav-item';
    li.textContent = joke;
    const btn = document.createElement('button');
    btn.textContent = 'Remove';
    btn.className = 'remove';
    btn.addEventListener('click', () => {
      const updated = favs.filter((j) => j !== joke);
      saveFavorites(updated);
      renderFavorites();
    });
    li.appendChild(btn);
    list.appendChild(li);
  }
}

function copyCurrentJoke() {
  const text = $('#joke').textContent;
  if (!text || text === '—') return setStatus('Nothing to copy', true);
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => setStatus('Copied to clipboard'), (e) => setStatus('Copy failed', true));
  } else {
    setStatus('Clipboard not available', true);
  }
}

function favoriteCurrentJoke() {
  const joke = $('#joke').textContent;
  if (!joke || joke === '—') return setStatus('No joke to favorite', true);
  const favs = loadFavorites();
  if (!favs.includes(joke)) {
    favs.unshift(joke);
    saveFavorites(favs);
    renderFavorites();
    setStatus('Added to favorites');
  } else {
    setStatus('Already in favorites', true);
  }
}

function startAutoRefresh(seconds) {
  stopAutoRefresh();
  if (!seconds || seconds <= 0) return;
  autoTimer = setInterval(() => fetchJoke(), seconds * 1000);
  $('#toggle-auto').textContent = 'Stop';
  setStatus(`Auto-refresh every ${seconds}s`);
}

function stopAutoRefresh() {
  if (autoTimer) {
    clearInterval(autoTimer);
    autoTimer = null;
  }
  $('#toggle-auto').textContent = 'Start';
}

function setup() {
  $('#new-joke').addEventListener('click', () => fetchJoke());
  $('#copy-joke').addEventListener('click', () => copyCurrentJoke());
  $('#fav-joke').addEventListener('click', () => favoriteCurrentJoke());

  $('#toggle-auto').addEventListener('click', () => {
    const secs = Number($('#interval').value || 0);
    if (autoTimer) {
      stopAutoRefresh();
      setStatus('Auto-refresh stopped');
    } else if (secs > 0) {
      startAutoRefresh(secs);
    } else {
      setStatus('Set a positive interval to start', true);
    }
  });

  renderFavorites();
  fetchJoke();
}

window.addEventListener('DOMContentLoaded', setup);