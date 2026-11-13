// Detailed scene props for app.js. Each builder returns a THREE.Group in metres:
// X = width, Y = up, Z = depth, origin on the ground at the prop's reference point.
window.PROPS = (function () {
  var T = window.THREE; if (!T) return {};
  var cache = {};
  function mat(key, o) { return cache[key] || (cache[key] = new T.MeshStandardMaterial(o)); }
  function rng(seed) { var s = (seed * 9301 + 49297) % 233280 || 1; return function () { s = (s * 9301 + 49297) % 233280; return s / 233280; }; }
  function mesh(g, geo, m, x, y, z) { var o = new T.Mesh(geo, m); o.position.set(x || 0, y || 0, z || 0); g.add(o); return o; }
  function rbox(w, h, d, r) { return T.RoundedBoxGeometry ? new T.RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2.2, h / 2.2, d / 2.2)) : new T.BoxGeometry(w, h, d); }

  // warm lamp material: app.js raises emissiveIntensity toward dusk
  var lamp = new T.MeshStandardMaterial({ color: '#FFF3DC', emissive: '#FFC978', emissiveIntensity: 0.5, roughness: 0.4 });

  // ---- tree: tapered trunk, branches, lumpy shaded canopy ----
  function blob(rad, seed, c1, c2) {
    var geo = new T.SphereGeometry(rad, 12, 9), p = geo.attributes.position, col = [], i, x, y, z, k, t, c = new T.Color();
    for (i = 0; i < p.count; i++) {
      x = p.getX(i); y = p.getY(i); z = p.getZ(i);
      k = 1 + 0.16 * Math.sin(x * 4.1 / rad + seed) * Math.sin(y * 3.7 / rad + seed * 1.7) + 0.12 * Math.sin(z * 5.3 / rad + seed * 0.6) * Math.cos(x * 2.9 / rad);
      p.setXYZ(i, x * k, y * k * 0.86, z * k);
      t = Math.max(0, Math.min(1, (y / rad + 1) / 2));
      c.copy(c1).lerp(c2, t).multiplyScalar(0.55 + 0.5 * t); col.push(c.r, c.g, c.b);
    }
    geo.setAttribute('color', new T.Float32BufferAttribute(col, 3)); geo.computeVertexNormals();
    return geo;
  }
  var leafMat = new T.MeshStandardMaterial({ vertexColors: true, roughness: 1 });
  function tree(a) {
    var g = new T.Group(), r = rng(a.seed || 1), h = a.h || 3, R = a.r || 1.5, i, ang, b;
    var bark = mat('bark', { color: '#5E4B3A', roughness: 1 });
    var trunk = mesh(g, new T.CylinderGeometry(0.07 + R * 0.03, 0.11 + R * 0.05, h, 9), bark, 0, h / 2, 0);
    trunk.rotation.z = (r() - 0.5) * 0.08;
    for (i = 0; i < 3; i++) {
      ang = i * 2.1 + r() * 0.8;
      b = mesh(g, new T.CylinderGeometry(0.03 + R * 0.012, 0.05 + R * 0.02, R * 0.95, 6), bark, Math.cos(ang) * R * 0.28, h + R * 0.12, Math.sin(ang) * R * 0.28);
      b.rotation.set(Math.sin(ang) * 0.75, 0, -Math.cos(ang) * 0.75);
    }
    var dark = new T.Color(['#3F6A35', '#476F33', '#3A6340'][Math.floor(r() * 3)]), light = new T.Color(['#7FA858', '#8DB25E', '#76A264'][Math.floor(r() * 3)]);
    mesh(g, blob(R * 0.74, r() * 9, dark, light), leafMat, 0, h + R * 0.55, 0);
    for (i = 0; i < 6; i++) {
      ang = i * 1.05 + r() * 0.6;
      mesh(g, blob(R * (0.42 + r() * 0.2), r() * 9, dark, light), leafMat, Math.cos(ang) * R * 0.6, h + R * (0.15 + r() * 0.5), Math.sin(ang) * R * 0.6);
    }
    return g;
  }

  // ---- shrub / potted plant ----
  function plant(a) {
    var g = new T.Group(), h = a.h || 1.1, r = rng(a.seed || 3), i, ang;
    if (!a.ground) mesh(g, new T.CylinderGeometry(0.2, 0.15, 0.36, 12), mat('pot', { color: a.pot || '#E9E6DF', roughness: 0.7 }), 0, 0.18, 0);
    var d = new T.Color('#33602F'), l = new T.Color('#6FA050'), base = a.ground ? 0 : 0.36;
    for (i = 0; i < 4; i++) { ang = i * 1.6 + r(); mesh(g, blob(h * (0.22 + r() * 0.1), r() * 9, d, l), leafMat, Math.cos(ang) * h * 0.14, base + h * (0.25 + r() * 0.4), Math.sin(ang) * h * 0.14); }
    return g;
  }

  // ---- car: extruded side profile, glazing, wheels, lights. Nose at z = 0, length along +Z ----
  function car(a) {
    var g = new T.Group(), W = 1.72, L = 4.4;
    var paint = mat('paint' + a.paint, { color: a.paint || '#D9DADB', roughness: 0.28, metalness: 0.55 });
    var glass = mat('carglass', { color: '#1B2229', roughness: 0.08, metalness: 0.8 });
    function ext(pts, w, bevel) {
      var s = new T.Shape(); pts.forEach(function (p, i) { if (i) s.lineTo(p[0], p[1]); else s.moveTo(p[0], p[1]); });
      var geo = new T.ExtrudeGeometry(s, { depth: w, bevelEnabled: !!bevel, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 3, curveSegments: 4 });
      geo.rotateY(-Math.PI / 2); geo.translate(w / 2, 0, 0); return geo;
    }
    mesh(g, ext([[0.05, 0.3], [0, 0.62], [0.12, 0.8], [1.0, 0.93], [1.55, 1.4], [3.0, 1.44], [3.72, 1.02], [4.3, 0.95], [4.4, 0.7], [4.36, 0.3]], W - 0.14, 0.07), paint);
    mesh(g, ext([[1.14, 0.97], [1.6, 1.36], [2.95, 1.4], [3.56, 1.04]], W + 0.03, 0), glass);                 // side windows
    mesh(g, ext([[1.0, 0.96], [1.53, 1.425], [1.62, 1.43], [1.1, 0.96]], W - 0.3, 0), glass);                 // windscreen
    mesh(g, ext([[3.02, 1.455], [3.75, 1.03], [3.66, 1.03], [2.94, 1.455]], W - 0.3, 0), glass);              // rear screen
    mesh(g, new T.BoxGeometry(W - 0.2, 0.16, L - 0.5), mat('carunder', { color: '#111214', roughness: 0.9 }), 0, 0.26, L / 2);
    var tyre = mat('tyre', { color: '#141517', roughness: 0.92 }), rim = mat('rim', { color: '#B9BCC0', roughness: 0.3, metalness: 0.8 });
    [0.85, 3.5].forEach(function (z) { [-1, 1].forEach(function (s) {
      var w = mesh(g, new T.CylinderGeometry(0.33, 0.33, 0.22, 20), tyre, s * (W / 2 - 0.1), 0.33, z); w.rotation.z = Math.PI / 2;
      var r = mesh(g, new T.CylinderGeometry(0.2, 0.2, 0.235, 14), rim, s * (W / 2 - 0.1), 0.33, z); r.rotation.z = Math.PI / 2;
    }); });
    var head = mat('headlamp', { color: '#F4F6F8', emissive: '#FFFFFF', emissiveIntensity: 0.25, roughness: 0.2 });
    var tail = mat('taillamp', { color: '#8E1B1B', emissive: '#B01010', emissiveIntensity: 0.35, roughness: 0.3 });
    [-1, 1].forEach(function (s) {
      mesh(g, new T.BoxGeometry(0.34, 0.12, 0.06), head, s * 0.58, 0.72, 0.03);
      mesh(g, new T.BoxGeometry(0.36, 0.13, 0.06), tail, s * 0.58, 0.82, L - 0.02);
    });
    mesh(g, new T.BoxGeometry(0.46, 0.13, 0.03), mat('plate', { color: '#F2F2EE', roughness: 0.6 }), 0, 0.48, L - 0.01);
    return g;
  }

  // ---- motorcycle (step-through scooter) ----
  function moto(a) {
    var g = new T.Group(), body = mat('moto' + a.paint, { color: a.paint || '#2B2D30', roughness: 0.35, metalness: 0.4 });
    var tyre = mat('tyre', { color: '#141517', roughness: 0.92 }), dark = mat('motodark', { color: '#1A1B1D', roughness: 0.7 });
    [0.28, 1.5].forEach(function (z) { var w = mesh(g, new T.CylinderGeometry(0.27, 0.27, 0.1, 16), tyre, 0, 0.27, z); w.rotation.z = Math.PI / 2; });
    mesh(g, rbox(0.3, 0.42, 0.75, 0.1), body, 0, 0.6, 1.2);
    mesh(g, rbox(0.34, 0.12, 0.5, 0.05), body, 0, 0.36, 0.72);
    mesh(g, rbox(0.3, 0.55, 0.16, 0.06), body, 0, 0.72, 0.42).rotation.x = -0.3;
    mesh(g, rbox(0.3, 0.1, 0.72, 0.05), dark, 0, 0.84, 1.2);
    var f = mesh(g, new T.CylinderGeometry(0.03, 0.03, 0.75, 6), dark, 0, 0.72, 0.32); f.rotation.x = -0.35;
    var hb = mesh(g, new T.CylinderGeometry(0.02, 0.02, 0.62, 6), dark, 0, 1.08, 0.42); hb.rotation.z = Math.PI / 2;
    return g;
  }

  // ---- person: neutral scale figure, 1.65-1.75 m ----
  function person(a) {
    var g = new T.Group(), r = rng(a.seed || 5), k = 0.95 + r() * 0.08;
    var shirts = ['#E8E4DC', '#6F7F8E', '#B8A58B', '#3F4B57', '#C9CDD0', '#8C6F5A'], pants = ['#2E3338', '#3E4650', '#5A5148'];
    var shirt = mat('shirt' + (a.seed % 6), { color: shirts[a.seed % 6], roughness: 0.9 }), pant = mat('pant' + (a.seed % 3), { color: pants[a.seed % 3], roughness: 0.9 });
    var skin = mat('skin', { color: '#C99B7A', roughness: 0.8 }), hair = mat('hair', { color: '#1F1A17', roughness: 0.9 });
    [-0.085, 0.085].forEach(function (x) { mesh(g, new T.CylinderGeometry(0.075, 0.06, 0.84, 8), pant, x, 0.42, 0); });
    mesh(g, rbox(0.38, 0.58, 0.22, 0.09), shirt, 0, 1.12, 0);
    [-0.235, 0.235].forEach(function (x) { mesh(g, new T.CylinderGeometry(0.048, 0.042, 0.58, 7), shirt, x, 1.1, 0); });
    mesh(g, new T.CylinderGeometry(0.045, 0.05, 0.08, 8), skin, 0, 1.44, 0);
    mesh(g, new T.SphereGeometry(0.105, 14, 10), skin, 0, 1.57, 0);
    mesh(g, new T.SphereGeometry(0.11, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.55), hair, 0, 1.585, -0.012);
    g.scale.setScalar(k);
    return g;
  }

  // ---- patio umbrella ----
  function umbrella() {
    var g = new T.Group();
    mesh(g, new T.CylinderGeometry(0.025, 0.025, 2.5, 8), mat('umpole', { color: '#D8D2C6', roughness: 0.5, metalness: 0.3 }), 0, 1.25, 0);
    mesh(g, new T.CylinderGeometry(0.22, 0.25, 0.08, 12), mat('umbase', { color: '#3A3C3F', roughness: 0.8 }), 0, 0.04, 0);
    mesh(g, new T.ConeGeometry(1.45, 0.5, 8, 1, true), mat('umcloth', { color: '#F1ECE1', roughness: 1, side: T.DoubleSide }), 0, 2.45, 0);
    return g;
  }

  // ---- pendant lamp hanging from `top` down by `drop` ----
  function pendant(a) {
    var g = new T.Group(), d = a.drop || 1;
    mesh(g, new T.CylinderGeometry(0.006, 0.006, d, 4), mat('cord', { color: '#151515', roughness: 0.8 }), 0, -d / 2, 0);
    mesh(g, new T.ConeGeometry(0.17, 0.2, 16, 1, true), mat('shade', { color: '#1B1B1C', roughness: 0.5, side: T.DoubleSide }), 0, -d - 0.02, 0);
    mesh(g, new T.SphereGeometry(0.055, 10, 8), lamp, 0, -d - 0.08, 0);
    g.userData.noShadow = true;
    return g;
  }

  // ---- concrete utility pole ----
  function pole() {
    var g = new T.Group(), c = mat('polec', { color: '#B5B2AA', roughness: 0.95 });
    mesh(g, new T.CylinderGeometry(0.09, 0.15, 9, 8), c, 0, 4.5, 0);
    mesh(g, new T.BoxGeometry(0.1, 0.1, 1.8), c, 0, 8.5, 0);
    [-0.75, 0, 0.75].forEach(function (z) { mesh(g, new T.CylinderGeometry(0.04, 0.05, 0.16, 6), mat('insul', { color: '#6B4A3A', roughness: 0.5 }), 0, 8.63, z); });
    return g;
  }

  // ---- neighbouring house: plastered box + hip roof ----
  function house(a) {
    var g = new T.Group(), w = a.w || 8, d = a.d || 10, h = a.h || 3.2;
    mesh(g, new T.BoxGeometry(w, h, d), mat('hwall' + (a.wall || ''), { color: a.wall || '#E6DFD2', roughness: 0.95 }), 0, h / 2, 0);
    var roof = mesh(g, new T.ConeGeometry(0.76, 1, 4, 1), mat('hroof' + (a.roof || ''), { color: a.roof || '#A5623F', roughness: 0.85, flatShading: true }), 0, h + 0.9, 0);
    roof.rotation.y = Math.PI / 4; roof.scale.set(w * 1.02, 1.8, d * 1.02);
    [-1, 1].forEach(function (s) { mesh(g, new T.BoxGeometry(0.05, 1.1, 1.3), mat('hwin', { color: '#3C4A54', roughness: 0.2, metalness: 0.4 }), s * (w / 2 + 0.01), 1.7, 0); });
    return g;
  }

  return { tree: tree, plant: plant, car: car, moto: moto, person: person, umbrella: umbrella, pendant: pendant, pole: pole, house: house, lamp: lamp };
})();
