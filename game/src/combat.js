// Combat: fists, mouse-aimed pistol, bullets and hit reactions.
export function createCombat() {
  return { bullets: [], particles: [], punchCooldown: 0, shootCooldown: 0, muzzle: 0 };
}
export function tryShoot(combat, from, angle, sfx) {
  if (combat.shootCooldown > 0) return false;
  combat.shootCooldown = 14;
  combat.muzzle = 4;
  combat.bullets.push({ x: from.x + Math.cos(angle) * 16, y: from.y + Math.sin(angle) * 16, vx: Math.cos(angle) * 13, vy: Math.sin(angle) * 13, life: 46 });
  if (sfx) sfx.shoot();
  return true;
}
export function tryPunch(combat, player, targets) {
  if (combat.punchCooldown > 0) return null;
  combat.punchCooldown = 22;
  for (const t of targets) {
    if (Math.hypot(t.x - player.x, t.y - player.y) < 30) { spawnHit(combat, t.x, t.y); return t; }
  }
  return null;
}
export function spawnHit(combat, x, y) {
  for (let i = 0; i < 7; i++) combat.particles.push({ x, y, vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 0.5) * 4, life: 16, color: '#ffd60a' });
}
export function spawnCash(combat, x, y) {
  for (let i = 0; i < 8; i++) combat.particles.push({ x, y, vx: (Math.random() - 0.5) * 3, vy: -1 - Math.random() * 2, life: 26, color: '#06d6a0' });
}
export function updateCombat(combat, dt, hitTest) {
  combat.punchCooldown = Math.max(0, combat.punchCooldown - dt);
  combat.shootCooldown = Math.max(0, combat.shootCooldown - dt);
  combat.muzzle = Math.max(0, combat.muzzle - dt);
  for (const b of combat.bullets) { b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt; if (hitTest) hitTest(b); }
  combat.bullets = combat.bullets.filter(b => b.life > 0 && !b.dead);
  for (const pt of combat.particles) { pt.x += pt.vx * dt; pt.y += pt.vy * dt; pt.vy += 0.08 * dt; pt.life -= dt; }
  combat.particles = combat.particles.filter(pt => pt.life > 0);
}
export function drawCombat(ctx, combat, cam) {
  for (const b of combat.bullets) { ctx.fillStyle = '#ffe66d'; ctx.fillRect(b.x - cam.x - 2, b.y - cam.y - 1, 5, 2.5); }
  for (const pt of combat.particles) { ctx.globalAlpha = Math.min(1, pt.life / 12); ctx.fillStyle = pt.color; ctx.fillRect(pt.x - cam.x - 2, pt.y - cam.y - 2, 4, 4); }
  ctx.globalAlpha = 1;
}
