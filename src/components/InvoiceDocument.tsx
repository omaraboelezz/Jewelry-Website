// src/components/InvoiceDocument.tsx
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';

import CairoFont from '../assets/fonts/Cairo.ttf';
import LogoImage from '../assets/Saudi-Silver-Logo.png';

Font.register({
  family: 'Cairo',
  src: CairoFont,
});

// ─── Color Palette ────────────────────────────────────────────────────────────
const gold = '#C9A84C';
const goldDim = '#8a6a28';
const darkBg = '#1a1208';
const lightGold = '#F5E6C0';
const white = '#FFFFFF';
const gray = '#888888';
const deepBlack = '#0d0a04';
const rowAlt = '#1f160a';

// ─── QR Code via free API (gold on dark) ─────────────────────────────────────
const QR_URL =
  'https://api.qrserver.com/v1/create-qr-code/?size=80x80&color=C9A84C&bgcolor=0d0a04&data=https://elsaudi-jewelry.vercel.app/';

// ─── Currency formatter ───────────────────────────────────────────────────────
const fmt = (amount: number) => `${amount.toLocaleString('en-US')} EGP`;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  page: {
    backgroundColor: darkBg,
    fontFamily: 'Cairo',
    padding: 0,
  },

  // All 4 corner accents
  cornerTL: { position: 'absolute', top: 8, left: 8, width: 22, height: 22, borderTopWidth: 2, borderLeftWidth: 2, borderColor: gold, opacity: 0.6 },
  cornerTR: { position: 'absolute', top: 8, right: 8, width: 22, height: 22, borderTopWidth: 2, borderRightWidth: 2, borderColor: gold, opacity: 0.6 },
  cornerBL: { position: 'absolute', bottom: 8, left: 8, width: 22, height: 22, borderBottomWidth: 2, borderLeftWidth: 2, borderColor: gold, opacity: 0.6 },
  cornerBR: { position: 'absolute', bottom: 8, right: 8, width: 22, height: 22, borderBottomWidth: 2, borderRightWidth: 2, borderColor: gold, opacity: 0.6 },

  // ─── Header ─────────────────────────────────────────────────────────────
  header: {
    backgroundColor: deepBlack,
    paddingVertical: 22,
    paddingHorizontal: 40,
    borderBottomWidth: 1,
    borderBottomColor: gold,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoWrapper: {
    width: 68, height: 68,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: white, borderRadius: 4, padding: 4,
  },
  logoImage: { width: 60, height: 60, objectFit: 'contain' },

  headerCenter: { flex: 1, alignItems: 'center' },
  brandName: { color: gold, fontSize: 22, fontFamily: 'Cairo', letterSpacing: 4 },
  brandSub: { color: lightGold, fontSize: 7, letterSpacing: 3, marginTop: 3, opacity: 0.75 },

  headerRight: { alignItems: 'flex-end', width: 68 },
  qrImage: { width: 60, height: 60, borderWidth: 1, borderColor: goldDim },
  qrLabel: { color: gray, fontSize: 6, marginTop: 3, textAlign: 'center', letterSpacing: 0.5, marginRight: 6 },

  // ─── Meta Strip ─────────────────────────────────────────────────────────
  metaStrip: {
    backgroundColor: '#110e04',
    paddingHorizontal: 40, paddingVertical: 10,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderBottomWidth: 1, borderBottomColor: '#2a1f08',
  },
  metaItem: { flexDirection: 'row', alignItems: 'center' },
  metaLabel: { color: gray, fontSize: 7, letterSpacing: 1, marginRight: 4 },
  metaValue: { color: lightGold, fontSize: 8, letterSpacing: 0.5 },
  metaDot: { color: goldDim, fontSize: 10, marginHorizontal: 8, opacity: 0.5 },

  // ─── Body ───────────────────────────────────────────────────────────────
  body: { paddingHorizontal: 40, paddingTop: 22, paddingBottom: 20 },
  sectionTitle: { color: gold, fontSize: 8, letterSpacing: 2.5, marginBottom: 12 },

  // ─── Table ──────────────────────────────────────────────────────────────
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: deepBlack,
    borderTopWidth: 1, borderBottomWidth: 1, borderColor: gold,
    paddingVertical: 7, paddingHorizontal: 8,
  },
  thProduct: { color: gold, fontSize: 7, flex: 4, letterSpacing: 1 },
  thCell: { color: gold, fontSize: 7, flex: 1, textAlign: 'center', letterSpacing: 1 },

  itemRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 9, paddingHorizontal: 8,
    borderBottomWidth: 1, borderBottomColor: '#2a200a',
  },
  itemRowAlt: { backgroundColor: rowAlt },
  itemImage: { width: 44, height: 44, marginRight: 10, borderWidth: 1, borderColor: '#3a2d10' },
  itemInfo: { flex: 3 },
  itemName: { color: white, fontSize: 10, fontFamily: 'Cairo' },
  itemDesc: { color: gray, fontSize: 7, marginTop: 2 },
  itemQty: { flex: 1, color: lightGold, fontSize: 9, textAlign: 'center' },
  itemPrice: { flex: 1, color: lightGold, fontSize: 9, textAlign: 'center' },
  itemTotal: { flex: 1, color: gold, fontSize: 9, textAlign: 'center', fontFamily: 'Cairo' },

  // ─── Items count badge ───────────────────────────────────────────────────
  badgeRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: goldDim, backgroundColor: '#1f1608' },
  badgeText: { color: gold, fontSize: 7, letterSpacing: 1.5 },

  // ─── Total Box ──────────────────────────────────────────────────────────
  totalBoxWrapper: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20 },
  totalBox: { width: 230, borderWidth: 1, borderColor: goldDim, backgroundColor: deepBlack },
  totalBoxHeader: {
    backgroundColor: '#1a1208', borderBottomWidth: 1, borderBottomColor: goldDim,
    paddingVertical: 6, paddingHorizontal: 14,
  },
  totalBoxHeaderText: { color: gold, fontSize: 7, letterSpacing: 2 },
  totalBoxBody: { padding: 14 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 7 },
  totalLabel: { color: gray, fontSize: 9 },
  totalValue: { color: lightGold, fontSize: 9, fontFamily: 'Cairo' },
  totalDivider: { height: 1, backgroundColor: gold, opacity: 0.25, marginVertical: 8 },
  grandTotalLabel: { color: gold, fontSize: 12, fontFamily: 'Cairo' },
  grandTotalValue: { color: gold, fontSize: 12, fontFamily: 'Cairo' },

  // ─── Terms & Conditions ───────────────────────────────────────────────────
  dividerTerms: {
    width: '100%',
    height: 1,
    backgroundColor: gold,
    opacity: 0.25,
    marginVertical: 8,
  },

  // ─── Footer ─────────────────────────────────────────────────────────────
  footer: {
    marginTop: 28, borderTopWidth: 1, borderTopColor: '#2a200a',
    paddingTop: 14, alignItems: 'center',
  },
  footerText: { color: gray, fontSize: 7, textAlign: 'center', letterSpacing: 0.5 },
  footerBrand: { color: gold, fontSize: 9, marginTop: 5, letterSpacing: 3 },
  footerWebsite: { color: goldDim, fontSize: 7, marginTop: 3, letterSpacing: 1 },
});

// ─── Types ────────────────────────────────────────────────────────────────────
interface InvoiceItem {
  id: number | string;
  name: string;
  name_ar?: string;
  name_en?: string;
  arabic_name?: string;
  english_name?: string;
  price: number;
  quantity?: number;
  image?: string;
  image_file?: string;
  image_url?: string;
  weight?: string | number;
  karat?: string;
  notes?: string;
}

interface InvoiceDocumentProps {
  items: InvoiceItem[];
  language?: string;
  invoiceNumber?: string;
  date?: string;
  status?: string;
  customerName?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getProductName = (item: InvoiceItem, language: string) =>
  language === 'ar'
    ? item.arabic_name || item.name_ar || item.name || 'منتج'
    : item.english_name || item.name_en || item.name || 'Product';

const getImageUrl = (item: InvoiceItem): string | null => {
  if ('image_url' in item && item.image_url === null) return null;
  const url = item.image_url || item.image_file || item.image || null;
  if (!url) return null;
  if (url.startsWith('data:image')) return url;
  if (url.includes('cloudinary.com')) return url;
  return null;
};

// ─── Component ────────────────────────────────────────────────────────────────
const InvoiceDocument = ({
  items,
  language = 'ar',
  invoiceNumber,
  date,
  status,
  customerName,
}: InvoiceDocumentProps) => {
  const validItems = items.filter(i => !(i as any).isDeleted);
  const subtotal = validItems.reduce((acc, i) => acc + (Math.ceil(i.price / 5) * 5) * (i.quantity || 1), 0);
  const invoiceNum = `SS-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const invoiceDate = date || new Date().toLocaleDateString('en-GB');
  const isAr = language === 'ar';
  const orderStatus = status || (isAr ? 'مكتمل' : 'COMPLETED');

  // If arabic, set direction to RTL
  const pageStyle = { ...styles.page, direction: isAr ? 'rtl' : 'ltr' } as any;

  return (
    <Document>
      <Page size="A4" style={pageStyle}>

        {/* ── 4 Corner accents ── */}
        <View style={styles.cornerTL} />
        <View style={styles.cornerTR} />
        <View style={styles.cornerBL} />
        <View style={styles.cornerBR} />

        {/* ── Header: Logo | Brand | QR ── */}
        <View style={styles.header}>
          <View style={styles.logoWrapper}>
            <Image src={LogoImage} style={styles.logoImage} />
          </View>

          <View style={styles.headerCenter}>
            <Text style={styles.brandName}>El-Saudi JEWELRY</Text>
            <Text style={styles.brandSub}>* LUXURY JEWELRY *</Text>
          </View>

          <View style={styles.headerRight}>
            <Image src={QR_URL} style={styles.qrImage} />
            <Text style={styles.qrLabel}>elsaudi-jewelry</Text>
          </View>
        </View>

        {/* ── Meta Strip ── */}
        <View style={styles.metaStrip}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>{isAr ? 'رقم الفاتورة' : 'INVOICE'}</Text>
            <Text style={styles.metaValue}>{invoiceNum}</Text>
          </View>
          <Text style={styles.metaDot}>|</Text>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>{isAr ? 'التاريخ' : 'DATE'}</Text>
            <Text style={styles.metaValue}>{invoiceDate}</Text>
          </View>
          <Text style={styles.metaDot}>|</Text>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>{isAr ? 'الحالة' : 'STATUS'}</Text>
            <Text style={[styles.metaValue, { color: gold }]}>{orderStatus}</Text>
          </View>
        </View>

        {/* ── Body ── */}
        <View style={styles.body}>
          <View style={{ marginBottom: 24, flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ color: goldDim, fontSize: 10, letterSpacing: 1.5 }}>
              {isAr ? 'فاتورة إلى :' : 'BILL TO :'}
            </Text>
            <Text style={{ color: white, fontSize: 16, fontFamily: 'Cairo', marginHorizontal: 8 }}>
              {customerName || (isAr ? 'عميل' : 'Customer')}
            </Text>
          </View>

          <Text style={styles.sectionTitle}>
            {isAr ? 'تفاصيل الطلب' : 'ORDER DETAILS'}
          </Text>

          {/* Table header */}
          <View style={styles.tableHeader}>
            <Text style={styles.thProduct}>{isAr ? 'المنتج' : 'PRODUCT'}</Text>
            <Text style={styles.thCell}>{isAr ? 'الكمية' : 'QTY'}</Text>
            <Text style={styles.thCell}>{isAr ? 'السعر' : 'PRICE'}</Text>
            <Text style={styles.thCell}>{isAr ? 'الإجمالي' : 'TOTAL'}</Text>
          </View>

          {/* Items with alternating rows */}
          {validItems.map((item, index) => {
            const imageUrl = getImageUrl(item);
            const qty = item.quantity || 1;
            const roundedPrice = Math.ceil(item.price / 5) * 5;
            const lineTotal = roundedPrice * qty;

            return (
              <View
                key={String(item.id)}
                style={index % 2 !== 0 ? [styles.itemRow, styles.itemRowAlt] : styles.itemRow}
              >
                <Image src={imageUrl || LogoImage} style={styles.itemImage} />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{getProductName(item, language)}</Text>
                  {(item.weight || item.karat || item.notes) && (
                    <View style={{ marginTop: 5, flexDirection: isAr ? 'row-reverse' : 'row' }}>
                      {item.weight && (
                        <Text style={{ color: '#aaa', fontSize: 6, backgroundColor: '#2a200a', paddingHorizontal: 4, paddingVertical: 2, borderRadius: 2, marginRight: isAr ? 0 : 4, marginLeft: isAr ? 4 : 0 }}>
                          {isAr ? `الوزن: ${item.weight}ج` : `Weight: ${item.weight}g`}
                        </Text>
                      )}
                      {item.karat && (
                        <Text style={{ color: '#aaa', fontSize: 6, backgroundColor: '#2a200a', paddingHorizontal: 4, paddingVertical: 2, borderRadius: 2, marginRight: isAr ? 0 : 4, marginLeft: isAr ? 4 : 0 }}>
                          {isAr ? `العيار: ${item.karat}` : `Purity: ${item.karat}`}
                        </Text>
                      )}
                      {item.notes && (
                        <Text style={{ color: '#aaa', fontSize: 6, backgroundColor: '#2a200a', paddingHorizontal: 4, paddingVertical: 2, borderRadius: 2, marginRight: isAr ? 0 : 4, marginLeft: isAr ? 4 : 0 }}>
                          {isAr ? `ملاحظات: ${item.notes}` : `Notes: ${item.notes}`}
                        </Text>
                      )}
                    </View>
                  )}
                </View>
                <Text style={styles.itemQty}>{qty}</Text>
                <Text style={styles.itemPrice}>{fmt(roundedPrice)}</Text>
                <Text style={styles.itemTotal}>{fmt(lineTotal)}</Text>
              </View>
            );
          })}

          {/* Items count badge */}
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {isAr
                  ? `${validItems.length} منتج في الطلب`
                  : `${validItems.length} ITEM${validItems.length !== 1 ? 'S' : ''} IN ORDER`}
              </Text>
            </View>
          </View>

          {/* Total Box */}
          <View style={styles.totalBoxWrapper}>
            <View style={styles.totalBox}>
              <View style={styles.totalBoxHeader}>
                <Text style={styles.totalBoxHeaderText}>
                  {isAr ? 'ملخص الفاتورة' : 'INVOICE SUMMARY'}
                </Text>
              </View>
              <View style={styles.totalBoxBody}>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>{isAr ? 'المجموع الفرعي' : 'Subtotal'}</Text>
                  <Text style={styles.totalValue}>{fmt(subtotal)}</Text>
                </View>
                <View style={styles.totalDivider} />
                <View style={styles.totalRow}>
                  <Text style={styles.grandTotalLabel}>{isAr ? 'الإجمالي' : 'Total'}</Text>
                  <Text style={styles.grandTotalValue}>{fmt(subtotal)}</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.dividerTerms} />

          {/* Terms & Conditions */}
          <View style={{ marginTop: 20, marginBottom: 10, paddingHorizontal: 10, width: '100%', alignItems: isAr ? 'flex-end' : 'flex-start' }}>
            <Text style={{ color: '#aaa', fontSize: 8, fontFamily: 'Cairo', marginBottom: 3, textAlign: isAr ? 'right' : 'left' }}>
              {isAr ? '١- المنتجات التي تسترد بالفصوص تسترد حسب تعليمات الشركة المنتجة دون أدنى مسئولية ع المحل' : '1- Products returned with stones are returned according to the manufacturer\'s instructions without any responsibility on the store.'}
            </Text>
            <Text style={{ color: '#aaa', fontSize: 8, fontFamily: 'Cairo', marginBottom: 3, textAlign: isAr ? 'right' : 'left' }}>
              {isAr ? '٢- على العميل مراجعة الوزن خلال ثلاث أيام من تاريخ الاستلام' : '2- The customer must review the weight within three days from the date of receipt.'}
            </Text>
            <Text style={{ color: '#aaa', fontSize: 8, fontFamily: 'Cairo', textAlign: isAr ? 'right' : 'left' }}>
              {isAr ? '٣- ماعدا السهو والخطأ والتحفظات المعتادة' : '3- Errors and omissions excepted.'}
            </Text>
          </View>


          {/* Footer */}
          <View style={styles.footer}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 12, paddingHorizontal: 20 }}>
              {/* Head Center */}
              <View style={{ alignItems: isAr ? 'flex-start' : 'flex-start', flex: 1 }}>
                <Text style={{ color: goldDim, fontSize: 8, marginBottom: 3, fontFamily: 'Cairo' }}>
                  {isAr ? 'بورسعيد .. المركز الرئيسي : ش أسوان (مساكن المعلمين)' : 'Port Said .. Head Center Aswan St,.'}
                </Text>
                <Text style={{ color: goldDim, fontSize: 8, fontFamily: 'Cairo' }}>
                  {isAr ? 'فـــرع أســـــوان' : 'Aswan Branch'}
                </Text>
              </View>
              {/* Phone Numbers */}
              <View style={{ alignItems: isAr ? 'flex-end' : 'flex-end' }}>
                <Text style={{ color: gray, fontSize: 8, marginBottom: 3, fontFamily: 'Cairo' }}>
                  {isAr ? '+ت : 201067365567' : 'Tel.: +201067365567'}  
                </Text>
              </View>
            </View>

            <Text style={styles.footerText}>
              {isAr
                ? 'شكراً لثقتك في EL-SAUDI JEWELRY  — نلتزم بأعلى معايير الجودة'
                : 'Thank you for choosing EL-SAUDI JEWELRY  — Committed to the highest quality standards'}
            </Text>
            <Text style={styles.footerBrand}>* EL-SAUDI JEWELRY *</Text>
            <Text style={styles.footerWebsite}>elsaudi-jewelry.vercel.app</Text>
          </View>
        </View>

      </Page>
    </Document>
  );
};

export default InvoiceDocument;