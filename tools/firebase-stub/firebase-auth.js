// Test-only stub of firebase-auth. Signs in an anonymous user immediately.
const user = { uid: 'test-uid', isAnonymous: true, providerData: [] };
const auth = { currentUser: null };
const listeners = [];
export function getAuth() { return auth; }
export async function signInAnonymously(a) { a.currentUser = user; listeners.forEach(f => f(user)); return { user }; }
export function onAuthStateChanged(a, cb) { listeners.push(cb); setTimeout(() => cb(a.currentUser), 0); return () => {}; }
export class GoogleAuthProvider { static credentialFromError() { return null; } }
export async function signInWithPopup() { throw new Error('popup disabled in tests'); }
export async function linkWithPopup() { throw new Error('popup disabled in tests'); }
export async function signInWithRedirect() {}
export async function getRedirectResult() { return null; }
export async function signInWithCredential() { return { user }; }
