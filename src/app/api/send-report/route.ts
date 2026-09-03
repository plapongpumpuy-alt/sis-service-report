import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { toEmail, ccEmails, reportData, pdfBase64 } = body;

    if (!toEmail) {
      return NextResponse.json({ status: 'error', message: 'Missing recipient email' }, { status: 400 });
    }

    // Setup SMTP transporter using environment variables
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const reportId = reportData.reportId || 'N/A';
    const customerName = reportData.customerName || reportData.siteName || 'Customer';
    const dateStr = reportData.dateTime ? new Date(reportData.dateTime).toLocaleDateString('th-TH') : 'N/A';

    const subject = `[Service Report] ${reportId} - ${customerName} - ${dateStr}`;

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">Service Report Summary</h2>
        <p>Dear ${customerName},</p>
        <p>Please find attached the signed service report for the recent work completed at your site.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold; width: 40%;">Report ID:</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${reportId}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Date:</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${dateStr}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Job Status:</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">
              <span style="padding: 4px 8px; border-radius: 12px; font-size: 12px; ${
                reportData.jobStatus === 'Completed' ? 'background-color: #dcfce7; color: #166534;' : 
                reportData.jobStatus === 'Pending Parts' ? 'background-color: #fef3c7; color: #92400e;' : 
                'background-color: #fee2e2; color: #991b1b;'
              }">${reportData.jobStatus || '-'}</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Technician(s):</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${reportData.staffNames?.join(', ') || '-'}</td>
          </tr>
        </table>
        
        <p style="color: #666; font-size: 14px;">If you have any questions or concerns regarding this report, please do not hesitate to contact us.</p>
        <br/>
        <p style="margin-bottom: 0;">Best regards,</p>
        <p style="margin-top: 5px; font-weight: bold;">Service Team</p>
      </div>
    `;

    // Process base64 PDF
    // Usually base64 from FileReader data URL looks like "data:application/pdf;base64,JVBER..."
    let pdfBuffer;
    if (pdfBase64.includes('base64,')) {
      const b64Str = pdfBase64.split('base64,')[1];
      pdfBuffer = Buffer.from(b64Str, 'base64');
    } else {
      pdfBuffer = Buffer.from(pdfBase64, 'base64');
    }

    const mailOptions: nodemailer.SendMailOptions = {
      from: process.env.SMTP_USER,
      to: toEmail,
      subject,
      html: htmlBody,
      attachments: [
        {
          filename: `${reportId}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    };

    if (ccEmails) {
      mailOptions.cc = ccEmails.split(',').map((e: string) => e.trim());
    }

    const info = await transporter.sendMail(mailOptions);
    console.log('Nodemailer sent info:', info.messageId, info.response);

    return NextResponse.json({ status: 'success', message: 'Email sent successfully', info: info.response });

  } catch (error: any) {
    console.error('Error sending email:', error);
    return NextResponse.json({ status: 'error', message: error.message || 'Failed to send email' }, { status: 500 });
  }
}

export const maxDuration = 60;
