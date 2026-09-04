import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font, Image } from '@react-pdf/renderer';
import { ServiceReportFormValues } from '@/types/service-report';

// Register Thai Font (Sarabun from Google Fonts) to prevent missing character boxes
Font.register({
  family: 'Sarabun',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/sarabun/v17/DtVjJx26TKEr37c9WBI.ttf', fontWeight: 'normal' },
    { src: 'https://fonts.gstatic.com/s/sarabun/v17/DtVmJx26TKEr37c9YK5sulw.ttf', fontWeight: 'bold' }
  ]
});

const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontFamily: 'Sarabun',
    fontSize: 11,
    color: '#333',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
    paddingBottom: 10,
    marginBottom: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  companyHeaderImage: {
    width: 200,
    objectFit: 'contain',
  },
  headerRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 2,
  },
  grid: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 10,
  },
  gridCol: {
    flex: 1,
    padding: 8,
  },
  gridBorderRight: {
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
  },
  label: {
    fontSize: 9,
    color: '#6b7280',
    marginBottom: 1,
  },
  value: {
    fontSize: 11,
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    backgroundColor: '#f3f4f6',
    padding: 4,
    marginBottom: 5,
  },
  description: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    minHeight: 40,
    marginBottom: 10,
  },
  summaryBlock: {
    backgroundColor: '#eff6ff',
    padding: 8,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryCol: {
    alignItems: 'center',
    flex: 1,
  },
  summaryLabel: {
    fontSize: 9,
    color: '#3b82f6',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 11,
    color: '#1e3a8a',
    fontWeight: 'bold',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  photoWrapper: {
    width: '48%',
    height: 110,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 2,
  },
  photo: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 'auto',
    paddingTop: 10,
  },
  signatureBox: {
    width: '45%',
    alignItems: 'center',
  },
  signatureImage: {
    width: 100,
    height: 45,
    marginBottom: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
  signatureLine: {
    width: 100,
    height: 1,
    backgroundColor: '#000',
    marginBottom: 2,
    marginTop: 20, 
  },
  signatureText: {
    fontSize: 9,
  }
});

interface Props {
  data: ServiceReportFormValues;
}

const formatTime = (timeStr: string) => {
  if (!timeStr) return '-';
  if (timeStr.includes('T') && timeStr.includes('Z')) {
    try {
      const d = new Date(timeStr);
      // Format specifically to TH timezone since the app is for TH
      return d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Bangkok' });
    } catch (e) {
      return timeStr;
    }
  }
  return timeStr;
};

export const ReportDocument = ({ data }: Props) => {
  const getStatusColors = (status: string) => {
    if (status === 'งานเสร็จเรียบร้อย') return { bg: '#dcfce7', border: '#bbf7d0', title: '#166534', value: '#14532d' };
    if (status === 'รอการดำเนินการ') return { bg: '#fef3c7', border: '#fde68a', title: '#92400e', value: '#78350f' };
    if (status === 'ต้องมีการติดตามผล') return { bg: '#fee2e2', border: '#fecaca', title: '#991b1b', value: '#7f1d1d' };
    return { bg: '#f3f4f6', border: '#e5e7eb', title: '#4b5563', value: '#1f2937' };
  };
  const colors = getStatusColors(data.jobStatus || '');

  return (
  <Document>
    <Page size="A4" style={styles.page}>
      
      {/* 1. Document Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerLeft}>
          <Image src="/company-header.png" style={styles.companyHeaderImage} />
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.reportTitle}>SERVICE REPORT</Text>
          <Text>ID: {data.reportId || 'N/A'}</Text>
          <Text>Date: {data.dateTime ? (data.dateTime.includes('T') ? new Date(data.dateTime).toLocaleDateString('th-TH') : data.dateTime) : 'N/A'}</Text>
        </View>
      </View>

      {/* 2. Customer & Site Info Grid */}
      <View style={styles.grid}>
        <View style={[styles.gridCol, styles.gridBorderRight]}>
          <Text style={styles.label}>Customer / Site Name</Text>
          <Text style={styles.value}>{data.siteName || '-'}</Text>
          

          <Text style={styles.label}>Working Hours</Text>
          <Text style={styles.value}>
            {data.startTime ? `${formatTime(data.startTime)} - ${formatTime(data.endTime) || 'N/A'}` : '-'} 
            {data.workDuration ? ` (${data.workDuration})` : ''}
          </Text>
          
          <Text style={styles.label}>GPS Location</Text>
          <Text style={styles.value}>
            {data.location?.latitude 
              ? `${data.location.latitude.toFixed(6)}, ${data.location.longitude?.toFixed(6)}` 
              : '-'}
          </Text>
        </View>
        <View style={styles.gridCol}>
          <Text style={styles.label}>Job Type</Text>
          <Text style={styles.value}>{data.jobType || '-'}</Text>

          <Text style={styles.label}>Team ({data.workersCount} persons)</Text>
          <Text style={styles.value}>{data.staffNames?.join(', ') || '-'}</Text>
        </View>
      </View>

      {/* 3. Work Description */}
      <Text style={styles.sectionTitle}>Work Description / Action Details</Text>
      <View style={styles.description}>
        <Text>{data.actionDetails || 'No details provided.'}</Text>
      </View>

      {/* 3.1 Work Summary (Status & Time) */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        borderWidth: 1,
        borderRadius: 4,
        marginBottom: 10,
        backgroundColor: colors.bg,
        borderColor: colors.border,
      }}>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{ fontSize: 9, fontWeight: 'bold', marginBottom: 2, color: colors.title }}>TIME IN</Text>
          <Text style={{ fontSize: 11, fontWeight: 'bold', color: colors.value }}>{formatTime(data.startTime)}</Text>
        </View>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{ fontSize: 9, fontWeight: 'bold', marginBottom: 2, color: colors.title }}>TIME OUT</Text>
          <Text style={{ fontSize: 11, fontWeight: 'bold', color: colors.value }}>{formatTime(data.endTime)}</Text>
        </View>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{ fontSize: 9, fontWeight: 'bold', marginBottom: 2, color: colors.title }}>TOTAL TIME</Text>
          <Text style={{ fontSize: 11, fontWeight: 'bold', color: colors.value }}>{data.workDuration || '-'}</Text>
        </View>
        <View style={{ flex: 1, alignItems: 'center', borderLeftWidth: 1, borderLeftColor: colors.border }}>
          <Text style={{ fontSize: 9, fontWeight: 'bold', marginBottom: 2, color: colors.title }}>JOB STATUS</Text>
          <Text style={{ fontSize: 12, fontWeight: 'bold', color: colors.value }}>{data.jobStatus || '-'}</Text>
        </View>
      </View>

      {/* 4. Photo Evidence */}
      {data.photos && data.photos.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Photo Evidence</Text>
          <View style={styles.photoGrid}>
            {data.photos.map((photo, idx) => (
              <View key={idx} style={styles.photoWrapper}>
                <Image src={photo} style={styles.photo} />
              </View>
            ))}
          </View>
        </>
      )}

      {/* 5. Signature Block */}
      <View style={styles.footer}>
        <View style={styles.signatureBox}>
          {data.technicianSignature ? (
            <Image src={data.technicianSignature} style={styles.signatureImage} />
          ) : (
            <View style={styles.signatureLine} />
          )}
          <Text style={styles.signatureText}>( {data.leaderName || data.staffNames?.[0] || 'ชื่อผู้ปฏิบัติงาน'} )</Text>
          <Text style={styles.signatureText}>ผู้ปฏิบัติงาน</Text>
          <Text style={styles.signatureText}>Date: {new Date().toLocaleDateString('th-TH')}</Text>
        </View>
        <View style={styles.signatureBox}>
          {data.customerSignature ? (
            <Image src={data.customerSignature} style={styles.signatureImage} />
          ) : (
            <View style={styles.signatureLine} />
          )}
          <Text style={styles.signatureText}>( {data.customerName || 'Customer Name'} )</Text>
          <Text style={styles.signatureText}>Customer / Authorized Person</Text>
          <Text style={styles.signatureText}>Date: {new Date().toLocaleDateString('th-TH')}</Text>
        </View>
      </View>

    </Page>
  </Document>
);

};
