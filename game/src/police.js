// Wanted system and police response: stars, patrol cars and foot officers.
import { makeCar, CAR_TYPES } from './vehicles.js';
export function createWanted() {
  return { stars: 0, heat: 0, hideTimer: 0, bustedTimer: 0 };
}
export function addHeat(w, amount) {
  w.heat += amount;
  w.stars = Math.min(5, Math.floor(w.heat / 30));
  w.hideTimer = 0;
}
export function updateWanted(w, dt, playerHidden) {
  if (w.stars > 0) {
    if (playerHidden) { w.hideTimer += dt; if (w.hideTimer > 500) { w.heat = Math.max(0, w.heat - dt * 0.08); w.stars = Math.min(5, Math.floor(w.heat / 30)); if (w.heat <= 0) { w.stars = 0; } } }
    else w.hideTimer = 0;
  }
}
export function spawnPolice(rng, wanted, player) {
  const want = wanted.stars * 2;
  return want;
}
export function makePoliceCar(x, y) {
  const t = { name: 'Polisi', color: '#f8f9fa', speed: 4.6, w: 46, h: 22 };
  const c = makeCar(x, y, 0, t, { police: true });
  c.targetSpeed = 4.6;
  return c;
}
export function makeOfficer(x, y) {
  return { x, y, angle: 0, speed: 2.0, walkPhase: 0 };
}
export function updatePoliceCar(c, dt, target) {
  const dx = target.x - c.x, dy = target.y - c.y;
  const dist = Math.hypot(dx, dy);
  const wantAngle = Math.atan2(dy, dx);
  let diff = wantAngle - c.angle;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  c.angle += Math.max(-0.06 * dt, Math.min(0.06 * dt, diff));
  const spd = dist > 60 ? 4.4 : dist > 25 ? 2.2 : 0.4;
  c.speed += (spd - c.speed) * 0.05 * dt;
  c.x += Math.cos(c.angle) * c.speed * dt;
  c.y += Math.sin(c.angle) * c.speed * dt;
  return dist;
}
export function updateOfficer(o, dt, target) {
  const dx = target.x - o.x, dy = target.y - o.y;
  const dist = Math.hypot(dx, dy);
  o.angle = Math.atan2(dy, dx);
  if (dist > 22) { o.x += Math.cos(o.angle) * o.speed * dt; o.y += Math.sin(o.angle) * o.speed * dt; o.walkPhase += dt * 0.4; }
  return dist;
}
export function drawOfficer(ctx, o, cam) {
  const x = o.x - cam.x, y = o.y - cam.y;
  if (x < -30 || y < -30 || x > 1330 || y > 770) return;
  const bob = Math.sin(o.walkPhase) * 1.4;
  ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(x, y + 8, 7, 3, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#14213d'; ctx.fillRect(x - 4, y + 2, 3, 7); ctx.fillRect(x + 1, y + 2, 3, 7);
  ctx.fillStyle = '#1d3557'; ctx.beginPath(); ctx.roundRect(x - 5, y - 5 + bob * 0.2, 10, 9, 3); ctx.fill();
  ctx.fillStyle = '#f2c094'; ctx.beginPath(); ctx.arc(x, y - 8, 4.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1d3557'; ctx.fillRect(x - 5, y - 13, 10, 4);
  ctx.fillStyle = '#fff'; ctx.font = 'bold 8px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('POLISI', x, y - 18);
}
export function drawStars(ctx, stars, x, y) {
  ctx.font = '26px sans-serif'; ctx.textAlign = 'left';
  for (let i = 0; i < 5; i++) { ctx.fillStyle = i < stars ? '#ffd60a' : 'rgba(255,255,255,0.25)'; ctx.fillText('★', x + i * 28, y); }
}
