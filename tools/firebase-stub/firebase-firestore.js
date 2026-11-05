// Test-only in-memory stub of firebase-firestore.
// Seed data comes from window.__FIRESTORE_SEED__ ({ 'path/to/doc': {...} }).
const store = new Map(Object.entries(window.__FIRESTORE_SEED__ || {}));
window.__FIRESTORE__ = store;
const INC = Symbol('inc'), UNION = Symbol('union');
export function getFirestore() { return {}; }
export function doc(db, ...parts) { return { path: parts.join('/') }; }
export function collection(db, ...parts) { return { path: parts.join('/') }; }
export function query(col, ...conds) { return { col, conds }; }
export function where(field, op, value) { return { field, op, value }; }
export function orderBy(field, dir) { return { order: field, dir: dir || 'asc' }; }
export function limit(n) { return { limit: n }; }
export function serverTimestamp() { return Date.now(); }
export function increment(n) { return { [INC]: n }; }
export function arrayUnion(...items) { return { [UNION]: items }; }
const snap = (path) => ({ id: path.split('/').pop(), exists: () => store.has(path), data: () => store.get(path) });
export async function getDoc(ref) { return snap(ref.path); }
function apply(cur, data) {
  const out = { ...cur };
  for (const [k, v] of Object.entries(data)) {
    if (v && typeof v === 'object' && INC in v) out[k] = (out[k] || 0) + v[INC];
    else if (v && typeof v === 'object' && UNION in v) out[k] = [...(out[k] || []), ...v[UNION]];
    else out[k] = v;
  }
  return out;
}
export async function setDoc(ref, data, opts) { store.set(ref.path, apply(opts && opts.merge ? store.get(ref.path) || {} : {}, data)); }
export async function updateDoc(ref, data) { if (!store.has(ref.path)) throw new Error('not-found'); store.set(ref.path, apply(store.get(ref.path), data)); }
export async function getDocs(q) {
  if (!q.col) q = { col: q, conds: [] };
  const prefix = q.col.path + '/';
  const conds = (q.conds || []).filter(c => c.field), ord = (q.conds || []).find(c => c.order), lim = (q.conds || []).find(c => c.limit);
  const ok = (v, c) => c.op === '>' ? v > c.value : c.op === '>=' ? v >= c.value : c.op === '<' ? v < c.value : c.op === '<=' ? v <= c.value : v === c.value;
  let keys = [...store.keys()].filter(k => k.startsWith(prefix) && !k.slice(prefix.length).includes('/') && conds.every(c => ok(store.get(k)[c.field], c)));
  if (ord) keys.sort((a, b) => { const x = store.get(a)[ord.order], y = store.get(b)[ord.order]; return (x > y ? 1 : x < y ? -1 : 0) * (ord.dir === 'desc' ? -1 : 1); });
  if (lim) keys = keys.slice(0, lim.limit);
  const docs = keys.map(snap);
  return { empty: docs.length === 0, size: docs.length, docs, forEach: f => docs.forEach(f) };
}
export async function deleteDoc(ref) { store.delete(ref.path); }
export async function getCountFromServer(q) { const r = await getDocs(q); return { data: () => ({ count: r.size }) }; }
