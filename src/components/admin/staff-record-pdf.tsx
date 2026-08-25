"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
} from "@react-pdf/renderer";

export type StaffRecordPdfData = {
  recordId: string;
  staffId: string;
  referralCode: string;
  fullName: string;
  phone: string;
  identityNumber: string;
  dateOfBirth: string;
  jobTitle: string;
  department: string;
  employmentType: string;
  dutyStation: string;
  appointmentDate: string;
  supervisor: string;
  role: string;
  roleCode: string;
  accountStatus: string;
  loginProvisioning: string;
};

const COLORS = {
  navy: "#071A3D",
  gold: "#D4AF37",
  red: "#B91C1C",
  slate: "#475569",
  light: "#F8FAFC",
  border: "#CBD5E1",
  green: "#047857",
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 28,
    paddingBottom: 32,
    paddingHorizontal: 34,
    fontSize: 9,
    color: "#0F172A",
    backgroundColor: "#FFFFFF",
  },

  topBand: {
    backgroundColor: COLORS.navy,
    paddingVertical: 9,
    paddingHorizontal: 12,
    marginBottom: 14,
  },

  topBandText: {
    fontSize: 8,
    color: "#FFFFFF",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },

  header: {
    borderBottomWidth: 3,
    borderBottomColor: COLORS.gold,
    paddingBottom: 14,
  },

  brand: {
    fontSize: 10,
    color: COLORS.red,
    fontWeight: 700,
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },

  title: {
    marginTop: 6,
    fontSize: 20,
    color: COLORS.navy,
    fontWeight: 700,
    textTransform: "uppercase",
  },

  subtitle: {
    marginTop: 5,
    fontSize: 9,
    color: COLORS.slate,
    fontWeight: 700,
  },

  classification: {
    marginTop: 8,
    fontSize: 7,
    color: COLORS.red,
    fontWeight: 700,
    textTransform: "uppercase",
  },

  controlRow: {
    marginTop: 14,
    flexDirection: "row",
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.light,
  },

  controlCell: {
    flex: 1,
    padding: 8,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },

  controlCellLast: {
    flex: 1,
    padding: 8,
  },

  label: {
    fontSize: 6.5,
    color: "#64748B",
    fontWeight: 700,
    textTransform: "uppercase",
    marginBottom: 3,
  },

  value: {
    fontSize: 9,
    color: "#0F172A",
    fontWeight: 700,
  },

  valueGreen: {
    fontSize: 9,
    color: COLORS.green,
    fontWeight: 700,
  },

  section: {
    marginTop: 18,
  },

  sectionTitle: {
    fontSize: 10,
    color: COLORS.navy,
    fontWeight: 700,
    textTransform: "uppercase",
    borderBottomWidth: 1.5,
    borderBottomColor: COLORS.navy,
    paddingBottom: 5,
    marginBottom: 11,
  },

  row: {
    flexDirection: "row",
    marginBottom: 10,
  },

  field: {
    flex: 1,
    marginRight: 16,
  },

  fieldLast: {
    flex: 1,
  },

  fieldValue: {
    fontSize: 9,
    fontWeight: 700,
    paddingBottom: 4,
    borderBottomWidth: 0.6,
    borderBottomColor: COLORS.border,
  },

  notice: {
    marginTop: 17,
    padding: 10,
    borderWidth: 1,
    borderColor: "#FDE68A",
    backgroundColor: "#FFFBEB",
  },

  noticeTitle: {
    fontSize: 7,
    fontWeight: 700,
    color: "#92400E",
    textTransform: "uppercase",
    marginBottom: 4,
  },

  noticeText: {
    fontSize: 7,
    color: "#78350F",
    lineHeight: 1.45,
  },

  signatureRow: {
    flexDirection: "row",
    marginTop: 24,
  },

  signatureBlock: {
    flex: 1,
    marginRight: 24,
  },

  signatureBlockLast: {
    flex: 1,
  },

  signatureSpace: {
    height: 38,
  },

  signatureLine: {
    borderTopWidth: 0.8,
    borderTopColor: "#475569",
    paddingTop: 4,
    fontSize: 7,
    fontWeight: 700,
  },

  footer: {
    marginTop: 24,
    paddingTop: 9,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    textAlign: "center",
  },

  footerBrand: {
    fontSize: 7,
    color: COLORS.navy,
    fontWeight: 700,
    textTransform: "uppercase",
  },

  footerText: {
    marginTop: 2,
    fontSize: 6.5,
    color: "#64748B",
  },

  pageNumber: {
    position: "absolute",
    right: 34,
    bottom: 15,
    fontSize: 6,
    color: "#94A3B8",
  },
});

function PdfField({
  label,
  value,
  last = false,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View style={last ? styles.fieldLast : styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  );
}

function StaffRecordDocument({
  record,
}: {
  record: StaffRecordPdfData;
}) {
  return (
    <Document
      title={`${record.fullName} - Official Staff Personnel Record`}
      author="Red Stone Employment Agency"
      subject="Confidential Staff Personnel Record"
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.topBand}>
          <Text style={styles.topBandText}>
            Red Stone Employment Agency — Staff Administration System
          </Text>
        </View>

        <View style={styles.header}>
          <Text style={styles.brand}>
            Red Stone Employment Agency
          </Text>

          <Text style={styles.title}>
            Official Staff Personnel Record
          </Text>

          <Text style={styles.subtitle}>
            Staff Administration & Personnel Registry
          </Text>

          <Text style={styles.classification}>
            Confidential — Internal Administrative Use
          </Text>
        </View>

        <View style={styles.controlRow}>
          <View style={styles.controlCell}>
            <Text style={styles.label}>Record Reference</Text>
            <Text style={styles.value}>{record.recordId}</Text>
          </View>

          <View style={styles.controlCell}>
            <Text style={styles.label}>Staff ID</Text>
            <Text style={styles.value}>{record.staffId}</Text>
          </View>

          <View style={styles.controlCell}>
            <Text style={styles.label}>Role Code</Text>
            <Text style={styles.value}>{record.roleCode}</Text>
          </View>

          <View style={styles.controlCellLast}>
            <Text style={styles.label}>Account Status</Text>
            <Text style={styles.valueGreen}>
              {record.accountStatus}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            01 — Staff Identification
          </Text>

          <View style={styles.row}>
            <PdfField
              label="Full Legal Name"
              value={record.fullName}
            />

            <PdfField
              label="Referral Code"
              value={record.referralCode}
              last
            />
          </View>

          <View style={styles.row}>
            <PdfField
              label="Mobile Number"
              value={record.phone}
            />

            <PdfField
              label="National ID / Passport"
              value={record.identityNumber}
              last
            />
          </View>

          <View style={styles.row}>
            <PdfField
              label="Date of Birth"
              value={record.dateOfBirth}
            />

            <PdfField
              label="Personnel Status"
              value={record.accountStatus}
              last
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            02 — Employment Information
          </Text>

          <View style={styles.row}>
            <PdfField
              label="Job Title"
              value={record.jobTitle}
            />

            <PdfField
              label="Department"
              value={record.department}
              last
            />
          </View>

          <View style={styles.row}>
            <PdfField
              label="Employment Type"
              value={record.employmentType}
            />

            <PdfField
              label="Duty Station"
              value={record.dutyStation}
              last
            />
          </View>

          <View style={styles.row}>
            <PdfField
              label="Date of Appointment"
              value={record.appointmentDate}
            />

            <PdfField
              label="Reporting Officer"
              value={record.supervisor}
              last
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            03 — System Access & Authorization
          </Text>

          <View style={styles.row}>
            <PdfField
              label="Assigned System Role"
              value={record.role}
            />

            <PdfField
              label="Role Code"
              value={record.roleCode}
              last
            />
          </View>

          <View style={styles.row}>
            <PdfField
              label="Account State"
              value={record.accountStatus}
            />

            <PdfField
              label="Login Provisioning"
              value={record.loginProvisioning}
              last
            />
          </View>

          <View style={styles.notice}>
            <Text style={styles.noticeTitle}>
              Access Control Notice
            </Text>

            <Text style={styles.noticeText}>
              System access is granted according to the staff member's
              authorized duties and the principle of least privilege.
              Access may be amended, suspended or revoked by authorized
              Red Stone administrators.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            04 — Administrative Authorization
          </Text>

          <View style={styles.signatureRow}>
            <View style={styles.signatureBlock}>
              <View style={styles.signatureSpace} />

              <Text style={styles.signatureLine}>
                Authorized Officer Signature
              </Text>
            </View>

            <View style={styles.signatureBlockLast}>
              <View style={styles.signatureSpace} />

              <Text style={styles.signatureLine}>
                Official Stamp
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerBrand}>
            Red Stone Employment Agency
          </Text>

          <Text style={styles.footerText}>
            P.O. Box 2400-40200, Kisii, Kenya
          </Text>

          <Text style={styles.footerText}>
            Confidential — For authorized administrative use only.
          </Text>
        </View>

        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) =>
            `Page ${pageNumber} of ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  );
}

export function StaffRecordPdfDownload({
  record,
}: {
  record: StaffRecordPdfData;
}) {
  const safeName = record.fullName
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return (
    <PDFDownloadLink
      document={<StaffRecordDocument record={record} />}
      fileName={`Red-Stone-${safeName || "Staff"}-Personnel-Record.pdf`}
      className="inline-flex h-11 items-center justify-center rounded-lg border border-amber-600 bg-amber-500 px-6 text-sm font-bold text-slate-950 shadow-sm transition hover:bg-amber-400"
    >
      {({ loading }) =>
        loading
          ? "Preparing Official PDF..."
          : "Download Official PDF"
      }
    </PDFDownloadLink>
  );
}