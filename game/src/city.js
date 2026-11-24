// Sunfall City generation: tropical grid, districts, buildings, beach and palms.
export const WORLD_W = 3200;
export const WORLD_H = 2400;
export const ROAD_W = 150;
export const VX = [420, 1080, 1740, 2400, 2960];
export const HY = [340, 900, 1460, 1980];
export const DISTRICTS = [
  { name: 'MARINA STRIP', x: 200, y: 2050, w: 2800, h: 200, color: '#ff8a5c' },
  { name: 'OLD MARKET', x: 900, y: 750, w: 1300, h: 800, color: '#ffd166' },
  { name: 'HARBOR POINT', x: 2250, y: 1500, w: 800, h: 550, color: '#4ecdc4' },
  { name: 'PALM HEIGHTS', x: 150, y: 150, w: 1100, h: 650, color: '#a8e063' },
];
const PASTEL = ['#ffb3a7', '#ffe8c2', '#a8dadc', '#ffd6a5', '#caffbf', '#ffc6ff', '#fdffb6', '#bdb2ff', '#ffadad', '#9bf6ff'];
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function isOnRoad(x, y) {
  for (const rx of VX) if (Math.abs(x - rx) < ROAD_W / 2) return true;
  for (const ry of HY) if (Math.abs(y - ry) < ROAD_W / 2) return true;
  return false;
}
export function isOnSidewalk(x, y) {
  for (const rx of VX) if (Math.abs(x - rx) < ROAD_W / 2 + 26 && Math.abs(x - rx) > ROAD_W / 2 - 4) return true;
  for (const ry of HY) if (Math.abs(y - ry) < ROAD_W / 2 + 26 && Math.abs(y - ry) > ROAD_W / 2 - 4) return true;
  return false;
}
export function generateCity(rng) {
  const buildings = [];
  const palms = [];
  const block = 300;
  for (let bx = 80; bx < WORLD_W - 200; bx += block) {
    for (let by = 60; by < 2050; by += block) {
      const cx = bx + block / 2, cy = by + block / 2;
      if (isOnRoad(cx, cy)) continue;
      if (rng() < 0.18) continue;
      const w = 110 + rng() * 110, h = 90 + rng() * 100;
      buildings.push({ x: bx + 30 + rng() * 30, y: by + 25 + rng() * 25, w, h, color: PASTEL[(rng() * PASTEL.length) | 0], floors: 2 + ((rng() * 5) | 0), name: '' });
    }
  }
  const names = ['Cafe Sol', 'Hotel Coral', 'Toko Rina', 'Bar Ombak', 'Kantor Pos', 'Pasar Sore', 'Studio Foto', 'Bengkel Jaya', 'Klinik Sehat', 'Toko Roti'];
  for (let i = 0; i < buildings.length; i += 7) buildings[i].name = names[(i / 7 | 0) % names.length];
  for (let i = 0; i < 130; i++) {
    const x = rng() * WORLD_W, y = 60 + rng() * 2100;
    if (!isOnRoad(x, y)) palms.push({ x, y, s: 0.8 + rng() * 0.6 });
  }
  for (let x = 120; x < WORLD_W; x += 170) palms.push({ x: x + rng() * 40, y: 2130 + rng() * 40, s: 1 + rng() * 0.4 });
  return { buildings, palms };
}
export function buildingAt(city, x, y, r) {
  for (const b of city.buildings) {
    if (x + r > b.x && x - r < b.x + b.w && y + r > b.y && y - r < b.y + b.h) return b;
  }
  return null;
}
export function collides(city, x, y, r) {
  if (x < 20 || y < 20 || x > WORLD_W - 20 || y > WORLD_H - 10) return true;
  return !!buildingAt(city, x, y, r);
}
export function drawCity(ctx, city, cam, W, H) {
  ctx.fillStyle = '#7ec850';
  ctx.fillRect(0, 0, W, H);
  const x0 = cam.x - 40, y0 = cam.y - 40, x1 = cam.x + W + 40, y1 = cam.y + H + 40;
  ctx.fillStyle = '#f7e8b0';
  ctx.fillRect(0 - cam.x, 2080 - cam.y, WORLD_W, 180);
  const grad = ctx.createLinearGradient(0, 2260 - cam.y, 0, 2400 - cam.y);
  grad.addColorStop(0, '#2ec4b6'); grad.addColorStop(1, '#118ab2');
  ctx.fillStyle = grad;
  ctx.fillRect(0 - cam.x, 2260 - cam.y, WORLD_W, 140);
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  for (let x = 0; x < WORLD_W; x += 90) ctx.fillRect(x - cam.x + ((x * 7) % 30), 2280 - cam.y + ((x * 13) % 80), 34, 3);
  ctx.fillStyle = '#c9c9c9';
  for (const rx of VX) ctx.fillRect(rx - ROAD_W / 2 - 24 - cam.x, 0 - cam.y, ROAD_W + 48, 2260);
  for (const ry of HY) ctx.fillRect(0 - cam.x, ry - ROAD_W / 2 - 24 - cam.y, WORLD_W, ROAD_W + 48);
  ctx.fillStyle = '#3d4451';
  for (const rx of VX) ctx.fillRect(rx - ROAD_W / 2 - cam.x, 0 - cam.y, ROAD_W, 2260);
  for (const ry of HY) ctx.fillRect(0 - cam.x, ry - ROAD_W / 2 - cam.y, WORLD_W, ROAD_W);
  ctx.strokeStyle = '#ffd60a'; ctx.lineWidth = 3; ctx.setLineDash([22, 18]);
  ctx.beginPath();
  for (const rx of VX) { ctx.moveTo(rx - cam.x, 0 - cam.y); ctx.lineTo(rx - cam.x, 2260 - cam.y); }
  for (const ry of HY) { ctx.moveTo(0 - cam.x, ry - cam.y); ctx.lineTo(WORLD_W - cam.x, ry - cam.y); }
  ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  for (const rx of VX) for (const ry of HY) {
    for (let i = -2; i <= 2; i++) { ctx.fillRect(rx - 26 - cam.x, ry + i * 28 - 3 - cam.y, 52, 6); }
  }
  for (const b of city.buildings) {
    if (b.x + b.w < x0 || b.x > x1 || b.y + b.h < y0 || b.y > y1) continue;
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.fillRect(b.x + 14 - cam.x, b.y + 16 - cam.y, b.w, b.h);
    ctx.fillStyle = b.color;
    ctx.fillRect(b.x - cam.x, b.y - cam.y, b.w, b.h);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillRect(b.x - cam.x, b.y - cam.y, b.w, 8);
    ctx.fillStyle = 'rgba(30,60,90,0.55)';
    const cols = Math.max(2, (b.w / 26) | 0), rows = Math.max(2, (b.h / 24) | 0);
    for (let cx = 0; cx < cols; cx++) for (let cy = 0; cy < rows; cy++) ctx.fillRect(b.x + 8 + cx * 24 - cam.x, b.y + 14 + cy * 22 - cam.y, 12, 12);
    if (b.name) { ctx.fillStyle = '#223'; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(b.name, b.x + b.w / 2 - cam.x, b.y + b.h + 14 - cam.y); }
  }
  for (const p of city.palms) {
    if (p.x < x0 || p.x > x1 || p.y < y0 || p.y > y1) continue;
    ctx.strokeStyle = '#7a4a21'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(p.x - cam.x, p.y - cam.y); ctx.lineTo(p.x + 4 - cam.x, p.y - 16 * p.s - cam.y); ctx.stroke();
    ctx.strokeStyle = '#1a9e4b'; ctx.lineWidth = 3;
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2 + 0.4;
      ctx.beginPath(); ctx.moveTo(p.x + 4 - cam.x, p.y - 16 * p.s - cam.y);
      ctx.lineTo(p.x + 4 + Math.cos(a) * 16 * p.s - cam.x, p.y - 16 * p.s + Math.sin(a) * 8 * p.s - 4 - cam.y); ctx.stroke();
    }
  }
  ctx.font = 'bold 20px sans-serif'; ctx.textAlign = 'left';
  for (const d of DISTRICTS) {
    if (d.x + d.w < x0 || d.x > x1 || d.y + d.h < y0 || d.y > y1) continue;
    ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillText(d.name, d.x + 2 - cam.x, d.y + 22 - cam.y);
    ctx.fillStyle = '#fff'; ctx.fillText(d.name, d.x - cam.x, d.y + 20 - cam.y);
  }
  ctx.fillStyle = '#8d6e63'; ctx.fillRect(2400 - cam.x, 1980 - cam.y, 620, 26);
  for (let i = 0; i < 8; i++) ctx.fillRect(2430 + i * 74 - cam.x, 2006 - cam.y, 10, 60);
  ctx.fillStyle = '#fff'; ctx.font = 'bold 13px sans-serif'; ctx.fillText('HARBOR PIER', 2620 - cam.x, 1972 - cam.y);
}
