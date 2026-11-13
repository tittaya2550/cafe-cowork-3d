// Scene data in metres. Lot is x: 0..16 (width), y: 0..38 (depth from road), z up.
// box(x, y, w, d, h, z, color, alpha)  flat(x, y, w, d, color, z)
// Edit dimensions here; app.js only renders.
window.LOT = { width: 16, depth: 38 };

window.buildModel = function (opts) {
  var items = [];
  function flat(x, y, w, d, c, z) { items.push({ t: 'flat', x: x, y: y, w: w, d: d, c: c, z: z || 0.02 }); }
  function box(x, y, w, d, h, z, c, a) { items.push({ t: 'box', x: x, y: y, w: w, d: d, h: h, z: z, c: c, a: a }); }
  var i;

  // Road + ground
  flat(-4, -6, 24, 6, '#3A3D40', 0);
  for (i = 0; i < 6; i++) flat(-3 + i * 4, -3.1, 2, 0.2, '#E8E8E8', 0.01);
  flat(-4, 0, 24, 38, '#E2DFD8', 0);

  // Front setback 3 m + driveway
  flat(0, 0, 16, 3, '#A9C9A4');
  flat(5, 0, 6, 3, '#B9BCBF', 0.03);

  // Parking 6 cars (5 standard + 1 accessible)
  flat(0, 3, 16, 14, '#9FA4A8');
  for (i = 1; i <= 5; i++) flat(i * 2.5 - 0.05, 3, 0.1, 5, '#F4F4F4', 0.04);
  flat(12.55, 3.05, 3.4, 4.9, '#7FA6C9', 0.03);
  flat(0, 14, 10, 3, '#8D9296', 0.03); // motorcycles

  // Outdoor terrace + side greens + back of house
  flat(0, 17, 16, 4, '#A9C9A4');
  flat(0, 21, 1, 13, '#A9C9A4'); flat(15, 21, 1, 13, '#A9C9A4');
  flat(0, 34, 16, 4, '#C9C9C6');
  box(2, 17.5, 12, 3, 0.15, 0, '#C8A77E'); // wood deck

  // Boundary walls + sign wall
  box(-0.15, 3, 0.15, 35, 1.2, 0, '#D8D4CC'); box(16, 3, 0.15, 35, 1.2, 0, '#D8D4CC'); box(0, 38, 16, 0.15, 1.2, 0, '#D8D4CC');
  box(9, 1, 5, 0.4, 1.2, 0, '#2A2A2A');

  // Trees
  box(2.8, 1.2, 0.4, 0.4, 2.6, 0, '#7A5A3E'); box(1.5, 0, 3, 3, 2.2, 2.4, '#5F8F5A');
  box(13.2, 18, 0.35, 0.35, 2.4, 0, '#7A5A3E'); box(12, 16.9, 2.6, 2.6, 2, 2.2, '#6A9A63');
  box(1.3, 18.4, 0.3, 0.3, 1.8, 0, '#7A5A3E'); box(0.4, 17.6, 2, 2, 1.6, 1.6, '#5F8F5A');
  for (i = 0; i < 3; i++) box(3.5 + i * 3, 18.5, 1, 1, 0.75, 0.15, '#F2F2F2'); // outdoor tables

  // Ground floor café (building 14 x 13 m at x1..15, y21..34)
  box(1, 30, 6, 4, 3.5, 0, '#E8E5DF');            // WC + stair core
  box(2, 22, 4, 1, 1.1, 0, '#C8A77E');            // bar counter
  for (i = 0; i < 3; i++) { box(8 + i * 2.3, 23, 1.1, 1.1, 0.75, 0, '#F2F2F2'); box(8 + i * 2.3, 26, 1.1, 1.1, 0.75, 0, '#F2F2F2'); }
  box(9, 30.5, 5.5, 3, 2.2, 0, '#D9CBB8');        // kitchen + store
  box(1, 21, 14, 13, 3.5, 0, '#9CC3CF', 0.42);    // glass shell
  box(4, 19.6, 8, 1.4, 0.15, 3.0, '#2A2A2A');     // entrance canopy

  // Back of house
  box(2, 35, 1, 0.8, 0.8, 0, '#BCBCBC'); box(3.4, 35, 1, 0.8, 0.8, 0, '#BCBCBC'); box(10, 35.5, 2.5, 1, 1.2, 0, '#6F7A72');

  if (opts.cars) {
    var cc = ['#D7D7D7', '#3B4A5A', null, '#9A2F2F', '#F0F0F0'];
    for (i = 0; i < 5; i++) { if (!cc[i]) continue; var cx = 0.35 + i * 2.5; box(cx, 3.4, 1.8, 4.3, 0.8, 0.25, cc[i]); box(cx + 0.1, 4.6, 1.6, 2.1, 0.55, 1.05, '#5A6670'); }
    for (i = 0; i < 6; i++) box(0.6 + i * 1.4, 14.5, 0.5, 1.8, 1, 0, '#333333');
  }

  if (opts.upper) {
    box(0.6, 20.4, 14.8, 13.8, 0.35, 3.5, '#F4F3EF');          // slab
    box(1, 21, 14, 13, 3.3, 3.85, '#FAFAF8');                  // co-working volume
    box(1.6, 20.95, 12.8, 0.05, 2.3, 4.4, '#6F8A96', 0.9);     // front window
    for (var lx = 1.2; lx < 14.8; lx += 0.55) box(lx, 20.55, 0.12, 0.25, 3.1, 3.95, '#B3865A'); // louvers
    box(0.8, 20.8, 14.4, 13.4, 0.3, 7.15, '#EEEDE9');          // roof
    for (i = 0; i < 5; i++) { box(2 + i * 2.5, 24, 2.1, 1.3, 0.12, 7.5, '#2E3D55'); box(2 + i * 2.5, 27, 2.1, 1.3, 0.12, 7.5, '#2E3D55'); }
  }

  var labels = [
    { t: 'ถนนสาธารณะ', x: 5, y: -4.6, dark: true },
    { t: 'ลานจอดรถ 6 คัน', x: 4.5, y: 9.8 },
    { t: 'มอเตอร์ไซค์', x: 10.4, y: 15 },
    { t: 'ลาน Outdoor', x: 5.6, y: 20.6 },
    { t: 'Back of house', x: 5, y: 36.6 }
  ];
  return { items: items, labels: labels };
};
