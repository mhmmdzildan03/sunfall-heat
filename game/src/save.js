// Save and load for Sunfall Heat using localStorage.
const KEY = 'sunfall-heat-save-v1';
export function saveGame(data) {
  try { localStorage.setItem(KEY, JSON.stringify(data)); return true; } catch (e) { return false; }
}
export function loadGame() {
  try { const raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : null; } catch (e) { return null; }
}
export function clearSave() {
  try { localStorage.removeItem(KEY); } catch (e) { /* storage unavailable */ }
}
export function hasSave() {
  return loadGame() !== null;
}
