// CSS-3D renderer for model.js. No dependencies.
(function () {
  var S = 14, OX = 4, OY = 6; // px per metre, scene offset
  var st = { rot: -35, tilt: 58, zoom: 1.15, upper: true, cars: true, view: 'iso' };
  var VIEWS = { iso: [-35, 58], front: [0, 78], back: [180, 62], top: [0, 0] };
  var stage = document.getElementById('stage');
  var vp = document.getElementById('viewport');

  function px(x) { return (x + OX) * S; }
  function py(y) { return (y + OY) * S; }
  function shade(h, f, a) {
    var n = parseInt(h.slice(1), 16);
    var r = Math.min(255, Math.round(((n >> 16) & 255) * f)), g = Math.min(255, Math.round(((n >> 8) & 255) * f)), b = Math.min(255, Math.round((n & 255) * f));
    return 'rgba(' + r + ',' + g + ',' + b + ',' + (a == null ? 1 : a) + ')';
  }
  function face(frag, l, t, w, h, tr, c) {
    var d = document.createElement('div');
    d.className = 'f';
    d.style.cssText = 'left:' + l + 'px;top:' + t + 'px;width:' + w + 'px;height:' + h + 'px;transform:' + tr + ';background:' + c;
    frag.appendChild(d);
  }
  function draw() {
    var m = window.buildModel({ upper: st.upper, cars: st.cars });
    var frag = document.createDocumentFragment();
    m.items.forEach(function (it) {
      if (it.t === 'flat') { face(frag, px(it.x), py(it.y), it.w * S, it.d * S, 'translateZ(' + it.z * S + 'px)', it.c); return; }
      var zt = (it.z + it.h) * S + 'px', W = it.w * S, D = it.d * S, H = it.h * S, x = it.x, y = it.y;
      face(frag, px(x), py(y), W, D, 'translateZ(' + zt + ')', shade(it.c, 1.04, it.a));
      face(frag, px(x), py(y + it.d), W, H, 'translateZ(' + zt + ') rotateX(-90deg)', shade(it.c, 0.86, it.a));
      face(frag, px(x), py(y), W, H, 'translateZ(' + zt + ') rotateX(-90deg)', shade(it.c, 0.8, it.a));
      face(frag, px(x), py(y), D, H, 'translateZ(' + zt + ') rotateZ(90deg) rotateX(-90deg)', shade(it.c, 0.72, it.a));
      face(frag, px(x + it.w), py(y), D, H, 'translateZ(' + zt + ') rotateZ(90deg) rotateX(-90deg)', shade(it.c, 0.92, it.a));
    });
    m.labels.forEach(function (l) {
      var d = document.createElement('div');
      d.className = 'lab' + (l.dark ? ' dark' : '');
      d.textContent = l.t;
      d.style.cssText = 'left:' + px(l.x) + 'px;top:' + py(l.y) + 'px;transform:translateZ(2px)';
      frag.appendChild(d);
    });
    stage.innerHTML = '';
    stage.appendChild(frag);
    stage.style.width = 24 * S + 'px';
    stage.style.height = 44 * S + 'px';
    xform();
  }
  function xform() {
    stage.style.transform = 'translate(-50%,-50%) scale(' + st.zoom + ') rotateX(' + st.tilt + 'deg) rotateZ(' + st.rot + 'deg)';
    document.querySelectorAll('#views .btn').forEach(function (b) { b.classList.toggle('on', b.dataset.view === st.view); });
  }

  document.querySelectorAll('#views .btn').forEach(function (b) {
    b.addEventListener('click', function () { var v = VIEWS[b.dataset.view]; st.rot = v[0]; st.tilt = v[1]; st.view = b.dataset.view; xform(); });
  });
  function toggle(id, key) {
    var b = document.getElementById(id);
    b.addEventListener('click', function () { st[key] = !st[key]; b.classList.toggle('on', st[key]); draw(); });
  }
  toggle('tUp', 'upper'); toggle('tCars', 'cars');
  document.getElementById('zIn').addEventListener('click', function () { st.zoom = Math.min(2.4, st.zoom + 0.15); xform(); });
  document.getElementById('zOut').addEventListener('click', function () { st.zoom = Math.max(0.5, st.zoom - 0.15); xform(); });

  var drag = null;
  vp.addEventListener('pointerdown', function (e) { vp.setPointerCapture(e.pointerId); vp.classList.add('dragging'); drag = { x: e.clientX, y: e.clientY, r: st.rot, t: st.tilt }; });
  vp.addEventListener('pointermove', function (e) {
    if (!drag) return;
    st.rot = drag.r + (e.clientX - drag.x) * 0.4;
    st.tilt = Math.max(0, Math.min(85, drag.t - (e.clientY - drag.y) * 0.3));
    st.view = null; xform();
  });
  function end() { drag = null; vp.classList.remove('dragging'); }
  vp.addEventListener('pointerup', end); vp.addEventListener('pointercancel', end);
  vp.addEventListener('wheel', function (e) { e.preventDefault(); st.zoom = Math.max(0.5, Math.min(2.4, st.zoom - (e.deltaY > 0 ? 0.08 : -0.08))); xform(); }, { passive: false });

  draw();
})();
