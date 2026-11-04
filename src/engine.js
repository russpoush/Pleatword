// Pleatword engine: two-sided paper, folds along creases, daily puzzle generation.
// A face is cell*2 + side (side 0 = front, 1 = back). A stack lists faces bottom -> top.
// A state is { w, h, g } where g[y][x] is a stack (array of faces), or null for empty space.

const W0 = 7, H0 = 3, LEN = 5, MAX_DEPTH = 4;

function initialState() {
  const g = [];
  for (let y = 0; y < H0; y++) { const row = []; for (let x = 0; x < W0; x++) row.push([(y * W0 + x) * 2]); g.push(row); }
  return { w: W0, h: H0, g };
}

const flipStack = s => s.slice().reverse().map(f => f ^ 1);

// fold = { axis: "v"|"h", k: crease index (1..w-1 or 1..h-1), side: "a"|"b" }
// v: crease between column k-1 and k. side "a" folds the left part over the right; "b" folds the right over the left.
// h: crease between row k-1 and k. side "a" folds the top part down; "b" folds the bottom part up.
function applyFold(st, f) {
  const { w, h, g } = st;
  const n = f.axis === "v" ? w : h, k = f.k;
  if (k < 1 || k >= n) return null;
  let lo, hi; // new coordinate range along the axis, before shifting to 0
  if (f.side === "a") { lo = k; hi = Math.max(n - 1, 2 * k - 1); }
  else { lo = Math.min(0, 2 * k - n); hi = k - 1; }
  const len = hi - lo + 1;
  const nw = f.axis === "v" ? len : w, nh = f.axis === "v" ? h : len;
  const ng = Array.from({ length: nh }, () => Array(nw).fill(null));
  const put = (x, y, stack) => { if (!stack) return; ng[y][x] = ng[y][x] ? ng[y][x].concat(stack) : stack.slice(); };
  // stationary part first, then the moving flap on top
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const c = f.axis === "v" ? x : y;
    const moving = f.side === "a" ? c < k : c >= k;
    if (moving) continue;
    const nc = c - lo;
    put(f.axis === "v" ? nc : x, f.axis === "v" ? y : nc, g[y][x]);
  }
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const c = f.axis === "v" ? x : y;
    const moving = f.side === "a" ? c < k : c >= k;
    if (!moving || !g[y][x]) continue;
    const nc = 2 * k - 1 - c - lo;
    put(f.axis === "v" ? nc : x, f.axis === "v" ? y : nc, flipStack(g[y][x]));
  }
  return { w: nw, h: nh, g: ng };
}

function allFolds(st) {
  const out = [];
  for (let k = 1; k < st.w; k++) for (const side of ["a", "b"]) out.push({ axis: "v", k, side });
  for (let k = 1; k < st.h; k++) for (const side of ["a", "b"]) out.push({ axis: "h", k, side });
  return out;
}

const topFace = s => (s && s.length ? s[s.length - 1] : -1);
// Visible rows as strings ("." for empty space)
function visibleRows(st, letters) {
  return st.g.map(row => row.map(s => { const f = topFace(s); return f < 0 ? "." : letters[f]; }).join(""));
}
function findWord(st, letters, word) {
  const rows = visibleRows(st, letters);
  for (let y = 0; y < rows.length; y++) { const x = rows[y].indexOf(word); if (x >= 0) return { y, x }; }
  return null;
}
const keyOf = st => st.w + "x" + st.h + ":" + st.g.map(r => r.map(s => (s ? s.join(",") : "")).join("|")).join("/");

// Breadth-first over fold sequences. Calls visit(state, depth); stop early if visit returns true.
function explore(start, depth, visit) {
  let frontier = [start]; const seen = new Set([keyOf(start)]);
  if (visit(start, 0)) return;
  for (let d = 1; d <= depth; d++) {
    const next = [];
    for (const st of frontier) for (const f of allFolds(st)) {
      const ns = applyFold(st, f); if (!ns) continue;
      const key = keyOf(ns); if (seen.has(key)) continue; seen.add(key);
      if (ns.w < LEN) continue; // width never grows back, so the word can no longer fit
      if (visit(ns, d)) return;
      next.push(ns);
    }
    frontier = next;
  }
}

function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const FREQ = "eeeeeeeeeeeettttttttaaaaaaaaoooooooiiiiiiinnnnnnnsssssshhhhhhrrrrrrddddllllcccuuummmwwffggyyppbbvkjxqz";

// Make a puzzle hiding `word`. Returns { letters, par, solution } or null.
function makePuzzle(word, seed, answerSet) {
  const r = rng(seed);
  for (let attempt = 0; attempt < 200; attempt++) {
    // random fold path of 2-3 folds that ends with room for the word
    const steps = 2 + Math.floor(r() * 2);
    let st = initialState(); const path = [];
    for (let i = 0; i < steps; i++) {
      const opts = allFolds(st).map(f => ({ f, s: applyFold(st, f) })).filter(o => o.s && o.s.w >= LEN);
      if (!opts.length) break;
      const o = opts[Math.floor(r() * opts.length)]; st = o.s; path.push(o.f);
    }
    if (path.length < 2) continue;
    // pick a row and a 5-wide window of top faces
    const y = Math.floor(r() * st.h), x0 = Math.floor(r() * (st.w - LEN + 1));
    const faces = []; for (let i = 0; i < LEN; i++) faces.push(topFace(st.g[y][x0 + i]));
    if (faces.some(f => f < 0)) continue;
    const letters = Array(W0 * H0 * 2).fill("");
    faces.forEach((f, i) => { letters[f] = word[i]; });
    for (let i = 0; i < letters.length; i++) if (!letters[i]) letters[i] = FREQ[Math.floor(r() * FREQ.length)];
    // validate: not visible at the start, findable, and no other answer word shows up first
    let par = -1, clash = false;
    explore(initialState(), MAX_DEPTH, (s, d) => {
      const rows = visibleRows(s, letters);
      if (par < 0 && rows.some(row => row.includes(word))) { par = d; }
      if (par < 0 || d <= par) for (const row of rows) for (let i = 0; i + LEN <= row.length; i++) {
        const sub = row.slice(i, i + LEN); if (sub !== word && answerSet.has(sub)) clash = true;
      }
      return par >= 0 && d > par;
    });
    if (par >= 2 && !clash) return { letters, par, solution: path };
  }
  return null;
}

if (typeof module !== "undefined") module.exports = { initialState, applyFold, allFolds, visibleRows, findWord, explore, makePuzzle, W0, H0, LEN };
