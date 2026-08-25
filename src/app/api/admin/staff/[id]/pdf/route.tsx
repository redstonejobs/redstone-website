import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 42,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#0f172a",
  },

  header: {
    borderBottomWidth: 3,
    borderBottomColor: "#d4af37",
    paddingBottom: 16,
    marginBottom: 24,
  },

  company: {
    fontSize: 10,
    color: "#b91c1c",
    fontWeight: 700,
    letterSpacing: 2,
    marginBottom: 6,
  },

  title: {
    fontSize: 22,
    fontWeight: 700,
    marginBottom: 5,
  },

  subtitle: {
    fontSize: 10,
    color: "#64748b",
  },

  confidential: {
    marginTop: 8,
    fontSize: 8,
    color: "#b91c1c",
    fontWeight: 700,
  },

  section: {
    marginTop: 22,
  },

  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    borderBottomWidth: 1.5,
    borderBottomColor: "#0f172a",
    paddingBottom: 5,
    marginBottom: 12,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  field: {
    width: "50%",
    paddingRight: 14,
    marginBottom: 12,
  },

  label: {
    fontSize: 7,
    color: "#64748b",
    fontWeight: 700,
    marginBottom: 4,
  },

  value: {
    fontSize: 10,
    fontWeight: 700,
    borderBottomWidth: 0.5,
    borderBottomColor: "#cbd5e1",
    paddingBottom: 5,
  },

  warning: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#fff7ed",
    borderWidth: 1,
    borderColor: "#fed7aa",
    fontSize: 8,
    lineHeight: 1.5,
  },

  signatures: {
    marginTop: 40,
    flexDirection: "row",
    gap: 40,
  },

  signature: {
    width: "45%",
    borderTopWidth: 1,
    borderTopColor: "#64748b",
    paddingTop: 6,
    fontSize: 8,
  },

  footer: {
    marginTop: 45,
    borderTopWidth: 1,
    borderTopColor: "#cbd5e1",
    paddingTop: 10,
    textAlign: "center",
    fontSize: 7,
    color: "#64748b",
  },
});

function Field({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

function StaffRecordPdf({ id }: { id: string }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.company}>
            RED STONE EMPLOYMENT AGENCY
          </Text>

          <Text style={styles.title}>
            OFFICIAL STAFF PERSONNEL RECORD
          </Text>

          <Text style={styles.subtitle}>
            Staff Administration & Personnel Registry
          </Text>

          <Text style={styles.confidential}>
            CONFIDENTIAL — INTERNAL ADMINISTRATIVE USE
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            A. STAFF IDENTIFICATION
          </Text>

          <View style={styles.grid}>
            <Field label="RECORD REFERENCE" value={id} />
            <Field label="STAFF ID" value="RSE-STF-000001" />

            <Field label="REFERRAL CODE" value="RSE-7K4M9Q" />
            <Field label="FULL LEGAL NAME" value="Sample Staff Member" />

            <Field
              label="OFFICIAL EMAIL"
              value="staff@redstone.co.ke"
            />

            <Field
              label="PHONE NUMBER"
              value="+254 --- --- ---"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            B. EMPLOYMENT INFORMATION
          </Text>

          <View style={styles.grid}>
            <Field label="JOB TITLE" value="Recruitment Officer" />
            <Field label="DEPARTMENT" value="Recruitment" />

            <Field label="EMPLOYMENT TYPE" value="Full Time" />
            <Field label="DUTY STATION" value="Kisii Office" />

            <Field label="ACCOUNT STATUS" value="Active" />
            <Field label="SYSTEM ROLE" value="Recruiter" />
          </View>
        </View>

        <Text style={styles.warning}>
          System access is granted according to the staff member's
          authorized duties and may be amended, suspended or revoked by
          authorized Red Stone administrators. This document must never
          contain passwords, OTPs, access tokens or authentication
          secrets.
        </Text>

        <View style={styles.signatures}>
          <Text style={styles.signature}>
            Authorized Officer Signature
          </Text>

          <Text style={styles.signature}>
            Official Stamp / HR Administration
          </Text>
        </View>

        <View style={styles.footer}>
          <Text>RED STONE EMPLOYMENT AGENCY</Text>
          <Text>P.O. Box 2400-40200, Kisii, Kenya</Text>
          <Text>
            Confidential — For authorized administrative use only.
          </Text>
        </View>
      </Page>
    </Document>
  );
}

export async function GET(
  _request: Request,
  context: {
    params: Promise<{ id: string }>;
  },
) {
  const { id } = await context.params;

  const pdfBuffer = await renderToBuffer(
    <StaffRecordPdf id={id} />,
  );

  return new Response(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="Red-Stone-Staff-${id}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}