// Simple fetch helper (returns parsed JSON or throws)
async function getData(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("Fetch error:", err);
    throw err;
  }
}

// Endpoints to try (order matters)
const QUOTE_ENDPOINT_CANDIDATES = [
  "https://officeapi.akashrajpurohit.com/quote/random",
];

const LOCAL_FALLBACK_QUOTES = [
  { quote: "Bears. Beets. Battlestar Galactica.", character: "Jim" },
  { quote: "I am Beyoncé, always.", character: "Michael" },
  { quote: "I declare bankruptcy!", character: "Michael" },
];

// Try multiple endpoints, return the first successful parsed JSON
async function tryFetchAny(urls) {
  for (const url of urls) {
    try {
      const cacheBustedUrl = url + (url.includes("?") ? "&" : "?") + "_=" + Date.now();
      const res = await fetch(cacheBustedUrl, { cache: "no-store", headers: { "Cache-Control": "no-cache" } });
      if (!res.ok) {
        console.warn(`Quotes fetch ${url} responded ${res.status}`);
        continue;
      }
      const data = await res.json();
      return { url, data };
    } catch (err) {
      console.warn(`Quotes fetch ${url} failed:`, err);
    }
  }
  return null;
}

async function getRandomQuote() {
  const imgElement = document.getElementById("quote-svg");
  const textEl = document.getElementById("quote-text");

  try {
    const result = await tryFetchAny(QUOTE_ENDPOINT_CANDIDATES);

    let quotes = null;
    if (result) {
      const data = result.data;
      quotes = data.results || data;
      if (!Array.isArray(quotes) && typeof quotes === "object") {
        quotes = [quotes];
      }
    }

    if (!Array.isArray(quotes) || quotes.length === 0) {
      console.info("Using local fallback quotes");
      quotes = LOCAL_FALLBACK_QUOTES;
    }

    const q = quotes[Math.floor(Math.random() * quotes.length)];
    const id = q.id || q._id || q._key;

    if (id && imgElement) {
      const svgUrl = `https://officeapi.akashrajpurohit.com/quote/${id}?responseType=svg&mode=light&width=400`;
      imgElement.src = svgUrl + `&_=${Date.now()}`;
      imgElement.alt = q.content || q.quote || "Quote";
      if (textEl) textEl.textContent = "";
    } else {
      if (imgElement) imgElement.src = "";
      if (textEl) textEl.textContent = q.content || q.quote || q.quoteText || JSON.stringify(q);
    }
  } catch (err) {
    console.error("Random quote error:", err);
    if (textEl) textEl.textContent = "Failed to fetch quote (see console)";
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("random-quote-btn");
  if (btn) btn.addEventListener("click", getRandomQuote);
});

// Ensure the DOM is fully loaded before running the initial fetch
// (removed leftover character fetch call) - project now uses getRandomQuote()