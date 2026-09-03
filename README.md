# SIS Field Service Report Web App

**Version:** v.2026.09.02.1110

## Overview
ระบบเว็บแอปพลิเคชันสำหรับให้ช่างหน้างาน (Technicians) สามารถกรอกรายงานการให้บริการ (Service Report) ได้อย่างสะดวกรวดเร็วผ่านโทรศัพท์มือถือ โดยเน้นที่การลดการพิมพ์ให้มากที่สุดผ่านการใช้ GPS, การพูดแทนการพิมพ์ (Speech-to-Text), การกดปุ่มเลือกแทนการพิมพ์, และการเซ็นลายเซ็นบนหน้าจอ

ข้อมูลทั้งหมดจะถูกส่งไปจัดเก็บที่:
- **ข้อมูลรายงาน:** Google Sheets
- **รูปภาพและลายเซ็น:** Google Drive

## Features
- **Auto-generated Report ID:** สร้างรหัสรายงานอัตโนมัติ (SR-YYYYMMDD-XXXX)
- **Local Timezone:** ดึงเวลาตามนาฬิกาของเครื่องโทรศัพท์อัตโนมัติ
- **GPS Location:** ดึงพิกัด Latitude/Longitude ผ่าน Browser Geolocation API
- **Speech-to-Text:** สามารถกดปุ่มไมโครโฟนเพื่อพูดรายละเอียดงาน แล้วแปลงเป็นข้อความได้ทันที
- **Photo Capture:** เปิดกล้องเพื่อถ่ายภาพหน้างานได้สูงสุด 4 รูป
- **Digital Signatures:** รองรับการเซ็นชื่อผ่านหน้าจอ ทั้งช่างผู้ปฏิบัติงานและลูกค้า

## How to Run (การรันโปรเจกต์)
ระบบพัฒนาด้วย Next.js และ Node.js
1. เปิดโปรแกรม PowerShell หรือ Command Prompt และเข้าไปที่โฟลเดอร์โปรเจกต์
2. ติดตั้ง Dependencies (ถ้ายังไม่ได้ทำ):
   ```bash
   npm install
   ```
3. รันเซิร์ฟเวอร์แบบ Development:
   ```bash
   npm run dev
   ```
4. เปิดเบราว์เซอร์ไปที่ `http://localhost:3000`

## Google Apps Script Integration
หากต้องการแก้ไขสคริปต์ปลายทาง หรืออัปเดตโฟลเดอร์ Google Drive:
1. เข้าไปที่ Google Sheets ที่ผูกไว้ ไปที่ `Extensions > Apps Script`
2. แก้ไข `folderId` ในสคริปต์
3. **สำคัญ:** เมื่อแก้ไขเสร็จ ต้องกดปุ่ม `Deploy > Manage deployments > Edit > New version` ทุกครั้ง และตรวจสอบให้แน่ใจว่า Who has access ตั้งค่าเป็น `Anyone`
4. นำ URL ใหม่มาอัปเดตในไฟล์ `src/app/api/submit/route.ts` ของโปรเจกต์นี้

## Update History
- **v.2026.09.02.1110:**
  - สร้างโครงสร้างโปรเจกต์ Next.js (App Router)
  - เพิ่ม UI Components: Stepper, LocationPicker, SpeechTextArea, PhotoCapture, SignaturePad
  - แก้ไขระบบแปลงไฟล์ภาพ (Blob) ให้กลายเป็น Base64 เพื่อส่งให้ Google API ได้สำเร็จ
  - แก้ไขบั๊ก Timezone ของวันที่ให้ตรงตามเวลาท้องถิ่น
  - ติดตั้งและเชื่อมต่อ API Route เข้ากับ Google Apps Script สำเร็จ
