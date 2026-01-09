**Quick Summary**
- **Purpose:** Short, actionable guidance for AI coding agents working on this frontend Vite project.
- **Stack:** Vite (dev server), TailwindCSS, DaisyUI; plain ES modules and small vanilla JS components.

**Where to Start**
- **Run locally:** open a shell in `api-project` and run `npm install` then `npm run dev`.
- **Build/Preview:** `npm run build` and `npm run preview` from `api-project`.

**Big Picture / Architecture**
- **Single-page static app:** UI and interaction live in `api-project/index.html` and `api-project/script.js`.
- **Two parallel entry patterns exist:** a simple top-level entry (`api-project/script.js`) drives the API demo, while the Vite template has a `src/` entry (`api-project/src/main.js`) with `counter.js`. Prefer modifying the entry that the task targets (check `index.html` to see which is active).
- **Styling:** Tailwind + DaisyUI are declared in `api-project/package.json` — styles are consumed from local CSS files; note there are small path inconsistencies (see "Gotchas").

**Important Files**
- **HTML + DOM wiring:** [api-project/index.html](api-project/index.html) — contains the UI card and DOM ids (`fetch-btn`, `api-response`, `loading`, `error`).
- **API logic:** [api-project/script.js](api-project/script.js) — fetches `https://theofficeapi.dev/api/characters` and renders badges.
- **Vite entry & example:** [api-project/src/main.js](api-project/src/main.js) and [api-project/src/counter.js](api-project/src/counter.js) — the Vite template; only used if `index.html` references `src/` entry.
- **Build config:** [api-project/vite.config.js](api-project/vite.config.js) — currently malformed and should be checked before debugging dev failures.
- **Package manifest:** [api-project/package.json](api-project/package.json) — lists `devDependencies` and scripts.

**Project-specific Patterns & Conventions**
- **Vanilla DOM-first approach:** UI interaction is implemented by querying elements by id and adding listeners (see `fetch-btn` in [api-project/script.js](api-project/script.js)).
- **ES modules:** `type: "module"` in `package.json` and `script` tags use `type="module"`; prefer `import`/`export` style when adding JS modules.
- **Two coexisting workflows:** small demo uses top-level `script.js`; Vite template assets live in `src/`. When making changes, confirm which entry the target HTML uses.

**Gotchas & Immediate Checks**
- **`vite.config.js` typos:** the file uses `pulgins` instead of `plugins` and imports `@tailwindcss/vite` as `tailwindscss`. Fix typos if `npm run dev` fails: see [api-project/vite.config.js](api-project/vite.config.js).
- **CSS path mismatch:** `index.html` links `/srcs/style.css` (note the extra "s") while styles exist under `src/` and `style.css`. Verify the correct stylesheet path before changing styles.
- **Which entry runs in browser:** `index.html` currently loads `script.js` (top-level). If you edit `src/main.js`, confirm `index.html` is switched to the Vite entry or use Vite dev server behavior.

**Testing & Debugging Tips**
- **Dev start failures:** check console output and inspect `vite.config.js` for syntax/key typos first. Many issues here are config path/name mistakes.
- **Live DOM checks:** Inspect elements with ids `fetch-btn`, `api-response`, `loading`, and `error` when debugging the fetch flow in `script.js`.
- **Network:** `script.js` hits `https://theofficeapi.dev/api/characters` — for offline testing mock that fetch or substitute a local JSON fixture.

**When Editing**
- **Keep changes minimal:** this is a small demo repo; prefer minimal, targeted edits rather than large refactors.
- **Preserve both flows:** if you centralize entries (move `script.js` into `src/`), update `index.html` and `package.json` scripts consistently.

**Examples (quick references)**
- **DOM IDs used by features:** `fetch-btn`, `api-response`, `loading`, `error` — see [api-project/index.html](api-project/index.html).
- **API call location:** `URL` constant in [api-project/script.js](api-project/script.js).

If any of this is unclear or you want me to prefer one entry flow (top-level `script.js` vs `src/main.js`), tell me which to standardize and I will update the repo and tests accordingly.
