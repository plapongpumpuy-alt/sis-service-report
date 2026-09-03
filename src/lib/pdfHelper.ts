import { pdf } from '@react-pdf/renderer';
import { ReportDocument } from '@/components/pdf/ReportDocument';
import { ServiceReportFormValues } from '@/types/service-report';

/**
 * Generates a PDF Blob from the form data.
 * Useful for attaching to emails, uploading to cloud storage via APIs, etc.
 */
export const generatePdfBlob = async (data: ServiceReportFormValues): Promise<Blob> => {
  const document = ReportDocument({ data }); // JSX Element
  const asPdf = pdf([]); // create an empty pdf instance
  asPdf.updateContainer(document);
  const blob = await asPdf.toBlob();
  return blob;
};
