// Player character: on-foot movement, entering and stealing cars, health.
export function createPlayer(x, y) {
  return { x, y, angle: 0, speed: 0, hp: 100, maxHp: 100, money: 120, inCar: null, walkPhase: 0, hasGun: true, ammo: 60, name: 'Raka' };
}
export function updatePlayerOnFoot(p, input, dt, collidesFn) {
  let mx = 0, my = 0;
  if (input.up) my -= 1; if (input.down) my += 1; if (input.left) mx -= 1; if (input.right) mx += 1;
  const moving = mx !== 0 || my !== 0;
  const spd = input.run ? 3.6 : 2.1;
  if (moving) {
    const len = Math.hypot(mx, my); mx /= len; my /= len;
    p.angle = Math.atan2(my, mx);
    const nx = p.x + mx * spd * dt, ny = p.y + my * spd * dt;
    if (!collidesFn(nx, p.y, 10)) p.x = nx;
    if (!collidesFn(p.x, ny, 10)) p.y = ny;
    p.walkPhase += dt * (input.run ? 0.45 : 0.3);
  }
  return moving;
}
export function nearestCar(p, cars, maxDist) {
  let best = null, bd = maxDist;
  for (const c of cars) { const d = Math.hypot(c.x - p.x, c.y - p.y); if (d < bd) { bd = d; best = c; } }
  return best;
}
export function drawPlayer(ctx, p, cam, mouseAngle) {
  if (p.inCar) return;
  const x = p.x - cam.x, y = p.y - cam.y;
  const bob = Math.sin(p.walkPhase) * 1.6;
  ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(x, y + 9, 8, 3.5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1d3557'; ctx.fillRect(x - 4, y + 2 + bob * 0.3, 3.5, 8); ctx.fillRect(x + 1, y + 2 - bob * 0.3, 3.5, 8);
  ctx.fillStyle = '#ffd60a'; ctx.beginPath(); ctx.roundRect(x - 6, y - 6 + bob * 0.2, 12, 10, 3); ctx.fill();
  ctx.fillStyle = '#f2c094'; ctx.beginPath(); ctx.arc(x, y - 10 + bob * 0.2, 5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#e63946'; ctx.beginPath(); ctx.arc(x, y - 12 + bob * 0.2, 5, Math.PI, Math.PI * 2); ctx.fill();
  if (mouseAngle !== null && mouseAngle !== undefined) {
    ctx.save(); ctx.translate(x, y - 2); ctx.rotate(mouseAngle);
    ctx.fillStyle = '#222'; ctx.fillRect(6, -1.5, 13, 3.5);
    ctx.restore();
  }
  ctx.fillStyle = '#fff'; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('RAKA', x, y - 24);
}
