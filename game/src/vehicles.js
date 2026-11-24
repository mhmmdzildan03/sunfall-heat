// Vehicle definitions, traffic AI and driving physics for Sunfall Heat.
import { VX, HY, WORLD_W } from './city.js';
export const CAR_TYPES = [
  { name: 'Kijang Taxi', color: '#ffd60a', speed: 3.4, w: 44, h: 22 },
  { name: 'Sedan Biru', color: '#3a86ff', speed: 3.0, w: 46, h: 22 },
  { name: 'Hatch Merah', color: '#ef476f', speed: 3.2, w: 42, h: 21 },
  { name: 'Pickup Putih', color: '#f1faee', speed: 2.7, w: 50, h: 24 },
  { name: 'Sport Toska', color: '#06d6a0', speed: 4.2, w: 46, h: 21 },
  { name: 'Van Ungu', color: '#8338ec', speed: 2.5, w: 52, h: 25 },
];
export function makeCar(x, y, angle, type, opts = {}) {
  return { x, y, angle, speed: 0, type, color: type.color, w: type.w, h: type.h, police: !!opts.police, parked: !!opts.parked, stolen: false, hp: 100, driver: opts.driver || null, lane: opts.lane || 0, dir: opts.dir || 1, vert: !!opts.vert, targetSpeed: type.speed };
}
export function spawnTraffic(rng, count) {
  const cars = [];
  for (let i = 0; i < count; i++) {
    const type = CAR_TYPES[(rng() * CAR_TYPES.length) | 0];
    const vert = rng() < 0.5;
    let x, y, angle, dir;
    if (vert) { const rx = VX[(rng() * VX.length) | 0]; dir = rng() < 0.5 ? 1 : -1; x = rx + (dir > 0 ? 34 : -34); y = rng() * 2100 + 60; angle = dir > 0 ? Math.PI / 2 : -Math.PI / 2; }
    else { const ry = HY[(rng() * HY.length) | 0]; dir = rng() < 0.5 ? 1 : -1; y = ry + (dir > 0 ? -34 : 34); x = rng() * WORLD_W; angle = dir > 0 ? 0 : Math.PI; }
    const c = makeCar(x, y, angle, type, { vert, dir });
    c.speed = type.speed * 0.7;
    cars.push(c);
  }
  const parkedSpots = [[700, 500], [1350, 620], [2000, 500], [700, 1180], [1400, 1150], [2050, 1180], [700, 1750], [1350, 1720], [2650, 620], [2650, 1750]];
  for (const [px, py] of parkedSpots) {
    const type = CAR_TYPES[(rng() * CAR_TYPES.length) | 0];
    cars.push(makeCar(px, py, 0, type, { parked: true }));
  }
  return cars;
}
export function updateTrafficCar(c, dt) {
  if (c.parked) return;
  const spd = c.targetSpeed;
  c.speed += (spd - c.speed) * 0.02 * dt;
  c.x += Math.cos(c.angle) * c.speed * dt * 0.9;
  c.y += Math.sin(c.angle) * c.speed * dt * 0.9;
  if (c.vert) {
    if (c.y > 2240) c.y = 40; if (c.y < 20) c.y = 2220;
    if (Math.random() < 0.002) {
      const near = HY.reduce((a, b) => Math.abs(b - c.y) < Math.abs(a - c.y) ? b : a);
      if (Math.abs(near - c.y) < 30) { c.vert = false; c.angle = c.dir > 0 ? 0 : Math.PI; c.y = near + (c.dir > 0 ? -34 : 34); }
    }
  } else {
    if (c.x > WORLD_W - 10) c.x = 20; if (c.x < 10) c.x = WORLD_W - 20;
    if (Math.random() < 0.002) {
      const near = VX.reduce((a, b) => Math.abs(b - c.x) < Math.abs(a - c.x) ? b : a);
      if (Math.abs(near - c.x) < 30) { c.vert = true; c.angle = c.dir > 0 ? Math.PI / 2 : -Math.PI / 2; c.x = near + (c.dir > 0 ? 34 : -34); }
    }
  }
}
export function driveCar(car, input, dt) {
  const accel = 0.16, maxF = 6.2, maxR = -2.4;
  if (input.up) car.speed += accel * dt;
  else if (input.down) car.speed -= accel * 0.8 * dt;
  else car.speed *= Math.pow(0.985, dt);
  if (input.brake) car.speed *= Math.pow(0.9, dt);
  car.speed = Math.max(maxR, Math.min(maxF, car.speed));
  const steer = 0.045 * (car.speed >= 0 ? 1 : -1);
  if (input.left) car.angle -= steer * dt * Math.min(1, Math.abs(car.speed) / 2 + 0.2);
  if (input.right) car.angle += steer * dt * Math.min(1, Math.abs(car.speed) / 2 + 0.2);
  car.x += Math.cos(car.angle) * car.speed * dt;
  car.y += Math.sin(car.angle) * car.speed * dt;
  return Math.abs(car.speed);
}
export function drawCar(ctx, c, cam) {
  const x = c.x - cam.x, y = c.y - cam.y;
  if (x < -80 || y < -80 || x > 1400 || y > 820) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(c.angle);
  ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(-c.w / 2 + 3, -c.h / 2 + 4, c.w, c.h);
  ctx.fillStyle = c.police ? '#f8f9fa' : c.color;
  ctx.beginPath(); ctx.roundRect(-c.w / 2, -c.h / 2, c.w, c.h, 6); ctx.fill();
  if (c.police) { ctx.fillStyle = '#1d3557'; ctx.fillRect(-c.w / 2, -c.h / 2, c.w, 7); ctx.fillRect(-c.w / 2, c.h / 2 - 7, c.w, 7); ctx.fillStyle = '#e63946'; ctx.fillRect(-4, -4, 8, 8); ctx.fillStyle = '#3a86ff'; ctx.fillRect(-12, -4, 8, 8); }
  ctx.fillStyle = '#bde0fe'; ctx.fillRect(-2, -c.h / 2 + 4, 14, c.h - 8);
  ctx.fillStyle = '#222'; ctx.fillRect(-c.w / 2 + 2, -c.h / 2 - 2, 9, 5); ctx.fillRect(-c.w / 2 + 2, c.h / 2 - 3, 9, 5); ctx.fillRect(c.w / 2 - 11, -c.h / 2 - 2, 9, 5); ctx.fillRect(c.w / 2 - 11, c.h / 2 - 3, 9, 5);
  ctx.fillStyle = '#fff9c4'; ctx.fillRect(c.w / 2 - 3, -c.h / 2 + 3, 3, 5); ctx.fillRect(c.w / 2 - 3, c.h / 2 - 8, 3, 5);
  ctx.restore();
  if (c.police) { ctx.fillStyle = '#fff'; ctx.font = 'bold 9px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('POLISI', x, y - 18); }
}
