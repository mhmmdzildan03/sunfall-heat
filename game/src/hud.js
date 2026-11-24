// HUD for Sunfall Heat: minimap, wanted stars, money, health and objective banner.
import { VX, HY, WORLD_W, WORLD_H } from './city.js';
import { drawStars } from './police.js';
export function drawMinimap(ctx, G, x, y, size) {
  const s = size / WORLD_W, sh = size / WORLD_H;
  ctx.save();
  ctx.fillStyle = 'rgba(10,25,40,0.88)'; ctx.beginPath(); ctx.roundRect(x, y, size, size * 0.75, 10); ctx.fill();
  ctx.strokeStyle = '#ffd60a'; ctx.lineWidth = 2; ctx.stroke();
  ctx.beginPath(); ctx.roundRect(x, y, size, size * 0.75, 10); ctx.clip();
  ctx.fillStyle = '#2a6e3f'; ctx.fillRect(x, y, size, size * 0.75);
  ctx.fillStyle = '#118ab2'; ctx.fillRect(x, y + 2260 * sh, size, 140 * sh);
  ctx.strokeStyle = '#888'; ctx.lineWidth = 3;
  for (const rx of VX) { ctx.beginPath(); ctx.moveTo(x + rx * s, y); ctx.lineTo(x + rx * s, y + size * 0.75); ctx.stroke(); }
  for (const ry of HY) { ctx.beginPath(); ctx.moveTo(x, y + ry * sh); ctx.lineTo(x + size, y + ry * sh); ctx.stroke(); }
  ctx.fillStyle = '#ef476f';
  for (const c of G.policeCars) ctx.fillRect(x + c.x * s - 2, y + c.y * sh - 2, 5, 5);
  ctx.fillStyle = '#aaa';
  for (const c of G.traffic) ctx.fillRect(x + c.x * s - 1, y + c.y * sh - 1, 3, 3);
  if (G.missionTargetPos) { ctx.fillStyle = '#ffd60a'; ctx.beginPath(); ctx.arc(x + G.missionTargetPos.x * s, y + G.missionTargetPos.y * sh, 5 + Math.sin(G.t * 0.15) * 1.5, 0, Math.PI * 2); ctx.fill(); }
  const px = G.player.inCar ? G.player.inCar.x : G.player.x, py = G.player.inCar ? G.player.inCar.y : G.player.y;
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x + px * s, y + py * sh, 4.5, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#ffd60a'; ctx.stroke();
  ctx.restore();
  ctx.fillStyle = '#fff'; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'left'; ctx.fillText('SUNFALL CITY', x + 6, y + size * 0.75 - 6);
}
export function drawHUD(ctx, G, W, H) {
  const p = G.player;
  ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.beginPath(); ctx.roundRect(W - 230, 12, 218, 86, 10); ctx.fill();
  ctx.fillStyle = '#06d6a0'; ctx.font = 'bold 24px sans-serif'; ctx.textAlign = 'right'; ctx.fillText('$ ' + p.money, W - 24, 42);
  drawStars(ctx, G.wanted.stars, W - 218, 70);
  ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.beginPath(); ctx.roundRect(12, H - 52, 230, 40, 8); ctx.fill();
  ctx.fillStyle = '#555'; ctx.fillRect(20, H - 40, 160, 14);
  ctx.fillStyle = p.hp > 30 ? '#06d6a0' : '#e63946'; ctx.fillRect(20, H - 40, 160 * Math.max(0, p.hp) / 100, 14);
  ctx.fillStyle = '#fff'; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'left'; ctx.fillText('NYAWA', 20, H - 44 + 28);
  ctx.fillStyle = '#ffd60a'; ctx.font = 'bold 12px sans-serif'; ctx.fillText(p.inCar ? '🚗 ' + 'MENGEMUDI' : (p.hasGun ? '🔫 PISTOL  ' + p.ammo : '👊 TINJU'), 188, H - 29);
  if (G.objective) {
    ctx.fillStyle = 'rgba(0,0,0,0.65)'; const tw = Math.min(560, G.objective.length * 8 + 40);
    ctx.beginPath(); ctx.roundRect(W / 2 - tw / 2, 12, tw, 36, 8); ctx.fill();
    ctx.fillStyle = '#ffd60a'; ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('🎯 ' + G.objective, W / 2, 35);
  }
  if (G.toast && G.toastT > 0) {
    ctx.globalAlpha = Math.min(1, G.toastT / 30);
    ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.beginPath(); ctx.roundRect(W / 2 - 190, 58, 380, 32, 8); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(G.toast, W / 2, 79);
    ctx.globalAlpha = 1;
  }
  if (G.nearCar && !p.inCar) {
    ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.beginPath(); ctx.roundRect(W / 2 - 130, H - 96, 260, 30, 8); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('[E] Masuk / Curi Mobil', W / 2, H - 76);
  }
  drawMinimap(ctx, G, W - 176, H - 150, 164);
}
export function drawDialog(ctx, G, W, H) {
  if (!G.dialogText) return;
  ctx.fillStyle = 'rgba(5,10,20,0.88)'; ctx.beginPath(); ctx.roundRect(60, H - 150, W - 260, 76, 12); ctx.fill();
  ctx.strokeStyle = '#ffd60a'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.font = '15px sans-serif'; ctx.textAlign = 'left';
  const words = G.dialogText.split(' '); let line = '', yy = H - 122;
  for (const w of words) { if ((line + w).length > 62) { ctx.fillText(line, 84, yy); yy += 20; line = ''; } line += w + ' '; }
  ctx.fillText(line, 84, yy);
  ctx.fillStyle = '#ffd60a'; ctx.font = 'bold 11px sans-serif'; ctx.fillText('Klik / Enter untuk lanjut ▸', W - 430, H - 84);
}
