// Budget built from published Thai prices (THB, excl. land; retail prices as listed on the shop pages
// when looked up in Nov 2026 - promotions change, re-check before buying).
// p = priority: 1 must-have to open, 2 should-have, 3 can be deferred.
// s = key into SRC (published price). Lines without s are my own allowance and are marked "ประมาณการ".
window.COST = {
  groups: {
    1: { t: 'จำเป็น', d: 'ขาดไม่ได้ ถ้าไม่มีเปิดร้านไม่ได้' },
    2: { t: 'ควรมี', d: 'ออฟฟิศชั้น 2 และของที่ทำให้อยู่สบาย' },
    3: { t: 'เลื่อนได้', d: 'ทำเฟสถัดไปได้โดยไม่กระทบการเปิดร้าน' }
  },
  SRC: {
    area: { t: 'มูลนิธิประเมินค่าทรัพย์สินฯ ตารางราคาประเมินค่าก่อสร้างอาคาร: อาคารพาณิชย์ 2–3 ชั้น ระดับต่ำ 7,400 / ปานกลาง 8,900 บาท/ตร.ม.', url: 'https://www.thaiappraisal.org/thai/value/value.php' },
    ac: { t: 'ไทวัสดุ แอร์ติดผนัง Inverter 18,000 BTU (Hisense / Samsung 14,390 บาท, Carrier Wi-Fi 26,900 บาท) + ค่าติดตั้ง 2,600 บาท', url: 'https://www.thaiwatsadu.com/th/product/%E0%B9%81%E0%B8%AD%E0%B8%A3%E0%B9%8C%E0%B8%95%E0%B8%B4%E0%B8%94%E0%B8%9C%E0%B8%99%E0%B8%B1%E0%B8%87-Inverter-18,000-BTU-HISENSE-%E0%B8%A3%E0%B8%B8%E0%B9%88%E0%B8%99-AS18TRKE2T-60406831' },
    adde: { t: 'IKEA เก้าอี้ ADDE 299 บาท', url: 'https://www.ikea.com/th/th/p/adde-chair-white-90219179/' },
    gunde: { t: 'IKEA ชุดโต๊ะ GUNDE + เก้าอี้ ADDE 2 ตัว 2,188 บาท', url: 'https://www.ikea.com/th/th/p/gunde-adde-table-and-2-chairs-folding-black-black-s89564802/' },
    mell: { t: 'IKEA โต๊ะ MELLTORP 75×75 ซม. 1,190–1,590 บาท (ราคาจากเว็บเทียบราคา Priceza)', url: 'https://www.priceza.com/s/%E0%B8%A3%E0%B8%B2%E0%B8%84%E0%B8%B2/ikea-%E0%B9%80%E0%B8%A1%E0%B8%A5%E0%B8%97%E0%B8%AD%E0%B8%A3%E0%B9%8C%E0%B8%9B' },
    lagk: { t: 'IKEA โต๊ะทำงาน LAGKAPTEN/ADILS 140×60 ซม. 1,590 บาท', url: 'https://www.ikea.com/th/th/p/lagkapten-adils-desk-white-s39417154/' },
    lagk2: { t: 'IKEA ท็อปโต๊ะ LAGKAPTEN 200×60 ซม. 1,390 บาท', url: 'https://www.ikea.com/th/th/p/lagkapten-table-top-white-20460835/' },
    spand: { t: 'IKEA โต๊ะทำงาน LAGKAPTEN/SPÄND 140×60 ซม. 2,650 บาท', url: 'https://www.ikea.com/th/th/p/lagkapten-spaend-desk-white-s19563844/' },
    esp: { t: 'Worldwide Coffee Group เครื่องชง 1 หัวกรุ๊ป: Cosmo Cube 29,900 บาท, Magister HRC 58,900 บาท', url: 'https://www.worldwide-coffeegroup.com/product/26671-30962/cosmo-cube' },
    grind: { t: 'เครื่องบด Primavera GR100 25,000 บาท (Lazada ผ่าน Priceza)', url: 'https://www.priceza.com/s/%E0%B8%A3%E0%B8%B2%E0%B8%84%E0%B8%B2/%E0%B9%80%E0%B8%84%E0%B8%A3%E0%B8%B7%E0%B9%88%E0%B8%AD%E0%B8%87%E0%B8%8A%E0%B8%87%E0%B8%81%E0%B8%B2%E0%B9%80%E0%B9%80%E0%B8%9F' },
    cake: { t: 'The Maple Cake ตู้โชว์เค้ก 90 ซม.: Sanden SKR-0090G 22,500 บาท, CS-0900S-FT 34,000 บาท', url: 'https://www.themaplecake.com/product/SKR-0090G' },
    oven: { t: 'ไทวัสดุ เตาอบ 60 ลิตร: OTTO TO-772 3,350 บาท, MINIMEX MMO60L2 6,650 บาท', url: 'https://www.thaiwatsadu.com/th/category/%E0%B9%84%E0%B8%A1%E0%B9%82%E0%B8%84%E0%B8%A3%E0%B9%80%E0%B8%A7%E0%B8%9F-|-%E0%B9%80%E0%B8%95%E0%B8%B2%E0%B8%AD%E0%B8%9A-630101' },
    fridge: { t: 'ไทวัสดุ ตู้เย็น 1 ประตู: TCL 3.2 คิว 3,890 บาท, Mitsubishi 6.1 คิว 6,390 บาท', url: 'https://www.thaiwatsadu.com/th/category/%E0%B8%95%E0%B8%B9%E0%B9%89%E0%B9%80%E0%B8%A2%E0%B9%87%E0%B8%99-630301' },
    sofa: { t: 'Index Living Mall โซฟาตัว L: Furinbox ลูอิส 5,990 บาท, โอวิร่า 12,990 บาท', url: 'https://www.indexlivingmall.com/category/furniture/sofa/l-shape-and-corner' },
    bed: { t: 'Index Living Mall เตียง 5 ฟุต: เมลตัน 5,790 บาท, ชิลี 8,990 บาท', url: 'https://www.indexlivingmall.com/category/furniture/beds/beds-5-ft' },
    matt: { t: 'Index Living Mall ที่นอน 5 ฟุต: Furinbox คูลลิซึ่ม 5,990 บาท, ดรีม-พีเอส 9,990 บาท', url: 'https://www.indexlivingmall.com/category/furniture/mattress/mattress-5-ft' },
    ward: { t: 'Index Living Mall ตู้เสื้อผ้า 2 บาน รุ่นมาโน่ 6,990 บาท', url: 'https://www.indexlivingmall.com/corporate-campaign/index-living-sofa-sale-bedroom' }
  },
  items: [
    // ---- 1 must-have ----
    { p: 1, n: 'ตัวอาคาร 2 ชั้น รวมงานระบบพื้นฐาน (มาตรฐานอาคารพาณิชย์)', qty: 364, u: 'ตร.ม.', lo: 7400, hi: 8900, s: 'area' },
    { p: 1, n: 'ส่วนเพิ่มกระจกหน้าร้านบานใหญ่ + เพดานสูง 3.5 ม.', qty: 1, u: 'ชุด', lo: 150000, hi: 250000 },
    { p: 1, n: 'คานช่วงยาว ~9 ม. แทนเสากลางร้าน (ส่วนเพิ่ม)', qty: 1, u: 'ชุด', lo: 60000, hi: 120000 },
    { p: 1, n: 'ถมดินปรับระดับ ~0.5 ม. (สมมติ)', qty: 300, u: 'ลบ.ม.', lo: 250, hi: 350 },
    { p: 1, n: 'ลานจอด + ทางรถ คอนกรีต', qty: 290, u: 'ตร.ม.', lo: 700, hi: 950 },
    { p: 1, n: 'ห้องคลุมบันไดดาดฟ้า + ราวกันตก', qty: 1, u: 'ชุด', lo: 120000, hi: 200000 },
    { p: 1, n: 'ถังน้ำ ปั๊ม ถังดักไขมัน ถังบำบัด', qty: 1, u: 'ชุด', lo: 80000, hi: 140000 },
    { p: 1, n: 'ป้ายร้าน ทางลาด ถังดับเพลิง ไฟฉุกเฉิน', qty: 1, u: 'ชุด', lo: 85000, hi: 155000 },
    { p: 1, n: 'แอร์ 18,000 BTU ชั้น 1 (ร้าน 5 + ห้องประชุม 1) รวมติดตั้ง', qty: 6, u: 'เครื่อง', lo: 16990, hi: 29500, s: 'ac' },
    { p: 1, n: 'เก้าอี้โต๊ะคู่ + โต๊ะสี่ + ห้องประชุมย่อย', qty: 38, u: 'ตัว', lo: 299, hi: 900, s: 'adde' },
    { p: 1, n: 'โต๊ะคาเฟ่ 75×75 ซม.', qty: 10, u: 'ตัว', lo: 1190, hi: 1590, s: 'mell' },
    { p: 1, n: 'โต๊ะห้องประชุมย่อย (ต่อ 2 ตัว)', qty: 2, u: 'ตัว', lo: 1590, hi: 2650, s: 'lagk' },
    { p: 1, n: 'สตูลสูงเคาน์เตอร์ตัว L', qty: 9, u: 'ตัว', lo: 800, hi: 1500 },
    { p: 1, n: 'เคาน์เตอร์สูงตัว L ริมกระจก 10 ม. (งานไม้)', qty: 1, u: 'ชุด', lo: 25000, hi: 45000 },
    { p: 1, n: 'เคาน์เตอร์บาร์ + เคาน์เตอร์หลังบาร์ (งานไม้)', qty: 1, u: 'ชุด', lo: 40000, hi: 70000 },
    { p: 1, n: 'เครื่องชงกาแฟ 1 หัวกรุ๊ป', qty: 1, u: 'เครื่อง', lo: 29900, hi: 58900, s: 'esp' },
    { p: 1, n: 'เครื่องบดกาแฟ', qty: 1, u: 'เครื่อง', lo: 15000, hi: 25000, s: 'grind' },
    { p: 1, n: 'ตู้โชว์เค้กแช่เย็น 90 ซม.', qty: 1, u: 'ตู้', lo: 22500, hi: 34000, s: 'cake' },
    { p: 1, n: 'เตาอบขนม 60 ลิตร', qty: 2, u: 'เครื่อง', lo: 3350, hi: 6650, s: 'oven' },
    { p: 1, n: 'ตู้เย็นครัว 6.1 คิว', qty: 2, u: 'ตู้', lo: 6390, hi: 6390, s: 'fridge' },
    { p: 1, n: 'โต๊ะสเตนเลสครัว ซิงก์ ชั้นวาง อุปกรณ์ทำขนม เครื่องคิดเงิน', qty: 1, u: 'ชุด', lo: 45000, hi: 80000 },
    { p: 1, n: 'โคมไฟ ไฟราง ของตกแต่งร้าน', qty: 1, u: 'ชุด', lo: 60000, hi: 110000 },
    // ---- 2 should-have ----
    { p: 2, n: 'แอร์ 18,000 BTU ชั้น 2 (ออฟฟิศ 2 + ประชุม + ผู้บริหาร + ห้องนอน) รวมติดตั้ง', qty: 5, u: 'เครื่อง', lo: 16990, hi: 29500, s: 'ac' },
    { p: 2, n: 'โต๊ะทำงานริมกระจก (ต่อ 6 ตัว นั่ง 8 คน)', qty: 6, u: 'ตัว', lo: 1590, hi: 2650, s: 'lagk' },
    { p: 2, n: 'เก้าอี้ทำงาน', qty: 9, u: 'ตัว', lo: 1500, hi: 3500 },
    { p: 2, n: 'โซฟาตัว L (Freedom space)', qty: 1, u: 'ตัว', lo: 5990, hi: 12990, s: 'sofa' },
    { p: 2, n: 'ทีวี 65 นิ้ว + ตู้วาง + บีนแบ็ก + พรม', qty: 1, u: 'ชุด', lo: 22000, hi: 35000 },
    { p: 2, n: 'โต๊ะยาว 6 ที่นั่ง (ท็อป 200×60 ต่อคู่ + ขา)', qty: 2, u: 'ตัว', lo: 1390, hi: 2400, s: 'lagk2' },
    { p: 2, n: 'เก้าอี้โต๊ะยาว + ห้องประชุม', qty: 14, u: 'ตัว', lo: 299, hi: 900, s: 'adde' },
    { p: 2, n: 'โต๊ะห้องประชุม (ต่อ 2 ตัว) + โต๊ะผู้บริหาร', qty: 3, u: 'ตัว', lo: 1590, hi: 2650, s: 'spand' },
    { p: 2, n: 'ไวท์บอร์ดล้อเลื่อน จอห้องประชุม ชั้นหนังสือ', qty: 1, u: 'ชุด', lo: 18000, hi: 30000 },
    { p: 2, n: 'เตียง 5 ฟุต', qty: 1, u: 'ตัว', lo: 5790, hi: 8990, s: 'bed' },
    { p: 2, n: 'ที่นอน 5 ฟุต', qty: 1, u: 'ตัว', lo: 5990, hi: 9990, s: 'matt' },
    { p: 2, n: 'ตู้เสื้อผ้า 2 บาน', qty: 1, u: 'ตัว', lo: 6990, hi: 6990, s: 'ward' },
    { p: 2, n: 'มินิครัว: ตู้เย็น 1 ประตู', qty: 1, u: 'ตู้', lo: 3890, hi: 6390, s: 'fridge' },
    { p: 2, n: 'มินิครัว: เคาน์เตอร์ ซิงก์ ไมโครเวฟ เตา 2 หัว กาต้มน้ำ', qty: 1, u: 'ชุด', lo: 30000, hi: 50000 },
    { p: 2, n: 'ชั้นวางรองเท้า ล็อกเกอร์ โคมไฟ ของตกแต่งออฟฟิศ', qty: 1, u: 'ชุด', lo: 35000, hi: 60000 },
    { p: 2, n: 'ระแนงบังแดดทิศตะวันตก', qty: 70, u: 'ตร.ม.', lo: 2000, hi: 3000 },
    { p: 2, n: 'รั้วรอบแปลง 3 ด้าน', qty: 66, u: 'ม.', lo: 1800, hi: 2500 },
    // ---- 3 deferrable ----
    { p: 3, n: 'ลานไม้กลางแจ้ง + จัดสวน', qty: 1, u: 'ชุด', lo: 80000, hi: 150000 },
    { p: 3, n: 'ชุดโต๊ะเก้าอี้ลานกลางแจ้ง (12 ที่นั่ง)', qty: 6, u: 'ชุด', lo: 2188, hi: 2188, s: 'gunde' },
    { p: 3, n: 'ไฟราว ไฟนีออน ชั้นขวดสำหรับโหมดบาร์กลางคืน', qty: 1, u: 'ชุด', lo: 15000, hi: 30000 }
  ],
  design: [0.03, 0.05],   // architect + engineer + permit, share of construction
  reserve: 0.05,          // contingency
  gfa: 364
};

(function () {
  var C = window.COST;
  function m(v) { return (v / 1e6).toFixed(2); }
  function rng(lo, hi) { return m(lo) + ' – ' + m(hi); }
  function set(id, html) { var e = document.getElementById(id); if (e) e.innerHTML = html; }
  var fLo = 1 + C.design[0] + C.reserve, fHi = 1 + C.design[1] + C.reserve;
  var sub = { 1: [0, 0], 2: [0, 0], 3: [0, 0] }, html = '', used = [], sourced = [0, 0], all = [0, 0];

  [1, 2, 3].forEach(function (p) {
    var g = C.groups[p], rows = '';
    C.items.forEach(function (it) {
      if (it.p !== p) return;
      var a = it.qty * it.lo, b = it.qty * it.hi; sub[p][0] += a; sub[p][1] += b; all[0] += a; all[1] += b;
      var unit = it.lo === it.hi ? it.lo.toLocaleString() : it.lo.toLocaleString() + '–' + it.hi.toLocaleString();
      var note = it.qty === 1 && it.u === 'ชุด' ? 'เหมา' : it.qty.toLocaleString() + ' ' + it.u + ' × ' + unit + ' บาท';
      var ref = '<span class="est">ประมาณการ</span>';
      if (it.s) {
        if (used.indexOf(it.s) < 0) used.push(it.s);
        ref = '<a class="ref" href="' + C.SRC[it.s].url + '" target="_blank" rel="noopener">[' + (used.indexOf(it.s) + 1) + ']</a>'; sourced[0] += a; sourced[1] += b;
      }
      rows += '<tr><td>' + it.n + '<small>' + note + ' ' + ref + '</small></td><td>' + rng(a, b) + '</td></tr>';
    });
    html += '<section class="tier t' + p + '"><header><span class="tag">' + p + '</span><div><h3>' + g.t + '</h3><p>' + g.d + '</p></div></header>' +
      '<table><tbody>' + rows +
      '<tr class="fee"><td>ค่าออกแบบ ขออนุญาต 3–5% + เงินสำรอง 5%</td><td>' + rng(sub[p][0] * (fLo - 1), sub[p][1] * (fHi - 1)) + '</td></tr>' +
      '<tr class="sum"><td>รวมกลุ่ม "' + g.t + '"</td><td>' + rng(sub[p][0] * fLo, sub[p][1] * fHi) + '</td></tr></tbody></table></section>';
  });
  html += '<section class="tier srcs"><header><div><h3>แหล่งอ้างอิงราคา</h3><p>ราคาตามหน้าเว็บร้านค้า ณ พ.ย. 2569 โปรโมชันเปลี่ยนได้ ควรเช็กอีกครั้งก่อนซื้อ รายการที่มีแหล่งอ้างอิงคิดเป็น ' +
    Math.round(sourced[0] / all[0] * 100) + '–' + Math.round(sourced[1] / all[1] * 100) + '% ของงบก่อนค่าออกแบบ ที่เหลือเป็นประมาณการ</p></div></header><ol>' +
    used.map(function (k) { var s = C.SRC[k]; return '<li>' + s.t + ' <a href="' + s.url + '" target="_blank" rel="noopener">เปิดแหล่งที่มา</a></li>'; }).join('') + '</ol></section>';
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
