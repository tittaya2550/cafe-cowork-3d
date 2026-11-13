// Scene data in metres. Lot is x: 0..16 (width), y: 0..38 (depth from road), z up.
// Edit dimensions here; app.js only renders. Every item belongs to a group that the UI can toggle:
//   site | cars | l1 (ground floor) | l2 (level 2 slab, walls, furniture) | roof
// Lot ~31 m along the road x ~19.5 m deep, read off the LandsMaps parcel lines (+-2 m, not a survey).
window.LOT = { width: 31, depth: 19.5 };
// The building + deck are authored in their own frame (footprint x 1..15, y 21..34) and shifted by BLDG,
// so the footprint sits at x 15..29, y 4.5..17.5: 2 m clear to the east and back boundaries.
window.BLDG = { dx: 14, dy: -16.5 };

// Real location (Google Maps pin). `facing` = compass bearing the road frontage looks at,
// measured off the satellite image: the road runs WNW-ESE and the lot sits on its south side.
// So +y (depth) points to bearing facing+180 and +x points to bearing facing+90 (roughly east).
window.SITE = { lat: 16.7671944, lon: 100.2713889, tz: 7, facing: 16 };

window.LEVELS = { G: 0.15, F2: 3.95, H1: 3.5, H2: 3.0, ROOF: 6.95 };

// Ground-floor café zones (u, v = metres from the building's front-west corner).
// Target split for a café this size: ~60% seating, ~25% bar + kitchen, ~15% WC + stair.
window.ZONES1 = [
  { name: 'ที่นั่งลูกค้า 37 ที่นั่ง + ทางเดิน', area: 107.6, u: 3.6, v: 2.3 },
  { name: 'บาร์ + ตู้เค้ก ตู้ขนม', area: 12, u: 6.6, v: 5.8 },
  { name: 'ครัวขนม', area: 13.6, u: 8.3, v: 11.3 },
  { name: 'ห้องเก็บของ (คั่นห้องน้ำกับครัว)', area: 4.8, u: 6, v: 12.4 },
  { name: 'ห้องประชุมย่อยสำหรับลูกค้า 10 ที่นั่ง', area: 22.4, u: 11.4, v: 10.0 },
  { name: 'ห้องน้ำ 2 ห้อง + โซนล้างมือ', area: 11.6, u: 3.9, v: 10.6 },
  { name: 'บันไดขึ้นออฟฟิศ', area: 10, u: 1.3, v: 9.6 }
];

// Level-2 rooms. Used for labels + legend.
window.ROOMS = [
  { name: 'โต๊ะทำงานริมกระจก 8 ที่ + Freedom space', area: 67.5, u: 5.2, v: 2.3 },
  { name: 'ห้องผู้บริหาร', area: 17.5, u: 11.5, v: 0.9 },
  { name: 'ห้องประชุม 8 ที่นั่ง', area: 20, u: 11.5, v: 4.1 },
  { name: 'ทางเดิน', area: 16.5, u: 8.4, v: 8.25 },
  { name: 'ห้องนอน + ห้องน้ำในตัว', area: 20, u: 12.9, v: 9.6 },
  { name: 'ห้องน้ำ', area: 12, u: 7.5, v: 11.4 },
  { name: 'แพนทรี (มินิครัว) + ล็อกเกอร์', area: 14, u: 4.3, v: 10.4 },
  { name: 'โถงบันได + ชั้นวางรองเท้า', area: 14.5, u: 1.7, v: 8.25 }
];

window.buildModel = function () {
  var items = [];
  var L = window.LEVELS, G = L.G, F2 = L.F2, i, j;

  var OX = 0, OY = 0;                       // current frame offset: 0 for the site, BLDG for the building
  function box(g, x, y, w, d, h, z, m, o) { items.push({ t: 'box', g: g, x: x + OX, y: y + OY, w: w, d: d, h: h, z: z || 0, m: m, rx: o && o.rx, rz: o && o.rz }); }
  function flat(g, x, y, w, d, m, z) { box(g, x, y, w, d, (z || 0.02), 0, m); }
  function cyl(g, x, y, r, h, z, m) { items.push({ t: 'cyl', g: g, x: x + OX, y: y + OY, r: r, h: h, z: z, m: m }); }
  function sph(g, x, y, z, r, m) { items.push({ t: 'sph', g: g, x: x + OX, y: y + OY, z: z, r: r, m: m }); }

  // Wall along 'x' (at y = c) or along 'y' (at x = c), from a0 to a1, with openings
  // [{ a, b, sill, head, glass }]. Openings without glass are doorways.
  function wall(g, axis, c, a0, a1, z0, h, m, ops, t) {
    t = t || 0.2;
    function seg(a, b, zb, hh, mm, tt) {
      if (b - a < 0.01 || hh < 0.01) return;
      if (axis === 'x') box(g, a, c - tt / 2, b - a, tt, hh, zb, mm); else box(g, c - tt / 2, a, tt, b - a, hh, zb, mm);
    }
    var cur = a0;
    (ops || []).forEach(function (o) {
      var sill = o.sill || 0, head = o.head == null ? h : o.head;
      seg(cur, o.a, z0, h, m, t);
      seg(o.a, o.b, z0, sill, m, t);
      seg(o.a, o.b, z0 + head, h - head, m, t);
      if (o.glass) {
        seg(o.a, o.b, z0 + sill, head - sill, 'glass', 0.03);
        seg(o.a, o.b, z0 + sill, 0.05, 'steel', 0.07); seg(o.a, o.b, z0 + head - 0.05, 0.05, 'steel', 0.07);
        seg(o.a, o.a + 0.05, z0 + sill, head - sill, 'steel', 0.07); seg(o.b - 0.05, o.b, z0 + sill, head - sill, 'steel', 0.07);
      }
      cur = o.b;
    });
    seg(cur, a1, z0, h, m, t);
  }
  // Full-height glazing with thin black steel mullions.
  function glazing(g, axis, c, a0, a1, z0, h, step) {
    wall(g, axis, c, a0, a1, z0, h, 'steel', [{ a: a0, b: a1, glass: true }], 0.06);
    for (var a = a0 + step; a < a1 - 0.2; a += step) {
      if (axis === 'x') box(g, a - 0.03, c - 0.05, 0.06, 0.1, h, z0, 'steel'); else box(g, c - 0.05, a - 0.03, 0.1, 0.06, h, z0, 'steel');
    }
  }
  function chair(g, x, y, z, back, m) { // back = side the backrest is on: n (-y), s (+y), w (-x), e (+x)
    box(g, x, y, 0.45, 0.45, 0.06, z + 0.4, m || 'fabric');
    box(g, x + 0.2, y + 0.2, 0.05, 0.05, 0.4, z, 'steel');
    if (back === 'n') box(g, x, y, 0.45, 0.05, 0.42, z + 0.46, m || 'fabric');
    if (back === 's') box(g, x, y + 0.4, 0.45, 0.05, 0.42, z + 0.46, m || 'fabric');
    if (back === 'w') box(g, x, y, 0.05, 0.45, 0.42, z + 0.46, m || 'fabric');
    if (back === 'e') box(g, x + 0.4, y, 0.05, 0.45, 0.42, z + 0.46, m || 'fabric');
  }
  function table(g, x, y, w, d, z, h) {
    box(g, x, y, w, d, 0.05, z + (h || 0.72), 'oak');
    box(g, x + w / 2 - 0.04, y + d / 2 - 0.04, 0.08, 0.08, (h || 0.72), z, 'steel');
  }
  // Detailed props are built by props.js; here we only say what goes where.
  var seed = 1;
  function prop(g, k, x, y, z, rot, a) { a = a || {}; a.seed = seed++; items.push({ t: 'prop', g: g, k: k, x: x + OX, y: y + OY, z: z || 0, rot: rot || 0, a: a }); }
  function tree(x, y, h, r) { prop('site', 'tree', x, y, 0, seed * 47, { h: h, r: r }); }
  function car(x, y, paint) { prop('cars', 'car', x + 0.9, y, 0.07, 0, { paint: paint }); }
  function pendants(g, xs, y, top, drop) { xs.forEach(function (x) { prop(g, 'pendant', x, y, top, 0, { drop: drop }); }); }

  // ---------- Surroundings ----------
  var LW = window.LOT.width, LD = window.LOT.depth, B = window.BLDG;
  flat('site', -60, -60, 152, 150, 'field', 0.005);
  flat('site', -60, -6.5, 152, 6.5, 'road', 0.02);
  flat('site', -60, -0.9, 152, 0.9, 'gravel', 0.025); flat('site', -60, -7.4, 152, 0.9, 'gravel', 0.025);   // road shoulders
  flat('site', -60, -3.4, 152, 0.12, 'lineY', 0.03);
  flat('site', 0, 0, LW, LD, 'paving', 0.03);
  [-44, -10, 24, 58].forEach(function (px) { prop('site', 'pole', px, -8.2, 0, 0); });
  [-0.75, 0, 0.75].forEach(function (dz) { box('site', -60, -8.2 + dz - 0.01, 152, 0.02, 0.02, 8.68, 'steel'); });
  prop('site', 'house', -7.5, 8, 0, 6, { w: 8, d: 12, roof: '#A5623F' });                 // existing neighbour hard on the west boundary
  prop('site', 'house', 46, 5, 0, -4, { w: 9, d: 8, h: 3, wall: '#DDE3E6', roof: '#5F7FA8' });
  prop('site', 'house', 42, 34, 0, 8, { w: 10, d: 9, roof: '#8C5A3C' });

  // Lot is wide and shallow, so parking sits beside the building (west), not in front of it.
  // West strip x 0-3: sign green, motorcycles, back-of-house yard | aisle x 3-9 | bays x 9-14 | path x 14-15 | building x 15-29 | east garden x 29-31
  flat('site', 0, 0, 3, 2.2, 'grass', 0.06); flat('site', 9, 0, 22, 1.0, 'grass', 0.06); flat('site', 9, 1.0, 5, 1.2, 'grass', 0.06);
  flat('site', 3, -0.2, 6, LD + 0.2, 'asphalt', 0.07);                                    // 6 m aisle, entered straight from the road
  flat('site', 9, 2.2, 5, 16, 'asphalt', 0.07);                                           // 5 standard + 1 accessible bay, noses to the building
  for (i = 0; i <= 5; i++) flat('site', 9, (i ? 3.2 + i * 2.5 : 2.2) - 0.05, 5, 0.1, 'line', 0.08);
  flat('site', 9, 18.15, 5, 0.1, 'line', 0.08);
  flat('site', 9.05, 2.3, 4.9, 3.3, 'bluebay', 0.08);
  var bays = [3.95, 6.95, 9.45, 11.95, 14.45, 16.95];
  bays.forEach(function (by) { box('site', 13.55, by - 0.8, 0.16, 1.6, 0.11, 0.07, 'concrete'); });   // wheel stops
  flat('site', 9, 18.2, 5, 1.3, 'grass', 0.06);
  flat('site', 0, 2.2, 3, 9.8, 'paving', 0.08);                                           // motorcycles, 7 slots
  for (i = 0; i <= 7; i++) flat('site', 0.2, 2.25 + i * 1.37, 2.6, 0.06, 'line', 0.09);
  box('site', 9, 0.95, 22, 0.15, 0.14, 0, 'curb'); box('site', 0, 2.1, 3, 0.15, 0.14, 0, 'curb'); box('site', 8.9, 1.0, 0.15, 1.2, 0.14, 0, 'curb');
  [4, 9, 14].forEach(function (by) { cyl('site', 3.15, by, 0.06, 0.8, 0, 'steel'); box('site', 3.08, by - 0.07, 0.14, 0.14, 0.1, 0.8, 'lamp'); });
  [6, 11, 16].forEach(function (by) { cyl('site', 14.5, by, 0.06, 0.8, 0, 'steel'); box('site', 14.43, by - 0.07, 0.14, 0.14, 0.1, 0.8, 'lamp'); });

  flat('site', 14, 1, 1.05, LD - 1, 'paving', 0.075);                                     // path: parking -> ramp + cafe deck / back of house
  box('site', 14.9, 2.0, 1.15, 1.4, 0.04, 0.09, 'concrete', { rz: 0.07 });                // wheelchair ramp up to the deck, beside the accessible bay
  box('site', 14.9, 1.95, 1.15, 0.05, 0.9, 0.07, 'steel'); box('site', 14.9, 3.4, 1.15, 0.05, 0.9, 0.07, 'steel');
  flat('site', 29, 1, 2, LD - 1, 'grass', 0.06);                                          // east garden strip (2 m, needed for the east windows)
  flat('site', 15, 17.5, 14, 2, 'paving', 0.05);                                          // back service path (2 m)

  // Back-of-house yard in the SW corner: reachable by a pickup from the aisle
  flat('site', 0, 12.3, 3, 7.2, 'paving', 0.085);
  box('site', 0.1, 16.9, 2.8, 0.1, 1.5, 0, 'bound'); box('site', 0.05, 16.85, 2.9, 2.6, 0.06, 1.5, 'steel');
  box('site', 0.4, 17.9, 0.9, 0.8, 1.0, 0, 'binG'); box('site', 1.6, 17.9, 0.9, 0.8, 1.0, 0, 'binG');
  cyl('site', 1.4, 14.9, 0.8, 2.0, 0.05, 'steelL'); box('site', 1.1, 13.2, 0.55, 0.4, 0.45, 0.05, 'steel');
  // behind the kitchen: grease trap, treatment tank covers, AC condensers along the back wall
  box('site', 25.2, 18.3, 1.3, 0.8, 0.04, 0.05, 'steelL'); cyl('site', 27.3, 18.7, 0.38, 0.05, 0.05, 'concrete'); cyl('site', 28.2, 18.7, 0.38, 0.05, 0.05, 'concrete');
  for (i = 0; i < 4; i++) box('site', 17.6 + i * 1.2, 17.6, 0.9, 0.35, 0.7, 0.1, 'white');
  box('site', 14.25, 0.25, 0.45, 0.28, 1.3, 0.3, 'steelL');                               // electricity meter + main board

  // Boundary walls (west, east, back) + sign wall by the driveway
  box('site', -0.15, 2.2, 0.15, LD - 2.2, 1.6, 0, 'bound'); box('site', LW, 1, 0.15, LD - 1, 1.6, 0, 'bound'); box('site', -0.15, LD, LW + 0.3, 0.15, 1.6, 0, 'bound');
  box('site', 9.6, 0.3, 3.6, 0.3, 1.6, 0, 'steel'); box('site', 9.9, 0.26, 3, 0.04, 0.6, 0.75, 'sign'); box('site', 9.6, 0.2, 3.6, 0.5, 0.06, 1.6, 'oak');

  // Planting
  tree(1.5, 1.0, 2.8, 1.4); tree(11.5, 18.9, 2.4, 1.1); tree(30, 4, 2.4, 1.0); tree(30, 10.5, 2.6, 1.1); tree(30, 16.5, 2.2, 0.9); tree(21.5, 0.45, 2.6, 1.0);
  for (i = 0; i < 16; i++) if (i < 6 || i > 8) prop('site', 'plant', 15.6 + i * 0.85, 0.45, 0.05, i * 50, { h: 0.85, ground: true });
  for (i = 0; i < 12; i++) prop('site', 'plant', 30.5, 1.8 + i * 1.5, 0.05, i * 61, { h: 0.7, ground: true });
  tree(-14, -1, 3.2, 2.0); tree(-15, 26, 3.6, 2.3); tree(38, 12, 3.4, 2.1); tree(35, 24, 3.0, 1.8); tree(48, 20, 3.8, 2.4);
  tree(-6, -12, 3.4, 2.2); tree(28, -13, 3.8, 2.4); tree(44, -11, 3.2, 2.0); tree(8, 30, 3.6, 2.3); tree(-10, 34, 3.0, 1.9); tree(24, 28, 3.2, 2.0);

  // Cars (noses toward the building) + motorcycles + people
  var paints = [null, '#D9DADB', '#33414F', null, '#8F2B2B', '#F1F1EF'];
  bays.forEach(function (by, n) { if (paints[n]) prop('cars', 'car', 13.75, by, 0.07, 90, { paint: paints[n] }); });
  var mp = ['#2B2D30', '#A8322D', '#E7E7E4', '#2F4A6B', '#2B2D30'];
  for (i = 0; i < 5; i++) prop('cars', 'moto', 2.5, 2.95 + (i < 3 ? i : i + 1) * 1.37, 0.09, 90 + (i % 2 ? 4 : -3), { paint: mp[i] });
  prop('site', 'person', 6.2, 8.5, 0.07, 20); prop('site', 'person', 6.8, 8.2, 0.07, 150);

  // ---- from here on everything is in the building frame ----
  OX = B.dx; OY = B.dy;
  box('site', 2, 17.4, 12, 3.4, 0.15, 0, 'deck');                                         // deck in front of the cafe, facing the road
  for (i = 0; i < 3; i++) {
    table('site', 3.3 + i * 3.4, 18.6, 0.9, 0.9, 0.15);
    chair('site', 2.7 + i * 3.4, 18.8, 0.15, 'w', 'oak'); chair('site', 4.35 + i * 3.4, 18.8, 0.15, 'e', 'oak');
    chair('site', 3.52 + i * 3.4, 17.95, 0.15, 'n', 'oak'); chair('site', 3.52 + i * 3.4, 19.65, 0.15, 's', 'oak');
    prop('site', 'umbrella', 3.75 + i * 3.4, 19.05, 0.15);
  }
  [2.05, 13.2].forEach(function (px) { box('site', px, 17.5, 0.75, 0.45, 0.5, 0.15, 'oak'); prop('site', 'plant', px + 0.2, 17.72, 0.6, 0, { h: 0.9, ground: true }); prop('site', 'plant', px + 0.55, 17.72, 0.6, 40, { h: 0.8, ground: true }); });
  prop('site', 'person', 9.1, 20.35, 0.15, 200);

  // ---------- Ground floor: café (building frame: 14 x 13 m at x 1..15, y 21..34) ----------
  box('l1', 1, 21, 14, 13, G, 0, 'concrete');
  // Columns: front and back rows, plus a middle row pulled back into the kitchen / back-room wall line (y 29.85) so
  // nothing stands at the bar counter or in the open floor. Front bay then spans ~8.9 m (deeper beams, no centre post).
  [[1, 21], [7.85, 21], [14.7, 21], [1, 29.85], [7.45, 29.85], [14.7, 29.85], [1, 33.7], [7.85, 33.7], [14.7, 33.7]].forEach(function (c) {
    box('l1', c[0], c[1], 0.3, 0.3, L.H1, G, 'wall'); box('l2', c[0], c[1], 0.3, 0.3, L.H2, F2, 'wall');
  });
  glazing('l1', 'x', 21.05, 1.3, 14.7, G, L.H1, 1.9);                                  // north front: all glass
  glazing('l1', 'y', 14.95, 21.3, 29, G, L.H1, 1.9);                                   // east: morning light
  wall('l1', 'y', 14.9, 29, 34, G, L.H1, 'wall', [{ a: 30.6, b: 33.2, sill: 0.9, head: 2.6, glass: true }]);   // conference room window
  wall('l1', 'y', 1.1, 21.3, 34, G, L.H1, 'wall', [{ a: 21.8, b: 25.6, sill: 0.9, head: 2.8, glass: true }]);   // west: mostly solid, no outside door
  wall('l1', 'x', 33.9, 1, 15, G, L.H1, 'wall', [{ a: 8.6, b: 9.5, head: 2.1 }]);                                 // kitchen service door
  var fy;
  box('l1', 4, 19.6, 8, 1.45, 0.12, 3.25, 'steel');                                   // entrance canopy
  box('l1', 0.95, 20.95, 14.1, 13.1, 0.14, 0, 'plinth');                              // dark base course
  box('l1', 6.9, 20.98, 0.08, 0.12, 2.5, G, 'steel'); box('l1', 9.02, 20.98, 0.08, 0.12, 2.5, G, 'steel'); box('l1', 6.9, 20.98, 2.2, 0.12, 0.08, G + 2.45, 'steel'); // door frame
  box('l1', 7.96, 20.98, 0.06, 0.1, 2.45, G, 'steel');
  box('l1', 7.8, 20.9, 0.04, 0.05, 0.9, G + 0.7, 'steelL'); box('l1', 8.16, 20.9, 0.04, 0.05, 0.9, G + 0.7, 'steelL');                                          // pull handles
  box('l1', 6.6, 19.9, 2.8, 1.1, 0.03, 0.03, 'carpet');                                                                                                      // entrance mat
  cyl('l1', 0.92, 33.9, 0.05, 6.8, 0.1, 'white'); cyl('l1', 15.08, 33.9, 0.05, 6.8, 0.1, 'white');                                                           // downpipes
  box('l1', 5.2, 19.75, 0.12, 0.12, 0.06, 3.19, 'lamp'); box('l1', 8, 19.75, 0.12, 0.12, 0.06, 3.19, 'lamp'); box('l1', 10.7, 19.75, 0.12, 0.12, 0.06, 3.19, 'lamp'); // canopy downlights

  // Back strip: compact stair | 2 WC | store room (buffer) | pastry kitchen || mini conference room (east end, runs to y 28.4)
  // Rule from the owner: neither the kitchen nor the conference room may share a wall with the WC.
  wall('l1', 'x', 30, 1.2, 11, G, L.H1, 'wall', [
    { a: 1.3, b: 2.25, head: 2.1 },                                                    // key-card door: the only way up to the office
    { a: 4.5, b: 5.4, head: 2.1 },                                                     // one entrance to the shared washroom
    { a: 7.9, b: 9.6, sill: 1.1, head: 2.0 },                                          // pastry pass
    { a: 10.0, b: 10.8, head: 2.1 }], 0.12);                                           // kitchen door behind the bar
  wall('l1', 'y', 3.5, 30, 33.8, G, L.H1, 'wall', null, 0.12);
  wall('l1', 'y', 6.4, 30, 33.8, G, L.H1, 'wall', null, 0.12);                         // WC | store
  wall('l1', 'y', 7.6, 30, 33.8, G, L.H1, 'wall', [{ a: 31.6, b: 32.4, head: 2.1 }], 0.1);   // store | kitchen (store opens from the kitchen only)
  wall('l1', 'y', 11, 28.4, 33.8, G, L.H1, 'wall', null, 0.12);                        // kitchen + bar | conference
  wall('l1', 'x', 28.4, 11, 14.8, G, L.H1, 'wall', [{ a: 11.2, b: 13.5, glass: true }, { a: 13.7, b: 14.6, head: 2.1 }], 0.12); // conference glass front + door
  box('l1', 3.5, 30, 2.9, 3.8, 0.02, G, 'tile'); box('l1', 6.4, 30, 4.6, 3.8, 0.02, G, 'tile'); box('l1', 11, 28.4, 3.8, 5.4, 0.02, G, 'carpet');
  // shared washroom like the office one upstairs: 2 cubicles at the back, separate hand-wash counter in front
  wall('l1', 'y', 4.95, 31.9, 33.8, G, 2.0, 'white', null, 0.05);
  wall('l1', 'x', 31.9, 3.56, 6.34, G, 2.0, 'white', [{ a: 3.9, b: 4.6, head: 2.0 }, { a: 5.3, b: 6.0, head: 2.0 }], 0.05);
  box('l1', 4.05, 33.15, 0.4, 0.6, 0.42, G, 'white'); box('l1', 5.45, 33.15, 0.4, 0.6, 0.42, G, 'white');
  box('l1', 3.6, 30.2, 0.5, 1.5, 0.85, G, 'white'); box('l1', 3.6, 30.2, 0.52, 1.5, 0.04, G + 0.85, 'oak'); box('l1', 3.57, 30.3, 0.03, 1.3, 0.8, G + 1.1, 'steelL');   // 2 basins + mirror
  box('l1', 3.68, 30.4, 0.34, 0.4, 0.1, G + 0.89, 'white'); box('l1', 3.68, 31.1, 0.34, 0.4, 0.1, G + 0.89, 'white');
  for (var sy = 0; sy < 8; sy++) box('l1', 3.7 + sy * 0.38, 28.6, 0.08, 0.12, 2.3, G, 'oak'); // slat screen hiding the WC doors
  box('l1', 6.55, 21.15, 0.18, 0.14, 0.5, G + 0.9, 'red');   // fire extinguisher by the entrance (the one in front of the counter moved into the kitchen)
  box('l1', 10.75, 30.2, 0.14, 0.18, 0.5, G + 0.9, 'red');
  // compact U-stair: 1.0 m flights, 20 risers
  for (i = 0; i < 10; i++) box('l1', 1.3, 30.4 + i * 0.24, 1.0, 0.24, G + 0.19 * (i + 1), 0, 'concrete');
  box('l1', 1.3, 32.8, 2.1, 1.0, 0.15, 1.9, 'concrete');
  for (j = 0; j < 10; j++) box('l1', 2.4, 32.8 - (j + 1) * 0.24, 1.0, 0.24, 0.25, 2.05 + 0.19 * (j + 1) - 0.25, 'concrete');
  box('l1', 2.3, 30.64, 0.1, 1.9, F2 - G, G, 'wall');                                  // stair spine wall
  // store room: dry goods + cleaning shelves
  box('l1', 6.5, 30.2, 0.35, 3.4, 2.0, G, 'white');
  // pastry kitchen: oven, fridge, work table, counter run, sink
  box('l1', 7.7, 33.05, 0.8, 0.7, 1.9, G, 'steelL'); box('l1', 7.7, 30.15, 0.7, 0.7, 1.9, G, 'steelL');
  box('l1', 8.7, 31.4, 1.4, 0.8, 0.9, G, 'steelL'); box('l1', 10.35, 30.9, 0.55, 2.8, 0.9, G, 'steelL'); box('l1', 9.6, 33.2, 0.7, 0.55, 0.9, G, 'steelL');
  box('l1', 10.6, 31.0, 0.3, 2.6, 0.04, G + 1.5, 'white');
  // mini conference room for customers: 10 seats, screen on the back wall, east daylight
  box('l1', 12.4, 29.6, 1.1, 3.0, 0.05, G + 0.7, 'oak'); box('l1', 12.85, 30.0, 0.2, 2.2, 0.7, G, 'steel');
  for (i = 0; i < 4; i++) { chair('l1', 11.75, 29.75 + i * 0.7, G, 'w'); chair('l1', 13.6, 29.75 + i * 0.7, G, 'e'); }
  chair('l1', 12.72, 29.0, G, 'n'); chair('l1', 12.72, 32.7, G, 's');
  box('l1', 12.1, 33.72, 1.6, 0.06, 0.9, G + 1.1, 'steel');
  pendants('l1', [12.95], 30.4, G + L.H1, 1.35); pendants('l1', [12.95], 31.8, G + L.H1, 1.35);

  // Bar in front of the kitchen: cake case - till - pastry case - pickup, 1.25 m work aisle, back bar with the espresso machine
  box('l1', 7.0, 27.4, 3.0, 0.7, 1.0, G, 'oak'); box('l1', 6.9, 27.3, 3.2, 0.85, 0.05, G + 1.0, 'white');
  box('l1', 7.0, 28.1, 0.6, 1.25, 1.0, G, 'oak'); box('l1', 6.9, 28.1, 0.75, 1.3, 0.05, G + 1.0, 'white');
  box('l1', 7.0, 29.35, 2.8, 0.58, 0.9, G, 'white'); box('l1', 7.0, 29.35, 2.8, 0.6, 0.04, G + 0.9, 'oak');
  // small upright cake case: 2 glass shelves with whole cakes
  box('l1', 7.1, 27.45, 0.6, 0.55, 0.62, G + 1.05, 'glass'); box('l1', 7.1, 27.45, 0.6, 0.55, 0.03, G + 1.67, 'steel'); box('l1', 7.12, 27.47, 0.56, 0.51, 0.015, G + 1.34, 'steelL');
  cyl('l1', 7.28, 27.72, 0.1, 0.08, G + 1.06, 'art'); cyl('l1', 7.54, 27.72, 0.1, 0.08, G + 1.06, 'white');
  cyl('l1', 7.28, 27.72, 0.1, 0.08, G + 1.355, 'white'); cyl('l1', 7.54, 27.72, 0.1, 0.08, G + 1.355, 'oak');
  box('l1', 8.3, 27.5, 0.3, 0.25, 0.3, G + 1.05, 'steel');                                                             // till 
  box('l1', 8.75, 27.45, 1.1, 0.55, 0.45, G + 1.05, 'glass'); box('l1', 8.75, 27.45, 1.1, 0.55, 0.03, G + 1.5, 'steel'); // pastry case
  box('l1', 8.9, 29.4, 0.6, 0.48, 0.45, G + 0.94, 'steelL'); box('l1', 8.4, 29.45, 0.25, 0.25, 0.4, G + 0.94, 'steel'); // espresso + grinder on the back bar
  box('l1', 7.9, 29.86, 1.7, 0.08, 0.5, G + 2.2, 'steel');                                                             // menu board
  pendants('l1', [7.5, 8.5, 9.5], 27.75, G + L.H1, 1.25);
  prop('l1', 'person', 8.6, 28.75, G, 180); prop('l1', 'person', 8.4, 26.5, G, 5); prop('l1', 'person', 8.9, 25.9, G, 20);

  // Seating 37, three table types
  function two(x, y) { table('l1', x, y, 0.7, 0.7, G); chair('l1', x - 0.55, y + 0.12, G, 'w', 'oak'); chair('l1', x + 0.8, y + 0.12, G, 'e', 'oak'); }
  function four(x, y) {
    table('l1', x, y, 0.8, 0.8, G);
    chair('l1', x - 0.55, y + 0.18, G, 'w', 'oak'); chair('l1', x + 0.9, y + 0.18, G, 'e', 'oak');
    chair('l1', x + 0.18, y - 0.55, G, 'n', 'oak'); chair('l1', x + 0.18, y + 0.9, G, 's', 'oak');
  }
  // 1) tables for two: 6 tables = 12 seats, all in groups (none stranded in front of the conference door)
  two(2.2, 21.8); two(4.7, 21.8);
  [23.2, 24.9].forEach(function (ty) { two(10.0, ty); two(12.0, ty); });            // east block: 2 rows of 2, clear floor in front of the conference room
  // 2) tables for four: 4 tables = 16 seats
  four(2.3, 24.2); four(4.7, 24.2); four(2.3, 26.6); four(4.7, 26.6);
  pendants('l1', [2.7, 5.1], 24.6, G + L.H1, 1.45); pendants('l1', [2.7, 5.1], 27.0, G + L.H1, 1.45);
  // 3) high counter for single seats, L-shaped along the glass at the north-east corner: 9 stools
  box('l1', 14.3, 21.3, 0.45, 5.7, 0.05, G + 1.0, 'oak'); box('l1', 9.7, 21.3, 4.6, 0.45, 0.05, G + 1.0, 'oak');
  [21.4, 24.1, 26.9].forEach(function (cy) { box('l1', 14.5, cy, 0.05, 0.05, 1.0, G, 'steel'); });
  [9.75, 12.0].forEach(function (cx) { box('l1', cx, 21.5, 0.05, 0.05, 1.0, G, 'steel'); });
  for (i = 0; i < 5; i++) cyl('l1', 13.95, 22.9 + i * 0.95, 0.17, 0.72, G, 'steel');
  for (i = 0; i < 4; i++) cyl('l1', 10.2 + i * 0.95, 22.1, 0.17, 0.72, G, 'steel');
  // decorative pots (small / medium) in the corners
  prop('l1', 'plant', 1.5, 21.5, G, 0, { h: 0.7 }); prop('l1', 'plant', 1.5, 28.2, G, 40, { h: 0.55 }); prop('l1', 'plant', 14.45, 27.6, G, 70, { h: 0.6 }); prop('l1', 'plant', 9.2, 21.5, G, 20, { h: 0.5 });

  // ---------- Night mode extras (group 'night'): the cafe turns into a relaxed cafe-and-bar ----------
  // festoon lights over the deck
  [17.75, 20.45].forEach(function (ly) {
    box('night', 2.2, ly, 11.6, 0.012, 0.012, 2.82, 'steel');
    for (i = 0; i < 17; i++) sph('night', 2.4 + i * 0.7, ly, 2.74 - 0.1 * Math.sin(i / 16 * Math.PI), 0.05, 'lamp');
  });
  box('night', 4, 19.62, 8, 0.04, 0.04, 3.2, 'amber');                                   // warm strip under the canopy edge
  box('night', 7.0, 27.36, 3.0, 0.03, 0.05, G + 0.08, 'neon');                           // LED strip under the bar front
  box('night', 9.72, 21.78, 4.55, 0.03, 0.04, G + 0.93, 'amber'); box('night', 14.26, 21.3, 0.03, 5.7, 0.04, G + 0.93, 'amber'); // under the high counter
  box('night', 8.0, 29.8, 1.5, 0.04, 0.28, G + 2.31, 'neon');                            // neon sign above the back bar
  box('night', 7.05, 29.9, 1.25, 0.03, 0.4, G + 0.96, 'amber');                          // bottle shelf backlight
  ['bottleG', 'bottleA', 'bottleC', 'bottleA', 'bottleG', 'bottleC', 'bottleA'].forEach(function (bm, n) {
    cyl('night', 7.14 + n * 0.17, 29.78, 0.035, 0.26, G + 0.94, bm); cyl('night', 7.14 + n * 0.17, 29.78, 0.014, 0.08, G + 1.2, bm);
  });
  // candle lights on every table
  [[2.55, 22.15], [5.05, 22.15], [10.35, 23.55], [12.35, 23.55], [10.35, 25.25], [12.35, 25.25], [2.7, 24.6], [5.1, 24.6], [2.7, 27.0], [5.1, 27.0]].forEach(function (c) {
    box('night', c[0] - 0.04, c[1] - 0.04, 0.08, 0.08, 0.09, G + 0.78, 'lamp');
  });
  for (i = 0; i < 3; i++) box('night', 3.71 + i * 3.4, 19.01, 0.08, 0.08, 0.09, 0.92, 'lamp');   // deck tables

  // ---------- Level 2: company office (u = x - 1, v = y - 21) ----------
  box('l2', 0.8, 20.6, 14.4, 9.8, 0.3, 3.65, 'slab');                    // stair opening: x 1.2-3.5, y 30.4-33.8
  box('l2', 3.5, 30.4, 11.7, 3.8, 0.3, 3.65, 'slab');
  box('l2', 0.8, 30.4, 0.4, 3.8, 0.3, 3.65, 'slab'); box('l2', 0.8, 33.8, 2.7, 0.4, 0.3, 3.65, 'slab');
  // floor finishes
  box('l2', 1.2, 21.1, 8.8, 7.4, 0.02, F2, 'oakfloor');   // open office
  box('l2', 10, 21.1, 4.8, 3.4, 0.02, F2, 'oakfloor');    // manager (quiet NE corner)
  box('l2', 10, 24.5, 4.8, 4, 0.02, F2, 'carpet');        // meeting (next to corridor)
  box('l2', 1.2, 28.5, 13.6, 1.5, 0.02, F2, 'oakfloor');  // corridor
  box('l2', 3.5, 30, 6.5, 3.8, 0.02, F2, 'tile');         // pantry + WC
  box('l2', 10, 30, 4.8, 3.8, 0.02, F2, 'oakfloor');      // bedroom
  box('l2', 10, 31.8, 1.8, 2, 0.03, F2, 'tile');          // ensuite

  // envelope
  glazing('l2', 'x', 21.05, 1.3, 14.7, F2, L.H2, 1.9);    // north glass: daylight without direct sun most of the year
  wall('l2', 'y', 1.1, 21.3, 34, F2, L.H2, 'wall', [
    { a: 21.5, b: 23.9, sill: 0.6, head: 2.6, glass: true },                          // one big window beside the desks; solid wall behind the TV
    { a: 31, b: 33, sill: 1.0, head: 2.4, glass: true }]);
  wall('l2', 'y', 14.9, 21.3, 34, F2, L.H2, 'wall', [
    { a: 21.7, b: 24.2, head: 2.7, glass: true }, { a: 25, b: 28, sill: 0.8, head: 2.5, glass: true },
    { a: 30.6, b: 33.2, sill: 0.8, head: 2.4, glass: true }]);                      // bedroom: its only window, facing east
  wall('l2', 'x', 33.9, 1, 15, F2, L.H2, 'wall', [
    { a: 4.2, b: 6.0, sill: 1.1, head: 2.3, glass: true }, { a: 7.6, b: 9.2, sill: 1.8, head: 2.4, glass: true }]);   // pantry, WC; bedroom side is solid
  // west sun screen: vertical oak fins in front of the west wall (afternoon sun, bearing ~250-290)
  for (fy = 21.2; fy < 30; fy += 0.4) box('l2', 0.5, fy, 0.35, 0.06, L.H2, F2, 'oak');
  box('l2', 0.5, 21.2, 0.5, 8.8, 0.06, F2 - 0.06, 'steel'); box('l2', 0.5, 21.2, 0.5, 8.8, 0.06, F2 + L.H2, 'steel');

  // partitions (2.9 m high, 0.1 m)
  var P = 2.9, T = 0.1;
  wall('l2', 'y', 10, 21.1, 24.5, F2, P, 'wall', [{ a: 21.15, b: 23.3, glass: true }, { a: 23.5, b: 24.4, head: 2.1 }], T);       // manager | office
  wall('l2', 'x', 24.5, 10, 14.8, F2, P, 'wall', null, T);                                                                    // manager | meeting
  wall('l2', 'y', 10, 24.5, 28.5, F2, P, 'wall', [{ a: 24.6, b: 27.3, glass: true }, { a: 27.45, b: 28.35, head: 2.1 }], T);   // meeting | office, door to the Freedom space
  wall('l2', 'x', 28.5, 10, 14.8, F2, P, 'wall', null, T);                                                                    // meeting | corridor: solid (privacy toward the bedroom)
  wall('l2', 'x', 28.5, 1.2, 4.2, F2, P, 'wall', null, T);                                                                    // stair landing | lounge
  wall('l2', 'y', 4.2, 28.5, 30, F2, P, 'wall', [{ a: 28.95, b: 29.9, head: 2.1 }], T);                                         // key-card door
  wall('l2', 'x', 30, 3.5, 14.8, F2, P, 'wall', [{ a: 4.6, b: 6.4, head: 2.4 }, { a: 8, b: 8.9, head: 2.1 }, { a: 12.3, b: 13.2, head: 2.1 }], T);
  wall('l2', 'y', 3.5, 30, 33.8, F2, P, 'wall', null, T);
  wall('l2', 'y', 7, 30, 33.8, F2, P, 'wall', null, T);
  wall('l2', 'y', 10, 30, 33.8, F2, P, 'wall', null, T);
  wall('l2', 'x', 31.8, 10, 11.8, F2, P, 'wall', [{ a: 10.6, b: 11.4, head: 2.1 }], T);                                        // ensuite
  wall('l2', 'y', 11.8, 31.8, 33.8, F2, P, 'wall', null, T);
  // stair up to the roof: 17 risers, same compact footprint as the flight below
  var RS = (L.ROOF + 0.25 - F2) / 17;
  for (i = 0; i < 9; i++) box('l2', 1.3, 30.4 + i * 0.24, 1.0, 0.24, 0.25, F2 + RS * (i + 1) - 0.25, 'concrete');
  box('l2', 1.3, 32.56, 2.1, 1.24, 0.15, F2 + RS * 9 - 0.15, 'concrete');
  for (j = 0; j < 8; j++) box('l2', 2.4, 32.56 - (j + 1) * 0.24, 1.0, 0.24, 0.25, F2 + RS * (10 + j) - 0.25, 'concrete');
  box('l2', 2.4, 30.4, 1.0, 0.24, 0.25, L.ROOF, 'concrete');
  box('l2', 2.3, 30.64, 0.1, 1.9, L.ROOF + 1.2 - F2, F2, 'wall');                                                             // spine wall / guard
  box('l2', 4.25, 28.6, 0.14, 0.18, 0.5, F2 + 0.9, 'red'); box('l2', 14.62, 29.75, 0.14, 0.18, 0.5, F2 + 0.9, 'red');           // fire extinguishers
  // shoe rack + bench on the stair landing: shoes come off before the office
  box('l2', 1.3, 28.56, 2.0, 0.34, 1.1, F2, 'oak');
  for (i = 0; i < 3; i++) box('l2', 1.3, 28.9, 2.0, 0.02, 0.02, F2 + 0.3 + i * 0.3, 'steel');
  box('l2', 3.4, 28.56, 0.7, 0.36, 0.45, F2, 'oak'); box('l2', 1.5, 29.2, 2.2, 0.9, 0.015, F2 + 0.02, 'rug');

  // open office: one 8-seat bench along the north glass, everyone faces the window. No company computers: staff bring laptops
  box('l2', 1.5, 21.3, 8.3, 0.7, 0.04, F2 + 0.71, 'oak');
  for (i = 0; i < 5; i++) box('l2', 1.55 + i * 2.05, 21.4, 0.05, 0.5, 0.71, F2, 'steel');
  for (i = 0; i < 8; i++) {
    chair('l2', 1.79 + i * 1.03, 22.1, F2, 's');
    if (i) box('l2', 1.49 + i * 1.03, 21.3, 0.03, 0.7, 0.3, F2 + 0.75, 'fabric');
  }
  // Freedom space in the middle: do anything here - sofa talk, work with a film on, feels like working at home
  box('l2', 1.5, 24.5, 4.1, 3.7, 0.015, F2 + 0.02, 'rug');
  box('l2', 1.25, 24.9, 0.4, 2.0, 0.45, F2, 'oak'); box('l2', 1.22, 25.0, 0.05, 1.8, 1.05, F2 + 0.95, 'steel');                 // media console + big screen on the solid west wall
  // one L-shaped sofa: long side faces the screen, short side returns along the corridor edge, one continuous back
  box('l2', 4.3, 24.6, 0.82, 3.3, 0.42, F2, 'fabric'); box('l2', 2.2, 27.08, 2.92, 0.82, 0.42, F2, 'fabric');
  box('l2', 5.1, 24.6, 0.2, 3.5, 0.84, F2, 'fabric'); box('l2', 2.2, 27.9, 3.1, 0.2, 0.84, F2, 'fabric');
  box('l2', 4.3, 24.42, 1.0, 0.2, 0.6, F2, 'fabric'); box('l2', 2.02, 27.08, 0.2, 1.02, 0.6, F2, 'fabric');                    // arms
  box('l2', 4.4, 24.8, 0.5, 0.5, 0.14, F2 + 0.42, 'bed'); box('l2', 4.4, 27.2, 0.5, 0.5, 0.14, F2 + 0.42, 'bed'); box('l2', 2.5, 27.2, 0.5, 0.5, 0.14, F2 + 0.42, 'bed'); // cushions
  table('l2', 2.7, 25.6, 0.9, 0.9, F2, 0.36);
  sph('l2', 2.0, 24.5, F2 + 0.3, 0.42, 'fabric'); sph('l2', 3.2, 24.3, F2 + 0.3, 0.42, 'rug');                                  // bean bags
  cyl('l2', 5.45, 24.45, 0.02, 1.6, F2, 'steel'); box('l2', 5.33, 24.33, 0.24, 0.24, 0.26, F2 + 1.6, 'lamp');                   // floor lamp
  box('l2', 6.3, 25.6, 2.4, 1.0, 0.05, F2 + 0.72, 'oak'); box('l2', 6.7, 26.0, 1.6, 0.2, 0.72, F2, 'steel');                   // home-style table, 6 seats
  [6.5, 7.28, 8.05].forEach(function (cx) { chair('l2', cx, 25.05, F2, 'n', 'oak'); chair('l2', cx, 26.7, F2, 's', 'oak'); });
  box('l2', 9.0, 24.9, 0.04, 1.8, 1.2, F2 + 0.6, 'board'); box('l2', 8.8, 25.0, 0.45, 0.05, 0.6, F2, 'steel'); box('l2', 8.8, 26.55, 0.45, 0.05, 0.6, F2, 'steel'); // the one whiteboard
  pendants('l2', [6.9, 8.1], 26.1, F2 + L.H2, 1.0);
  pendants('l2', [11.6, 13.2], 26.5, F2 + L.H2, 1.25);
  prop('l2', 'person', 7.6, 27.5, F2, 200); prop('l2', 'person', 3.4, 23.6, F2, 160); prop('l2', 'person', 12.2, 27.9, F2, 190);
  // decorative pots (small / medium) in the corners instead of indoor trees
  prop('l2', 'plant', 9.6, 23.0, F2, 0, { h: 0.6 }); prop('l2', 'plant', 1.5, 23.4, F2, 50, { h: 0.7 }); prop('l2', 'plant', 14.45, 21.5, F2, 20, { h: 0.5 });
  prop('l2', 'plant', 14.45, 28.1, F2, 10, { h: 0.55 }); prop('l2', 'plant', 14.45, 30.25, F2, 30, { h: 0.45 });
  for (i = 0; i < 8; i++) box('l2', 1.86 + i * 1.03, 21.62, 0.32, 0.22, 0.015, F2 + 0.75, 'steelL');   // laptops

  // manager office (NE corner)
  box('l2', 12.7, 21.9, 0.8, 1.6, 0.05, F2 + 0.7, 'oak'); box('l2', 13.05, 22.0, 0.08, 1.4, 0.7, F2, 'steel');
  chair('l2', 13.7, 22.5, F2, 'e'); chair('l2', 12.0, 22.1, F2, 'w'); chair('l2', 12.0, 22.9, F2, 'w');
  box('l2', 11.6, 24.02, 3.0, 0.4, 1.8, F2, 'oak');

  // meeting room: 8 seats + screen, door from the corridor
  box('l2', 10.9, 25.9, 3.1, 1.2, 0.05, F2 + 0.7, 'oak'); box('l2', 11.3, 26.4, 2.3, 0.2, 0.7, F2, 'steel');
  [11.2, 12.22, 13.25].forEach(function (cx) { chair('l2', cx, 25.35, F2, 'n'); chair('l2', cx, 27.2, F2, 's'); });
  chair('l2', 10.35, 26.28, F2, 'w'); chair('l2', 14.1, 26.28, F2, 'e');
  box('l2', 11.5, 24.56, 2.0, 0.06, 1.1, F2 + 1.0, 'steel');

  // pantry = mini kitchen, no seating: single-door fridge right by the doorway, sink, microwave + small hob to warm food
  box('l2', 3.6, 33.2, 3.3, 0.6, 0.88, F2, 'white'); box('l2', 3.6, 33.15, 3.3, 0.65, 0.04, F2 + 0.88, 'oak');
  box('l2', 3.6, 31.3, 0.6, 1.9, 0.88, F2, 'white'); box('l2', 3.6, 31.3, 0.65, 1.9, 0.04, F2 + 0.88, 'oak');
  box('l2', 3.6, 31.3, 0.32, 1.9, 0.5, F2 + 1.5, 'white');                                             // wall cabinets
  box('l2', 4.6, 33.3, 0.55, 0.4, 0.03, F2 + 0.9, 'steelL');                                           // sink
  box('l2', 5.5, 33.3, 0.58, 0.4, 0.02, F2 + 0.92, 'steel');                                           // 2-zone hob
  box('l2', 3.68, 31.5, 0.42, 0.5, 0.3, F2 + 0.92, 'steelL');                                          // microwave
  box('l2', 3.72, 32.3, 0.2, 0.2, 0.26, F2 + 0.92, 'steel'); box('l2', 3.72, 32.7, 0.25, 0.3, 0.32, F2 + 0.92, 'white'); // kettle + rice cooker
  box('l2', 6.42, 30.12, 0.56, 0.6, 1.7, F2, 'steelL');                                                // single-door fridge beside the doorway
  box('l2', 6.5, 30.9, 0.45, 2.0, 1.8, F2, 'oak');                                                     // lockers
  box('l2', 3.6, 30.2, 0.6, 0.9, 2.0, F2, 'steel');                                                    // server rack

  // WC: 2 cubicles + basin
  wall('l2', 'y', 8.5, 31.9, 33.8, F2, 2.0, 'white', null, 0.05);
  wall('l2', 'x', 31.9, 7.05, 9.95, F2, 2.0, 'white', [{ a: 7.4, b: 8.1, head: 2.0 }, { a: 8.9, b: 9.6, head: 2.0 }], 0.05);
  box('l2', 7.5, 33.15, 0.4, 0.6, 0.42, F2, 'white'); box('l2', 9.05, 33.15, 0.4, 0.6, 0.42, F2, 'white');
  box('l2', 9.35, 30.2, 0.5, 1.2, 0.85, F2, 'white');

  // bedroom: bed head on the solid south wall, the only window faces east; wardrobe nook, desk, ensuite (exhaust fan, no window)
  box('l2', 12.45, 31.7, 1.7, 2.05, 0.25, F2, 'oak'); box('l2', 12.5, 31.75, 1.6, 2.0, 0.22, F2 + 0.25, 'bed');
  box('l2', 12.4, 33.72, 1.8, 0.07, 1.0, F2, 'oak');
  box('l2', 12.6, 33.15, 0.62, 0.42, 0.14, F2 + 0.47, 'bed'); box('l2', 13.38, 33.15, 0.62, 0.42, 0.14, F2 + 0.47, 'bed');
  box('l2', 12.5, 31.75, 1.6, 0.8, 0.03, F2 + 0.47, 'fabric');
  box('l2', 11.95, 33.3, 0.4, 0.4, 0.5, F2, 'oak'); box('l2', 14.2, 33.3, 0.4, 0.4, 0.5, F2, 'oak');
  box('l2', 12.05, 33.4, 0.2, 0.2, 0.16, F2 + 0.5, 'lamp'); box('l2', 14.3, 33.4, 0.2, 0.2, 0.16, F2 + 0.5, 'lamp');
  box('l2', 12.8, 33.7, 1.0, 0.03, 0.6, F2 + 1.5, 'art');
  box('l2', 10.1, 30.1, 1.6, 0.55, 2.2, F2, 'oak');
  box('l2', 14.2, 30.15, 0.55, 0.4, 0.75, F2, 'oak'); box('l2', 14.3, 30.2, 0.3, 0.3, 0.3, F2 + 0.75, 'bed');   // dresser
  box('l2', 10.15, 33.15, 0.4, 0.6, 0.42, F2, 'white'); box('l2', 10.1, 31.95, 0.45, 0.55, 0.85, F2, 'white');
  box('l2', 10.95, 32.95, 0.03, 0.85, 2.0, F2, 'glass');

  // ---------- Roof ----------
  function deck(z, h, m, e) {              // roof plate with the stair opening (x 1.2-3.5, y 30.4-33.8) left out
    box('roof', 0.6 - e, 19.8 - e, 14.8 + 2 * e, 10.6 + e, h, z, m); box('roof', 3.5, 30.4, 11.9 + e, 4 + e, h, z, m);
    box('roof', 0.6 - e, 30.4, 0.6 + e, 4 + e, h, z, m); box('roof', 1.2, 33.8, 2.3, 0.6 + e, h, z, m);
  }
  deck(L.ROOF, 0.25, 'roofwhite', 0);       // 1.2 m overhang shades the north glass in May-Jul
  box('roof', 0.6, 19.8, 14.8, 0.12, 0.35, L.ROOF + 0.25, 'roofwhite'); box('roof', 0.6, 34.28, 14.8, 0.12, 0.35, L.ROOF + 0.25, 'roofwhite');
  box('roof', 0.6, 19.8, 0.12, 14.6, 0.35, L.ROOF + 0.25, 'roofwhite'); box('roof', 15.28, 19.8, 0.12, 14.6, 0.35, L.ROOF + 0.25, 'roofwhite');
  deck(L.ROOF - 0.06, 0.06, 'steel', 0.05); deck(L.ROOF + 0.25, 0.03, 'gravel', -0.12);
  // stair house: the roof is reached by the main stair, not a ladder
  var RT = L.ROOF + 0.25;
  wall('roof', 'x', 30.3, 1.05, 3.65, RT, 2.4, 'wall', [{ a: 2.45, b: 3.35, head: 2.1 }], 0.15);
  wall('roof', 'x', 33.9, 1.05, 3.65, RT, 2.4, 'wall', null, 0.15);
  wall('roof', 'y', 1.12, 30.3, 33.9, RT, 2.4, 'wall', [{ a: 31.2, b: 32.8, sill: 1.2, head: 2.0, glass: true }], 0.15);
  wall('roof', 'y', 3.58, 30.3, 33.9, RT, 2.4, 'wall', null, 0.15);
  box('roof', 0.85, 29.7, 3.0, 4.4, 0.15, RT + 2.4, 'roofwhite'); box('roof', 0.8, 29.65, 3.1, 4.5, 0.05, RT + 2.55, 'steel');
  box('roof', 3.7, 31.5, 0.14, 0.18, 0.5, RT + 0.4, 'red');
  box('roof', 2.3, 28.5, 1.3, 1.8, 0.04, RT + 0.03, 'paving'); box('roof', 3.6, 28.5, 8.9, 1.2, 0.04, RT + 0.03, 'paving'); box('roof', 11.3, 29.7, 1.2, 2.1, 0.04, RT + 0.03, 'paving'); // service walkway to the water tank
  // guard rail 1.1 m above the roof surface, on top of the parapet
  var gx, gy;
  for (gx = 0.66; gx < 15.4; gx += 2.44) { box('roof', gx - 0.02, 19.84, 0.04, 0.04, 0.75, L.ROOF + 0.6, 'steel'); box('roof', gx - 0.02, 34.32, 0.04, 0.04, 0.75, L.ROOF + 0.6, 'steel'); }
  for (gy = 19.86; gy < 34.4; gy += 2.41) { box('roof', 0.64, gy - 0.02, 0.04, 0.04, 0.75, L.ROOF + 0.6, 'steel'); box('roof', 15.32, gy - 0.02, 0.04, 0.04, 0.75, L.ROOF + 0.6, 'steel'); }
  [0.36, 0.75].forEach(function (rz) {
    box('roof', 0.64, 19.84, 14.72, 0.04, 0.04, L.ROOF + 0.6 + rz, 'steel'); box('roof', 0.64, 34.32, 14.72, 0.04, 0.04, L.ROOF + 0.6 + rz, 'steel');
    box('roof', 0.64, 19.84, 0.04, 14.52, 0.04, L.ROOF + 0.6 + rz, 'steel'); box('roof', 15.32, 19.84, 0.04, 14.52, 0.04, L.ROOF + 0.6 + rz, 'steel');
  });
  box('roof', 0.55, 19.75, 14.9, 0.2, 0.04, L.ROOF + 0.6, 'steel'); box('roof', 0.55, 34.25, 14.9, 0.2, 0.04, L.ROOF + 0.6, 'steel');  // parapet coping
  box('roof', 0.55, 19.75, 0.2, 14.7, 0.04, L.ROOF + 0.6, 'steel'); box('roof', 15.25, 19.75, 0.2, 14.7, 0.04, L.ROOF + 0.6, 'steel');
  box('roof', 12.2, 31.5, 1.6, 1.6, 0.1, L.ROOF + 0.28, 'concrete'); cyl('roof', 13, 32.3, 0.7, 1.5, L.ROOF + 0.38, 'steelL');         // water tank

  OX = 0; OY = 0;
  var labels = [
    { t: 'ถนนสาธารณะ', x: 16, y: -4.8, z: 0.1, g: 'site', dark: true },
    { t: 'ลานจอดรถ 6 คัน', x: 8.5, y: 10.5, z: 0.1, g: 'site' },
    { t: 'มอเตอร์ไซค์', x: 1.5, y: 7, z: 0.1, g: 'site' },
    { t: 'ลานบริการ: ขยะ ถังน้ำ ปั๊ม', x: 1.6, y: 15.2, z: 2.4, g: 'site' },
    { t: 'ทางลาดรถเข็น', x: 15.4, y: 2.7, z: 0.6, g: 'site' },
    { t: 'ลานนั่งกลางแจ้ง', x: 8, y: 19.2, z: 0.3, g: 'site', b: 1 },
    { t: 'ทางขึ้นดาดฟ้า', x: 2.4, y: 32, z: L.ROOF + 3.1, g: 'roof', b: 1 },
    { t: 'ถังน้ำ', x: 13, y: 32.3, z: L.ROOF + 2.3, g: 'roof', b: 1 }
  ];
  window.ZONES1.forEach(function (r) {
    labels.push({ t: r.name + ' · ' + r.area + ' ตร.ม.', x: r.u + 1, y: r.v + 21, z: G + 1.2, g: 'plan1', b: 1 });
  });
  window.ROOMS.forEach(function (r) {
    labels.push({ t: r.name + ' · ' + r.area + ' ตร.ม.', x: r.u + 1, y: r.v + 21, z: F2 + 1.2, g: 'plan2', b: 1 });
  });
  labels.forEach(function (l) { if (l.b) { l.x += B.dx; l.y += B.dy; } });
  return { items: items, labels: labels };
};
