"use client";

import Swal from 'sweetalert2';
import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { ServiceReportFormValues } from '@/types/service-report';
import LocationPicker from './ui/LocationPicker';
import Stepper from './ui/Stepper';
import SpeechTextArea from './ui/SpeechTextArea';
import PhotoCapture from './ui/PhotoCapture';
import SignaturePad from './ui/SignaturePad';
import PreviewModal from './pdf/PreviewModal';
import SearchableSelect from './ui/SearchableSelect';
import { pdf } from '@react-pdf/renderer';
import { ReportDocument } from './pdf/ReportDocument';
const generateReportId = () => {
  const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `SR-${date}-${random}`;
};

const getLocalDatetime = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return (new Date(now.getTime() - offset)).toISOString().slice(0, 16);
};

const getEndTimeDefault = () => {
  const now = new Date();
  const endDate = new Date(now.getTime() + 15 * 60000);
  const endHours = String(endDate.getHours()).padStart(2, '0');
  const endMinutes = String(endDate.getMinutes()).padStart(2, '0');
  return `${endHours}:${endMinutes}`;
};

export default function ServiceReportForm() {
  const { control, handleSubmit, setValue, register, watch } = useForm<ServiceReportFormValues>({
    defaultValues: {
      reportId: '',
      dateTime: getLocalDatetime(),
      startTime: '',
      endTime: getEndTimeDefault(),
      workDuration: '',
      siteName: '',
      location: { latitude: null, longitude: null },
      workersCount: 1,
      staffNames: [],
      jobType: 'Installation (งานติดตั้ง)',
      jobStatus: 'Completed',
      actionDetails: '',
      photos: [],
      technicianSignature: '',
      customerName: '',
      customerSignature: '',
    }
  });

  const [staffOptions, setStaffOptions] = useState<{fullName: string, nickname: string, email?: string}[]>([]);
  const [siteOptions, setSiteOptions] = useState<any[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [previewData, setPreviewData] = useState<ServiceReportFormValues | null>(null);

  useEffect(() => {
    setValue('reportId', generateReportId());
    
    // Fetch options from Google Sheets
    fetch('/api/options')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          setStaffOptions(data.technicians || []);
          setSiteOptions(data.customers || []);
        }
      })
      .catch(err => console.error("Failed to load options:", err))
      .finally(() => setIsLoadingOptions(false));
  }, [setValue]);

  const startTime = watch('startTime');
  const endTime = watch('endTime');

  useEffect(() => {
    if (startTime && endTime) {
      const [sH, sM] = startTime.split(':').map(Number);
      const [eH, eM] = endTime.split(':').map(Number);
      
      if (!isNaN(sH) && !isNaN(sM) && !isNaN(eH) && !isNaN(eM)) {
        let sMins = sH * 60 + sM;
        let eMins = eH * 60 + eM;
        
        if (eMins < sMins) eMins += 24 * 60; // Handle next day
        
        const diffMins = eMins - sMins;
        const hours = Math.floor(diffMins / 60);
        const mins = diffMins % 60;
        
        let durationStr = '';
        if (hours > 0) durationStr += `${hours} ชั่วโมง `;
        if (mins > 0 || hours === 0) durationStr += `${mins} นาที`;
        
        setValue('workDuration', durationStr.trim());
      }
    } else {
      setValue('workDuration', '');
    }
  }, [startTime, endTime, setValue]);

  const selectedSite = watch('siteName');
  useEffect(() => {
    const siteObj = siteOptions.find(s => (typeof s === 'string' ? s : s.name) === selectedSite);
    if (siteObj && typeof siteObj !== 'string' && siteObj.email) {
       setValue('toEmail', siteObj.email);
    } else {
       setValue('toEmail', '');
    }
  }, [selectedSite, siteOptions, setValue]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: ServiceReportFormValues) => {
    // Validation rules
    if (!data.startTime) return Swal.fire('ข้อมูลไม่ครบ', 'กรุณาระบุ "เวลาเริ่มงาน"', 'warning');
    if (!data.siteName) return Swal.fire('ข้อมูลไม่ครบ', 'กรุณาเลือก "รายชื่อลูกค้า / ไซต์งาน"', 'warning');
    if (!data.location.latitude) return Swal.fire('ข้อมูลไม่ครบ', 'กรุณากดดึงตำแหน่ง "พิกัด GPS"', 'warning');
    if (data.staffNames.length === 0) return Swal.fire('ข้อมูลไม่ครบ', 'กรุณาเลือก "รายชื่อช่าง" อย่างน้อย 1 คน', 'warning');
    if (!data.actionDetails.trim()) return Swal.fire('ข้อมูลไม่ครบ', 'กรุณากรอก "รายละเอียดการปฏิบัติงาน"', 'warning');
    if (data.photos.length === 0) return Swal.fire('ข้อมูลไม่ครบ', 'กรุณาถ่ายรูปหน้างานอย่างน้อย 1 รูป', 'warning');
    if (!data.technicianSignature) return Swal.fire('ข้อมูลไม่ครบ', 'กรุณาเซ็นชื่อ "ช่างผู้ปฏิบัติงาน"', 'warning');
    if (!data.customerSignature) return Swal.fire('ข้อมูลไม่ครบ', 'กรุณาเซ็นชื่อ "ลายเซ็นลูกค้า"', 'warning');

    try {
      setIsSubmitting(true);
      Swal.fire({
        title: 'กำลังบันทึกข้อมูลและสร้างรายงาน...',
        text: 'กรุณารอสักครู่',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
      
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      
      if (result.status === 'success') {
        Swal.update({
          title: 'กำลังส่งอีเมล...',
          text: 'ระบบกำลังจัดส่ง PDF ไปยังอีเมลที่ระบุ'
        });

        // Collect staff emails
        const staffEmails = data.staffNames
          .map(name => staffOptions.find(s => s.fullName === name)?.email)
          .filter(email => email) as string[];
          
        let allRecipients: string[] = [];
        if (staffEmails.length > 0) {
           allRecipients = [...staffEmails];
        }
        
        if (data.sendToCustomer && data.toEmail) {
           allRecipients.push(data.toEmail);
        }

        if (allRecipients.length > 0) {
           const blob = await pdf(<ReportDocument data={data} />).toBlob();
           const pdfBase64 = await new Promise<string>((resolve) => {
             const reader = new FileReader();
             reader.onloadend = () => resolve(reader.result as string);
             reader.readAsDataURL(blob);
           });
           
           const emailResponse = await fetch('/api/send-report', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({
               toEmail: allRecipients.join(', '),
               ccEmails: data.ccEmails,
               reportData: data,
               pdfBase64
             })
           });
           
           const emailResult = await emailResponse.json();
           if (emailResult.status === 'success') {
              Swal.fire({
                title: 'สำเร็จ!',
                text: 'บันทึกข้อมูลและส่งอีเมลเรียบร้อยแล้ว ต้องการล้างฟอร์มหรือไม่?',
                icon: 'success',
                showCancelButton: true,
                confirmButtonText: 'ล้างข้อมูล (New Report)',
                cancelButtonText: 'ปิด'
              }).then((res) => {
                 if (res.isConfirmed) window.location.reload();
              });
           } else {
              Swal.fire('บันทึกสำเร็จ (แต่ส่งอีเมลไม่ผ่าน)', emailResult.message, 'warning');
           }
        } else {
           Swal.fire({
             title: 'สำเร็จ!',
             text: 'บันทึกข้อมูลลงระบบเรียบร้อย (ไม่มีการส่งอีเมลเนื่องจากไม่ได้ระบุผู้รับ)',
             icon: 'success',
             showCancelButton: true,
             confirmButtonText: 'ล้างข้อมูล (New Report)',
             cancelButtonText: 'ปิด'
           }).then((res) => {
              if (res.isConfirmed) window.location.reload();
           });
        }
      } else {
        Swal.fire('เกิดข้อผิดพลาดจากเซิร์ฟเวอร์', result.message, 'error');
      }
    } catch (error: any) {
      Swal.fire('ข้อผิดพลาด', 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้: ' + (error.message || String(error)), 'error');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl mx-auto p-4 sm:p-6 space-y-8 pb-28">
      
      {/* 1. Header & Metadata */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
          <div className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">1</div>
          <h2 className="font-bold text-lg text-gray-800">ข้อมูลทั่วไป</h2>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-50">
            <label className="text-gray-500 text-xs block mb-1">Report ID</label>
            <p className="font-bold text-gray-900 text-base">{watch('reportId')}</p>
          </div>
          <div>
            <label className="text-gray-500 text-xs block mb-1">วันที่ / เวลา</label>
            <input type="datetime-local" {...register('dateTime')} className="w-full border border-gray-200 rounded-lg p-3 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <label className="text-gray-500 text-xs block mb-1">เวลาเริ่มงาน</label>
            <input type="time" {...register('startTime')} className="w-full border border-gray-200 rounded-lg p-3 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-gray-500 text-xs block mb-1">เวลาเลิกงาน</label>
            <input type="time" readOnly {...register('endTime')} className="w-full border border-gray-200 rounded-lg p-3 bg-gray-100 text-gray-500 outline-none" />
          </div>
        </div>
        
        <div>
           <label className="text-gray-500 text-xs block mb-1">รวมเวลาปฏิบัติงาน</label>
           <input type="text" readOnly {...register('workDuration')} placeholder="คำนวณอัตโนมัติ..." className="w-full border border-gray-200 rounded-lg p-3 bg-gray-100 text-gray-700 outline-none font-medium text-center" />
        </div>
        
        <div>
          <label className="text-gray-500 text-xs block mb-1">ชื่อไซต์ / ลูกค้า</label>
          <Controller
            name="siteName"
            control={control}
            render={({ field }) => (
              <SearchableSelect 
                options={siteOptions.map(s => typeof s === 'string' ? s : s.name)}
                value={field.value}
                onChange={field.onChange}
                placeholder="พิมพ์เพื่อค้นหา หรือเลือกจากรายชื่อ..."
              />
            )}
          />
        </div>

        <Controller
          name="location"
          control={control}
          render={({ field }) => (
            <LocationPicker value={field.value} onChange={field.onChange} />
          )}
        />
      </section>

      {/* 2. Team Attendance */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
          <div className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">2</div>
          <h2 className="font-bold text-lg text-gray-800">ปฏิบัติงาน</h2>
        </div>
        
        <Controller
          name="workersCount"
          control={control}
          render={({ field }) => (
            <Stepper label="จำนวนทีมงาน" value={field.value} onChange={field.onChange} />
          )}
        />
        
        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-50/80">
            <label className="text-gray-700 font-medium text-sm block mb-3">เลือกรายชื่อช่าง (Tags)</label>
            <div className="flex flex-wrap gap-2">
                {isLoadingOptions ? <p className="text-sm text-gray-500">กำลังโหลดรายชื่อ...</p> : staffOptions.map((staff, index) => {
                    const isSelected = watch('staffNames').includes(staff.fullName);
                    return (
                        <button
                            key={`${staff.fullName}-${index}`}
                            type="button"
                            onClick={() => {
                                const current = watch('staffNames');
                                if (isSelected) {
                                    setValue('staffNames', current.filter(n => n !== staff.fullName));
                                } else {
                                    setValue('staffNames', [...current, staff.fullName]);
                                }
                            }}
                            className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                                isSelected ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300'
                            }`}
                        >
                            {staff.fullName}
                        </button>
                    )
                })}
            </div>
        </div>
      </section>

      {/* 3. Task & Action Summary */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
          <div className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">3</div>
          <h2 className="font-bold text-lg text-gray-800">รายละเอียดงาน</h2>
        </div>
        
        <div>
             <label className="text-gray-700 font-medium text-sm block mb-3">ประเภทงาน (Job Type)</label>
             <div className="grid grid-cols-2 gap-3">
                {[
                  'Installation (งานติดตั้ง)',
                  'Program (งานโปรแกรม)',
                  'Preventive (บำรุงรักษา)',
                  'Billing (วางบิล)',
                  'Calibration (สอบเทียบ)',
                  'Repair (ซ่อมแซม)',
                  'Service Contract (สัญญาบริการ)',
                  'Warranty (อยู่ในรับประกัน)',
                  'Electric Wiring',
                  'Training',
                  'Maintenance',
                  'Account',
                  'Urgent'
                ].map((type) => {
                    const isSelected = watch('jobType') === type;
                    return (
                        <button
                            key={type}
                            type="button"
                            onClick={() => setValue('jobType', type as any)}
                            className={`p-3 rounded-xl text-sm font-medium border text-left transition-all ${
                                isSelected ? 'bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            {type}
                        </button>
                    )
                })}
             </div>
        </div>

        <div>
             <label className="text-gray-700 font-medium text-sm block mb-3">สถานะงาน (Job Status)</label>
             <div className="flex flex-wrap gap-3">
                {['Completed', 'Pending Parts', 'Follow-up Required'].map((status) => {
                    const isSelected = watch('jobStatus') === status;
                    return (
                        <button
                            key={status}
                            type="button"
                            onClick={() => setValue('jobStatus', status as any)}
                            className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                                isSelected 
                                    ? (status === 'Completed' ? 'bg-green-100 border-green-500 text-green-700' : 'bg-yellow-100 border-yellow-500 text-yellow-700')
                                    : 'bg-white border-gray-300 text-gray-600'
                            }`}
                        >
                            {status}
                        </button>
                    )
                })}
             </div>
        </div>

        <Controller
          name="actionDetails"
          control={control}
          render={({ field }) => (
            <SpeechTextArea value={field.value} onChange={field.onChange} />
          )}
        />
      </section>

      {/* 4. Media Capture */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
          <div className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">4</div>
          <h2 className="font-bold text-lg text-gray-800">รูปภาพประกอบ</h2>
        </div>
        <Controller
          name="photos"
          control={control}
          render={({ field }) => (
            <PhotoCapture photos={field.value} onChange={field.onChange} />
          )}
        />
      </section>

      {/* 5. Signatures */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
          <div className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">5</div>
          <h2 className="font-bold text-lg text-gray-800">ลายเซ็น</h2>
        </div>
        
        <Controller
          name="technicianSignature"
          control={control}
          render={({ field }) => (
            <SignaturePad label="ลายเซ็นช่างผู้ปฏิบัติงาน" value={field.value} onChange={field.onChange} />
          )}
        />

        <div className="pt-4 border-t border-gray-100 space-y-4">
            <div>
                <label className="text-gray-700 font-medium text-sm block mb-1">ชื่อลูกค้า (ตัวบรรจง)</label>
                <input type="text" placeholder="ระบุชื่อลูกค้า..." {...register('customerName')} className="w-full border border-gray-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <Controller
            name="customerSignature"
            control={control}
            render={({ field }) => (
                <SignaturePad label="ลายเซ็นลูกค้า" value={field.value} onChange={field.onChange} />
            )}
            />
        </div>
      </section>

      {/* 6. Email Dispatch */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
          <div className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">6</div>
          <h2 className="font-bold text-lg text-gray-800">ส่งอีเมลรายงาน</h2>
        </div>
        
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-blue-800 mb-2">อีเมลพนักงานที่เลือก (ส่งอัตโนมัติ)</p>
            <div className="flex flex-wrap gap-2">
              {watch('staffNames').length === 0 && <span className="text-xs text-gray-500">ยังไม่ได้เลือกพนักงาน</span>}
              {watch('staffNames').map(name => {
                 const staff = staffOptions.find(s => s.fullName === name);
                 const email = staff?.email || 'ไม่พบอีเมลในระบบ';
                 return (
                   <span key={name} className="px-2 py-1 bg-white rounded text-xs text-blue-700 border border-blue-200">
                     {name} ({email})
                   </span>
                 );
              })}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
             <label className="flex items-center gap-2 cursor-pointer mb-3">
               <input type="checkbox" {...register('sendToCustomer')} className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
               <span className="text-sm font-medium text-gray-700">ส่งรายงานให้ลูกค้าด้วย</span>
             </label>
             <div className={`transition-all ${watch('sendToCustomer') ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                 <label className="text-gray-600 text-xs block mb-1">อีเมลลูกค้า (ดึงอัตโนมัติจากไซต์งานที่เลือก)</label>
                 <input type="email" placeholder="customer@example.com" {...register('toEmail')} className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
                 <p className="text-xs text-gray-500 mt-1">สามารถพิมพ์แก้ไขอีเมลใหม่ได้</p>
             </div>
          </div>

          <div>
            <label className="text-gray-700 font-medium text-sm block mb-1">สำเนาอีเมล (CC - คั่นด้วยลูกน้ำ)</label>
            <input type="text" placeholder="manager@example.com, admin@example.com" {...register('ccEmails')} className="w-full border border-gray-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
      </section>

      {/* Submit Buttons (Fixed Bottom) */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 flex gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
        <button 
          type="button" 
          onClick={() => setPreviewData(watch())}
          className="flex-[0.4] bg-gray-100 text-gray-700 py-3.5 rounded-xl font-semibold shadow-sm active:bg-gray-200"
        >
          Preview
        </button>
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="flex-1 bg-blue-600 text-white py-3.5 rounded-xl font-bold shadow-md shadow-blue-200 active:bg-blue-700 disabled:bg-blue-400 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              กำลังส่งข้อมูล...
            </>
          ) : 'Save & Send'}
        </button>
      </div>

      {/* Preview Modal */}
      {previewData && (
        <PreviewModal 
          isOpen={!!previewData} 
          onClose={() => setPreviewData(null)} 
          data={previewData} 
        />
      )}

    </form>
  );
}
