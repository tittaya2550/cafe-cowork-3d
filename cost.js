// Rough order-of-magnitude budget (THB, excl. VAT and land). Unit rates are 2026 ballpark
// ranges for a provincial city, NOT quotations. Edit qty / lo / hi / p here; everything recalculates.
// p = priority: 1 must-have to open, 2 should-have, 3 can be deferred.
window.COST = {
  groups: {
    1: { t: 'จำเป็น', d: 'ขาดไม่ได้ ถ้าไม่มีเปิดร้านไม่ได้' },
    2: { t: 'ควรมี', d: 'ทำให้ใช้งานได้ครบและอยู่สบาย ทำพร้อมกันจะถูกกว่ามาเก็บทีหลัง' },
    3: { t: 'เลื่อนได้', d: 'ทำเฟสถัดไปได้โดยไม่กระทบการเปิดร้าน' }
  },
  items: [
    { p: 1, n: 'โครงสร้าง + สถาปัตย์ อาคาร 2 ชั้น', qty: 364, u: 'ตร.ม.', lo: 14000, hi: 18000 },
    { p: 1, n: 'ไฟฟ้า ประปา สุขาภิบาล', qty: 364, u: 'ตร.ม.', lo: 2500, hi: 3500 },
    { p: 1, n: 'ถมดินปรับระดับ ~0.8 ม. (สมมติ)', qty: 480, u: 'ลบ.ม.', lo: 300, hi: 450 },
    { p: 1, n: 'ตกแต่ง + เฟอร์นิเจอร์ คาเฟ่ ชั้น 1', qty: 182, u: 'ตร.ม.', lo: 7000, hi: 11000 },
    { p: 1, n: 'อุปกรณ์คาเฟ่ (เครื่องชง ตู้แช่ เครื่องคิดเงิน)', qty: 1, u: 'ชุด', lo: 350000, hi: 800000 },
    { p: 1, n: 'เครื่องปรับอากาศ', qty: 364, u: 'ตร.ม.', lo: 1500, hi: 2200 },
    { p: 1, n: 'ลานจอด + ทางรถ คอนกรีต', qty: 306, u: 'ตร.ม.', lo: 900, hi: 1300 },
    { p: 1, n: 'ป้ายร้านหน้าแปลง', qty: 1, u: 'ชุด', lo: 60000, hi: 120000 },
    { p: 1, n: 'บันไดขึ้นดาดฟ้า ห้องคลุมบันได ราวกันตก', qty: 1, u: 'ชุด', lo: 280000, hi: 450000 },
    { p: 1, n: 'ถังน้ำ ปั๊ม ถังดักไขมัน ถังบำบัดน้ำเสีย', qty: 1, u: 'ชุด', lo: 180000, hi: 320000 },
    { p: 1, n: 'ถังดับเพลิง ระบบแจ้งเหตุ ไฟฉุกเฉิน ป้ายทางออก', qty: 1, u: 'ชุด', lo: 90000, hi: 180000 },
    { p: 1, n: 'ทางลาดรถเข็น + ทางเดินข้างอาคาร', qty: 1, u: 'ชุด', lo: 60000, hi: 110000 },
    { p: 2, n: 'ตกแต่ง + เฟอร์นิเจอร์ ออฟฟิศ ชั้น 2', qty: 182, u: 'ตร.ม.', lo: 6000, hi: 9000 },
    { p: 2, n: 'ระแนงบังแดดทิศตะวันตก + กันสาด', qty: 70, u: 'ตร.ม.', lo: 3500, hi: 5500 },
    { p: 2, n: 'รั้วรอบแปลง 3 ด้าน', qty: 86, u: 'ม.', lo: 2800, hi: 4000 },
    { p: 3, n: 'ลานไม้กลางแจ้ง + จัดสวน', qty: 1, u: 'ชุด', lo: 190000, hi: 330000 },
    { p: 3, n: 'โซลาร์เซลล์ 10 แผง ~5.5 กิโลวัตต์', qty: 1, u: 'ชุด', lo: 170000, hi: 240000 }
  ],
  design: [0.06, 0.08],   // architect + engineer + permit, share of construction
  reserve: 0.10,          // contingency
  gfa: 364
};

(function () {
  var C = window.COST;
  function m(v) { return (v / 1e6).toFixed(2); }
  function rng(lo, hi) { return m(lo) + ' – ' + m(hi); }
  function set(id, html) { var e = document.getElementById(id); if (e) e.innerHTML = html; }
  var fLo = 1 + C.design[0] + C.reserve, fHi = 1 + C.design[1] + C.reserve;
  var sub = { 1: [0, 0], 2: [0, 0], 3: [0, 0] }, html = '', p;

  [1, 2, 3].forEach(function (p) {
    var g = C.groups[p], rows = '';
    C.items.forEach(function (it) {
      if (it.p !== p) return;
      var a = it.qty * it.lo, b = it.qty * it.hi; sub[p][0] += a; sub[p][1] += b;
      var note = it.qty === 1 ? 'เหมา' : it.qty.toLocaleString() + ' ' + it.u + ' × ' + it.lo.toLocaleString() + '–' + it.hi.toLocaleString() + ' บาท';
      rows += '<tr><td>' + it.n + '<small>' + note + '</small></td><td>' + rng(a, b) + '</td></tr>';
    });
    html += '<section class="tier t' + p + '"><header><span class="tag">' + p + '</span><div><h3>' + g.t + '</h3><p>' + g.d + '</p></div></header>' +
      '<table><tbody>' + rows +
      '<tr class="fee"><td>ค่าออกแบบ ขออนุญาต 6–8% + เงินสำรอง 10%</td><td>' + rng(sub[p][0] * (fLo - 1), sub[p][1] * (fHi - 1)) + '</td></tr>' +
      '<tr class="sum"><td>รวมกลุ่ม "' + g.t + '"</td><td>' + rng(sub[p][0] * fLo, sub[p][1] * fHi) + '</td></tr></tbody></table></section>';
  });
  set('cost', html);

  var c1 = [sub[1][0] * fLo, sub[1][1] * fHi];
  var c2 = [c1[0] + sub[2][0] * fLo, c1[1] + sub[2][1] * fHi];
  var c3 = [c2[0] + sub[3][0] * fLo, c2[1] + sub[3][1] * fHi];
  function card(cls, title, v, note) { return '<div class="card ' + cls + '"><p class="k">' + title + '</p><p class="v">' + rng(v[0], v[1]) + '<small> ล้านบาท</small></p><p class="s">' + note + '</p></div>'; }
  set('budgetCards',
    card('t1', 'ขั้นต่ำเพื่อเปิดร้าน', c1, 'เฉพาะกลุ่มจำเป็น') +
    card('t2', 'ใช้งานครบทั้งอาคาร', c2, 'จำเป็น + ควรมี') +
    card('t3', 'ครบตามแบบ', c3, 'เฉลี่ย ' + Math.round(c3[0] / C.gfa / 1000) + '–' + Math.round(c3[1] / C.gfa / 1000) + ' พันบาท/ตร.ม.'));
  set('kMust', rng(c1[0], c1[1])); set('kFull', rng(c3[0], c3[1]));
  set('ph1', rng(c1[0], c1[1])); set('ph2', rng(c2[0] - c1[0], c2[1] - c1[1])); set('ph3', rng(c3[0] - c2[0], c3[1] - c2[1]));
})();
