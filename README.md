# คาเฟ่ + ออฟฟิศ 2 ชั้น พิษณุโลก

เว็บนำเสนอโครงการแบบ static (HTML + CSS + JS + three.js) มี 3 หน้า เรียงตามลำดับการนำเสนอ

1. **Layout** โมเดล 3D หมุนดูได้ แสงแดดจริงตามพิกัดแปลง ผังชั้น 1 และชั้น 2
2. **Budget** งบลงทุนแบ่ง 3 กลุ่มตามความจำเป็น (จำเป็น / ควรมี / เลื่อนได้)
3. **Solution** แนวทางโครงการ ลำดับการลงทุน เหตุผลของผัง และสิ่งที่ต้องยืนยัน

ใช้ได้บนคอมพิวเตอร์ แท็บเล็ต และโทรศัพท์ ไม่มีขั้นตอน build และไม่พึ่ง CDN (three.js อยู่ในโฟลเดอร์ `vendor/`)

## ดูในเครื่อง
เปิด `index.html` ได้เลย หรือรัน
```bash
python3 -m http.server 8000
```

## Deploy ด้วย GitHub Pages
1. สร้าง repository ใหม่บน GitHub (ยังไม่ต้องใส่ไฟล์)
2. push โค้ดขึ้นไป
```bash
git remote add origin https://github.com/<user>/<repo>.git
git push -u origin main
```
3. ใน repo ไปที่ Settings → Pages → Source เลือก **GitHub Actions**
4. workflow ใน `.github/workflows/pages.yml` จะ deploy ให้ทุกครั้งที่ push เข้า `main` ลิงก์เว็บจะอยู่ที่ `https://<user>.github.io/<repo>/`

หมายเหตุ: GitHub Pages ของบัญชีฟรีใช้ได้กับ repo แบบ public เท่านั้น ซึ่งหมายความว่าพิกัดแปลงและตัวเลขงบจะเปิดเผยต่อสาธารณะ

## แก้ข้อมูล
- `model.js` ขนาดและผังทั้งหมด (หน่วยเมตร)
- `cost.js` ราคาต่อหน่วยและลำดับความจำเป็น (`p: 1 | 2 | 3`)
- `index.html` ข้อความหน้า Solution
