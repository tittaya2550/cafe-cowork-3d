// Scene data in metres. Lot is x: 0..16 (width), y: 0..38 (depth from road), z up.
// Edit dimensions here; app.js only renders. Every item belongs to a group that the UI can toggle:
//   site | cars | l1 (ground floor) | l2 (level 2 slab, walls, furniture) | roof
window.LOT = { width: 16, depth: 38 };

// Real location (Google Maps pin). `facing` = compass bearing the road frontage looks at,
// measured off the satellite image: the road runs WNW-ESE and the lot sits on its south side.
// So +y (depth) points to bearing facing+180 and +x points to bearing facing+90 (roughly east).
window.SITE = { lat: 16.7671944, lon: 100.2713889, tz: 7, facing: 18 };

window.LEVELS = { G: 0.15, F2: 3.95, H1: 3.5, H2: 3.0, ROOF: 6.95 };

// Ground-floor café zones (u, v = metres from the building's front-west corner).
// Target split for a café this size: ~60% seating, ~25% bar + kitchen, ~15% WC + stair.
window.ZONES1 = [
  { name: 'ที่นั่งลูกค้า 33 ที่นั่ง + ทางเดิน', area: 106.8, u: 4.2, v: 1.9 },
  { name: 'บาร์ + จุดสั่ง/รับ', area: 17.7, u: 10.9, v: 5.8 },
  { name: 'ครัวเบา + สโตร์', area: 25.8, u: 11.3, v: 10.3 },
  { name: 'ห้องน้ำ ช/ญ/ผู้พิการ', area: 14.4, u: 5.1, v: 12.5 },
  { name: 'โถงทางเข้าออฟฟิศ + บันได', area: 17.3, u: 2.4, v: 8.3 }
];

// Level-2 rooms. Used for labels + legend.
window.ROOMS = [
  { name: 'ออฟฟิศเปิด 8 โต๊ะริมกระจก + โซนระดมความคิด', area: 67.5, u: 4.6, v: 2.6 },
  { name: 'ห้องผู้บริหาร', area: 17.5, u: 11.5, v: 0.9 },
  { name: 'ห้องประชุม 8 ที่นั่ง', area: 20, u: 11.5, v: 4.1 },
  { name: 'ทางเดิน', area: 16.5, u: 8.4, v: 8.25 },
  { name: 'ห้องนอน + ห้องน้ำในตัว', area: 20, u: 12.9, v: 10.2 },
  { name: 'ห้องน้ำ', area: 12, u: 7.5, v: 10.6 },
  { name: 'แพนทรี + ล็อกเกอร์', area: 11.2, u: 4.6, v: 12.3 },
  { name: 'โถงบันได ลงชั้น 1 / ขึ้นดาดฟ้า', area: 17.3, u: 2.0, v: 8.25 }
];

window.buildModel = function () {
  var items = [];
  var L = window.LEVELS, G = L.G, F2 = L.F2, i, j;

  function box(g, x, y, w, d, h, z, m, o) { items.push({ t: 'box', g: g, x: x, y: y, w: w, d: d, h: h, z: z || 0, m: m, rx: o && o.rx }); }
  function flat(g, x, y, w, d, m, z) { box(g, x, y, w, d, (z || 0.02), 0, m); }
  function cyl(g, x, y, r, h, z, m) { items.push({ t: 'cyl', g: g, x: x, y: y, r: r, h: h, z: z, m: m }); }
  function sph(g, x, y, z, r, m) { items.push({ t: 'sph', g: g, x: x, y: y, z: z, r: r, m: m }); }

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
  function prop(g, k, x, y, z, rot, a) { a = a || {}; a.seed = seed++; items.push({ t: 'prop', g: g, k: k, x: x, y: y, z: z || 0, rot: rot || 0, a: a }); }
  function tree(x, y, h, r) { prop('site', 'tree', x, y, 0, seed * 47, { h: h, r: r }); }
  function car(x, y, paint) { prop('cars', 'car', x + 0.9, y, 0.07, 0, { paint: paint }); }
  function pendants(g, xs, y, top, drop) { xs.forEach(function (x) { prop(g, 'pendant', x, y, top, 0, { drop: drop }); }); }

  // ---------- Surroundings ----------
  flat('site', -60, -60, 136, 160, 'field', 0.005);
  flat('site', -60, -6.5, 136, 6.5, 'road', 0.02);
  flat('site', -60, -0.9, 136, 0.9, 'gravel', 0.025); flat('site', -60, -7.4, 136, 0.9, 'gravel', 0.025);   // road shoulders
  flat('site', -60, -3.4, 136, 0.12, 'lineY', 0.03);
  flat('site', 0, 0, 16, 38, 'paving', 0.03);
  [-44, -10, 24, 58].forEach(function (px) { prop('site', 'pole', px, -8.2, 0, 0); });
  [-0.75, 0, 0.75].forEach(function (dz) { box('site', -60, -8.2 + dz - 0.01, 136, 0.02, 0.02, 8.68, 'steel'); });
  prop('site', 'house', -19, 9, 0, 6, { w: 8, d: 12, roof: '#A5623F' });
  prop('site', 'house', 33, 2, 0, -4, { w: 9, d: 8, h: 3, wall: '#DDE3E6', roof: '#5F7FA8' });
  prop('site', 'house', 36, 34, 0, 8, { w: 10, d: 9, roof: '#8C5A3C' });

  // Front setback 3 m + driveway
  flat('site', 0, 0, 16, 3, 'grass', 0.06);
  flat('site', 5, -0.2, 6, 3.2, 'asphalt', 0.07);

  // Parking 5 cars + 1 accessible, 6 m aisle, motorcycles
  flat('site', 0, 3, 16, 14, 'asphalt', 0.07);
  for (i = 1; i <= 5; i++) flat('site', i * 2.5 - 0.05, 3, 0.1, 5, 'line', 0.08);
  flat('site', 12.6, 3.05, 3.3, 4.9, 'bluebay', 0.08);
  for (i = 0; i < 5; i++) box('site', 0.45 + i * 2.5, 3.15, 1.6, 0.16, 0.11, 0.07, 'concrete');          // wheel stops
  box('site', 13.4, 3.15, 1.6, 0.16, 0.11, 0.07, 'concrete');
  box('site', 0, 2.9, 5, 0.15, 0.14, 0, 'curb'); box('site', 11, 2.9, 5, 0.15, 0.14, 0, 'curb'); box('site', 0, 16.9, 6.9, 0.15, 0.14, 0, 'curb'); box('site', 9.1, 16.9, 6.9, 0.15, 0.14, 0, 'curb');
  box('site', 7, 16.0, 2, 1.45, 0.04, 0.09, 'concrete', { rx: -0.057 });               // wheelchair ramp, parking -> deck
  box('site', 6.94, 16.0, 0.05, 1.45, 0.9, 0.07, 'steel'); box('site', 9.01, 16.0, 0.05, 1.45, 0.9, 0.07, 'steel');
  [0.6, 15.4].forEach(function (bx) { [5, 10, 15].forEach(function (by) { cyl('site', bx, by, 0.06, 0.8, 0, 'steel'); box('site', bx - 0.07, by - 0.07, 0.14, 0.14, 0.1, 0.8, 'lamp'); }); });
  flat('site', 0.2, 14, 9.6, 2.8, 'paving', 0.08);
  for (i = 1; i < 7; i++) flat('site', 0.2 + i * 1.37, 14, 0.06, 2.8, 'line', 0.09);

  // Outdoor terrace + side greens + back of house
  flat('site', 0, 17, 16, 4, 'grass', 0.06);
  flat('site', 0, 21, 1, 13, 'grass', 0.06); flat('site', 15, 21, 1, 13, 'grass', 0.06);
  flat('site', 0, 34, 16, 4, 'paving', 0.05);
  flat('site', 0, 17, 1.05, 17, 'paving', 0.075);                                    // side path to the office entrance + back of house
  box('site', 2, 17.4, 12, 3.4, 0.15, 0, 'deck');
  for (i = 0; i < 3; i++) {
    table('site', 3.3 + i * 3.4, 18.6, 0.9, 0.9, 0.15);
    chair('site', 2.7 + i * 3.4, 18.8, 0.15, 'w', 'oak'); chair('site', 4.35 + i * 3.4, 18.8, 0.15, 'e', 'oak');
    chair('site', 3.52 + i * 3.4, 17.95, 0.15, 'n', 'oak'); chair('site', 3.52 + i * 3.4, 19.65, 0.15, 's', 'oak');
  }

  for (i = 0; i < 3; i++) prop('site', 'umbrella', 3.75 + i * 3.4, 19.05, 0.15);
  [2.05, 13.2].forEach(function (px) { box('site', px, 17.5, 0.75, 0.45, 0.5, 0.15, 'oak'); prop('site', 'plant', px + 0.2, 17.72, 0.6, 0, { h: 0.9, ground: true }); prop('site', 'plant', px + 0.55, 17.72, 0.6, 40, { h: 0.8, ground: true }); });
  for (i = 0; i < 6; i++) { prop('site', 'plant', 0.5 + i * 0.75, 0.6, 0.05, i * 50, { h: 0.9, ground: true }); prop('site', 'plant', 11.4 + i * 0.75, 2.2, 0.05, i * 70, { h: 0.8, ground: true }); }
  for (i = 0; i < 9; i++) { prop('site', 'plant', 15.5, 22 + i * 1.3, 0.05, i * 61, { h: 0.7, ground: true }); }
  prop('site', 'person', 9.1, 20.35, 0.15, 200); prop('site', 'person', 9.5, 12.5, 0.07, 20); prop('site', 'person', 10.1, 12.2, 0.07, 150);

  // Boundary walls + sign wall
  box('site', -0.15, 3, 0.15, 35, 1.6, 0, 'bound'); box('site', 16, 3, 0.15, 35, 1.6, 0, 'bound'); box('site', -0.15, 38, 16.3, 0.15, 1.6, 0, 'bound');
  box('site', 11.6, 1, 3.6, 0.3, 1.6, 0, 'steel'); box('site', 11.9, 0.96, 3, 0.04, 0.6, 0.75, 'sign'); box('site', 11.6, 0.9, 3.6, 0.5, 0.06, 1.6, 'oak');

  // Trees (site + a few neighbours for context)
  tree(2.6, 1.5, 2.8, 1.5); tree(13.6, 18.3, 2.6, 1.3); tree(1.55, 19.5, 2.0, 0.9);
  tree(15.5, 27, 2.2, 0.9); tree(0.5, 36.2, 2.4, 1.1);
  tree(-13, -1, 3.2, 2.0); tree(-14, 30, 3.6, 2.3); tree(27, 9, 3.4, 2.1); tree(24, 33, 3.0, 1.8); tree(31, 22, 3.8, 2.4);
  tree(-6, -12, 3.4, 2.2); tree(24, -13, 3.8, 2.4); tree(30, -11, 3.2, 2.0); tree(6, 46, 3.6, 2.3); tree(-10, 44, 3.0, 1.9);

  // Back of house: bin store, water tank + pump, grease trap, treatment tank, AC condensers
  box('site', 1.7, 34.9, 0.1, 1.4, 1.5, 0, 'bound'); box('site', 4.3, 34.9, 0.1, 1.4, 1.5, 0, 'bound'); box('site', 1.7, 36.2, 2.7, 0.1, 1.5, 0, 'bound'); box('site', 1.6, 34.8, 2.9, 1.6, 0.06, 1.5, 'steel');
  cyl('site', 6.2, 36.7, 0.8, 2.0, 0.05, 'steelL'); box('site', 7.3, 36.4, 0.55, 0.4, 0.45, 0.05, 'steel');
  box('site', 12.4, 36.2, 1.3, 0.8, 0.04, 0.05, 'steelL'); cyl('site', 14.2, 37, 0.38, 0.05, 0.05, 'concrete'); cyl('site', 15.1, 37, 0.38, 0.05, 0.05, 'concrete');
  box('site', 15.35, 1.2, 0.45, 0.28, 1.3, 0.3, 'steelL');                                // electricity meter + main board
  box('site', 2, 35.2, 0.9, 0.8, 1.0, 0, 'binG'); box('site', 3.2, 35.2, 0.9, 0.8, 1.0, 0, 'binG');
  for (i = 0; i < 4; i++) box('site', 9.5 + i * 1.2, 34.4, 0.9, 0.35, 0.7, 0.1, 'white');

  // Cars + motorcycles
  var paints = ['#D9DADB', '#33414F', null, '#8F2B2B', '#F1F1EF'];
  for (i = 0; i < 5; i++) if (paints[i]) car(0.35 + i * 2.5, 3.3, paints[i]);
  var mp = ['#2B2D30', '#A8322D', '#E7E7E4', '#2F4A6B', '#2B2D30'];
  for (i = 0; i < 5; i++) prop('cars', 'moto', 0.88 + (i < 3 ? i : i + 1) * 1.37, 14.5, 0.09, i % 2 ? 4 : -3, { paint: mp[i] });

  // ---------- Ground floor: café (building 14 x 13 m at x 1..15, y 21..34) ----------
  box('l1', 1, 21, 14, 13, G, 0, 'concrete');
  [1, 7.85, 14.7].forEach(function (cx) { [21, 27.35, 33.7].forEach(function (cy) {
    box('l1', cx, cy, 0.3, 0.3, L.H1, G, 'wall'); box('l2', cx, cy, 0.3, 0.3, L.H2, F2, 'wall');
  }); });
  glazing('l1', 'x', 21.05, 1.3, 14.7, G, L.H1, 1.9);                                  // north front: all glass
  glazing('l1', 'y', 14.95, 21.3, 29, G, L.H1, 1.9);                                   // east: morning light
  wall('l1', 'y', 14.9, 29, 34, G, L.H1, 'wall');
  wall('l1', 'y', 1.1, 21.3, 34, G, L.H1, 'wall', [{ a: 21.8, b: 25.6, sill: 2.0, head: 2.8, glass: true }, { a: 28.8, b: 29.8, head: 2.1 }]); // west: solid, high strip window, office door
  box('l1', 0.3, 28.6, 0.8, 1.4, 0.06, G + 2.25, 'steel'); box('l1', 1.05, 28.82, 0.05, 0.96, 2.05, G, 'oak');   // office door + canopy
  wall('l1', 'x', 33.9, 1, 15, G, L.H1, 'wall', [{ a: 12.2, b: 13.1, head: 2.1 }]);
  var fy;
  box('l1', 4, 19.6, 8, 1.45, 0.12, 3.25, 'steel');                                   // entrance canopy
  box('l1', 0.95, 20.95, 14.1, 13.1, 0.14, 0, 'plinth');                              // dark base course
  box('l1', 6.9, 20.98, 0.08, 0.12, 2.5, G, 'steel'); box('l1', 9.02, 20.98, 0.08, 0.12, 2.5, G, 'steel'); box('l1', 6.9, 20.98, 2.2, 0.12, 0.08, G + 2.45, 'steel'); // door frame
  box('l1', 7.96, 20.98, 0.06, 0.1, 2.45, G, 'steel');
  box('l1', 7.8, 20.9, 0.04, 0.05, 0.9, G + 0.7, 'steelL'); box('l1', 8.16, 20.9, 0.04, 0.05, 0.9, G + 0.7, 'steelL');                                          // pull handles
  box('l1', 6.6, 19.9, 2.8, 1.1, 0.03, 0.03, 'carpet');                                                                                                      // entrance mat
  cyl('l1', 0.92, 33.9, 0.05, 6.8, 0.1, 'white'); cyl('l1', 15.08, 33.9, 0.05, 6.8, 0.1, 'white');                                                           // downpipes
  box('l1', 5.2, 19.75, 0.12, 0.12, 0.06, 3.19, 'lamp'); box('l1', 8, 19.75, 0.12, 0.12, 0.06, 3.19, 'lamp'); box('l1', 10.7, 19.75, 0.12, 0.12, 0.06, 3.19, 'lamp'); // canopy downlights

  // Back strip (y 30..34): stair | WC x3 | light kitchen + store
  // office lobby (x 1.2-4.4, y 28.6-30): own street door on the west side, lockable from the cafe
  wall('l1', 'x', 28.6, 1.2, 4.4, G, L.H1, 'wall', [{ a: 2.6, b: 3.6, head: 2.1 }], 0.12);
  wall('l1', 'y', 4.4, 28.6, 30, G, L.H1, 'wall', null, 0.12);
  box('l1', 2.55, 30.55, 0.1, 2.0, F2 - G, G, 'wall');                                 // stair spine wall
  wall('l1', 'x', 30, 4.2, 14.8, G, L.H1, 'wall', [
    { a: 4.35, b: 5.15, head: 2.1 }, { a: 5.45, b: 6.25, head: 2.1 }, { a: 6.7, b: 7.6, head: 2.1 }, // WC M / F / accessible
    { a: 9.4, b: 11.4, sill: 1.1, head: 2.0 },                                         // kitchen pass window
    { a: 13.2, b: 14.1, head: 2.1 }], 0.12);                                           // kitchen door behind the bar
  wall('l1', 'y', 4.2, 30, 33.8, G, L.H1, 'wall', null, 0.12);
  wall('l1', 'y', 5.3, 30, 33.8, G, L.H1, 'wall', null, 0.1);
  wall('l1', 'y', 6.4, 30, 33.8, G, L.H1, 'wall', null, 0.1);
  wall('l1', 'y', 8, 30, 33.8, G, L.H1, 'wall', null, 0.12);
  box('l1', 4.2, 30, 3.8, 3.8, 0.02, G, 'tile'); box('l1', 8, 30, 6.8, 3.8, 0.02, G, 'tile');
  [4.55, 5.65, 7.0].forEach(function (wx) { box('l1', wx, 33.1, 0.4, 0.6, 0.42, G, 'white'); });
  box('l1', 4.3, 30.2, 0.4, 0.45, 0.85, G, 'white'); box('l1', 5.4, 30.2, 0.4, 0.45, 0.85, G, 'white'); box('l1', 6.5, 31.4, 0.45, 0.5, 0.85, G, 'white');
  for (var sy = 0; sy < 6; sy++) box('l1', 5.8 + sy * 0.4, 28.6, 0.08, 0.12, 2.3, G, 'oak'); // slat screen hiding WC doors, entry at x 4.5-5.7
  box('l1', 6.55, 21.15, 0.18, 0.14, 0.5, G + 0.9, 'red'); box('l1', 14.62, 29.55, 0.14, 0.18, 0.5, G + 0.9, 'red');   // fire extinguishers
  for (i = 0; i < 10; i++) box('l1', 1.3, 30.3 + i * 0.25, 1.2, 0.25, G + 0.19 * (i + 1), 0, 'concrete');
  box('l1', 1.3, 32.8, 2.6, 1.0, 0.15, 1.9, 'concrete');
  for (j = 0; j < 10; j++) box('l1', 2.7, 32.8 - (j + 1) * 0.25, 1.2, 0.25, 0.25, 2.05 + 0.19 * (j + 1) - 0.25, 'concrete');
  // kitchen + store fit-out
  box('l1', 8.2, 33.15, 4.2, 0.6, 0.9, G, 'steelL'); box('l1', 12.6, 33.05, 0.75, 0.7, 1.9, G, 'steelL'); box('l1', 13.4, 33.05, 0.75, 0.7, 1.9, G, 'steelL');
  box('l1', 9.4, 30.1, 2.0, 0.5, 0.9, G, 'steelL'); box('l1', 8.1, 30.3, 0.45, 2.6, 2.0, G, 'white'); box('l1', 14.3, 31.0, 0.45, 2.0, 2.0, G, 'white');

  // Bar facing the entrance: front counter (order - pastry - espresso - pickup), 1.25 m work aisle, back bar
  box('l1', 8.6, 27.4, 5.2, 0.7, 1.0, G, 'oak'); box('l1', 8.5, 27.3, 5.4, 0.85, 0.05, G + 1.0, 'white');
  box('l1', 8.6, 28.1, 0.6, 1.25, 1.0, G, 'oak'); box('l1', 8.5, 28.1, 0.75, 1.3, 0.05, G + 1.0, 'white');
  box('l1', 8.6, 29.35, 4.4, 0.58, 0.9, G, 'white'); box('l1', 8.6, 29.35, 4.4, 0.6, 0.04, G + 0.9, 'oak');
  box('l1', 9.4, 27.45, 1.2, 0.55, 0.45, G + 1.05, 'glass'); box('l1', 9.4, 27.45, 1.2, 0.55, 0.03, G + 1.5, 'steel');   // pastry case
  box('l1', 11.2, 27.5, 0.8, 0.5, 0.45, G + 1.05, 'steelL'); box('l1', 12.15, 27.55, 0.25, 0.25, 0.4, G + 1.05, 'steel'); // espresso + grinder
  box('l1', 8.75, 27.5, 0.3, 0.25, 0.3, G + 1.05, 'steel');                                                             // POS
  box('l1', 8.6, 29.86, 0.7, 0.08, 0.5, G + 2.2, 'steel'); box('l1', 11.6, 29.86, 1.6, 0.08, 0.5, G + 2.2, 'steel');     // menu boards

  pendants('l1', [9.3, 10.5, 11.7, 12.9], 27.75, G + L.H1, 1.25);
  pendants('l1', [3.3, 4.7], 24.75, G + L.H1, 1.45);
  pendants('l1', [10.4, 12.7], 24.4, G + L.H1, 1.45);
  prop('l1', 'person', 10.4, 28.75, G, 180); prop('l1', 'person', 12.6, 28.7, G, 170);       // baristas
  prop('l1', 'person', 9.2, 26.6, G, 5); prop('l1', 'person', 9.6, 25.9, G, 20);             // queue
  prop('l1', 'plant', 1.6, 21.45, G, 0, { h: 1.5 }); prop('l1', 'plant', 14.4, 27.3, G, 30, { h: 1.3 }); prop('l1', 'plant', 7.2, 29.3, G, 60, { h: 1.2 });
  for (i = 0; i < 6; i++) box('l1', 8.8 + i * 0.7, 29.82, 0.5, 0.14, 0.03, G + 1.5, 'oak');   // back-bar shelf
  for (i = 0; i < 9; i++) cyl('l1', 8.95 + i * 0.45, 29.88, 0.04, 0.2, G + 1.53, i % 3 ? 'white' : 'oak');

  // Seating 33: front 2-tops, communal table, banquette, 4-tops, east window bar
  function two(x, y) { table('l1', x, y, 0.7, 0.7, G); chair('l1', x - 0.55, y + 0.12, G, 'w', 'oak'); chair('l1', x + 0.8, y + 0.12, G, 'e', 'oak'); }
  function four(x, y) {
    table('l1', x, y, 0.8, 0.8, G);
    chair('l1', x - 0.55, y + 0.18, G, 'w', 'oak'); chair('l1', x + 0.9, y + 0.18, G, 'e', 'oak');
    chair('l1', x + 0.18, y - 0.55, G, 'n', 'oak'); chair('l1', x + 0.18, y + 0.9, G, 's', 'oak');
  }
  two(2.2, 21.8); two(4.7, 21.8); two(10.2, 21.8); two(12.4, 21.8);
  box('l1', 2.6, 24.3, 2.8, 0.9, 0.06, G + 0.72, 'oak'); box('l1', 2.9, 24.65, 2.2, 0.2, 0.72, G, 'steel');   // communal table, 8 seats
  for (i = 0; i < 4; i++) { chair('l1', 2.75 + i * 0.68, 23.75, G, 'n', 'oak'); chair('l1', 2.75 + i * 0.68, 25.3, G, 's', 'oak'); }
  box('l1', 1.25, 26.0, 0.6, 2.4, 0.45, G, 'fabric'); box('l1', 1.25, 26.0, 0.15, 2.4, 0.95, G, 'fabric');    // banquette, 5 seats
  table('l1', 2.0, 26.2, 0.6, 0.6, G); table('l1', 2.0, 27.6, 0.6, 0.6, G);
  chair('l1', 2.7, 26.28, G, 'e', 'oak'); chair('l1', 2.7, 27.68, G, 'e', 'oak');
  four(10.0, 24.0); four(12.3, 24.0);
  box('l1', 14.3, 21.8, 0.45, 5.0, 0.05, G + 1.0, 'oak');
  for (i = 0; i < 4; i++) cyl('l1', 13.95, 22.5 + i * 1.2, 0.17, 0.72, G, 'steel');

  // ---------- Level 2: company office (u = x - 1, v = y - 21) ----------
  box('l2', 0.8, 20.6, 14.4, 9.7, 0.3, 3.65, 'slab');
  box('l2', 4.2, 30.3, 11, 3.9, 0.3, 3.65, 'slab');
  box('l2', 0.8, 30.3, 0.5, 3.9, 0.3, 3.65, 'slab'); box('l2', 0.8, 33.8, 3.4, 0.4, 0.3, 3.65, 'slab');
  // floor finishes
  box('l2', 1.2, 21.1, 8.8, 7.4, 0.02, F2, 'oakfloor');   // open office
  box('l2', 10, 21.1, 4.8, 3.4, 0.02, F2, 'oakfloor');    // manager (quiet NE corner)
  box('l2', 10, 24.5, 4.8, 4, 0.02, F2, 'carpet');        // meeting (next to corridor)
  box('l2', 1.2, 28.5, 13.6, 1.5, 0.02, F2, 'oakfloor');  // corridor
  box('l2', 4.2, 30, 5.8, 3.8, 0.02, F2, 'tile');         // pantry + WC
  box('l2', 10, 30, 4.8, 3.8, 0.02, F2, 'oakfloor');      // bedroom
  box('l2', 10, 31.8, 1.8, 2, 0.03, F2, 'tile');          // ensuite

  // envelope
  glazing('l2', 'x', 21.05, 1.3, 14.7, F2, L.H2, 1.9);    // north glass: daylight without direct sun most of the year
  wall('l2', 'y', 1.1, 21.3, 34, F2, L.H2, 'wall', [
    { a: 22.2, b: 23.2, sill: 0.9, head: 2.4, glass: true }, { a: 24.6, b: 25.6, sill: 0.9, head: 2.4, glass: true },
    { a: 31, b: 33, sill: 1.0, head: 2.4, glass: true }]);
  wall('l2', 'y', 14.9, 21.3, 34, F2, L.H2, 'wall', [
    { a: 21.7, b: 24.2, head: 2.7, glass: true }, { a: 25, b: 28, sill: 0.8, head: 2.5, glass: true },
    { a: 31, b: 33.2, sill: 0.9, head: 2.3, glass: true }]);
  wall('l2', 'x', 33.9, 1, 15, F2, L.H2, 'wall', [
    { a: 4.8, b: 6.4, sill: 1.1, head: 2.3, glass: true }, { a: 7.6, b: 9.2, sill: 1.8, head: 2.4, glass: true },
    { a: 10.4, b: 11.2, sill: 1.8, head: 2.4, glass: true }, { a: 12.4, b: 14.2, sill: 0.9, head: 2.3, glass: true }]);
  // west sun screen: vertical oak fins in front of the west wall (afternoon sun, bearing ~250-290)
  for (fy = 21.2; fy < 30; fy += 0.4) box('l2', 0.5, fy, 0.35, 0.06, L.H2, F2, 'oak');
  box('l2', 0.5, 21.2, 0.5, 8.8, 0.06, F2 - 0.06, 'steel'); box('l2', 0.5, 21.2, 0.5, 8.8, 0.06, F2 + L.H2, 'steel');

  // partitions (2.9 m high, 0.1 m)
  var P = 2.9, T = 0.1;
  wall('l2', 'y', 10, 21.1, 24.5, F2, P, 'wall', [{ a: 21.15, b: 23.3, glass: true }, { a: 23.5, b: 24.4, head: 2.1 }], T);       // manager | office
  wall('l2', 'x', 24.5, 10, 14.8, F2, P, 'wall', null, T);                                                                    // manager | meeting
  wall('l2', 'y', 10, 24.5, 28.5, F2, P, 'wall', [{ a: 24.6, b: 27.3, glass: true }, { a: 27.45, b: 28.35, head: 2.1 }], T);   // meeting | office, door to the brainstorm zone
  wall('l2', 'x', 28.5, 10, 14.8, F2, P, 'wall', null, T);                                                                    // meeting | corridor: solid (privacy toward the bedroom)
  wall('l2', 'x', 28.5, 1.2, 4.2, F2, P, 'wall', null, T);                                                                    // stair landing | lounge
  wall('l2', 'y', 4.2, 28.5, 30, F2, P, 'wall', [{ a: 28.7, b: 29.8, head: 2.1 }], T);                                         // key-card door
  wall('l2', 'x', 30, 4.2, 14.8, F2, P, 'wall', [{ a: 4.7, b: 6.5, head: 2.4 }, { a: 8, b: 8.9, head: 2.1 }, { a: 12.3, b: 13.2, head: 2.1 }], T);
  wall('l2', 'y', 4.2, 30, 33.8, F2, P, 'wall', null, T);
  wall('l2', 'y', 7, 30, 33.8, F2, P, 'wall', null, T);
  wall('l2', 'y', 10, 30, 33.8, F2, P, 'wall', null, T);
  wall('l2', 'x', 31.8, 10, 11.8, F2, P, 'wall', [{ a: 10.6, b: 11.4, head: 2.1 }], T);                                        // ensuite
  wall('l2', 'y', 11.8, 31.8, 33.8, F2, P, 'wall', null, T);
  // stair up to the roof: 17 risers, same footprint as the flight below
  var RS = (L.ROOF + 0.25 - F2) / 17;
  for (i = 0; i < 9; i++) box('l2', 1.3, 30.3 + i * 0.25, 1.2, 0.25, 0.25, F2 + RS * (i + 1) - 0.25, 'concrete');
  box('l2', 1.3, 32.55, 2.6, 1.25, 0.15, F2 + RS * 9 - 0.15, 'concrete');
  for (j = 0; j < 8; j++) box('l2', 2.7, 32.55 - (j + 1) * 0.25, 1.2, 0.25, 0.25, F2 + RS * (10 + j) - 0.25, 'concrete');
  box('l2', 2.7, 30.3, 1.2, 0.25, 0.25, L.ROOF, 'concrete');
  box('l2', 2.55, 30.55, 0.1, 2.0, L.ROOF + 1.2 - F2, F2, 'wall');                                                            // spine wall / guard
  box('l2', 4.25, 28.55, 0.14, 0.18, 0.5, F2 + 0.9, 'red'); box('l2', 14.62, 29.75, 0.14, 0.18, 0.5, F2 + 0.9, 'red');          // fire extinguishers
  // phone booth for private calls (open office is a talking zone)
  box('l2', 1.25, 23.3, 1.15, 0.06, 2.2, F2, 'white'); box('l2', 1.25, 24.39, 1.15, 0.06, 2.2, F2, 'white'); box('l2', 1.25, 23.3, 1.15, 1.15, 0.06, F2 + 2.2, 'white');
  box('l2', 2.37, 23.36, 0.03, 0.45, 2.2, F2, 'glass'); box('l2', 1.3, 23.4, 0.35, 0.95, 0.04, F2 + 1.0, 'oak'); cyl('l2', 1.95, 23.87, 0.16, 0.65, F2, 'steel');
  box('l2', 4.3, 30.2, 0.6, 0.9, 2.0, F2, 'steel');                                                                          // server rack + storage (pantry)

  // open office: one 8-seat bench along the north glass, everyone faces the window (nobody faces a colleague)
  box('l2', 1.5, 21.3, 8.3, 0.7, 0.04, F2 + 0.71, 'oak');
  for (i = 0; i < 5; i++) box('l2', 1.55 + i * 2.05, 21.4, 0.05, 0.5, 0.71, F2, 'steel');
  for (i = 0; i < 8; i++) {
    chair('l2', 1.79 + i * 1.03, 22.1, F2, 's');
    box('l2', 1.74 + i * 1.03, 21.42, 0.55, 0.04, 0.32, F2 + 0.8, 'steel');
    if (i) box('l2', 1.49 + i * 1.03, 21.3, 0.03, 0.7, 0.3, F2 + 0.75, 'fabric');
  }
  // brainstorm: standing project table + 8 stools, 2 mobile whiteboards, writable wall, huddle sofas
  box('l2', 4.8, 25.5, 3.0, 1.2, 0.06, F2 + 0.98, 'oak'); box('l2', 5.2, 26.0, 2.2, 0.2, 0.98, F2, 'steel');
  for (i = 0; i < 3; i++) { cyl('l2', 5.3 + i * 1.0, 25.1, 0.17, 0.7, F2, 'steel'); cyl('l2', 5.3 + i * 1.0, 27.1, 0.17, 0.7, F2, 'steel'); }
  cyl('l2', 4.4, 26.1, 0.17, 0.7, F2, 'steel'); cyl('l2', 8.2, 26.1, 0.17, 0.7, F2, 'steel');
  box('l2', 5.0, 24.2, 1.8, 0.04, 1.2, F2 + 0.6, 'board'); box('l2', 5.1, 24.0, 0.05, 0.45, 0.6, F2, 'steel'); box('l2', 6.65, 24.0, 0.05, 0.45, 0.6, F2, 'steel');
  box('l2', 9.0, 24.9, 0.04, 1.8, 1.2, F2 + 0.6, 'board'); box('l2', 8.8, 25.0, 0.45, 0.05, 0.6, F2, 'steel'); box('l2', 8.8, 26.55, 0.45, 0.05, 0.6, F2, 'steel');
  box('l2', 1.22, 25.9, 0.03, 2.5, 1.3, F2 + 0.8, 'board');                                 // writable wall (west)
  box('l2', 1.7, 25.3, 2.0, 0.8, 0.42, F2, 'fabric'); box('l2', 1.7, 25.3, 2.0, 0.18, 0.8, F2, 'fabric');
  box('l2', 1.7, 27.6, 2.0, 0.8, 0.42, F2, 'fabric'); box('l2', 1.7, 28.22, 2.0, 0.18, 0.8, F2, 'fabric');
  table('l2', 2.2, 26.5, 1.0, 0.7, F2, 0.36);
  box('l2', 4.6, 28.0, 4.2, 0.45, 0.95, F2, 'white');

  box('l2', 1.4, 25.1, 2.7, 3.2, 0.015, F2 + 0.02, 'rug');
  pendants('l2', [5.6, 7.0], 26.1, F2 + L.H2, 1.0);
  pendants('l2', [11.6, 13.2], 26.5, F2 + L.H2, 1.25);
  prop('l2', 'person', 6.3, 24.9, F2, 0); prop('l2', 'person', 5.0, 27.25, F2, 180); prop('l2', 'person', 7.4, 27.2, F2, 200); prop('l2', 'person', 12.2, 27.9, F2, 190);
  prop('l2', 'plant', 9.6, 22.9, F2, 0, { h: 1.5 }); prop('l2', 'plant', 3.0, 24.3, F2, 50, { h: 1.3 }); prop('l2', 'plant', 14.4, 21.5, F2, 20, { h: 1.2 }); prop('l2', 'plant', 14.4, 33.4, F2, 80, { h: 1.1 });
  for (i = 0; i < 8; i++) box('l2', 1.86 + i * 1.03, 21.62, 0.32, 0.22, 0.015, F2 + 0.75, 'steelL');   // laptops
  box('l2', 11.9, 31.35, 0.45, 0.4, 0.5, F2, 'oak'); cyl('l2', 12.12, 31.55, 0.035, 0.28, F2 + 0.5, 'steel'); box('l2', 12.02, 31.45, 0.2, 0.2, 0.14, F2 + 0.78, 'lamp'); // bedside lamp
  box('l2', 12.6, 33.83, 1.2, 0.03, 0.8, F2 + 1.3, 'art');                                              // wall art

  // manager office (NE corner)
  box('l2', 12.7, 21.9, 0.8, 1.6, 0.05, F2 + 0.7, 'oak'); box('l2', 13.05, 22.0, 0.08, 1.4, 0.7, F2, 'steel');
  chair('l2', 13.7, 22.5, F2, 'e'); chair('l2', 12.0, 22.1, F2, 'w'); chair('l2', 12.0, 22.9, F2, 'w');
  box('l2', 11.6, 24.02, 3.0, 0.4, 1.8, F2, 'oak');

  // meeting room: 8 seats + screen, door from the corridor
  box('l2', 10.9, 25.9, 3.1, 1.2, 0.05, F2 + 0.7, 'oak'); box('l2', 11.3, 26.4, 2.3, 0.2, 0.7, F2, 'steel');
  [11.2, 12.22, 13.25].forEach(function (cx) { chair('l2', cx, 25.35, F2, 'n'); chair('l2', cx, 27.2, F2, 's'); });
  chair('l2', 10.35, 26.28, F2, 'w'); chair('l2', 14.1, 26.28, F2, 'e');
  box('l2', 11.5, 24.56, 2.0, 0.06, 1.1, F2 + 1.0, 'steel');

  // pantry + lockers
  box('l2', 4.3, 33.2, 2.6, 0.6, 0.88, F2, 'white'); box('l2', 4.3, 33.15, 2.6, 0.65, 0.04, F2 + 0.88, 'oak');
  box('l2', 4.3, 32.4, 0.7, 0.7, 1.8, F2, 'steelL');
  box('l2', 6.5, 31.0, 0.45, 2.0, 1.8, F2, 'oak');
  table('l2', 4.9, 31.0, 0.8, 0.8, F2);

  // WC: 2 cubicles + basin
  wall('l2', 'y', 8.5, 31.9, 33.8, F2, 2.0, 'white', null, 0.05);
  wall('l2', 'x', 31.9, 7.05, 9.95, F2, 2.0, 'white', [{ a: 7.4, b: 8.1, head: 2.0 }, { a: 8.9, b: 9.6, head: 2.0 }], 0.05);
  box('l2', 7.5, 33.15, 0.4, 0.6, 0.42, F2, 'white'); box('l2', 9.05, 33.15, 0.4, 0.6, 0.42, F2, 'white');
  box('l2', 9.35, 30.2, 0.5, 1.2, 0.85, F2, 'white');

  // bedroom: queen bed, wardrobe, desk, ensuite bathroom
  box('l2', 11.95, 32.0, 2.05, 1.65, 0.25, F2, 'oak'); box('l2', 12.0, 32.03, 2.0, 1.6, 0.22, F2 + 0.25, 'bed');
  box('l2', 11.87, 31.95, 0.07, 1.75, 1.0, F2, 'oak');
  box('l2', 12.08, 32.15, 0.42, 0.62, 0.14, F2 + 0.47, 'bed'); box('l2', 12.08, 32.88, 0.42, 0.62, 0.14, F2 + 0.47, 'bed');
  box('l2', 13.1, 32.03, 0.9, 1.6, 0.03, F2 + 0.47, 'fabric');
  box('l2', 10.1, 30.1, 1.6, 0.55, 2.2, F2, 'oak');
  box('l2', 14.25, 30.2, 0.5, 1.1, 0.05, F2 + 0.7, 'oak'); chair('l2', 13.7, 30.5, F2, 'w');
  box('l2', 10.15, 33.15, 0.4, 0.6, 0.42, F2, 'white'); box('l2', 10.1, 31.95, 0.45, 0.55, 0.85, F2, 'white');
  box('l2', 10.95, 32.95, 0.03, 0.85, 2.0, F2, 'glass');

  // ---------- Roof ----------
  function deck(z, h, m, e) {              // roof plate with the stair opening (x 1.2-4.2, y 30.3-33.8) left out
    box('roof', 0.6 - e, 19.8 - e, 14.8 + 2 * e, 10.5 + e, h, z, m); box('roof', 4.2, 30.3, 11.2 + e, 4.1 + e, h, z, m);
    box('roof', 0.6 - e, 30.3, 0.6 + e, 4.1 + e, h, z, m); box('roof', 1.2, 33.8, 3, 0.6 + e, h, z, m);
  }
  deck(L.ROOF, 0.25, 'roofwhite', 0);       // 1.2 m overhang shades the north glass in May-Jul
  box('roof', 0.6, 19.8, 14.8, 0.12, 0.35, L.ROOF + 0.25, 'roofwhite'); box('roof', 0.6, 34.28, 14.8, 0.12, 0.35, L.ROOF + 0.25, 'roofwhite');
  box('roof', 0.6, 19.8, 0.12, 14.6, 0.35, L.ROOF + 0.25, 'roofwhite'); box('roof', 15.28, 19.8, 0.12, 14.6, 0.35, L.ROOF + 0.25, 'roofwhite');
  deck(L.ROOF - 0.06, 0.06, 'steel', 0.05); deck(L.ROOF + 0.25, 0.03, 'gravel', -0.12);
  // stair house: the roof is reached by the main stair, not a ladder
  var RT = L.ROOF + 0.25;
  wall('roof', 'x', 30.2, 1.05, 4.35, RT, 2.4, 'wall', [{ a: 2.75, b: 3.85, head: 2.1 }], 0.15);
  wall('roof', 'x', 33.9, 1.05, 4.35, RT, 2.4, 'wall', null, 0.15);
  wall('roof', 'y', 1.12, 30.2, 33.9, RT, 2.4, 'wall', [{ a: 31.2, b: 32.8, sill: 1.2, head: 2.0, glass: true }], 0.15);
  wall('roof', 'y', 4.28, 30.2, 33.9, RT, 2.4, 'wall', null, 0.15);
  box('roof', 0.85, 29.6, 3.7, 4.5, 0.15, RT + 2.4, 'roofwhite'); box('roof', 0.8, 29.55, 3.8, 4.6, 0.05, RT + 2.55, 'steel');
  box('roof', 4.4, 31.5, 0.14, 0.18, 0.5, RT + 0.4, 'red');
  box('roof', 2.6, 28.4, 1.4, 1.8, 0.04, RT + 0.03, 'paving'); box('roof', 3.9, 28.4, 8.6, 1.2, 0.04, RT + 0.03, 'paving'); box('roof', 11.3, 29.6, 1.2, 2.2, 0.04, RT + 0.03, 'paving'); // service walkway to solar + tank
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
  for (i = 0; i < 5; i++) for (j = 0; j < 2; j++) {                          // solar tilted ~15 deg toward the south (back)
    box('roof', 2 + i * 2.5, 23.5 + j * 4, 2.1, 1.3, 0.05, L.ROOF + 0.62, 'solar', { rx: 0.26 });
    box('roof', 2.9 + i * 2.5, 23.6 + j * 4, 0.3, 0.1, 0.3, L.ROOF + 0.25, 'steel');
  }

  var labels = [
    { t: 'ถนนสาธารณะ', x: 4, y: -4.8, z: 0.1, g: 'site', dark: true },
    { t: 'ลานจอดรถ 6 คัน', x: 8, y: 11, z: 0.1, g: 'site' },
    { t: 'มอเตอร์ไซค์', x: 11.5, y: 15.4, z: 0.1, g: 'site' },
    { t: 'ลานนั่งกลางแจ้ง', x: 8, y: 20.2, z: 0.3, g: 'site' },
    { t: 'ส่วนบริการหลังร้าน', x: 10, y: 37.2, z: 0.1, g: 'site' },
    { t: 'ถังน้ำ + ปั๊ม', x: 6.3, y: 36.7, z: 2.3, g: 'site' },
    { t: 'ทางลาดรถเข็น', x: 8, y: 16.6, z: 0.4, g: 'site' },
    { t: 'ทางเข้าออฟฟิศ', x: 0.4, y: 29.3, z: 2.7, g: 'site' },
    { t: 'ทางขึ้นดาดฟ้า', x: 2.7, y: 32, z: L.ROOF + 3.1, g: 'roof' },
    { t: 'ถังน้ำ', x: 13, y: 32.3, z: L.ROOF + 2.3, g: 'roof' },
    { t: 'แผงโซลาร์ 10 แผง', x: 8, y: 25.6, z: L.ROOF + 1.3, g: 'roof' },
    { t: 'ห้องคุยโทรศัพท์', x: 1.8, y: 23.85, z: F2 + 2.4, g: 'plan2' }
  ];
  window.ZONES1.forEach(function (r) {
    labels.push({ t: r.name + ' · ' + r.area + ' ตร.ม.', x: r.u + 1, y: r.v + 21, z: G + 1.2, g: 'plan1' });
  });
  window.ROOMS.forEach(function (r) {
    labels.push({ t: r.name + ' · ' + r.area + ' ตร.ม.', x: r.u + 1, y: r.v + 21, z: F2 + 1.2, g: 'plan2' });
  });
  return { items: items, labels: labels };
};
