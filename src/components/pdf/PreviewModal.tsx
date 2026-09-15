"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { PDFDownloadLink, pdf, usePDF } from '@react-pdf/renderer';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { ReportDocument } from './ReportDocument';
import { ServiceReportFormValues } from '@/types/service-report';
import { X, Download, FileText, Mail, Send } from 'lucide-react';
import Swal from 'sweetalert2';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data: ServiceReportFormValues;
}

export default function PreviewModal({ isOpen, onClose, data }: Props) {
  const [isMounted, setIsMounted] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailTo, setEmailTo] = useState(data.toEmail || '');
  const [emailCC, setEmailCC] = useState(data.ccEmails || '');
  const [isSending, setIsSending] = useState(false);
  const [numPages, setNumPages] = useState<number>();

  // Generate PDF blob for preview using usePDF
  const doc = useMemo(() => <ReportDocument data={data} />, [data]);
  const [pdfInstance] = usePDF({ document: doc });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isOpen || !isMounted) return null;

  const fileName = `${data.reportId || 'Service_Report'}.pdf`;

  const handleSendEmail = async () => {
    if (!emailTo) return Swal.fire('ข้อผิดพลาด', 'กรุณาระบุอีเมลผู้รับ', 'warning');
    try {
      setIsSending(true);
      Swal.fire({
        title: 'กำลังส่งอีเมล...',
        text: 'ระบบกำลังจัดส่ง PDF ไปยังอีเมลที่ระบุ',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

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
          toEmail: emailTo,
          ccEmails: emailCC,
          reportData: data,
          pdfBase64
        })
      });
      
      const result = await emailResponse.json();
      if (result.status === 'success') {
         Swal.fire('สำเร็จ!', 'ส่งอีเมลเรียบร้อยแล้ว', 'success');
         setShowEmailForm(false);
      } else {
         Swal.fire('ส่งอีเมลไม่สำเร็จ', result.message, 'error');
      }
    } catch (error) {
      Swal.fire('ข้อผิดพลาด', 'เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์', 'error');
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-5xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2 text-blue-700">
            <FileText className="w-5 h-5" />
            <h3 className="font-bold text-lg">Preview Report</h3>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowEmailForm(!showEmailForm)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${showEmailForm ? 'bg-gray-200 text-gray-700' : 'bg-green-600 text-white hover:bg-green-700'}`}
            >
              <Mail className="w-4 h-4" />
              {showEmailForm ? 'ซ่อนการส่งอีเมล' : 'ส่งอีเมล'}
            </button>
            <PDFDownloadLink 
              document={doc} 
              fileName={fileName}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              {({ loading }) => loading ? 'Generating...' : (
                <>
                  <Download className="w-4 h-4" />
                  Download
                </>
              )}
            </PDFDownloadLink>
            <button 
              onClick={onClose}
              className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Email Form Panel (Slide down if active) */}
        {showEmailForm && (
          <div className="bg-green-50 p-4 border-b border-green-100 flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="text-sm font-medium text-green-800 block mb-1">อีเมลผู้รับ (To)</label>
              <input type="text" value={emailTo} onChange={e => setEmailTo(e.target.value)} placeholder="customer@example.com, staff@example.com" className="w-full border border-green-200 rounded-lg p-2 outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div className="flex-1 w-full">
              <label className="text-sm font-medium text-green-800 block mb-1">สำเนา (CC)</label>
              <input type="text" value={emailCC} onChange={e => setEmailCC(e.target.value)} placeholder="manager@example.com" className="w-full border border-green-200 rounded-lg p-2 outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <button 
              onClick={handleSendEmail}
              disabled={isSending}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:bg-green-400"
            >
              {isSending ? 'กำลังส่ง...' : (
                <>
                  <Send className="w-4 h-4" />
                  ยืนยันการส่ง
                </>
              )}
            </button>
          </div>
        )}

        {/* PDF Viewer (Fills remaining height) */}
        <div className="flex-1 bg-gray-100 p-4 overflow-y-auto flex flex-col items-center gap-4 relative">
          {!pdfInstance.url ? (
            <div className="flex items-center justify-center h-full w-full">
              <span className="text-gray-500 font-medium">กำลังสร้างตัวอย่าง PDF...</span>
            </div>
          ) : (
            <Document
              file={pdfInstance.url}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={
                <div className="flex items-center justify-center p-8">
                  <span className="text-gray-500 font-medium">กำลังโหลดเอกสาร...</span>
                </div>
              }
              className="max-w-full flex flex-col items-center gap-4"
            >
              {Array.from(new Array(numPages || 0), (el, index) => (
                <Page
                  key={`page_${index + 1}`}
                  pageNumber={index + 1}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  className="shadow-xl bg-white"
                  width={typeof window !== 'undefined' ? Math.min(window.innerWidth - 48, 800) : 800}
                />
              ))}
            </Document>
          )}
        </div>

      </div>
    </div>
  );
}
