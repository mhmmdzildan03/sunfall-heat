// Sunfall Heat — boot, game loop and state machine (title/playing/paused/busted/wasted).
import { generateCity, drawCity, collides, mulberry32, WORLD_W, WORLD_H } from './city.js';
import { spawnTraffic, updateTrafficCar, driveCar, drawCar } from './vehicles.js';
import { spawnPedestrians, updatePedestrian, drawPedestrian } from './pedestrians.js';
import { createPlayer, updatePlayerOnFoot, nearestCar, drawPlayer } from './player.js';
import { createWanted, addHeat, updateWanted, makePoliceCar, makeOfficer, updatePoliceCar, updateOfficer, drawOfficer } from './police.js';
import { createCombat, tryShoot, tryPunch, updateCombat, drawCombat, spawnCash } from './combat.js';
import { createMissionState, startMission, advanceDialog, currentObjective, missionTarget, drawWorldMarker, drawOffscreenArrow, MISSIONS } from './missions.js';
import { drawHUD, drawDialog } from './hud.js';
import { createAudio } from './audio.js';
import { saveGame, loadGame } from './save.js';
import { parseShot, setupShotScene } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const W = 1280, H = 720;
canvas.width = W; canvas.height = H;
const shotInfo = parseShot();
const seed = shotInfo.active ? shotInfo.seed : ((Math.random() * 99999) | 0);
const rng = mulberry32(seed);
const city = generateCity(rng);
const sfx = createAudio();
const keys = {};
let mouse = { x: W / 2, y: H / 2, down: false };

const G = {
  state: 'title', t: 0, frozen: false, cam: { x: 400, y: 500 },
  city, player: createPlayer(1080, 1020), traffic: spawnTraffic(rng, 24),
  peds: spawnPedestrians(rng, 38), policeCars: [], officers: [],
  wanted: createWanted(), combat: createCombat(), mission: createMissionState(),
  objective: '', toast: '', toastT: 0, nearCar: null, dialogText: null,
  missionTargetPos: null, hasSave: !!loadGame(), endTimer: 0,
  spawnCops(n, around) {
    const arr = [];
    for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2 + 0.6; arr.push(makePoliceCar(around.x + Math.cos(a) * 190, around.y + Math.sin(a) * 150)); }
    return arr;
  },
  spawnOfficers(n, around) {
    const arr = [];
    for (let i = 0; i < n; i++) arr.push(makeOfficer(around.x + 70 + i * 36, around.y - 60 + i * 20));
    return arr;
  },
  startMissionByIndex(idx) { G.mission.index = idx; startMission(G.mission); syncDialog(); },
};
function syncDialog() {
  const ms = G.mission;
  if ((ms.phase === 'intro' || ms.phase === 'outro') && ms.dialog.length) G.dialogText = ms.dialog[ms.dialogIdx];
  else G.dialogText = null;
}
function toast(msg) { G.toast = msg; G.toastT = 200; }
function playerPos() { return G.player.inCar || G.player; }
function doSave() { saveGame({ money: G.player.money, completed: G.mission.completed, index: G.mission.index, x: G.player.x, y: G.player.y }); G.hasSave = true; }
function doLoad() {
  const s = loadGame(); if (!s) return;
  G.player.money = s.money || 120; G.mission.completed = s.completed || []; G.mission.index = s.index || 0;
  G.player.x = s.x || 1080; G.player.y = s.y || 1020; toast('Save dimuat — selamat datang kembali, Raka!');
}

window.addEventListener('keydown', (e) => {
  keys[e.code] = true; sfx.unlock();
  if (e.code === 'KeyM') { const m = sfx.toggleMute(); toast(m ? 'Suara mati (M)' : 'Suara nyala (M)'); }
  if (e.code === 'KeyP' && G.state === 'playing') G.state = 'paused';
  else if (e.code === 'KeyP' && G.state === 'paused') G.state = 'playing';
  if ((e.code === 'Enter' || e.code === 'Space') && G.dialogText) { advanceDialog(G.mission); syncDialog(); e.preventDefault(); }
  if (e.code === 'KeyE') tryEnterExit();
  if (e.code === 'KeyF' && !G.player.inCar && G.state === 'playing') {
    const hit = tryPunch(G.combat, G.player, [...G.peds, ...G.officers]);
    if (hit) { sfx.punch(); addHeat(G.wanted, 22); toast('Kamu memukul seseorang! Wanted naik'); }
  }
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
});
window.addEventListener('keyup', (e) => { keys[e.code] = false; });
canvas.addEventListener('mousemove', (e) => { const r = canvas.getBoundingClientRect(); mouse.x = (e.clientX - r.left) * (W / r.width); mouse.y = (e.clientY - r.top) * (H / r.height); });
canvas.addEventListener('mousedown', (e) => {
  sfx.unlock(); mouse.down = true;
  if (G.state === 'title') { handleTitleClick(mouse.x, mouse.y); return; }
  if (G.state === 'busted' || G.state === 'wasted') { resetAfterEnd(); return; }
  if (G.dialogText) { advanceDialog(G.mission); syncDialog(); return; }
  if (G.state === 'playing' && !G.player.inCar) {
    const pp = playerPos(); const ang = Math.atan2((pp.y - G.cam.y) - mouse.y, (pp.x - G.cam.x) - mouse.x) + Math.PI;
    const aim = Math.atan2(mouse.y - (pp.y - G.cam.y), mouse.x - (pp.x - G.cam.x));
    if (G.player.ammo > 0 && tryShoot(G.combat, pp, aim, sfx)) { G.player.ammo--; addHeat(G.wanted, 16); }
  }
});
window.addEventListener('mouseup', () => { mouse.down = false; });

function handleTitleClick(x, y) {
  if (x > W / 2 - 130 && x < W / 2 + 130 && y > 470 && y < 522) { G.state = 'playing'; toast('Selamat datang di Sunfall City, Raka!'); }
  if (G.hasSave && x > W / 2 - 130 && x < W / 2 + 130 && y > 532 && y < 580) { doLoad(); G.state = 'playing'; }
}
function tryEnterExit() {
  if (G.state !== 'playing') return;
  const p = G.player;
  if (p.inCar) { const c = p.inCar; p.x = c.x + 34; p.y = c.y + 10; p.inCar = null; toast('Keluar mobil'); return; }
  const car = nearestCar(p, [...G.traffic, ...G.policeCars], 52);
  if (car) {
    const firstSteal = !car.stolen && !car.police;
    p.inCar = car; car.parked = false;
    if (car.police) { addHeat(G.wanted, 60); toast('Kamu mencuri mobil POLISI!'); }
    else if (firstSteal) { car.stolen = true; addHeat(G.wanted, 34); toast('Mobil dicuri! Wanted naik ★'); }
    else toast('Mengemudi: ' + (car.police ? 'Mobil Polisi' : 'Mobil'));
    const ms = G.mission;
    if (ms.active && ms.phase === 'steal' && Math.hypot(car.x - ms.active.stealPos.x, car.y - ms.active.stealPos.y) < 220) { ms.phase = 'drop'; toast('Mobil didapat! Antar ke Harbor Point'); }
  }
}
function resetAfterEnd() {
  G.player.hp = 100; G.player.money = Math.max(50, G.player.money - 100);
  G.wanted.stars = 0; G.wanted.heat = 0; G.policeCars = []; G.officers = [];
  G.player.inCar = null; G.player.x = 1080; G.player.y = 1020; G.state = 'playing'; toast('Kembali beraksi di Sunfall City');
}
function inputState() {
  return { up: !!(keys.KeyW || keys.ArrowUp), down: !!(keys.KeyS || keys.ArrowDown), left: !!(keys.KeyA || keys.ArrowLeft), right: !!(keys.KeyD || keys.ArrowRight), run: !!(keys.ShiftLeft || keys.ShiftRight), brake: !!keys.Space };
}

function update(dt) {
  G.t += dt; if (G.toastT > 0) G.toastT -= dt;
  const inp = inputState(); const p = G.player; const pp = playerPos();
  if (G.state === 'playing' && !G.dialogText) {
    if (p.inCar) {
      const spd = driveCar(p.inCar, inp, dt);
      p.x = p.inCar.x; p.y = p.inCar.y;
      if (collides(city, p.inCar.x, p.inCar.y, 16)) { p.inCar.x -= Math.cos(p.inCar.angle) * p.inCar.speed * dt; p.inCar.y -= Math.sin(p.inCar.angle) * p.inCar.speed * dt; p.inCar.speed *= -0.3; p.inCar.hp -= 2; }
      if (spd > 4.5 && Math.random() < 0.01) addHeat(G.wanted, 2);
    } else {
      updatePlayerOnFoot(p, inp, dt, (x, y, r) => collides(city, x, y, r));
      if (mouse.down && p.ammo > 0) { const aim = Math.atan2(mouse.y - (p.y - G.cam.y), mouse.x - (p.x - G.cam.x)); if (tryShoot(G.combat, p, aim, sfx)) { p.ammo--; addHeat(G.wanted, 10); } }
    }
    G.nearCar = p.inCar ? null : nearestCar(p, [...G.traffic, ...G.policeCars], 52);
    for (const c of G.traffic) { if (c !== p.inCar) updateTrafficCar(c, dt); }
    const danger = (G.wanted.stars > 0 || p.inCar) ? pp : null;
    for (const pd of G.peds) updatePedestrian(pd, dt, danger);
    updateCombat(G.combat, dt, (b) => {
      for (const pd of G.peds) if (Math.hypot(pd.x - b.x, pd.y - b.y) < 12) { b.dead = true; pd.flee = 120; addHeat(G.wanted, 20); }
      for (const o of G.officers) if (Math.hypot(o.x - b.x, o.y - b.y) < 12) { b.dead = true; o.x += b.vx; addHeat(G.wanted, 26); toast('Petugas tertembak!'); }
    });
    const ms = G.mission;
    G.missionTargetPos = missionTarget(ms);
    G.objective = currentObjective(ms);
    if (!ms.active && G.missionTargetPos && Math.hypot(pp.x - G.missionTargetPos.x, pp.y - G.missionTargetPos.y) < 60) { startMission(ms); syncDialog(); toast('Misi dimulai: ' + ms.active.title); }
    if (ms.active) {
      if (ms.phase === 'pickup' && Math.hypot(pp.x - ms.active.stealPos.x, pp.y - ms.active.stealPos.y) < 55) { ms.phase = 'deliver'; addHeat(G.wanted, 40); toast('Paket diambil! Polisi mengejarmu!'); }
      else if ((ms.phase === 'drop' || ms.phase === 'deliver') && Math.hypot(pp.x - ms.active.dropPos.x, pp.y - ms.active.dropPos.y) < 70) { finishMission(); }
      else if (ms.phase === 'goto' && Math.hypot(pp.x - ms.active.stealPos.x, pp.y - ms.active.stealPos.y) < 70) { ms.phase = 'escape'; addHeat(G.wanted, 90); toast('Kabur! Hilangkan wanted-mu!'); }
      else if (ms.phase === 'escape' && G.wanted.stars === 0) finishMission();
    }
    const wantCops = G.wanted.stars * 2;
    if (G.policeCars.length < wantCops) G.policeCars.push(makePoliceCar(pp.x + (Math.random() - 0.5) * 700, pp.y + (Math.random() - 0.5) * 500));
    if (G.policeCars.length > wantCops + 2) G.policeCars.pop();
    const wantOff = G.wanted.stars >= 2 ? 2 : G.wanted.stars;
    if (G.officers.length < wantOff) G.officers.push(makeOfficer(pp.x + 90, pp.y - 70));
    if (G.officers.length > wantOff) G.officers.pop();
    let nearCop = false;
    for (const c of G.policeCars) { const d = updatePoliceCar(c, dt, pp); if (d < 90) nearCop = true; if (d < 30 && !p.inCar) G.wanted.bustedTimer += dt; }
    for (const o of G.officers) { const d = updateOfficer(o, dt, pp); if (d < 26 && !p.inCar) { G.wanted.bustedTimer += dt * 1.4; p.hp -= 0.12 * dt; } }
    if (G.wanted.stars === 0) G.wanted.bustedTimer = 0;
    updateWanted(G.wanted, dt, !nearCop);
    if (G.wanted.stars > 0) sfx.startSiren(); else sfx.stopSiren();
    if (G.wanted.bustedTimer > 170) { G.state = 'busted'; sfx.stopSiren(); doSave(); }
    if (p.hp <= 0) { G.state = 'wasted'; sfx.stopSiren(); }
    if (Math.random() < 0.002) { p.money += 5; }
  }
  const target = playerPos();
  const look = G.player.inCar ? 90 : 0;
  const lx = target.x + Math.cos(target.angle || 0) * look, ly = target.y + Math.sin(target.angle || 0) * look;
  G.cam.x += ((lx - W / 2) - G.cam.x) * 0.09; G.cam.y += ((ly - H / 2) - G.cam.y) * 0.09;
  G.cam.x = Math.max(0, Math.min(WORLD_W - W, G.cam.x)); G.cam.y = Math.max(0, Math.min(WORLD_H - H, G.cam.y));
}
function finishMission() {
  const ms = G.mission; const m = ms.active; if (!m) return;
  G.player.money += m.reward; sfx.cash(); sfx.missionDone(); spawnCash(G.combat, playerPos().x, playerPos().y);
  toast('Misi selesai! +$' + m.reward);
  ms.phase = 'outro'; ms.dialog = [...m.outro]; ms.dialogIdx = 0; syncDialog(); doSave();
}

function draw() {
  drawCity(ctx, city, G.cam, W, H);
  const tgt = missionTarget(G.mission);
  drawWorldMarker(ctx, tgt, G.cam, G.t);
  for (const c of G.traffic) drawCar(ctx, c, G.cam);
  for (const c of G.policeCars) drawCar(ctx, c, G.cam);
  for (const pd of G.peds) drawPedestrian(ctx, pd, G.cam);
  for (const o of G.officers) drawOfficer(ctx, o, G.cam);
  const pp = playerPos();
  const aim = Math.atan2(mouse.y - (pp.y - G.cam.y), mouse.x - (pp.x - G.cam.x));
  drawPlayer(ctx, G.player, G.cam, G.player.inCar ? null : aim);
  drawCombat(ctx, G.combat, G.cam);
  if (G.state !== 'title') { drawHUD(ctx, G, W, H); drawOffscreenArrow(ctx, tgt, G.cam, W, H); drawDialog(ctx, G, W, H); }
  if (G.wanted.bustedTimer > 30 && G.state === 'playing') {
    ctx.fillStyle = 'rgba(230,57,70,0.25)'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 18px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('POLISI MENANGKAPMU... ' + Math.max(0, Math.ceil((170 - G.wanted.bustedTimer) / 60)) + 's', W / 2, 90);
  }
  if (G.state === 'title') drawTitle();
  if (G.state === 'paused') overlay('⏸ PAUSED', 'Tekan P untuk lanjut • Misi & uang tersimpan otomatis');
  if (G.state === 'busted') overlay('🚔 BUSTED!', 'Kamu tertangkap. Klik untuk kembali — denda $100');
  if (G.state === 'wasted') overlay('💀 WASTED', 'Raka tumbang. Klik untuk bangun di Sunfall City — biaya $100');
}
function overlay(title, sub) {
  ctx.fillStyle = 'rgba(5,10,25,0.72)'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#ffd60a'; ctx.font = 'bold 52px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(title, W / 2, H / 2 - 20);
  ctx.fillStyle = '#fff'; ctx.font = '17px sans-serif'; ctx.fillText(sub, W / 2, H / 2 + 22);
}
function drawTitle() {
  const grd = ctx.createLinearGradient(0, 0, 0, H); grd.addColorStop(0, 'rgba(255,110,60,0.25)'); grd.addColorStop(1, 'rgba(10,20,50,0.78)');
  ctx.fillStyle = grd; ctx.fillRect(0, 0, W, H);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd60a'; ctx.font = 'bold 76px sans-serif'; ctx.fillText('SUNFALL HEAT', W / 2, 150);
  ctx.fillStyle = '#fff'; ctx.font = '20px sans-serif'; ctx.fillText('Open-World Crime di Sunfall City — kota tropis, mobil curian, polisi & misi', W / 2, 188);
  ctx.font = '15px sans-serif'; ctx.fillStyle = '#ffe8c2';
  ctx.fillText('Kamu adalah RAKA, kurir jalanan yang naik daun di Marina Strip, Old Market & Harbor Point.', W / 2, 222);
  ctx.fillText('Selesaikan 3 misi Dewi, Bima & Sari. Curi mobil, kabur dari polisi, jadi legenda senja.', W / 2, 246);
  ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.beginPath(); ctx.roundRect(W / 2 - 300, 272, 600, 178, 12); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.font = 'bold 15px sans-serif'; ctx.fillText('KONTROL', W / 2, 300);
  ctx.font = '14px sans-serif'; ctx.textAlign = 'left';
  const lines = ['WASD / Panah — jalan & menyetir      Shift — lari', 'E — masuk / curi / keluar mobil      Spasi — rem tangan', 'Mouse — bidik • Klik — tembak       F — tinju', 'P — pause      M — mute      Enter/Klik — lanjut dialog'];
  lines.forEach((l, i) => ctx.fillText(l, W / 2 - 270, 330 + i * 26));
  ctx.textAlign = 'center';
  ctx.fillStyle = '#06d6a0'; ctx.beginPath(); ctx.roundRect(W / 2 - 130, 470, 260, 52, 10); ctx.fill();
  ctx.fillStyle = '#06281d'; ctx.font = 'bold 20px sans-serif'; ctx.fillText('▶  MULAI MAIN', W / 2, 503);
  if (G.hasSave) { ctx.fillStyle = '#ffd60a'; ctx.beginPath(); ctx.roundRect(W / 2 - 130, 532, 260, 46, 10); ctx.fill(); ctx.fillStyle = '#332200'; ctx.font = 'bold 17px sans-serif'; ctx.fillText('↻  CONTINUE (Save)', W / 2, 561); }
  drawHUD(ctx, { ...G, objective: 'SUNFALL CITY — kota hidup di belakang menu ini!' }, W, H);
}

if (shotInfo.active) {
  setupShotScene(G, shotInfo.shot);
  if (shotInfo.shot !== 'start') G.objective = G.objective || currentObjective(G.mission);
  G.missionTargetPos = missionTarget(G.mission);
  draw(); draw();
  window.__shotReady = true;
} else {
  function loop() { if (!G.frozen) update(1); draw(); requestAnimationFrame(loop); }
  requestAnimationFrame(loop);
}
