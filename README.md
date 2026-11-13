# โมเดล 3D คาเฟ่ + Co-working

เปิดไฟล์ `index.html` ในเบราว์เซอร์ได้เลย ไม่ต้องติดตั้งอะไร

## ทำต่อใน Claude Code
```bash
unzip cafe-cowork-3d.zip
cd cafe-cowork-3d
git init && git add . && git commit -m "Initial 3D massing model"
claude
```
Claude Code จะอ่าน `CLAUDE.md` ซึ่งเก็บบริบทที่ดินและผังไว้แล้ว สั่งต่อได้ทันที เช่น
- "เปลี่ยนขนาดแปลงเป็น 14 x 43 ม. แล้วจัดผังใหม่"
- "ย้ายไปใช้ three.js พร้อมเงาแดดตอนบ่าย"
- "เพิ่มผังภายในชั้น 2"
