import { DeleteFilled, EditOutlined } from "@ant-design/icons";
import { pdf } from "@react-pdf/renderer";
import { Modal } from "antd";
import InvoiceDocument from "../components/InvoiceDocument";


export const MoveProductModal = ({
  language, t, sections,
  productToMove, newSectionForMove, setNewSectionForMove,
  isMovingProduct, onConfirm, onClose,
}) => {
  if (!productToMove) return null;
  return (
    <div style={overlayStyle}>
      <div style={cardStyle({ maxWidth: 400 })}>
        <h3 style={{ marginBottom: 20, color: "#1a1a1a", fontSize: 20, fontWeight: 700 }}>
          🔄 {t.moveProduct}:{" "}
          {language === "ar"
            ? productToMove.name_ar || productToMove.name
            : productToMove.name_en || productToMove.name}
        </h3>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
            {t.selectNewSection}
          </label>
          <select
            value={newSectionForMove}
            onChange={(e) => setNewSectionForMove(e.target.value)}
            style={selectStyle}
          >
            <option value="" disabled>-- {t.selectSection} --</option>
            {sections
              .filter((s) => s.id !== productToMove.section)
              .map((sec) => (
                <option key={sec.id} value={sec.id}>
                  {language === "ar" ? sec.title_ar : sec.title_en}
                </option>
              ))}
          </select>
        </div>

        <div style={btnRowStyle}>
          <button onClick={onClose} style={cancelBtnStyle} disabled={isMovingProduct}>
            {t.cancel}
          </button>
          <button
            onClick={onConfirm}
            style={primaryBtnStyle({ bg: "linear-gradient(135deg,#17a2b8 0%,#117a8b 100%)" })}
            disabled={isMovingProduct}
          >
            {isMovingProduct ? t.moving : t.confirmMove}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Invoice Item Detail Modal  (shown on top of InvoiceModal)
// ─────────────────────────────────────────────────────────────────────────────
export const InvoiceDetailModal = ({
  language, detailModalState, setDetailModalState,
  onSave, onClose,
}) => {
  if (!detailModalState.visible) return null;
  return (
    <div style={{ ...overlayStyle, zIndex: 2000 }}>
      <div style={cardStyle({ maxWidth: 400 })}>
        <h4 style={{ marginBottom: 15, color: "#1a1208", fontWeight: 700, fontSize: 18 }}>
          {language === "ar" ? "تفاصيل العنصر" : "Item Details"}
        </h4>

        {[
          {
            label: language === "ar" ? "الوزن (جرام)" : "Weight (g)",
            key: "weight", type: "number", min: 0,
            placeholder: "",
          },
          {
            label: language === "ar" ? "العيار" : "Karat (k)",
            key: "karat", type: "text",
            placeholder: language === "ar" ? "مثال: 21K" : "e.g. 21K",
          },
          {
            label: language === "ar" ? "ملاحظات" : "Notes",
            key: "notes", type: "text", placeholder: "",
          },
        ].map(({ label, key, type, min, placeholder }) => (
          <div key={key} style={{ marginBottom: 15 }}>
            <label style={fieldLabelStyle}>{label}</label>
            <input
              type={type}
              min={min}
              placeholder={placeholder}
              value={detailModalState[key]}
              onKeyDown={type === "number" ? (e) => { if (e.key === "-") e.preventDefault(); } : undefined}
              onChange={(e) => setDetailModalState((prev) => ({ ...prev, [key]: e.target.value }))}
              style={inputStyle}
            />
          </div>
        ))}

        <div style={{ marginBottom: 20 }}>
          <label style={fieldLabelStyle}>
            {language === "ar" ? "سعر مخصص" : "Custom Price"}
          </label>
          <input
            type="number" step="0.01" min="0"
            onKeyDown={(e) => { if (e.key === "-") e.preventDefault(); }}
            placeholder={language === "ar" ? "يترك فارغاً لاعتبار السعر الأصلي" : "Leave empty for original price"}
            value={detailModalState.customPrice}
            onChange={(e) => setDetailModalState((prev) => ({ ...prev, customPrice: e.target.value }))}
            style={{ ...inputStyle, marginBottom: 6 }}
          />
          <span style={{ fontSize: 12, color: "#666", display: "block", lineHeight: 1.4 }}>
            {language === "ar"
              ? "ملاحظة: إذا أدخلت هذا السعر فسيكون هو السعر النهائي الخاص بهذا المنتج في الفاتورة."
              : "Note: If entered, this will be the final price in the invoice."}
          </span>
        </div>

        <div style={btnRowStyle}>
          <button onClick={onClose} style={cancelBtnStyle}>
            {language === "ar" ? "إلغاء" : "Cancel"}
          </button>
          <button onClick={onSave} style={primaryBtnStyle({ bg: "#C9A84C", color: "#1a1208" })}>
            {language === "ar" ? "حفظ" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Invoice Modal
// ─────────────────────────────────────────────────────────────────────────────
export const InvoiceModal = ({
  language, products,
  invoiceItems, setInvoiceItems,
  invoiceLanguage, setInvoiceLanguage,
  customerName, setCustomerName,
  isGenerating, setIsGenerating,
  detailModalState, setDetailModalState, closeDetailModal,
  logoBase64, urlToBase64,
  onClose,
}) => {
  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    try {
      const itemsWithBase64 = await Promise.all(
        invoiceItems.map(async (item) => {
          if (item.image_url?.startsWith("https://")) {
            const base64 = await urlToBase64(item.image_url);
            return { ...item, image_url: base64 || null };
          }
          return item;
        })
      );
      const blob = await pdf(
        <InvoiceDocument
          items={itemsWithBase64}
          language={invoiceLanguage}
          customerName={customerName}
          fallbackImage={logoBase64}
        />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `elsaudi-jewelry-invoice-${Date.now()}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      Modal.error({
        title: language === "ar" ? "❌ خطأ" : "❌ Error",
        content: language === "ar" ? "فشل توليد الفاتورة" : "Failed to generate invoice",
        centered: true,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const total = invoiceItems.reduce(
    (acc, i) => acc + Math.ceil(i.price / 5) * 5 * i.quantity, 0
  );

  const canGenerate = invoiceItems.length > 0 && !isGenerating && customerName.trim();

  return (
    <div style={overlayStyle}>
      <div style={cardStyle({ maxWidth: 900, maxHeight: "140vh", overflow: "auto" })}>
        <h3 style={{ marginBottom: 20, color: "#1a1208", fontSize: 22, fontWeight: 700 }}>
          📄 {language === "ar" ? "إنشاء فاتورة" : "Create Invoice"}
        </h3>

        {/* Product selector */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 200px" }}>
            <label style={{ display: "block", marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
              {language === "ar" ? "اختر من المنتجات" : "Select from products"}
            </label>
            <select
              defaultValue=""
              onChange={(e) => {
                const product = products.find((p) => p.id === parseInt(e.target.value));
                if (!product) return;
                setInvoiceItems((prev) => {
                  const exists = prev.find((i) => i.id === product.id);
                  if (exists) return prev.map((i) => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
                  return [...prev, {
                    id: product.id,
                    name: language === "ar" ? (product.name_ar || product.name) : (product.name_en || product.name),
                    price: product.price,
                    originalPrice: product.price,
                    image_url: product.image_url,
                    quantity: 1,
                    fromDB: true,
                  }];
                });
                e.target.value = "";
              }}
              style={{ width: "100%", padding: 10, borderRadius: 8, border: "2px solid #C9A84C", fontSize: 14 }}
            >
              <option value="" disabled>
                {language === "ar" ? "-- اختر منتج --" : "-- Select product --"}
              </option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {language === "ar" ? (p.name_ar || p.name) : (p.name_en || p.name)} — ${p.price}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Items list */}
        {invoiceItems.length > 0 && (
          <div style={{ marginBottom: 20, border: "1px solid #e0e0e0", borderRadius: 8, overflow: "hidden" }}>
            {invoiceItems.map((item, idx) => (
              <div
                key={item.id}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 14px",
                  borderBottom: idx < invoiceItems.length - 1 ? "1px solid #f0f0f0" : "none",
                  background: idx % 2 === 0 ? "#fafafa" : "white",
                }}
              >
                <span style={{ flex: 3, fontWeight: 600, fontSize: 14 }}>{item.name}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <button onClick={() => setInvoiceItems((prev) => prev.map((i) => i.id === item.id ? { ...i, quantity: Math.max(1, i.quantity - 1) } : i))} style={qtyBtnStyle}>−</button>
                  <span style={{ width: 24, textAlign: "center", fontWeight: 600 }}>{item.quantity}</span>
                  <button onClick={() => setInvoiceItems((prev) => prev.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i))} style={qtyBtnStyle}>+</button>
                </div>
                <span style={{ fontWeight: 700, color: "#C9A84C", minWidth: 60, textAlign: "right" }}>
                  ${(Math.ceil(item.price / 5) * 5 * item.quantity).toLocaleString()}
                </span>
                <button
                  onClick={() => setDetailModalState({ visible: true, itemId: item.id, weight: item.weight || "", karat: item.karat || "", notes: item.notes || "", customPrice: item.customPrice || "" })}
                  style={{ background: "#17a2b8", color: "white", border: "none", borderRadius: 4, padding: "4px 8px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}
                >
                  {language === "ar" ? "تفاصيل" : "Details"}
                </button>
                <button
                  onClick={() => setInvoiceItems((prev) => prev.filter((i) => i.id !== item.id))}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "#dc3545", color: "white", border: "none", borderRadius: 4, width: 28, height: 28, cursor: "pointer" }}
                >
                  <DeleteFilled />
                </button>
              </div>
            ))}
            <div style={{ padding: "12px 14px", background: "#f5e6c8", color: "#5a3e00", display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 16 }}>
              <span>{language === "ar" ? "الإجمالي" : "Total"}</span>
              <span>${total.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Customer name + language */}
        <div style={{ display: "flex", gap: 15, marginBottom: 20, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={fieldLabelStyle}>
              {language === "ar" ? "اسم العميل" : "Customer Name"}{" "}
              <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder={language === "ar" ? "الاسم" : "Name"}
              style={inputStyle}
            />
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={fieldLabelStyle}>
              {language === "ar" ? "لغة الفاتورة" : "Invoice Language"}
            </label>
            <div style={{ display: "flex", gap: 5 }}>
              {["ar", "en"].map((lang) => (
                <button
                  key={lang}
                  onClick={() => setInvoiceLanguage(lang)}
                  style={{
                    flex: 1, padding: 10, borderRadius: 8,
                    border: invoiceLanguage === lang ? "2px solid #C9A84C" : "1px solid #e0e0e0",
                    background: invoiceLanguage === lang ? "#fcf9f2" : "white",
                    cursor: "pointer", fontWeight: 600,
                  }}
                >
                  {lang === "ar" ? "عربي" : "English"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Detail modal rendered on top */}
        <InvoiceDetailModal
          language={language}
          detailModalState={detailModalState}
          setDetailModalState={setDetailModalState}
          onClose={closeDetailModal}
          onSave={() => {
            setInvoiceItems((prev) =>
              prev.map((i) => {
                if (i.id !== detailModalState.itemId) return i;
                return {
                  ...i,
                  weight: detailModalState.weight,
                  karat: detailModalState.karat,
                  notes: detailModalState.notes,
                  customPrice: detailModalState.customPrice,
                  price:
                    detailModalState.customPrice && !isNaN(parseFloat(detailModalState.customPrice))
                      ? parseFloat(detailModalState.customPrice)
                      : i.originalPrice,
                };
              })
            );
            closeDetailModal();
          }}
        />

        {/* Buttons */}
        <div style={{ ...btnRowStyle, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={cancelBtnStyle}>
            {language === "ar" ? "إلغاء" : "Cancel"}
          </button>
          <button
            disabled={!canGenerate}
            onClick={handleGeneratePDF}
            style={{
              background: canGenerate ? "linear-gradient(135deg,#C9A84C,#f5e6c0)" : "#ccc",
              color: "#1a1208", border: "none", padding: "10px 24px",
              borderRadius: 8, cursor: canGenerate ? "pointer" : "not-allowed",
              fontWeight: 700, fontSize: 16, opacity: isGenerating ? 0.7 : 1,
            }}
          >
            {isGenerating
              ? (language === "ar" ? "⏳ جاري التوليد..." : "⏳ Generating...")
              : `📄 ${language === "ar" ? "توليد الفاتورة" : "Generate Invoice"}`}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Section Create Modal
// ─────────────────────────────────────────────────────────────────────────────
export const SectionCreateModal = ({
  language, t,
  sectionFormData, setSectionFormData,
  isSubmitting, onSubmit, onClose,
}) => (
  <div style={overlayStyle}>
    <div style={cardStyle({ maxWidth: 500 })}>
      <h3 style={{ marginBottom: 20, color: "#2c3e50" }}>{t.createSection}</h3>

      <form onSubmit={onSubmit}>
        {[
          { label: t.sectionTitleAr, key: "title_ar", dir: "rtl",  placeholder: "مثال: مجموعة الصيف" },
          { label: t.sectionTitleEn, key: "title_en", dir: "ltr",  placeholder: "e.g., Summer Collection" },
        ].map(({ label, key, dir, placeholder }) => (
          <div key={key} style={{ marginBottom: 15 }}>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
              {label} *{" "}
              <span style={{ color: "#666", fontSize: 14, marginLeft: 10 }}>
                ({sectionFormData[key].length}/20)
              </span>
            </label>
            <input
              type="text"
              value={sectionFormData[key]}
              onChange={(e) => {
                if (e.target.value.length <= 20)
                  setSectionFormData({ ...sectionFormData, [key]: e.target.value });
              }}
              required maxLength={20}
              placeholder={placeholder}
              style={{ ...inputStyle, direction: dir }}
            />
          </div>
        ))}

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>{t.sectionOrder}</label>
          <input
            type="number"
            value={sectionFormData.order}
            onChange={(e) => setSectionFormData({ ...sectionFormData, order: parseInt(e.target.value) })}
            min="1"
            style={inputStyle}
          />
        </div>

        <div style={btnRowStyle}>
          <button type="button" onClick={onClose} style={cancelBtnStyle}>{t.cancel}</button>
          <button
            type="submit"
            disabled={isSubmitting}
            style={primaryBtnStyle({ bg: isSubmitting ? "#6c757d" : "#28a745", opacity: isSubmitting ? 0.7 : 1 })}
          >
            {isSubmitting ? (
              <>{language === "ar" ? "جارٍ الحفظ..." : "Saving..."}</>
            ) : t.saveSection}
          </button>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </form>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Section Edit Order Modal
// ─────────────────────────────────────────────────────────────────────────────
export const SectionEditOrderModal = ({
  t, editOrderValue, setEditOrderValue,
  onConfirm, onClose,
}) => (
  <div style={overlayStyle}>
    <div style={cardStyle({ maxWidth: 400 })}>
      <h3 style={{ marginBottom: 20, color: "#2c3e50" }}>{t.editOrder}</h3>
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>{t.sectionOrder}</label>
        <input
          type="number"
          value={editOrderValue}
          onChange={(e) => setEditOrderValue(parseInt(e.target.value))}
          min="1"
          style={{ ...inputStyle, border: "2px solid #667eea" }}
        />
      </div>
      <div style={btnRowStyle}>
        <button onClick={onClose} style={cancelBtnStyle}>{t.cancel}</button>
        <button onClick={onConfirm} style={primaryBtnStyle({ bg: "#667eea" })}>{t.updateOrder}</button>
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Section Edit Name Modal
// ─────────────────────────────────────────────────────────────────────────────
export const SectionEditNameModal = ({
  language, t,
  editingSectionName, setEditingSectionName,
  onConfirm, onClose,
}) => (
  <div style={{ ...overlayStyle, zIndex: 1100 }}>
    <div style={cardStyle({ maxWidth: 450 })}>
      <h3 style={{ marginBottom: 20, color: "#2c3e50", fontSize: 20, fontWeight: 700 }}>
        <EditOutlined style={{ marginLeft: 8 }} />
        {language === "ar" ? "تعديل اسم القسم" : "Edit Section Name"}
      </h3>

      {[
        { label: t.sectionTitleAr, key: "title_ar", dir: "rtl" },
        { label: t.sectionTitleEn, key: "title_en", dir: "ltr" },
      ].map(({ label, key, dir }, i) => (
        <div key={key} style={{ marginBottom: i === 0 ? 15 : 20 }}>
          <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>{label} *</label>
          <input
            type="text"
            autoFocus={i === 0}
            value={editingSectionName[key]}
            onChange={(e) => setEditingSectionName((prev) => ({ ...prev, [key]: e.target.value }))}
            maxLength={20}
            style={{ ...inputStyle, border: "2px solid #667eea", direction: dir }}
          />
        </div>
      ))}

      <div style={btnRowStyle}>
        <button onClick={onClose} style={cancelBtnStyle}>{t.cancel}</button>
        <button
          onClick={onConfirm}
          disabled={!editingSectionName.title_ar.trim() || !editingSectionName.title_en.trim()}
          style={primaryBtnStyle({
            bg: (!editingSectionName.title_ar.trim() || !editingSectionName.title_en.trim())
              ? "#ccc"
              : "linear-gradient(135deg,#667eea 0%,#764ba2 100%)",
          })}
        >
          {language === "ar" ? "💾 حفظ" : "💾 Save"}
        </button>
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Badge Modal  (list / form / confirmDelete views)
// ─────────────────────────────────────────────────────────────────────────────
export const BadgeModal = ({
  language, t,
  badgeModalView, setBadgeModalView,
  customBadges,
  editingBadgeId, setEditingBadgeId,
  badgeToDelete, setBadgeToDelete,
  newBadgeNameAr, setNewBadgeNameAr,
  newBadgeNameEn, setNewBadgeNameEn,
  newBadgeColor,  setNewBadgeColor,
  isSavingBadge,
  products,
  onSave, onUpdate, onDelete, onClose,
}) => {
  const PRESET_COLORS = ["#667eea", "#28a745", "#dc3545", "#C9A84C", "#17a2b8", "#fd7e14"];

  return (
    <div style={{ ...overlayStyle, zIndex: 2000 }}>
      <div style={{
        ...cardStyle({ maxWidth: 450 }),
        maxHeight: "85vh", overflow: "hidden",
        display: "flex", flexDirection: "column",
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0, color: "#2c3e50", fontSize: 20 }}>
            {badgeModalView === "list"          && (language === "ar" ? "🏷️ إدارة البادجات" : "🏷️ Manage Badges")}
            {badgeModalView === "form" && editingBadgeId  && (language === "ar" ? "✏️ تعديل البادج"    : "✏️ Edit Badge")}
            {badgeModalView === "form" && !editingBadgeId && (language === "ar" ? "➕ إضافة بادج جديد" : "➕ Add New Badge")}
            {badgeModalView === "confirmDelete" && (language === "ar" ? "⚠️ تأكيد الحذف" : "⚠️ Confirm Delete")}
          </h3>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "#888" }}>×</button>
        </div>

        {/* ── LIST VIEW ── */}
        {badgeModalView === "list" && (
          <>
            <div style={{ overflowY: "auto", flex: 1, paddingRight: 5 }}>
              {customBadges.length === 0 ? (
                <p style={{ textAlign: "center", color: "#6c757d", padding: "20px 0" }}>
                  {language === "ar" ? "لا يوجد بادجات مخصصة بعد." : "No custom badges yet."}
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {customBadges.map((badge) => (
                    <div key={badge.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 12, border: "1px solid #eee", borderRadius: 8 }}>
                      <span style={{ color: badge.color, fontWeight: "bold" }}>
                        {badge.name_ar} / {badge.name_en}
                      </span>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={() => { setEditingBadgeId(badge.id); setNewBadgeNameAr(badge.name_ar); setNewBadgeNameEn(badge.name_en); setNewBadgeColor(badge.color); setBadgeModalView("form"); }}
                          style={{ padding: "6px 12px", background: "#f8f9fa", color: "#1a1a1a", border: "1px solid #ddd", borderRadius: 6, cursor: "pointer", fontSize: 13 }}
                        >
                          {language === "ar" ? "تعديل" : "Edit"}
                        </button>
                        <button
                          onClick={() => { setBadgeToDelete(badge); setBadgeModalView("confirmDelete"); }}
                          style={{ padding: "6px 12px", background: "#fff0f0", color: "#dc3545", border: "1px solid #ffcccc", borderRadius: 6, cursor: "pointer", fontSize: 13 }}
                        >
                          {language === "ar" ? "حذف" : "Delete"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ ...btnRowStyle, marginTop: 20 }}>
              <button onClick={onClose} style={cancelBtnStyle}>{t.cancel}</button>
              <button
                onClick={() => { setEditingBadgeId(null); setNewBadgeNameAr(""); setNewBadgeNameEn(""); setNewBadgeColor("#667eea"); setBadgeModalView("form"); }}
                style={primaryBtnStyle({ bg: "linear-gradient(135deg,#667eea 0%,#764ba2 100%)" })}
              >
                {language === "ar" ? "➕ إضافة بادج" : "➕ Add Badge"}
              </button>
            </div>
          </>
        )}

        {/* ── FORM VIEW ── */}
        {badgeModalView === "form" && (
          <div style={{ overflowY: "auto", paddingRight: 5 }}>
            {[
              { label: language === "ar" ? "اسم البادج (عربي)" : "Badge Name (Arabic)", key: "ar", value: newBadgeNameAr, setter: setNewBadgeNameAr, dir: "rtl", placeholder: "مثال: حصري، مميز..." },
              { label: language === "ar" ? "اسم البادج (إنجليزي)" : "Badge Name (English)", key: "en", value: newBadgeNameEn, setter: setNewBadgeNameEn, dir: "ltr", placeholder: "e.g., Exclusive, Special..." },
            ].map(({ label, key, value, setter, dir, placeholder }, i) => (
              <div key={key} style={{ marginBottom: 16 }}>
                <label style={fieldLabelStyle}>{label} *</label>
                <input
                  type="text"
                  autoFocus={i === 0}
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") editingBadgeId ? onUpdate() : onSave();
                    if (e.key === "Escape") setBadgeModalView("list");
                  }}
                  maxLength={15}
                  placeholder={placeholder}
                  style={{ ...inputStyle, border: "2px solid #667eea", direction: dir }}
                />
                <small style={{ color: "#6c757d", fontSize: 13, marginTop: 6, display: "block" }}>{value.length}/15</small>
              </div>
            ))}

            {/* Color picker */}
            <div style={{ marginBottom: 20 }}>
              <label style={fieldLabelStyle}>{language === "ar" ? "لون البادج" : "Badge Color"}</label>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <input type="color" value={newBadgeColor} onChange={(e) => setNewBadgeColor(e.target.value)}
                  style={{ width: 48, height: 48, border: "none", borderRadius: 8, cursor: "pointer", padding: 2, background: "none" }} />
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {PRESET_COLORS.map((c) => (
                    <div key={c} onClick={() => setNewBadgeColor(c)}
                      style={{ width: 28, height: 28, borderRadius: "50%", background: c, cursor: "pointer", border: newBadgeColor === c ? "3px solid #333" : "2px solid transparent", boxSizing: "border-box" }} />
                  ))}
                </div>
              </div>
              <div style={{ marginTop: 12 }}>
                <span style={{ fontSize: 13, color: "#6c757d", marginBottom: 6, display: "block" }}>
                  {language === "ar" ? "معاينة:" : "Preview:"}
                </span>
                <span style={{ display: "inline-block", color: "#fff", backgroundColor: newBadgeColor, padding: "4px 14px", borderRadius: 20, fontSize: 13, fontWeight: 600 }}>
                  {language === "ar" ? (newBadgeNameAr || "اسم البادج") : (newBadgeNameEn || "Badge Name")}
                </span>
              </div>
            </div>

            <div style={btnRowStyle}>
              <button type="button" onClick={() => { setBadgeModalView("list"); setNewBadgeNameAr(""); setNewBadgeNameEn(""); setNewBadgeColor("#667eea"); setEditingBadgeId(null); }} style={cancelBtnStyle}>
                {language === "ar" ? "رجوع" : "Back"}
              </button>
              <button
                type="button"
                onClick={editingBadgeId ? onUpdate : onSave}
                disabled={!newBadgeNameAr.trim() || !newBadgeNameEn.trim() || isSavingBadge}
                style={primaryBtnStyle({
                  bg: (!newBadgeNameAr.trim() || !newBadgeNameEn.trim() || isSavingBadge) ? "#ccc" : "linear-gradient(135deg,#667eea 0%,#764ba2 100%)",
                  opacity: isSavingBadge ? 0.7 : 1,
                  cursor: (!newBadgeNameAr.trim() || !newBadgeNameEn.trim() || isSavingBadge) ? "not-allowed" : "pointer",
                })}
              >
                {isSavingBadge ? (language === "ar" ? "⏳ جاري الحفظ..." : "⏳ Saving...") : (language === "ar" ? "💾 حفظ البادج" : "💾 Save Badge")}
              </button>
            </div>
          </div>
        )}

        {/* ── CONFIRM DELETE VIEW ── */}
        {badgeModalView === "confirmDelete" && badgeToDelete && (
          <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
            <p style={{ margin: 0, fontSize: 15 }}>
              {language === "ar"
                ? `هل أنت متأكد أنك تريد حذف البادج "${badgeToDelete.name_ar}"؟`
                : `Are you sure you want to delete the badge "${badgeToDelete.name_en}"?`}
            </p>
            {(() => {
              const affected = products.filter((p) => p.badge === badgeToDelete.name_ar || p.badge === badgeToDelete.name_en);
              return affected.length > 0 ? (
                <div style={{ background: "#fff3cd", color: "#856404", padding: 12, borderRadius: 8, fontSize: 14 }}>
                  <strong>
                    {language === "ar" ? `⚠️ تحذير: ${affected.length} منتجات تستخدم هذا البادج.` : `⚠️ Warning: ${affected.length} products are using this badge.`}
                  </strong>
                  <ul style={{ marginTop: 8, marginBottom: 0, paddingLeft: 20, maxHeight: 100, overflowY: "auto" }}>
                    {affected.map((p) => (
                      <li key={p.id || p._id}>{language === "ar" ? (p.name_ar || p.name) : (p.name_en || p.name)}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p style={{ margin: 0, fontSize: 14, color: "#28a745" }}>
                  {language === "ar" ? "✅ لا توجد منتجات تستخدم هذا البادج حالياً." : "✅ No products are currently using this badge."}
                </p>
              );
            })()}
            <div style={btnRowStyle}>
              <button onClick={() => { setBadgeToDelete(null); setBadgeModalView("list"); }} disabled={isSavingBadge} style={{ ...cancelBtnStyle, opacity: isSavingBadge ? 0.7 : 1 }}>
                {language === "ar" ? "رجوع" : "Back"}
              </button>
              <button
                onClick={onDelete}
                disabled={isSavingBadge}
                style={primaryBtnStyle({ bg: "#dc3545", cursor: isSavingBadge ? "not-allowed" : "pointer", opacity: isSavingBadge ? 0.7 : 1 })}
              >
                {isSavingBadge ? (language === "ar" ? "⏳ جاري الحذف..." : "⏳ Deleting...") : (language === "ar" ? "🗑️ تأكيد الحذف" : "🗑️ Confirm Delete")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Delete Orphans Confirmation Modal
// ─────────────────────────────────────────────────────────────────────────────
export const DeleteOrphansModal = ({
  language,
  selectedOrphans, orphanedProducts,
  isDeletingOrphans,
  onConfirm, onClose,
}) => (
  <div style={{ ...overlayStyle, zIndex: 1100 }}>
    <div style={cardStyle({ maxWidth: 420 })}>
      <h3 style={{ marginBottom: 16, color: "#dc3545", fontSize: 20 }}>
        🗑️ {language === "ar" ? "تأكيد الحذف" : "Confirm Delete"}
      </h3>
      <p style={{ marginBottom: 12, fontSize: 15 }}>
        {language === "ar"
          ? `هل أنت متأكد أنك تريد حذف ${selectedOrphans.length} منتج؟`
          : `Are you sure you want to delete ${selectedOrphans.length} product${selectedOrphans.length !== 1 ? "s" : ""}?`}
      </p>
      <div style={{ background: "#fff5f5", border: "1px solid #ffcccc", borderRadius: 8, padding: 12, maxHeight: 160, overflowY: "auto", marginBottom: 20 }}>
        {orphanedProducts
          .filter((p) => selectedOrphans.includes(p.id || p._id))
          .map((p) => (
            <div key={p.id || p._id} style={{ fontSize: 14, padding: "4px 0", borderBottom: "1px solid #ffe0e0", color: "#2c3e50" }}>
              • {language === "ar" ? p.name_ar || p.name : p.name_en || p.name}
            </div>
          ))}
      </div>
      <p style={{ color: "#dc3545", fontSize: 13, fontWeight: 600, marginBottom: 20 }}>
        ⚠️ {language === "ar" ? "لا يمكن التراجع عن هذا الإجراء." : "This action cannot be undone."}
      </p>
      <div style={btnRowStyle}>
        <button onClick={onClose} disabled={isDeletingOrphans} style={{ ...cancelBtnStyle, opacity: isDeletingOrphans ? 0.7 : 1 }}>
          {language === "ar" ? "إلغاء" : "Cancel"}
        </button>
        <button
          onClick={onConfirm}
          disabled={isDeletingOrphans}
          style={primaryBtnStyle({ bg: isDeletingOrphans ? "#ccc" : "#dc3545", cursor: isDeletingOrphans ? "not-allowed" : "pointer", opacity: isDeletingOrphans ? 0.7 : 1 })}
        >
          {isDeletingOrphans
            ? (language === "ar" ? "⏳ جاري الحذف..." : "⏳ Deleting...")
            : (language === "ar" ? "🗑️ تأكيد الحذف" : "🗑️ Confirm Delete")}
        </button>
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Shared micro-styles (keep styles co-located to avoid a separate .css file)
// ─────────────────────────────────────────────────────────────────────────────
const overlayStyle = {
  position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
  background: "rgba(0,0,0,0.7)",
  display: "flex", alignItems: "center", justifyContent: "center",
  zIndex: 1000, padding: 20,
};

const cardStyle = ({ maxWidth = 500, maxHeight, overflow } = {}) => ({
  background: "white",
  padding: 30,
  borderRadius: 12,
  maxWidth,
  width: "100%",
  ...(maxHeight ? { maxHeight } : {}),
  ...(overflow  ? { overflow }  : {}),
  boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
});

const inputStyle = {
  width: "100%", padding: 10,
  borderRadius: 8, border: "1px solid #ccc",
  fontSize: 14, boxSizing: "border-box",
};

const selectStyle = {
  width: "100%", padding: 10,
  borderRadius: 8, border: "1px solid #ccc",
};

const btnRowStyle = {
  display: "flex", gap: 10, justifyContent: "flex-end",
};

const cancelBtnStyle = {
  padding: "10px 20px", borderRadius: 8, border: "none",
  background: "#6c757d", color: "white", cursor: "pointer", fontWeight: 600,
};

const primaryBtnStyle = ({ bg, color = "white", opacity = 1, cursor = "pointer" } = {}) => ({
  padding: "10px 20px", borderRadius: 8, border: "none",
  background: bg, color, cursor, fontWeight: 600, opacity,
});

const fieldLabelStyle = {
  display: "block", fontSize: 14, fontWeight: 600, marginBottom: 5,
};

const qtyBtnStyle = {
  width: 28, height: 28, border: "1px solid #ddd",
  borderRadius: 4, cursor: "pointer", background: "white", fontWeight: 700,
};