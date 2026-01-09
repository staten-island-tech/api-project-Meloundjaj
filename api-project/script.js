const API_URL = "https://theofficeapi.dev/api/characters";
const QUOTE_API_URL = 'https://officeapi.akashrajpurohit.com/quotes/random' // replace with real endpoint
const quotesCache = {}

const fetchBtn = document.getElementById("fetch-btn");
const output = document.getElementById("api-response");
const loading = document.getElementById("loading");
const errorBox = document.getElementById("error");
const errorMsg = document.getElementById("error-msg");

const searchInput = document.getElementById('search-name');
const searchBtn = document.getElementById('search-btn');
const searchResult = document.getElementById('search-result');
const searchForm = document.getElementById('search-form');
let cachedItems = [];
const infoBox = document.getElementById('info');
const infoMsg = document.getElementById('info-msg');
const loadMoreBtn = document.getElementById('load-more-btn');

let currentPage = 1;
let pageSize = null;
let hasMore = true;
let isFetching = false;
const sentinel = document.getElementById('scroll-sentinel');
let observer = null;

// small built-in fallback in case the API is down
const BUILTIN_FALLBACK = [
  { name: 'Michael Scott', firstname: 'Michael', lastname: 'Scott' },
  { name: 'Jim Halpert', firstname: 'Jim', lastname: 'Halpert' },
  { name: 'Pam Beesly', firstname: 'Pam', lastname: 'Beesly' }
];

function setLoading(on) {
  if (!loading) return;
  if (on) {
    loading.classList.remove('hidden');
    if (fetchBtn) { fetchBtn.disabled = true; fetchBtn.classList.add('opacity-60', 'pointer-events-none'); }
    if (searchBtn) { searchBtn.disabled = true; searchBtn.classList.add('opacity-60', 'pointer-events-none'); }
  } else {
    loading.classList.add('hidden');
    if (fetchBtn) { fetchBtn.disabled = false; fetchBtn.classList.remove('opacity-60', 'pointer-events-none'); }
    if (searchBtn) { searchBtn.disabled = false; searchBtn.classList.remove('opacity-60', 'pointer-events-none'); }
  }
}

function showError(msg) {
  if (!errorBox) return;
  if (errorMsg) errorMsg.textContent = msg || 'Failed to load API data.';
  if (infoBox) infoBox.classList.add('hidden');
  errorBox.classList.remove('hidden');
}

function clearError() {
  if (!errorBox) return;
  errorBox.classList.add('hidden');
  if (infoBox) infoBox.classList.add('hidden');
}

function showInfo(msg) {
  if (!infoBox || !infoMsg) return;
  infoMsg.textContent = msg;
  infoBox.classList.remove('hidden');
  if (errorBox) errorBox.classList.add('hidden');
}

function renderItems(items, append = false) {
  if (!output) return;
  if (!append) output.innerHTML = '';
  if (!items || items.length === 0) {
    if (!append) output.innerHTML = '<p class="text-sm opacity-70">No characters found.</p>';
    return;
  }

  items.forEach(character => {
    const first = character.firstname ?? character.first ?? '';
    const last = character.lastname ?? character.last ?? '';
    const label = `${first} ${last}`.trim() || (character.name || 'Unknown');

    const card = document.createElement('div');
    card.className = 'p-2 bg-base-200 rounded flex items-center';

    const name = document.createElement('div');
    name.className = 'text-sm font-medium truncate';
    name.textContent = label;

    card.appendChild(name);
    output.appendChild(card);
  });
}

function showSkeleton(count = 8) {
  if (!output) return;
  output.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const sk = document.createElement('div');
    sk.className = 'animate-pulse p-3 bg-base-200 rounded';
    sk.innerHTML = '<div class="h-4 bg-base-300 rounded w-3/4 mb-2"></div><div class="h-3 bg-base-300 rounded w-1/2"></div>';
    output.appendChild(sk);
  }
}

async function fetchWithRetries(url, attempts = 3, init = {}) {
  let delay = 500;
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url, init);
      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status}${txt ? ' - ' + txt.slice(0,200) : ''}`);
      }
      return res;
    } catch (err) {
      if (i === attempts - 1) throw err;
      await new Promise(r => setTimeout(r, delay));
      delay *= 2;
    }
  }
}

async function loadCharacters(page = 1) {
  if (!output || !loading || !errorBox) {
    console.warn('Required DOM elements for fetch flow are missing');
    return;
  }

  if (isFetching) return;
  isFetching = true;

  clearError();
  setLoading(true);
  showSkeleton(12);

  try {
    const urlObj = new URL(API_URL);
    if (page && page > 1) urlObj.searchParams.set('page', String(page));
    const response = await fetchWithRetries(urlObj.toString(), 3);
    const data = await response.json();

    let items = [];
    if (Array.isArray(data)) items = data;
    else if (data && Array.isArray(data.data)) items = data.data;
    else if (data && Array.isArray(data.results)) items = data.results;

    // pagination state
    if (page === 1) {
      cachedItems = items.slice();
      pageSize = items.length || pageSize;
    } else {
      cachedItems = cachedItems.concat(items);
    }

    renderItems(items, page > 1);

    // update current page and determine if more pages likely exist
    currentPage = page;
    if (pageSize == null) pageSize = items.length;
    hasMore = items.length >= (pageSize || items.length);
    if (loadMoreBtn) {
      loadMoreBtn.classList.toggle('hidden', !hasMore);
      loadMoreBtn.disabled = !hasMore;
    }
  } catch (err) {
    console.error(err);
    // try a local fallback file first, then built-in fallback
    let recovered = false;
    try {
      const localResp = await fetch('/api-sample.json');
      if (localResp.ok) {
        const localData = await localResp.json();
        let items = Array.isArray(localData) ? localData : (localData.data || localData.results || []);
        cachedItems = items;
        renderItems(items);
        showInfo('Using local fallback data (api-sample.json).');
        hasMore = false;
        if (loadMoreBtn) loadMoreBtn.classList.add('hidden');
        recovered = true;
      }
    } catch (e) {
      // ignore local fetch errors
    }

    if (!recovered && BUILTIN_FALLBACK && BUILTIN_FALLBACK.length) {
      cachedItems = BUILTIN_FALLBACK;
      renderItems(BUILTIN_FALLBACK);
      showInfo('Using bundled fallback data.');
      hasMore = false;
      if (loadMoreBtn) loadMoreBtn.classList.add('hidden');
      recovered = true;
    }

    if (!recovered) {
      showError(`Unable to load characters: ${err.message}`);
      if (output) output.innerHTML = '';
    }
  } finally {
    setLoading(false);
    isFetching = false;
  }
}

function ensureObserver() {
  if (!sentinel || observer) return;
  observer = new IntersectionObserver((entries) => {
    const e = entries[0];
    if (!e) return;
    if (e.isIntersecting && hasMore && !isFetching) {
      loadCharacters(currentPage + 1);
    }
  }, { root: null, rootMargin: '400px', threshold: 0.01 });
  observer.observe(sentinel);
}

async function searchName() {
  if (!searchInput || !searchResult) {
    console.warn('Search elements missing');
    return;
  }

  const q = searchInput.value.trim();
  searchResult.textContent = '';
  if (!q) {
    searchResult.textContent = 'Please enter a name to search.';
    return;
  }

  setLoading(true);
  try {
    searchResult.textContent = 'Searching...';
    if (!cachedItems || cachedItems.length === 0) {
      await loadCharacters();
    }

    const term = q.toLowerCase();
    const matches = (cachedItems || []).filter(character => {
      const first = (character.firstname ?? character.first ?? '').toString();
      const last = (character.lastname ?? character.last ?? '').toString();
      const name = (character.name ?? '').toString();
      const label = `${first} ${last}`.trim() || name || '';
      return label.toLowerCase().includes(term) || name.toLowerCase().includes(term);
    });

    if (!matches.length) {
      searchResult.textContent = `No characters found for "${q}".`;
      if (output) output.innerHTML = '';
    } else {
      searchResult.textContent = `Found ${matches.length} match${matches.length > 1 ? 'es' : ''}.`;
      renderItems(matches);
    }
  } catch (err) {
    console.error(err);
    searchResult.textContent = 'Search failed.';
  } finally {
    setLoading(false);
  }
}

// Wire events
if (fetchBtn) {
  fetchBtn.addEventListener('click', () => { currentPage = 1; hasMore = true; loadCharacters(1); });
} else {
  console.warn('`fetch-btn` not found — fetch button listener not attached');
}

if (loadMoreBtn) {
  loadMoreBtn.addEventListener('click', () => {
    if (!hasMore) return;
    currentPage += 1;
    loadCharacters(currentPage);
  });
}

if (searchForm) {
  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    searchName();
  });
} else if (searchBtn) {
  searchBtn.addEventListener('click', (e) => { e.preventDefault(); searchName(); });
}

if (searchInput) {
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      searchName();
    }
  });
}

// Load initial data on page load and start observer
function start() {
  loadCharacters(1);
  ensureObserver();
}

window.addEventListener('DOMContentLoaded', start);
if (document.readyState === 'interactive' || document.readyState === 'complete') start();
