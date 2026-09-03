"use client";

import React, { useState, useEffect } from 'react';
import PreviewModal from '@/components/pdf/PreviewModal';
import { ServiceReportFormValues } from '@/types/service-report';

export default function HistoryPage() {
  const [history, setHistory] = useState<ServiceReportFormValues[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<ServiceReportFormValues | null>(null);

  useEffect(() => {
    fetch('/api/history')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          // Transform Google Drive URLs to direct image URLs and wrap in proxy to avoid CORS
          const convertDriveUrl = (url: string) => {
            if (!url) return url;
            const match = url.match(/file\/d\/(.*?)\/view/);
            let directUrl = url;
            if (match) {
              directUrl = `https://drive.google.com/uc?export=view&id=${match[1]}`;
            }
            // Only proxy http/https URLs (ignore base64 data URIs)
            if (directUrl.startsWith('http')) {
              return `/api/image-proxy?url=${encodeURIComponent(directUrl)}`;
            }
            return directUrl;
          };

          const formattedHistory = (data.data || []).map((report: any) => ({
            ...report,
            photos: (report.photos || []).map(convertDriveUrl),
            technicianSignature: convertDriveUrl(report.technicianSignature),
            customerSignature: convertDriveUrl(report.customerSignature)
          }));
          
          setHistory(formattedHistory);
        }
      })
      .catch(err => console.error("Failed to load history:", err))
      .finally(() => setIsLoading(false));
  }, []);

  const filteredHistory = history.filter(report => {
    const query = searchQuery.toLowerCase();
    return (
      (report.reportId || '').toLowerCase().includes(query) ||
      (report.siteName || '').toLowerCase().includes(query) ||
      (report.jobType || '').toLowerCase().includes(query) ||
      (report.jobStatus || '').toLowerCase().includes(query) ||
      (report.staffNames || []).join(' ').toLowerCase().includes(query)
    );
  });

  return (
    <main className="min-h-screen p-4 max-w-3xl mx-auto space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h2 className="font-bold text-xl text-blue-700">ประวัติการทำงาน</h2>
        <input 
          type="text" 
          placeholder="ค้นหา Report ID, ชื่อลูกค้า, ชื่อช่าง..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
        />
      </div>
      
      {isLoading ? (
        <p className="text-center text-gray-500 py-10">กำลังโหลดข้อมูล...</p>
      ) : filteredHistory.length === 0 ? (
        <p className="text-center text-gray-500 py-10">
          {searchQuery ? 'ไม่พบข้อมูลที่ค้นหา' : 'ยังไม่มีข้อมูลรายงาน'}
        </p>
      ) : (
        <div className="space-y-4">
          {filteredHistory.map((report, idx) => (
            <div 
              key={idx} 
              className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedReport(report)}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{report.reportId}</h3>
                  <p className="text-sm text-gray-500">{new Date(report.dateTime).toLocaleString('th-TH')}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  report.jobStatus === 'Completed' ? 'bg-green-100 text-green-700' : 
                  report.jobStatus === 'Pending Parts' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                }`}>
                  {report.jobStatus}
                </span>
              </div>
              <div className="text-sm text-gray-600 mb-2">
                <span className="font-semibold text-gray-700">ลูกค้า:</span> {report.siteName || '-'}
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-semibold text-gray-700">ประเภทงาน:</span> {report.jobType || '-'}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedReport && (
        <PreviewModal 
          isOpen={!!selectedReport} 
          onClose={() => setSelectedReport(null)} 
          data={selectedReport} 
        />
      )}
    </main>
  );
}
