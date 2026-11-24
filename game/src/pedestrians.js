// Pedestrians of Sunfall City: sidewalk walkers who flee from danger.
import { VX, HY, WORLD_W } from './city.js';
const SHIRTS = ['#ef476f', '#ffd166', '#06d6a0', '#118ab2', '#ff8a5c', '#f8f9fa', '#8338ec', '#e07a5f'];
export function spawnPedestrians(rng, count) {
  const peds = [];
  for (let i = 0; i < count; i++) {
    const vert = rng() < 0.5;
    let x, y;
    if (vert) { const rx = VX[(rng() * VX.length) | 0]; x = rx + (rng() < 0.5 ? -95 : 95); y = rng() * 2100 + 50; }
    else { const ry = HY[(rng() * HY.length) | 0]; y = ry + (rng() < 0.5 ? -95 : 95); x = rng() * WORLD_W; }
    peds.push({ x, y, angle: rng() * Math.PI * 2, speed: 0.7 + rng() * 0.7, shirt: SHIRTS[(rng() * SHIRTS.length) | 0], vert, dir: rng() < 0.5 ? 1 : -1, flee: 0, walkPhase: rng() * 6 });
  }
  return peds;
}
export function updatePedestrian(p, dt, danger) {
  p.walkPhase += dt * 0.25;
  if (danger) {
    const dx = p.x - danger.x, dy = p.y - danger.y;
    const d = Math.hypot(dx, dy);
    if (d < 170) p.flee = 90;
  }
  if (p.flee > 0) {
    p.flee -= dt;
    const dx = p.x - (danger ? danger.x : p.x), dy = p.y - (danger ? danger.y : p.y);
    const a = Math.atan2(dy, dx);
    p.x += Math.cos(a) * 2.4 * dt; p.y += Math.sin(a) * 2.4 * dt;
    return;
  }
  if (p.vert) { p.y += p.dir * p.speed * dt; if (p.y < 40 || p.y > 2180) p.dir *= -1; }
  else { p.x += p.dir * p.speed * dt; if (p.x < 30 || p.x > WORLD_W - 30) p.dir *= -1; }
  if (Math.random() < 0.0015) { p.vert = !p.vert; }
}
export function drawPedestrian(ctx, p, cam) {
  const x = p.x - cam.x, y = p.y - cam.y;
  if (x < -30 || y < -30 || x > 1330 || y > 770) return;
  const bob = Math.sin(p.walkPhase) * 1.5;
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.ellipse(x, y + 8, 7, 3, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#5a3a1a'; ctx.fillRect(x - 4, y + 2 + bob * 0.3, 3, 7); ctx.fillRect(x + 1, y + 2 - bob * 0.3, 3, 7);
  ctx.fillStyle = p.shirt; ctx.beginPath(); ctx.roundRect(x - 5, y - 5 + bob * 0.2, 10, 9, 3); ctx.fill();
  ctx.fillStyle = '#f2c094'; ctx.beginPath(); ctx.arc(x, y - 8 + bob * 0.2, 4.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#222'; ctx.beginPath(); ctx.arc(x, y - 10 + bob * 0.2, 4.5, Math.PI, Math.PI * 2); ctx.fill();
  if (p.flee > 0) { ctx.fillStyle = '#e63946'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('!', x, y - 18); }
}
