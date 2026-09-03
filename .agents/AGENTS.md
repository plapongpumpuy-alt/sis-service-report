# Project SIS App Service Report - Context Documentation

## Project Overview
This project is a mobile-first "Field Service Report Web App" built for internal technicians to report on-site jobs efficiently with minimal typing.

## Tech Stack
- **Frontend Framework:** Next.js 14.2 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Icons:** lucide-react
- **Form Management:** React Hook Form
- **Signatures:** react-signature-canvas
- **Backend/Database:** Google Apps Script (saving data to Google Sheets & images to Google Drive)

## Key File Structures
```text
src/
├── app/
│   ├── api/submit/route.ts      # API Route รับข้อมูลจากหน้าฟอร์ม ส่งต่อไปยัง Google Apps Script
│   ├── globals.css              # Global styles (Tailwind imports)
│   ├── layout.tsx               # Root Layout
│   └── page.tsx                 # หน้าหลักของแอป
├── components/
│   ├── ServiceReportForm.tsx    # ตัวฟอร์มหลัก (State Management ควบคุมด้วย React Hook Form)
│   └── ui/                      
│       ├── LocationPicker.tsx   # คอมโพเนนต์ดึงพิกัด GPS (Geolocation API)
│       ├── Stepper.tsx          # ปุ่มปรับจำนวนช่าง 
│       ├── SpeechTextArea.tsx   # กล่องข้อความสั่งงานด้วยเสียง (Web Speech API)
│       ├── PhotoCapture.tsx     # ระบบถ่ายรูปและแปลงเป็น Base64 Data URL
│       └── SignaturePad.tsx     # กระดานรับลายเซ็น (react-signature-canvas)
├── types/
│   └── service-report.ts        # TypeScript interfaces สำหรับโครงสร้างข้อมูล
```

## Important Rules & Business Logic
1. **Photo Uploads:** Images captured via `PhotoCapture.tsx` MUST be converted to base64 Data URLs using `FileReader` before submission. Blob URLs are not valid for server transmission.
2. **Timezone:** Timestamps must be generated using the local client timezone (UTC+7 for Thailand), not raw `toISOString()` which defaults to UTC.
3. **Google API Connection:** Data is submitted via `POST /api/submit`, which forwards the request to a deployed Google Apps Script Web App. The GAS must be deployed with "Execute as: Me" and "Who has access: Anyone". 
   - **Google Drive Folder ID (for images/signatures):** `1Wd-kDlN8t_cEdhy3Wp8Dg3-Wbbs_64Ld`
   - **Google Sheets Tabs:**
     - Data is saved to tab: `Reports`
     - Staff list is pulled from tab: `ชื่อชีตพนักงานของคุณ` (Col A=Full Name, Col B=Nickname)
     - Customer list is pulled from tab: `ชื่อชีตลูกค้าของคุณ` (Col A)
4. **App Versioning:** Version tracking is maintained based on the timestamp of significant updates (e.g., `v.YYYY.MM.DD.HHMM`).

## Design Decisions
- **React Hook Form** was chosen to manage the state of the complex form without causing the entire page to re-render.
- **Google Apps Script** was chosen as a lightweight backend to avoid the complexity of setting up Google Cloud Service Accounts for simple internal usage.
- **Image Proxy API (`/api/image-proxy`):** Google Drive's shareable URLs (`uc?export=view`) block cross-origin requests (CORS). To allow `@react-pdf/renderer` to draw the images on the client side, we built a Next.js proxy route to fetch the image buffer from the server and return it cleanly to the frontend.

## Recent Updates (v.2026.09.03.0950)
1. **Time Calculation:** "เวลาเลิกงาน" defaults to Current Time + 15 mins and is set to `readOnly`.
2. **PDF Layout:** Created a prominent "Work Summary" block at the bottom of the PDF. The block is color-coded automatically based on `Job Status` (Green=Completed, Yellow=Pending, Red=Follow-up).
3. **Staff Names:** Switched the UI tags to display Full Names (Column A) instead of Nicknames.
4. **Customer List:** Updated GAS `doGet` to combine Company Name (Col B) and Customer Name (Col A) into `Company (Customer)` format.
5. **History Page:** Built `src/app/history/page.tsx` to pull past records from the `Reports` sheet. Added real-time search filtering.
6. **CORS Fix:** Implemented `/api/image-proxy` to allow Google Drive images to load inside the PDF preview on the History page.
7. **Form Validation:** The submit button now strictly requires `startTime, siteName, location, staffNames, actionDetails, photos, technicianSignature, customerSignature`. Only "Customer Name (Print)" is optional.
8. **UI Overhaul:** Enhanced `ServiceReportForm.tsx` with gradients, section numbers, drop shadows, and modern Tailwind components for an app-like feel.
9. **Email Dispatch:** Added backend API route `/api/send-report` using `nodemailer` to automatically send the generated PDF to the customer when the "toEmail" field is provided in the form. PDF is generated on the client side via `@react-pdf/renderer` and passed as a Base64 string to the backend.

## Recent Updates (v.2026.09.03.1500)
1. **Cloud Deployment (Vercel):** The project is now deployed on Vercel. CI/CD workflow is established via GitHub Desktop (plapongpumpuy-alt/sis-service-report). Any git push origin main will automatically trigger a new Vercel build.
2. **Client-side Image Compression:** Updated PhotoCapture.tsx to automatically scale down uploaded photos (max 1200x1200px) and compress them to JPEG format (60% quality) using HTML Canvas. This prevents the 413 Payload Too Large error from Vercel's strict 4.5MB serverless function body size limit.
3. **Vercel Timeout Fix (504 Gateway Timeout):** Added export const maxDuration = 60; to both /api/submit/route.ts and /api/send-report/route.ts. The Google Apps Script processing takes around 13-15 seconds, which exceeded the default 10-second timeout of Vercel's Hobby tier. This fix extends the allowed duration to the maximum 60 seconds.
4. **Improved Error Handling:** Updated ServiceReportForm.tsx to display the actual error message inside the SweetAlert2 popup when a server/network error occurs during submission, making debugging easier.
5. **PDF Rendering Fix:** Resolved a TypeScript error (TS2345) in pdfHelper.ts where @react-pdf/renderer v4.x expected a valid React element rather than an empty array.
