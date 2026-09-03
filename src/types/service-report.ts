export type JobType = string;
export type JobStatus = 'Completed' | 'Pending Parts' | 'Follow-up Required';

export interface LocationData {
  latitude: number | null;
  longitude: number | null;
  error?: string;
}

export interface ServiceReportFormValues {
  // 1. Header & Metadata
  reportId: string;
  dateTime: string; 
  startTime: string;
  endTime: string;
  workDuration: string;
  siteName: string;
  location: LocationData;
  
  // 2. Team Attendance
  workersCount: number;
  staffNames: string[];
  
  // 3. Task & Action Summary
  jobType: JobType;
  jobStatus: JobStatus;
  actionDetails: string;
  
  // 4. Media Capture
  photos: string[];
  
  // 5. Signatures
  technicianSignature: string; 
  customerName: string;
  customerSignature: string; 
  // 6. Email Dispatch
  sendToCustomer?: boolean;
  toEmail?: string;
  ccEmails?: string;
}
