// Deterministic screenshot scenes for Sunfall Heat: ?shot=start|drive|chase|mission&seed=N
export function parseShot() {
  const q = new URLSearchParams(location.search);
  const shot = q.get('shot');
  const seed = parseInt(q.get('seed') || '1', 10) || 1;
  return { shot, seed, active: !!shot };
}
export function setupShotScene(G, shot) {
  const p = G.player;
  if (shot === 'start') {
    G.state = 'title';
    p.x = 1080; p.y = 980; G.cam.x = p.x - 640; G.cam.y = p.y - 360;
  } else if (shot === 'drive') {
    G.state = 'playing';
    const car = G.traffic[0];
    car.x = 1080; car.y = 934; car.angle = 0; car.parked = false; car.color = '#e63946'; car.w = 48; car.h = 22;
    p.inCar = car; car.stolen = true;
    G.objective = 'Jelajahi Sunfall City — Marina Strip di selatan!';
    let i = 0;
    for (const c of G.traffic) { if (c === car) continue; i++; if (i <= 6) { c.x = 1080 + (i % 2 ? 160 + i * 60 : -180 - i * 55); c.y = i % 2 ? 866 : 934; c.angle = i % 2 ? Math.PI : 0; c.parked = false; } }
    for (let k = 0; k < 8 && k < G.peds.length; k++) { G.peds[k].x = 980 + k * 32; G.peds[k].y = 812 + (k % 2) * 8; }
    G.cam.x = car.x - 640; G.cam.y = car.y - 360;
  } else if (shot === 'chase') {
    G.state = 'playing';
    const car = G.traffic[1];
    car.x = 1740; car.y = 1460; car.angle = 0; car.parked = false; car.color = '#e63946'; car.w = 48; car.h = 22;
    p.inCar = car; car.stolen = true;
    G.wanted.stars = 3; G.wanted.heat = 95;
    G.objective = 'Kabur dari polisi! Hilangkan bintang wanted';
    G.policeCars = G.spawnCops(3, car);
    G.policeCars[0].x = 1600; G.policeCars[0].y = 1426; G.policeCars[0].angle = 0.15;
    G.policeCars[1].x = 1615; G.policeCars[1].y = 1498; G.policeCars[1].angle = -0.1;
    G.policeCars[2].x = 1875; G.policeCars[2].y = 1462; G.policeCars[2].angle = Math.PI;
    G.officers = G.spawnOfficers(2, car);
    G.officers[0].x = 1690; G.officers[0].y = 1398;
    G.officers[1].x = 1805; G.officers[1].y = 1530;
    let i = 0;
    for (const c of G.traffic) { if (c === car) continue; i++; if (i <= 5) { c.x = 1740 + i * 110 - 200; c.y = 1392 + (i % 2) * 130; c.angle = i % 2 ? 0 : Math.PI; c.parked = false; } }
    for (let k = 0; k < 6 && k < G.peds.length; k++) { G.peds[k].x = 1620 + k * 36; G.peds[k].y = 1350; G.peds[k].flee = 80; }
    G.cam.x = car.x - 640; G.cam.y = car.y - 360;
  } else if (shot === 'mission') {
    G.state = 'playing';
    p.x = 1352; p.y = 1212; p.inCar = null;
    G.startMissionByIndex(0);
    G.mission.phase = 'steal';
    G.dialogText = 'Dewi: Curi mobilnya, antar ke dermaga Harbor Point. Jangan sampai rusak!';
    G.objective = 'First Wheels: Curi Sport Toska di Old Market';
    const spot = G.traffic.find(c => c.parked && Math.abs(c.x - 1400) < 6 && Math.abs(c.y - 1150) < 6) || G.traffic.find(c => c.parked) || G.traffic[2];
    spot.x = 1400; spot.y = 1150; spot.color = '#06d6a0'; spot.parked = true; spot.w = 48; spot.h = 22; spot.angle = 0;
    for (let k = 0; k < 6 && k < G.peds.length; k++) { G.peds[k].x = 1230 + k * 30; G.peds[k].y = 1005 + (k % 3) * 22; }
    G.cam.x = p.x - 640; G.cam.y = p.y - 400;
  }
  G.frozen = true;
}
