// Story missions for Sunfall Heat: three jobs with dialogue and rewards.
export const MISSIONS = [
  {
    id: 'first-wheels', title: 'First Wheels', giver: 'Dewi — Marina Strip',
    intro: ['Dewi: Raka, mobil sport toska di Old Market itu kunci kita.', 'Dewi: Curi mobilnya, antar ke dermaga Harbor Point. Jangan sampai rusak!', 'Raka: Santai. Sunfall City hafal di luar kepala.'],
    outro: ['Dewi: Kerja bagus! Ini upahmu. Kota ini mulai mengenal namamu.'],
    reward: 250, targetDesc: 'Curi Sport Toska di Old Market',
    stealPos: { x: 1400, y: 1150 }, dropPos: { x: 2700, y: 1900 },
  },
  {
    id: 'hot-delivery', title: 'Hot Delivery', giver: 'Bima — Old Market',
    intro: ['Bima: Paket ini harus sampai ke Hotel Coral sebelum matahari terbenam.', 'Bima: Polisi lagi rajin patroli. Gas terus, jangan berhenti!', 'Raka: Paket aman bersamaku.'],
    outro: ['Bima: Tepat waktu! Sunfall Heat memang bisa diandalkan.'],
    reward: 400, targetDesc: 'Ambil paket lalu antar ke Hotel Coral',
    stealPos: { x: 1080, y: 900 }, dropPos: { x: 700, y: 500 },
  },
  {
    id: 'harbor-job', title: 'Harbor Job', giver: 'Sari — Harbor Point',
    intro: ['Sari: Temui aku di dermaga, lalu kabur sampai polisi kehilangan jejakmu.', 'Sari: Kalau bintangmu padam, pekerjaan selesai. Percaya instingmu.', 'Raka: Dermaga, lalu hilang ditelan senja. Siap.'],
    outro: ['Sari: Hilang tanpa jejak. Kamu legenda baru Sunfall City!'],
    reward: 600, targetDesc: 'Capai dermaga Harbor Point lalu hilangkan wanted',
    stealPos: { x: 2700, y: 1900 }, dropPos: { x: 2700, y: 1900 },
  },
];
export function createMissionState() {
  return { index: 0, phase: 'idle', dialog: [], dialogIdx: 0, completed: [], active: null, toast: '' };
}
export function startMission(ms) {
  const m = MISSIONS[ms.index];
  if (!m) return null;
  ms.active = m; ms.phase = 'intro'; ms.dialog = [...m.intro]; ms.dialogIdx = 0;
  return m;
}
export function advanceDialog(ms) {
  ms.dialogIdx++;
  if (ms.dialogIdx >= ms.dialog.length) {
    if (ms.phase === 'intro') ms.phase = ms.active.id === 'first-wheels' ? 'steal' : ms.active.id === 'hot-delivery' ? 'pickup' : 'goto';
    else if (ms.phase === 'outro') { ms.completed.push(ms.active.id); ms.index++; ms.active = null; ms.phase = 'idle'; }
    return true;
  }
  return false;
}
export function currentObjective(ms) {
  if (!ms.active) return ms.index < MISSIONS.length ? 'Pergi ke penanda kuning untuk mulai misi: ' + MISSIONS[ms.index].title : 'Semua misi selesai — jelajahi Sunfall City!';
  const m = ms.active;
  if (ms.phase === 'steal') return m.targetDesc;
  if (ms.phase === 'pickup') return 'Ambil paket di Old Market';
  if (ms.phase === 'deliver' || ms.phase === 'goto') return 'Antar ke tujuan (penanda kuning)';
  if (ms.phase === 'escape') return 'Kabur sampai bintang wanted padam!';
  if (ms.phase === 'drop') return 'Antar mobil ke Harbor Point';
  return m.title;
}
export function missionTarget(ms) {
  if (!ms.active) {
    const m = MISSIONS[ms.index];
    return m ? { x: m.stealPos.x, y: m.stealPos.y } : null;
  }
  const m = ms.active;
  if (ms.phase === 'steal' || ms.phase === 'pickup' || ms.phase === 'goto') return m.stealPos;
  return m.dropPos;
}
export function drawWorldMarker(ctx, target, cam, t) {
  if (!target) return;
  const x = target.x - cam.x, y = target.y - cam.y;
  const bob = Math.sin(t * 0.08) * 6;
  ctx.fillStyle = 'rgba(255,214,10,0.25)'; ctx.beginPath(); ctx.ellipse(x, y, 34, 12, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffd60a'; ctx.beginPath(); ctx.moveTo(x, y - 44 + bob); ctx.lineTo(x - 11, y - 62 + bob); ctx.lineTo(x + 11, y - 62 + bob); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#ffd60a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, 26 + Math.sin(t * 0.1) * 3, 0, Math.PI * 2); ctx.stroke();
}
export function drawOffscreenArrow(ctx, target, cam, W, H) {
  if (!target) return;
  const sx = target.x - cam.x, sy = target.y - cam.y;
  if (sx > 20 && sx < W - 20 && sy > 20 && sy < H - 20) return;
  const cx = W / 2, cy = H / 2;
  const a = Math.atan2(sy - cy, sx - cx);
  const ax = cx + Math.cos(a) * (W / 2 - 70), ay = cy + Math.sin(a) * (H / 2 - 70);
  ctx.save(); ctx.translate(ax, ay); ctx.rotate(a);
  ctx.fillStyle = '#ffd60a'; ctx.beginPath(); ctx.moveTo(16, 0); ctx.lineTo(-8, -9); ctx.lineTo(-8, 9); ctx.closePath(); ctx.fill();
  ctx.restore();
}
