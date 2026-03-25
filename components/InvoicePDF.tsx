import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer'

// Register a clean font
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'Helvetica' },
    { src: 'Helvetica-Bold', fontWeight: 'bold' },
  ],
})

const BRAND = '#7BB829'
const DARK  = '#1a1f2e'

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: '#333',
    backgroundColor: '#fff',
    paddingBottom: 40,
  },

  // Header band
  header: {
    backgroundColor: DARK,
    padding: '24 32',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: { flexDirection: 'column' },
  headerAgency: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  headerSub: { color: BRAND, fontSize: 8, marginTop: 2 },
  headerInfo: { color: '#ccc', fontSize: 7.5, marginTop: 1 },

  headerRight: {
    alignItems: 'flex-end',
  },
  invoiceLabel: { color: BRAND, fontSize: 22, fontWeight: 'bold' },
  invoiceNumber: { color: '#fff', fontSize: 12, marginTop: 2 },

  // Body
  body: { padding: '20 32' },

  // Two-column row: recipient + dates
  twoCol: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  colLeft: { flex: 1 },
  colRight: { width: 180 },

  sectionLabel: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  clientName: { fontWeight: 'bold', fontSize: 11, color: DARK, marginBottom: 2 },
  clientDetail: { color: '#555', marginBottom: 1 },

  // Date box
  dateBox: {
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: '6 10',
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  dateRowLast: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: '8 10',
    backgroundColor: BRAND,
  },
  dateLabel: { color: '#666', fontWeight: 'bold' },
  dateValue: { color: '#333' },
  dateTotalLabel: { color: '#fff', fontWeight: 'bold', fontSize: 10 },
  dateTotalValue: { color: '#fff', fontWeight: 'bold', fontSize: 10 },

  // Table
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: BRAND,
    borderRadius: 4,
    padding: '7 10',
    marginBottom: 2,
  },
  tableRow: {
    flexDirection: 'row',
    padding: '6 10',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tableRowAlt: {
    flexDirection: 'row',
    padding: '6 10',
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },

  colDesc:  { flex: 1 },
  colQty:   { width: 50, textAlign: 'center' },
  colPrice: { width: 70, textAlign: 'right' },
  colTotal: { width: 70, textAlign: 'right' },

  thText: { color: '#fff', fontWeight: 'bold', fontSize: 8 },
  tdText: { color: '#444', fontSize: 8.5 },

  // Totals
  totalsSection: { marginTop: 16, alignItems: 'flex-end' },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 200,
    padding: '4 0',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  totalLabelText: { color: '#666', fontSize: 8.5 },
  totalValueText: { color: '#333', fontSize: 8.5 },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 200,
    backgroundColor: BRAND,
    borderRadius: 4,
    padding: '7 10',
    marginTop: 4,
  },
  grandTotalLabel: { color: '#fff', fontWeight: 'bold', fontSize: 10 },
  grandTotalValue: { color: '#fff', fontWeight: 'bold', fontSize: 10 },

  // Notes
  notesSection: { marginTop: 20 },
  notesText: { color: '#666', fontSize: 8, lineHeight: 1.5 },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#f8f8f8',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    padding: '8 32',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: { color: '#aaa', fontSize: 7 },
  footerBrand: { color: BRAND, fontSize: 7, fontWeight: 'bold' },
})

function fmt(n: number) {
  return `$${n.toFixed(2)}`
}

function fmtDate(d: string | Date) {
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

type Item = { description: string; quantity: number; unitPrice: number; total: number }
type Client = { name: string; company: string; email: string; phone: string; address: string; city: string; state: string; zip: string; country: string }
type Invoice = { number: string; status: string; issueDate: Date | string; dueDate: Date | string; subtotal: number; taxRate: number; taxAmount: number; total: number; notes: string; client: Client; items: Item[] }
type Settings = { agencyName: string; address: string; city: string; state: string; zip: string; country: string; phone: string; email: string; website: string } | null

export function InvoicePDFDocument({ invoice, settings }: { invoice: Invoice; settings: Settings }) {
  const agency = settings || { agencyName: 'Paradise Lamb Agency', address: '', city: '', state: '', zip: '', country: '', phone: '', email: '', website: '' }

  return (
    <Document title={`Factura ${invoice.number}`} author={agency.agencyName}>
      <Page size="A4" style={styles.page}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerAgency}>{agency.agencyName}</Text>
            <Text style={styles.headerSub}>Marketing &amp; Digital Agency</Text>
            {agency.address ? <Text style={styles.headerInfo}>{agency.address}</Text> : null}
            {(agency.city || agency.state) ? (
              <Text style={styles.headerInfo}>{[agency.city, agency.state, agency.zip].filter(Boolean).join(', ')}</Text>
            ) : null}
            {agency.phone ? <Text style={styles.headerInfo}>{agency.phone}</Text> : null}
            {agency.email ? <Text style={styles.headerInfo}>{agency.email}</Text> : null}
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.invoiceLabel}>FACTURA</Text>
            <Text style={styles.invoiceNumber}>#{invoice.number}</Text>
          </View>
        </View>

        {/* BODY */}
        <View style={styles.body}>
          {/* Recipient + Dates */}
          <View style={styles.twoCol}>
            <View style={styles.colLeft}>
              <Text style={styles.sectionLabel}>Facturar a:</Text>
              <Text style={styles.clientName}>{invoice.client.company || invoice.client.name}</Text>
              {invoice.client.company ? <Text style={styles.clientDetail}>{invoice.client.name}</Text> : null}
              {invoice.client.address ? <Text style={styles.clientDetail}>{invoice.client.address}</Text> : null}
              {(invoice.client.city || invoice.client.state) ? (
                <Text style={styles.clientDetail}>{[invoice.client.city, invoice.client.state, invoice.client.zip].filter(Boolean).join(', ')}</Text>
              ) : null}
              {invoice.client.email ? <Text style={styles.clientDetail}>{invoice.client.email}</Text> : null}
              {invoice.client.phone ? <Text style={styles.clientDetail}>{invoice.client.phone}</Text> : null}
            </View>

            <View style={styles.colRight}>
              <View style={styles.dateBox}>
                <View style={styles.dateRow}>
                  <Text style={styles.dateLabel}>Emitida</Text>
                  <Text style={styles.dateValue}>{fmtDate(invoice.issueDate)}</Text>
                </View>
                <View style={styles.dateRow}>
                  <Text style={styles.dateLabel}>Vence</Text>
                  <Text style={styles.dateValue}>{fmtDate(invoice.dueDate)}</Text>
                </View>
                <View style={styles.dateRowLast}>
                  <Text style={styles.dateTotalLabel}>TOTAL</Text>
                  <Text style={styles.dateTotalValue}>{fmt(invoice.total)}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Items table */}
          <View style={styles.tableHeader}>
            <Text style={[styles.thText, styles.colDesc]}>Servicio / Producto</Text>
            <Text style={[styles.thText, styles.colQty]}>Cant.</Text>
            <Text style={[styles.thText, styles.colPrice]}>Precio Unit.</Text>
            <Text style={[styles.thText, styles.colTotal]}>Total</Text>
          </View>

          {invoice.items.map((item, idx) => (
            <View key={idx} style={idx % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
              <Text style={[styles.tdText, styles.colDesc]}>{item.description}</Text>
              <Text style={[styles.tdText, styles.colQty]}>{item.quantity}</Text>
              <Text style={[styles.tdText, styles.colPrice]}>{fmt(item.unitPrice)}</Text>
              <Text style={[styles.tdText, styles.colTotal]}>{fmt(item.total)}</Text>
            </View>
          ))}

          {/* Totals */}
          <View style={styles.totalsSection}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabelText}>Subtotal</Text>
              <Text style={styles.totalValueText}>{fmt(invoice.subtotal)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabelText}>Impuesto ({invoice.taxRate}%)</Text>
              <Text style={styles.totalValueText}>{fmt(invoice.taxAmount)}</Text>
            </View>
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>TOTAL</Text>
              <Text style={styles.grandTotalValue}>{fmt(invoice.total)}</Text>
            </View>
          </View>

          {/* Notes */}
          {invoice.notes ? (
            <View style={styles.notesSection}>
              <Text style={styles.sectionLabel}>Notas</Text>
              <Text style={styles.notesText}>{invoice.notes}</Text>
            </View>
          ) : null}
        </View>

        {/* FOOTER */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Gracias por su preferencia · {agency.email}</Text>
          <Text style={styles.footerBrand}>{agency.agencyName}</Text>
        </View>
      </Page>
    </Document>
  )
}
