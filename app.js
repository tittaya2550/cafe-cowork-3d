// three.js renderer for model.js: real sun position (sun.js), soft shadows, sky, orbit camera.
(function () {
  var THREE = window.THREE;
  var vp = document.getElementById('viewport');
  var labelLayer = document.getElementById('labels');
  if (!THREE) { vp.insertAdjacentHTML('beforeend', '<p class="err">โหลด three.js ไม่ได้ ตรวจว่ามีโฟลเดอร์ vendor อยู่ข้างไฟล์ index.html</p>'); return; }
  if (THREE.ColorManagement) THREE.ColorManagement.legacyMode = false;

  var LOT = window.LOT, SITE = window.SITE, LV = window.LEVELS;
  var st = { l2: true, roof: true, cars: true, labels: true, night: false, month: 11, hour: 15.5, view: 'iso' };

  // ---------- renderer / scene / camera ----------
  var renderer = new THREE.WebGLRenderer({ antialias: true });
  var small = window.matchMedia('(max-width: 900px), (pointer: coarse)').matches;   // phone / tablet: lighter settings
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.62;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  vp.insertBefore(renderer.domElement, vp.firstChild);

  var scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xcfd9e2, 160, 520);
  var camera = new THREE.PerspectiveCamera(32, 1, 1, 900);
  var controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.maxPolarAngle = Math.PI / 2 - 0.03;
  controls.minDistance = 8; controls.maxDistance = 160;

  // model metres -> three: X = x - W/2, Y = z (up), Z = y - D/2
  function P(x, y, z) { return new THREE.Vector3(x - LOT.width / 2, z, y - LOT.depth / 2); }

  // ---------- procedural textures ----------
  function canvasTex(draw, metres) {
    var c = document.createElement('canvas'); c.width = c.height = 256;
    draw(c.getContext('2d'));
    var t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1 / metres, 1 / metres);
    t.encoding = THREE.sRGBEncoding; t.anisotropy = 8;
    return t;
  }
  function rnd(seed) { var s = seed; return function () { s = (s * 16807) % 2147483647; return s / 2147483647; }; }
  function noise(hex, amp, metres, grain, blot) {
    return canvasTex(function (g) {
      var r = rnd(7 + amp * 1000), n = grain || 2, i, j, v;
      g.fillStyle = hex; g.fillRect(0, 0, 256, 256);
      for (i = 0; i < (blot || 0); i++) {      // large soft patches: wear, stains, uneven growth (drawn wrapped so the tile stays seamless)
        var bx = r() * 256, by = r() * 256, br = 18 + r() * 46, dx, dy;
        g.fillStyle = r() > 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)';
        for (dx = -256; dx <= 256; dx += 256) for (dy = -256; dy <= 256; dy += 256) { g.beginPath(); g.arc(bx + dx, by + dy, br, 0, 6.3); g.fill(); }
      }
      for (i = 0; i < 256; i += n) for (j = 0; j < 256; j += n) {
        v = r(); g.fillStyle = v > 0.5 ? 'rgba(255,255,255,' + (v - 0.5) * amp + ')' : 'rgba(0,0,0,' + (0.5 - v) * amp + ')';
        g.fillRect(i, j, n, n);
      }
    }, metres);
  }
  function planks(hex, metres, n) {
    return canvasTex(function (g) {
      var r = rnd(31), i, k, h = 256 / n;
      for (i = 0; i < n; i++) {
        g.fillStyle = hex; g.fillRect(0, i * h, 256, h);
        g.fillStyle = 'rgba(' + (r() > 0.5 ? '255,240,210' : '60,35,10') + ',' + (r() * 0.14) + ')'; g.fillRect(0, i * h, 256, h);
        for (k = 0; k < 14; k++) { g.fillStyle = 'rgba(70,40,15,' + (0.04 + r() * 0.07) + ')'; g.fillRect(0, i * h + r() * h, 256, 1); }
        g.fillStyle = 'rgba(40,25,10,0.45)'; g.fillRect(0, i * h, 256, 1.5);
        g.fillRect(r() * 256, i * h, 1.5, h);
      }
    }, metres);
  }
  function tiles(hex, metres, n) {
    return canvasTex(function (g) {
      g.fillStyle = hex; g.fillRect(0, 0, 256, 256);
      g.fillStyle = 'rgba(0,0,0,0.16)';
      for (var i = 0; i < n; i++) { g.fillRect(i * 256 / n, 0, 1.5, 256); g.fillRect(0, i * 256 / n, 256, 1.5); }
    }, metres);
  }

  // ---------- materials ----------
  var MATS = {}, glassMats = [];
  var BUMP = { wall: 0.004, bound: 0.006, concrete: 0.004, asphalt: 0.02, road: 0.025, gravel: 0.04, grass: 0.04, field: 0.04, curb: 0.01,
    oak: 0.006, oakfloor: 0.004, deck: 0.012, paving: 0.008, carpet: 0.012, fabric: 0.012, rug: 0.015, tile: 0.003, roofwhite: 0.004 };
  function std(o) { return new THREE.MeshStandardMaterial(o); }
  var DEF = {
    wall: function () { return std({ map: noise('#F4F2ED', 0.05, 3), roughness: 0.92 }); },
    slab: function () { return std({ color: '#E7E5DF', roughness: 0.9 }); },
    roofwhite: function () { return std({ map: noise('#F0EEE9', 0.05, 3), roughness: 0.85 }); },
    concrete: function () { return std({ map: noise('#BDBCB7', 0.1, 4, 3), roughness: 0.45 }); },
    steel: function () { return std({ color: '#1D1E20', roughness: 0.5, metalness: 0.55 }); },
    steelL: function () { return std({ color: '#B9BDC1', roughness: 0.35, metalness: 0.7 }); },
    oak: function () { return std({ map: planks('#C9A574', 1.2, 6), roughness: 0.7 }); },
    oakfloor: function () { return std({ map: planks('#D6BA92', 1.6, 10), roughness: 0.6 }); },
    deck: function () { return std({ map: planks('#B58B5E', 1.4, 10), roughness: 0.8 }); },
    carpet: function () { return std({ map: noise('#8B9198', 0.18, 1, 1), roughness: 1 }); },
    tile: function () { return std({ map: tiles('#DFE2E3', 1.2, 2), roughness: 0.35 }); },
    board: function () { return std({ color: '#FBFBFA', roughness: 0.15 }); },
    white: function () { return std({ color: '#F6F6F4', roughness: 0.55 }); },
    fabric: function () { return std({ map: noise('#75808D', 0.16, 0.6, 1), roughness: 1 }); },
    bed: function () { return std({ color: '#EFEAE1', roughness: 1 }); },
    asphalt: function () { return std({ map: noise('#9C9FA1', 0.22, 5, 1, 60), roughness: 0.95 }); },
    road: function () { return std({ map: noise('#3F4245', 0.28, 6, 1, 70), roughness: 0.92 }); },
    gravel: function () { return std({ map: noise('#C4C0B6', 0.4, 1.6, 2, 20), roughness: 1 }); },
    lineY: function () { return std({ color: '#D9B23A', roughness: 0.8 }); },
    curb: function () { return std({ map: noise('#C9C7C1', 0.12, 2, 2, 10), roughness: 0.9 }); },
    plinth: function () { return std({ color: '#6E6D69', roughness: 0.85 }); },
    rug: function () { return std({ map: noise('#B9B0A2', 0.22, 0.5, 1), roughness: 1 }); },
    art: function () { return std({ color: '#C7A47C', roughness: 0.8 }); },
    lamp: function () { return window.PROPS.lamp; },
    neon: function () { return new THREE.MeshStandardMaterial({ color: '#FF8FB3', emissive: '#FF2E78', emissiveIntensity: 2.6, roughness: 0.4 }); },
    amber: function () { return new THREE.MeshStandardMaterial({ color: '#FFD9A0', emissive: '#FFA63D', emissiveIntensity: 2.2, roughness: 0.4 }); },
    bottleG: function () { return std({ color: '#2F6B45', roughness: 0.12, metalness: 0.2 }); },
    bottleA: function () { return std({ color: '#8A4B1F', roughness: 0.12, metalness: 0.2 }); },
    bottleC: function () { return std({ color: '#C9D4D6', roughness: 0.08, metalness: 0.3 }); },
    red: function () { return std({ color: '#C0281F', roughness: 0.4 }); },
    sign: function () {
      var c = document.createElement('canvas'); c.width = 600; c.height = 120; var g = c.getContext('2d');
      g.fillStyle = '#F6F4EE'; g.fillRect(0, 0, 600, 120); g.fillStyle = '#1C1C1C';
      g.font = "600 62px 'IBM Plex Sans Thai', system-ui, sans-serif"; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('คาเฟ่ + ออฟฟิศ', 300, 62);
      var t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1 / 3, 1 / 0.6); t.anisotropy = 8;
      return std({ map: t, roughness: 0.6 });
    },
    paving: function () { return std({ map: tiles('#CFCBC2', 2.4, 4), roughness: 0.9 }); },
    line: function () { return std({ color: '#F3F3F0', roughness: 0.8 }); },
    bluebay: function () { return std({ color: '#6F9CC6', roughness: 0.85 }); },
    grass: function () { return std({ map: noise('#6F9E5C', 0.34, 3, 1, 50), roughness: 1 }); },
    field: function () { return std({ map: noise('#9FA67C', 0.26, 14, 2, 90), roughness: 1 }); },
    bound: function () { return std({ map: noise('#DAD6CE', 0.07, 3), roughness: 0.95 }); },
    trunk: function () { return std({ color: '#6E5138', roughness: 1 }); },
    leaf1: function () { return std({ color: '#557F4B', roughness: 1, flatShading: true }); },
    leaf2: function () { return std({ color: '#6C9A5C', roughness: 1, flatShading: true }); },
    binG: function () { return std({ color: '#4E6B58', roughness: 0.7 }); },
    tyre: function () { return std({ color: '#17181A', roughness: 0.9 }); },
    solar: function () {
      var t = canvasTex(function (g) {
        g.fillStyle = '#131F36'; g.fillRect(0, 0, 256, 256); g.fillStyle = 'rgba(170,190,220,0.4)';
        for (var i = 0; i <= 8; i++) { g.fillRect(i * 32 - 0.5, 0, 1, 256); g.fillRect(0, i * 32 - 0.5, 256, 1); }
      }, 1.3);
      return std({ map: t, roughness: 0.22, metalness: 0.65 });
    },
    cglass: function () { return std({ color: '#222B33', roughness: 0.12, metalness: 0.7 }); },
    glass: function () {
      var m = new THREE.MeshPhysicalMaterial({ color: '#BFDCE0', roughness: 0.04, metalness: 0, transparent: true, opacity: 0.2, depthWrite: false, side: THREE.DoubleSide, envMapIntensity: 1.0 });
      glassMats.push(m); return m;
    }
  };
  function mat(name) {
    if (!MATS[name]) {
      MATS[name] = name.charAt(0) === '#' ? std({ color: name, roughness: 0.35, metalness: 0.35 }) : (DEF[name] || DEF.white)();
      var bump = BUMP[name], mm = MATS[name];
      if (bump && mm.map) { mm.bumpMap = mm.map; mm.bumpScale = bump; }
    }
    return MATS[name];
  }

  // Box whose UVs are in metres, so textures keep real-world scale on every face.
  function boxGeo(w, h, d) {
    var g = new THREE.BoxGeometry(w, h, d), uv = g.attributes.uv, f, k, su, sv;
    for (f = 0; f < 6; f++) {
      su = f < 2 ? d : w; sv = (f === 2 || f === 3) ? d : h;
      for (k = 0; k < 4; k++) uv.setXY(f * 4 + k, uv.getX(f * 4 + k) * su, uv.getY(f * 4 + k) * sv);
    }
    return g;
  }

  // ---------- build scene from model data ----------
  var groups = {};
  ['site', 'cars', 'l1', 'l2', 'roof', 'night'].forEach(function (n) { groups[n] = new THREE.Group(); scene.add(groups[n]); });
  var model = window.buildModel();
  model.items.forEach(function (it) {
    if (it.t === 'prop') {
      var build = window.PROPS[it.k]; if (!build) return;
      var pg = build(it.a), ns = pg.userData.noShadow;
      pg.position.copy(P(it.x, it.y, it.z)); pg.rotation.y = -it.rot * Math.PI / 180;
      pg.traverse(function (o) { if (o.isMesh) { o.castShadow = !ns; o.receiveShadow = !ns; } });
      groups[it.g].add(pg); return;
    }
    var mesh, m = mat(it.m);
    if (it.t === 'box') {
      var soft = (it.m === 'fabric' || it.m === 'bed') && Math.min(it.w, it.h, it.d) >= 0.1 && THREE.RoundedBoxGeometry;
      mesh = new THREE.Mesh(soft ? new THREE.RoundedBoxGeometry(it.w, it.h, it.d, 3, 0.05) : boxGeo(it.w, it.h, it.d), m);
      mesh.position.copy(P(it.x + it.w / 2, it.y + it.d / 2, it.z + it.h / 2));
      if (it.rx) mesh.rotation.x = it.rx;
      if (it.rz) mesh.rotation.z = it.rz;
    } else if (it.t === 'cyl') {
      mesh = new THREE.Mesh(new THREE.CylinderGeometry(it.r * 0.85, it.r, it.h, 10), m);
      mesh.position.copy(P(it.x, it.y, it.z + it.h / 2));
    } else {
      mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(it.r, 1), m);
      mesh.position.copy(P(it.x, it.y, it.z));
    }
    var isGlass = it.m === 'glass' || it.m === 'lamp' || it.m === 'neon' || it.m === 'amber', isGround = it.t === 'box' && it.h <= 0.1 && it.z === 0;
    mesh.castShadow = !isGlass && !isGround;
    mesh.receiveShadow = !isGlass;
    if (isGlass) mesh.renderOrder = 2;
    groups[it.g].add(mesh);
  });

  // North arrow on the ground, east of the lot
  (function () {
    var g = new THREE.Group(), red = std({ color: '#C8402F', roughness: 0.7 });
    var shaft = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.06, 3.2), red); shaft.position.z = 0.4;
    var head = new THREE.Mesh(new THREE.ConeGeometry(0.85, 1.8, 3), red);
    head.rotation.x = -Math.PI / 2; head.position.z = -2; head.scale.y = 1; head.scale.z = 0.08;
    var disc = new THREE.Mesh(new THREE.CylinderGeometry(2.9, 2.9, 0.04, 48), std({ color: '#F4F2EC', roughness: 0.9 }));
    g.add(disc, shaft, head);
    g.position.copy(P(LOT.width + 5.5, 9, 0.06)); shaft.position.y = head.position.y = 0.05;
    g.rotation.y = SITE.facing * Math.PI / 180;   // -Z (toward the road) rotated onto true north
    g.traverse(function (o) { o.receiveShadow = true; });
    groups.site.add(g);
    var n = SITE.facing * Math.PI / 180;
    model.labels.push({ t: 'N', x: LOT.width + 5.5 - Math.sin(n) * 3.6, y: 9 - Math.cos(n) * 3.6, z: 0.2, g: 'site', north: true });
  })();

  // ---------- sky + sun ----------
  // gradient sky dome with a sun glow (also used as the reflection environment for glass)
  var skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: new THREE.Color() }, bot: { value: new THREE.Color() }, sunDir: { value: new THREE.Vector3(0, 1, 0) }, glow: { value: new THREE.Color() },
      cloud: { value: new THREE.Color() }, gnd: { value: new THREE.Color(0.52, 0.53, 0.44) }, night: { value: 0 } },
    vertexShader: 'varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: 'uniform vec3 top; uniform vec3 bot; uniform vec3 sunDir; uniform vec3 glow; uniform vec3 cloud; uniform vec3 gnd; uniform float night; varying vec3 vDir;' +
      'float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }' +
      'float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y); }' +
      'float fbm(vec2 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { v += a * vn(p); p = p * 2.03 + 7.1; a *= 0.5; } return v; }' +
      'void main(){ vec3 d = normalize(vDir); float h = pow(clamp(d.y, 0.0, 1.0), 0.45); vec3 c = mix(bot, top, h);' +
      'float s = max(dot(d, normalize(sunDir)), 0.0);' +
      'if (d.y > 0.01) { vec2 uv = d.xz / (d.y + 0.14) * 1.15; float k = smoothstep(0.5, 0.8, fbm(uv + 3.7)) * smoothstep(0.01, 0.22, d.y); c = mix(c, cloud * (0.86 + 0.14 * fbm(uv * 3.0)), k * 0.8); }' +
      'c += glow * (pow(s, 600.0) * 1.5 + pow(s, 12.0) * 0.2);' +
      'if (night > 0.5 && d.y > 0.04) { vec2 sg = floor(d.xz / (d.y + 0.25) * 170.0); c += vec3(0.85, 0.9, 1.0) * step(0.9982, hash(sg)) * (0.45 + 0.55 * hash(sg + 3.1)); }' +
      'c = mix(c, gnd, smoothstep(0.0, -0.06, d.y)); gl_FragColor = vec4(c, 1.0); }'
  });
  var sky = new THREE.Mesh(new THREE.SphereGeometry(800, 32, 16), skyMat); scene.add(sky);
  var envScene = new THREE.Scene(); envScene.add(new THREE.Mesh(new THREE.SphereGeometry(50, 32, 16), skyMat));
  var su = skyMat.uniforms;
  var hemi = new THREE.HemisphereLight(0xcfe2ff, 0x9a917f, 0.75); scene.add(hemi);
  var sun = new THREE.DirectionalLight(0xffffff, 3); scene.add(sun, sun.target);
  sun.castShadow = true;
  sun.shadow.mapSize.set(small ? 2048 : 4096, small ? 2048 : 4096);
  var sc = sun.shadow.camera; sc.left = -34; sc.right = 34; sc.top = 34; sc.bottom = -34; sc.near = 10; sc.far = 260;
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.04;
  var pmrem = new THREE.PMREMGenerator(renderer), envRT = null, envTimer = null;
  var lamps = [], nightLights = [];
  [[8, 19, 2.7, 0xffc98a, 1.5, 13], [8.5, 28.6, 2.3, 0xff5a9a, 1.1, 7], [12.5, 23.5, 2.6, 0xffb060, 0.9, 9], [3.6, 25.4, 2.6, 0xffb060, 0.9, 9]].slice(0, small ? 2 : 4).forEach(function (d) {
    var nl = new THREE.PointLight(d[3], d[4], d[5], 2); nl.position.copy(P(d[0] + window.BLDG.dx, d[1] + window.BLDG.dy, d[2])); nl.visible = false; groups.night.add(nl); nightLights.push(nl);
  });
  [['l1', 5, 24.6, 2.9], ['l1', 11.2, 27.9, 2.6], ['l2', 6.3, 26.1, LV.F2 + 2.3], ['l2', 12.4, 26.5, LV.F2 + 2.3]].concat(small ? [] :
    [['l1', 11.4, 24.3, 2.9], ['l2', 5, 22.6, LV.F2 + 2.5], ['l2', 12.4, 22.6, LV.F2 + 2.5]]).forEach(function (d) {
    var pl = new THREE.PointLight(0xffd6a0, 0, 12, 2); pl.position.copy(P(d[1] + window.BLDG.dx, d[2] + window.BLDG.dy, d[3])); groups[d[0]].add(pl); lamps.push(pl);
  });

  function compass(az) { return ['เหนือ', 'ตะวันออกเฉียงเหนือ', 'ตะวันออก', 'ตะวันออกเฉียงใต้', 'ใต้', 'ตะวันตกเฉียงใต้', 'ตะวันตก', 'ตะวันตกเฉียงเหนือ'][Math.round(az / 45) % 8]; }
  function hhmm(h) { var m = Math.round(h * 60); return Math.floor(m / 60) + ':' + ('0' + (m % 60)).slice(-2); }
  var MONTHS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

  function updateSun() {
    var s = window.sunPosition(SITE.lat, SITE.lon, SITE.tz, window.dayOfYear21(st.month), st.hour);
    var R = Math.PI / 180, az = s.az * R, alt = s.alt * R, f = SITE.facing * R;
    var E = Math.cos(alt) * Math.sin(az), N = Math.cos(alt) * Math.cos(az);
    // direction toward the sun in model axes (x = width, y = depth), then three axes
    var mx = E * Math.cos(f) - N * Math.sin(f), my = -E * Math.sin(f) - N * Math.cos(f);
    var dir = new THREE.Vector3(mx, Math.sin(alt), my);
    var up = Math.max(0, Math.sin(alt)), k = Math.min(1, up * 4);
    sun.position.copy(dir).multiplyScalar(120).add(new THREE.Vector3(0, 0, 0));
    sun.intensity = 3.4 * k;
    sun.color.setRGB(1, 0.78 + 0.2 * Math.min(1, up * 2.2), 0.55 + 0.4 * Math.min(1, up * 2));
    hemi.intensity = 0.12 + 0.2 * Math.min(1, up * 3);
    su.sunDir.value.copy(dir);
    var day = Math.min(1, up * 3.5);
    su.top.value.setRGB(0.20 + 0.05 * day, 0.36 + 0.14 * day, 0.60 + 0.24 * day);
    su.bot.value.setRGB(0.93, 0.66 + 0.24 * day, 0.50 + 0.44 * day);
    su.glow.value.setRGB(1, 0.85 + 0.1 * day, 0.6 + 0.3 * day).multiplyScalar(up > 0 ? 1 : 0);
    su.cloud.value.setRGB(1, 0.9 + 0.1 * day, 0.8 + 0.2 * day);
    scene.fog.color.copy(su.bot.value);
    var dusk = 1 - Math.min(1, Math.max(0, (s.alt - 4) / 12));     // interior lights come on as the sun gets low
    window.PROPS.lamp.emissiveIntensity = 0.4 + 2.4 * dusk;
    lamps.forEach(function (l) { l.intensity = 1.15 * dusk; l.color.setHex(0xffd6a0); });
    renderer.toneMappingExposure = 0.5 + 0.12 * Math.min(1, up * 3);
    su.night.value = st.night ? 1 : 0; su.gnd.value.setRGB(0.52, 0.53, 0.44);
    if (st.night) {                              // cafe-and-bar evening: moonlight outside, warm lamps + neon inside
      dir.set(0.35, 0.8, -0.48).normalize();
      sun.position.copy(dir).multiplyScalar(120); sun.intensity = 0.32; sun.color.setRGB(0.55, 0.66, 1);
      hemi.intensity = 0.07; su.sunDir.value.copy(dir);
      su.top.value.setRGB(0.012, 0.02, 0.06); su.bot.value.setRGB(0.07, 0.075, 0.13); su.glow.value.setRGB(0.5, 0.55, 0.7);
      su.cloud.value.setRGB(0.09, 0.1, 0.16); su.gnd.value.setRGB(0.03, 0.035, 0.04); scene.fog.color.setRGB(0.035, 0.04, 0.07);
      window.PROPS.lamp.emissiveIntensity = 3.4; lamps.forEach(function (l) { l.intensity = 1.05; l.color.setHex(0xffb066); });
      renderer.toneMappingExposure = 0.9;
    }
    nightLights.forEach(function (l) { l.visible = st.night; });

    // which facades get direct sun
    var lit = [];
    if (s.alt > 0) {
      if (my < -0.12) lit.push('ด้านหน้า (ถนน)'); if (my > 0.12) lit.push('ด้านหลัง');
      if (mx < -0.12) lit.push('ด้านข้างทิศตะวันตก'); if (mx > 0.12) lit.push('ด้านข้างทิศตะวันออก');
    }
    document.getElementById('sunOut').innerHTML = st.night ? '<b>โหมดกลางคืน · คาเฟ่แอนด์บาร์</b><br>ไฟในร้าน ไฟราวบนลานนั่ง ไฟนีออนหลังบาร์ และเทียนบนโต๊ะเปิดทั้งหมด' : s.alt <= 0 ? 'ดวงอาทิตย์อยู่ใต้ขอบฟ้า' :
      'ดวงอาทิตย์อยู่ทิศ<b>' + compass(s.az) + '</b> (' + s.az.toFixed(0) + '°) · มุมเงย <b>' + s.alt.toFixed(0) + '°</b><br>แดดส่องตรง: ' + lit.join(', ');
    document.getElementById('monthOut').textContent = '21 ' + MONTHS[st.month - 1];
    document.getElementById('hourOut').textContent = hhmm(st.hour) + ' น.';

    clearTimeout(envTimer);
    envTimer = setTimeout(function () {         // refresh sky reflections once the slider settles
      var rt = pmrem.fromScene(envScene);
      if (envRT) envRT.dispose();
      envRT = rt;
      scene.environment = rt.texture;            // sky lights and reflects on every material
      render();
    }, 120);
    render();
  }

  // ---------- labels (HTML, projected each frame) ----------
  var labelEls = model.labels.map(function (l) {
    var d = document.createElement('div');
    d.className = 'lab' + (l.dark ? ' dark' : '') + (l.g === 'plan2' || l.g === 'plan1' ? ' room' : '') + (l.north ? ' north' : '');
    d.textContent = l.t; labelLayer.appendChild(d);
    return { el: d, pos: P(l.x, l.y, l.z), g: l.g };
  });
  var tmp = new THREE.Vector3();
  function placeLabels() {
    var w = vp.clientWidth, h = vp.clientHeight;
    labelEls.forEach(function (l) {
      var show = st.labels && (l.g === 'plan2' ? (st.l2 && !st.roof) : l.g === 'plan1' ? !st.l2 : l.g === 'roof' ? (st.l2 && st.roof) : true);
      tmp.copy(l.pos).project(camera);
      if (!show || tmp.z > 1 || Math.abs(tmp.x) > 1.05 || Math.abs(tmp.y) > 1.05) { l.el.style.display = 'none'; return; }
      l.el.style.display = '';
      l.el.style.transform = 'translate(-50%,-50%) translate(' + ((tmp.x + 1) / 2 * w).toFixed(1) + 'px,' + ((1 - tmp.y) / 2 * h).toFixed(1) + 'px)';
    });
  }

  // ---------- render on demand ----------
  var queued = false;
  function render() {
    if (queued) return; queued = true;
    requestAnimationFrame(function () { queued = false; renderer.render(scene, camera); placeLabels(); });
  }
  controls.addEventListener('change', function () { setView(null); render(); });
  function resize() {
    var w = vp.clientWidth, h = vp.clientHeight;
    if (!w || !h) return;                      // layout tab hidden
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); render();
  }
  window.addEventListener('resize', resize);

  // ---------- views + toggles ----------
  var BC = [8 + window.BLDG.dx - LOT.width / 2, 27.5 + window.BLDG.dy - LOT.depth / 2];   // building centre in three coords
  var VIEWS = {              // [camera offset from target], [target] in three coords
    iso: [[-30, 27, -40], [2, 2, 0]],
    front: [[2, 6, -46], [3, 3.2, 1]],
    west: [[-48, 15, -10], [3, 3, 1]],
    back: [[10, 20, 46], [2, 2, 0]],
    top: [[0, 52, 0.01], [0, 0, 0]],
    plan1: [[0, 41, 0.01], [BC[0], 0, BC[1]]],
    plan2: [[0, 37, 0.01], [BC[0], LV.F2, BC[1]]]
  };
  var settingView = false;
  function setView(name) {
    if (settingView) return;
    st.view = name;
    document.querySelectorAll('#views .btn').forEach(function (b) { b.classList.toggle('on', b.dataset.view === name); });
    if (!name) return;
    var v = VIEWS[name];
    settingView = true;
    controls.target.set(v[1][0], v[1][1], v[1][2]);
    var k = Math.max(1, 1.2 / camera.aspect);   // pull back on portrait screens so the model still fits
    camera.position.set(v[1][0] + v[0][0] * k, v[1][1] + v[0][1] * k, v[1][2] + v[0][2] * k);
    controls.update();
    settingView = false;
    if (name === 'plan2') { st.roof = false; st.l2 = true; }
    else if (name === 'plan1') { st.l2 = false; }
    else { st.l2 = true; st.roof = true; }
    applyToggles();
  }
  function applyToggles() {
    groups.l2.visible = st.l2; groups.roof.visible = st.l2 && st.roof; groups.cars.visible = st.cars; groups.night.visible = st.night;
    document.getElementById('tNight').classList.toggle('on', st.night);
    [['tL2', 'l2'], ['tRoof', 'roof'], ['tCars', 'cars'], ['tLab', 'labels']].forEach(function (p) { document.getElementById(p[0]).classList.toggle('on', st[p[1]]); });
    render();
  }
  document.querySelectorAll('#views .btn').forEach(function (b) { b.addEventListener('click', function () { setView(b.dataset.view); }); });
  [['tL2', 'l2'], ['tRoof', 'roof'], ['tCars', 'cars'], ['tLab', 'labels']].forEach(function (p) {
    document.getElementById(p[0]).addEventListener('click', function () { st[p[1]] = !st[p[1]]; applyToggles(); });
  });

  document.getElementById('tNight').addEventListener('click', function () { st.night = !st.night; applyToggles(); updateSun(); });
  var mSl = document.getElementById('month'), hSl = document.getElementById('hour');
  mSl.value = st.month; hSl.value = st.hour;
  mSl.addEventListener('input', function () { st.month = +mSl.value; updateSun(); });
  hSl.addEventListener('input', function () { st.hour = +hSl.value; updateSun(); });
  document.querySelectorAll('#presets .btn').forEach(function (b) {
    b.addEventListener('click', function () { st.hour = +b.dataset.hour; hSl.value = st.hour; updateSun(); });
  });

  // room legends
  document.getElementById('zones1').innerHTML = window.ZONES1.map(function (r) {
    return '<div class="rm"><span>' + r.name + '</span><span>' + r.area + ' ตร.ม. · ' + Math.round(r.area / 1.82) + '%</span></div>';
  }).join('');
  document.getElementById('rooms').innerHTML = window.ROOMS.map(function (r) {
    return '<div class="rm"><span>' + r.name + '</span><span>' + r.area + ' ตร.ม.</span></div>';
  }).join('');

  resize(); setView('iso'); updateSun();
  if (!vp.clientWidth) window.addEventListener('resize', function first() {      // page opened on another tab
    if (vp.clientWidth) { window.removeEventListener('resize', first); setView('iso'); }
  });
  window.__model = { st: st, setView: setView, updateSun: updateSun, applyToggles: applyToggles, hSl: hSl, mSl: mSl };
})();
