import { useState, useEffect, useRef } from "react";
import { Table, Input, Button, Space, Modal } from "antd";
import Header from "../components/Header/Header";
import {
  SearchOutlined,
  ExclamationCircleOutlined,
  DeleteFilled,
  EditOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import "./Admin.css";
import { fetchWithAuth } from "../utils/api";
import { Tooltip } from "antd";

import translations from "../pages/translate.json";
import {
  API_URL,
  SECTION_API_URL,
  PRICES_API_URL,
  BADGES_API_URL,
  CLOUDINARY_URL,
  CLOUDINARY_UPLOAD_PRESET,
  DEFAULT_FORM_DATA,
} from "./adminConstants";
import useAdminModals from "./useAdminModals";
import {
  MoveProductModal,
  InvoiceModal,
  SectionCreateModal,
  SectionEditOrderModal,
  SectionEditNameModal,
  BadgeModal,
  DeleteOrphansModal,
} from "./AdminModals";

// ─────────────────────────────────────────────────────────────────────────────

const Admin = ({ language, onLanguageChange, navigate, onLogout }) => {
  const t = translations[language] || translations.ar;

  // ── Local state (non-modal) ────────────────────────────────────────────────
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
  const [products, setProducts] = useState([]);
  const [sections, setSections] = useState([]);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageType, setImageType] = useState("url");
  const [sectionError, setSectionError] = useState(false);
  const [expandedSections, setExpandedSections] = useState([]);
  const [pageSize, setPageSize] = useState(5);
  const [customBadges, setCustomBadges] = useState([]);
  const [allPrices, setAllPrices] = useState(null);
  const [logoBase64, setLogoBase64] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [searchText, setSearchText] = useState("");
  // eslint-disable-next-line no-unused-vars
  const [searchedColumn, setSearchedColumn] = useState("");

  const sectionRef = useRef(null);
  const searchInput = useRef(null);

  // ── All modal state from hook ──────────────────────────────────────────────
  const {
    showProductModal, setShowProductModal,
    showSectionModal, setShowSectionModal,
    sectionFormData, setSectionFormData,
    showEditOrderModal, setShowEditOrderModal,
    editingSectionId, setEditingSectionId,
    editOrderValue, setEditOrderValue,
    showEditSectionNameModal, setShowEditSectionNameModal,
    editingSectionName, setEditingSectionName,
    showMoveProductModal, setShowMoveProductModal,
    productToMove, setProductToMove,
    newSectionForMove, setNewSectionForMove,
    isMovingProduct, setIsMovingProduct,
    closeMoveModal,
    showInvoiceModal, setShowInvoiceModal,
    invoiceItems, setInvoiceItems,
    isGenerating, setIsGenerating,
    customerName, setCustomerName,
    invoiceLanguage, setInvoiceLanguage,
    closeInvoiceModal,
    detailModalState, setDetailModalState,
    closeDetailModal,
    showBadgeModal, setShowBadgeModal,
    badgeModalView, setBadgeModalView,
    editingBadgeId, setEditingBadgeId,
    badgeToDelete, setBadgeToDelete,
    newBadgeNameAr, setNewBadgeNameAr,
    newBadgeNameEn, setNewBadgeNameEn,
    newBadgeColor, setNewBadgeColor,
    isSavingBadge, setIsSavingBadge,
    closeBadgeModal,
    showPriceModal, setShowPriceModal,
    priceEditData, setPriceEditData,
    showDeleteOrphansModal, setShowDeleteOrphansModal,
    selectedOrphans, setSelectedOrphans,
    isDeletingOrphans, setIsDeletingOrphans,
  } = useAdminModals();

  // ── Utility ────────────────────────────────────────────────────────────────
  const urlToBase64 = async (url) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    } catch {
      return null;
    }
  };

  const getProductsForSection = (sectionId) =>
    products.filter((p) => p.section === sectionId);

  const toggleSectionExpansion = (sectionId) =>
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );

  // ── Fetch helpers ──────────────────────────────────────────────────────────
  const fetchProducts = async () => {
    try {
      const response = await fetch(API_URL);
      const contentType = response.headers.get("content-type");
      if (!contentType?.includes("application/json")) return;
      const data = await response.json();
      setProducts(Array.isArray(data) ? data : data.products ?? []);
    } catch { /* silent */ }
  };

  const fetchSections = async () => {
    try {
      const response = await fetch(SECTION_API_URL);
      const data = await response.json();
      if (Array.isArray(data)) setSections(data);
    } catch { /* silent */ }
  };

  const fetchPrices = async () => {
    try {
      const response = await fetch(PRICES_API_URL);
      setAllPrices(await response.json());
    } catch { /* silent */ }
  };

  const fetchBadges = async () => {
    try {
      const response = await fetch(BADGES_API_URL);
      const data = await response.json();
      if (Array.isArray(data)) setCustomBadges(data);
    } catch { /* silent */ }
  };

  // ── Effects ────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchProducts();
    fetchSections();
    fetchPrices();
    fetchBadges();
    urlToBase64("/Saudi_Silver_Logo.png").then(setLogoBase64);
  }, []);

  // Auto-create Featured section if missing
  useEffect(() => {
    const createFeaturedSection = async () => {
      try {
        const response = await fetch(SECTION_API_URL);
        const data = await response.json();
        if (!data.some((s) => s.is_featured)) {
          const res = await fetch(SECTION_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title_ar: "المنتجات المميزة",
              title_en: "Featured Products",
              order: 0,
              is_featured: true,
            }),
          });
          if (res.ok) fetchSections();
        }
      } catch { /* silent */ }
    };
    createFeaturedSection();
  }, []);

  // Auto-clear status message after 5 s
  useEffect(() => {
    if (!status.message) return;
    const timer = setTimeout(() => setStatus({ type: "", message: "" }), 5000);
    return () => clearTimeout(timer);
  }, [status.message]);

  // ESC closes product / section / order modals
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key !== "Escape") return;
      if (showProductModal) {
        setShowProductModal(false);
        setEditingProductId(null);
        setFormData(DEFAULT_FORM_DATA);
        setSelectedFile(null);
        setImageType("url");
        setSectionError(false);
      }
      if (showSectionModal) {
        setShowSectionModal(false);
        setSectionFormData({ title_ar: "", title_en: "", order: 1 });
      }
      if (showEditOrderModal) {
        setShowEditOrderModal(false);
        setEditingSectionId(null);
      }
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [showProductModal, showSectionModal, showEditOrderModal]);

  // ── Search helpers ─────────────────────────────────────────────────────────
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };

  const getColumnSearchProps = (dataIndex, title) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInput}
          placeholder={`Search ${title}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button onClick={() => handleReset(clearFilters)} size="small" style={{ width: 90 }}>
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]?.toString().toLowerCase().includes(value.toLowerCase()),
    filterDropdownProps: {
      onOpenChange: (visible) => {
        if (visible) setTimeout(() => searchInput.current?.select(), 100);
      },
    },
  });

  // ── Form change handler ────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "type") {
      setFormData((prev) => ({
        ...prev,
        type: value,
        karat: value === "gold" ? "21K" : value === "silver" ? "999" : "",
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // ── Product submit (add / update) ─────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: "", message: "" });

    try {
      const form = new FormData();
      form.append("name_ar", formData.name_ar);
      form.append("name_en", formData.name_en);
      form.append("type", formData.type);
      form.append("karat", formData.karat || "");
      form.append("weight", Number(formData.weight));
      form.append("show_weight", formData.show_weight ? "True" : "False");
      form.append("manufacturing_cost", Number(formData.manufacturing_cost));
      form.append("price", Number(formData.price));
      form.append("badge", formData.badge || "");
      form.append("stock", formData.stock);
      if (formData.section) form.append("section", formData.section);
      form.append("description_ar", formData.description_ar);
      form.append("description_en", formData.description_en);
      form.append("shortDescription_ar", formData.shortDescription_ar);
      form.append("shortDescription_en", formData.shortDescription_en);

      if (imageType === "file" && selectedFile) {
        const cloudinaryForm = new FormData();
        cloudinaryForm.append("file", selectedFile);
        cloudinaryForm.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
        const cloudRes = await fetch(CLOUDINARY_URL, { method: "POST", body: cloudinaryForm });
        const cloudData = await cloudRes.json();
        if (!cloudData.secure_url) {
          Modal.error({
            title: language === "ar" ? "❌ فشل رفع الصورة" : "❌ Image Upload Failed",
            content: language === "ar" ? "تعذر رفع الصورة على Cloudinary" : "Failed to upload image to Cloudinary",
            centered: true,
          });
          setIsSubmitting(false);
          return;
        }
        form.append("image_url", cloudData.secure_url);
      } else if (imageType === "url" && formData.image_url) {
        form.append("image_url", formData.image_url);
      }

      const method = editingProductId ? "PUT" : "POST";
      const url = editingProductId ? `${API_URL}${editingProductId}/` : API_URL;
      const response = await fetch(url, { method, body: form });

      let data;
      try { data = await response.json(); }
      catch {
        setStatus({ type: "error", message: "❌ Server returned invalid response" });
        setIsSubmitting(false);
        return;
      }

      if (response.ok) {
        Modal.success({
          title: language === "ar" ? "🎉 تم بنجاح!" : "🎉 Success!",
          content: editingProductId
            ? (language === "ar" ? "✅ تم تحديث المنتج بنجاح!" : "✅ Product updated successfully!")
            : (language === "ar" ? "✅ تم إضافة المنتج بنجاح!" : "✅ Product added successfully!"),
          centered: true,
          okText: language === "ar" ? "حسناً" : "OK",
          onOk: () => {
            setFormData(DEFAULT_FORM_DATA);
            setSelectedFile(null);
            setEditingProductId(null);
            setImageType("url");
            setShowProductModal(false);
            fetchProducts();
          },
        });
      } else {
        Modal.error({
          title: language === "ar" ? "❌ حدث خطأ" : "❌ Error Occurred",
          content: typeof data.error === "string" ? data.error : JSON.stringify(data.error || data.message || "Failed"),
          centered: true,
          okText: language === "ar" ? "حسناً" : "OK",
        });
      }
    } catch (error) {
      Modal.error({
        title: language === "ar" ? "❌ خطأ في الاتصال" : "❌ Network Error",
        content: error.message,
        centered: true,
        okText: language === "ar" ? "حسناً" : "OK",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Delete product ─────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    const product = products.find((p) => (p._id || p.id) === id);
    const featuredSection = sections.find((s) => s.is_featured);
    const isFeatured = product && featuredSection &&
      String(product.section) === String(featuredSection.id);

    Modal.confirm({
      title: language === "ar" ? "تأكيد الإزالة" : "Confirm Removal",
      icon: <ExclamationCircleOutlined />,
      content: language === "ar"
        ? (isFeatured ? "هل أنت متأكد من حذف هذا المنتج نهائياً من قاعدة البيانات؟ لا يمكن التراجع." : "سيتم إزالة هذا المنتج من القسم الحالي ونقله تلقائياً إلى القسم المميز، ولن يتم حذفه نهائياً.")
        : (isFeatured ? "Are you sure you want to permanently delete this product? This action cannot be undone." : "This product will be removed from its current section and moved to the Featured Products section. It will not be permanently deleted."),
      okText: language === "ar"
        ? (isFeatured ? "نعم، احذف نهائياً" : "نعم، انقله للقسم المميز")
        : (isFeatured ? "Yes, Delete Permanently" : "Yes, Move to Featured"),
      okType: "danger",
      cancelText: language === "ar" ? "إلغاء" : "Cancel",
      centered: true,
      onOk: async () => {
        try {
          if (!isFeatured && featuredSection) {
            const patchData = new FormData();
            patchData.append("section", featuredSection.id);
            const response = await fetch(`${API_URL}${id}/`, { method: "PATCH", body: patchData });
            if (response.ok) {
              Modal.success({
                title: language === "ar" ? "ℹ️ تم النقل!" : "ℹ️ Moved!",
                content: language === "ar" ? "✅ تم نقل المنتج إلى القسم المميز بنجاح" : "✅ Product successfully moved to the Featured section",
                centered: true,
                okText: language === "ar" ? "حسناً" : "OK",
              });
              fetchProducts();
            } else {
              const data = await response.json();
              Modal.error({ title: language === "ar" ? "❌ فشل النقل" : "❌ Move Failed", content: data.message || "Error", centered: true, okText: language === "ar" ? "حسناً" : "OK" });
            }
            return;
          }

          const response = await fetch(`${API_URL}${id}/`, { method: "DELETE" });
          if (response.ok) {
            setProducts((prev) => prev.filter((p) => (p._id || p.id) !== id));
            Modal.success({
              title: language === "ar" ? "🎉 تم الحذف!" : "🎉 Deleted!",
              content: language === "ar" ? "✅ تم حذف المنتج بنجاح" : "✅ Product deleted successfully",
              centered: true,
              okText: language === "ar" ? "حسناً" : "OK",
            });
            fetchProducts();
          } else {
            const data = await response.json();
            Modal.error({
              title: language === "ar" ? "❌ فشل الحذف" : "❌ Delete Failed",
              content: data.message || (language === "ar" ? "حدث خطأ أثناء الحذف" : "An error occurred while deleting"),
              centered: true,
              okText: language === "ar" ? "حسناً" : "OK",
            });
          }
        } catch (err) {
          Modal.error({ title: language === "ar" ? "❌ خطأ في الاتصال" : "❌ Network Error", content: err.message, centered: true, okText: language === "ar" ? "حسناً" : "OK" });
        }
      },
    });
  };

  // ── Move product ───────────────────────────────────────────────────────────
  const handleMoveProductSubmit = async () => {
    if (!newSectionForMove || !productToMove) {
      Modal.error({ title: language === "ar" ? "خطأ" : "Error", content: language === "ar" ? "الرجاء تحديد قسم" : "Please select a section", centered: true });
      return;
    }
    setIsMovingProduct(true);
    try {
      const form = new FormData();
      form.append("section", newSectionForMove);
      const response = await fetch(`${API_URL}${productToMove.id || productToMove._id}/`, { method: "PATCH", body: form });
      if (response.ok) {
        Modal.success({ title: language === "ar" ? "🎉 تم النقل!" : "🎉 Moved!", content: t.productMoved, centered: true, okText: language === "ar" ? "حسناً" : "OK" });
        closeMoveModal();
        fetchProducts();
      } else {
        const data = await response.json();
        Modal.error({ title: language === "ar" ? "❌ خطأ" : "❌ Error", content: data.error || data.message || "Failed to move product", centered: true });
      }
    } catch (err) {
      Modal.error({ title: language === "ar" ? "❌ خطأ في الاتصال" : "❌ Network Error", content: err.message, centered: true });
    } finally {
      setIsMovingProduct(false);
    }
  };

  // ── Section submit ─────────────────────────────────────────────────────────
  const handleSectionSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(SECTION_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sectionFormData),
      });
      const data = await response.json();
      if (response.ok) {
        setStatus({ type: "success", message: language === "ar" ? "✅ تم إنشاء القسم بنجاح!" : "✅ Section created successfully!" });
        setSectionFormData({ title_ar: "", title_en: "", order: 1 });
        setShowSectionModal(false);
        fetchSections();
      } else {
        Modal.error({
          title: language === "ar" ? "❌ فشل الإنشاء" : "❌ Creation Failed",
          content: language === "ar" ? (data.error_ar || data.error || "حدث خطأ") : (data.error || "Failed to create section"),
          centered: true,
          okText: language === "ar" ? "حسناً" : "OK",
        });
      }
    } catch (error) {
      setStatus({ type: "error", message: `❌ Error: ${error.message}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Delete section ─────────────────────────────────────────────────────────
  const handleDeleteSection = async (id) => {
    const section = sections.find((s) => s.id === id);
    if (section?.is_featured) {
      Modal.warning({
        title: language === "ar" ? "⭐ لا يمكن حذف القسم المميز" : "⭐ Cannot Delete Featured Section",
        content: (
          <div>
            <p>{language === "ar" ? "هذا القسم أساسي ومهم للموقع." : "This is an essential section for the website."}</p>
            <ul style={{ marginTop: 10, paddingLeft: 20 }}>
              <li>✅ {language === "ar" ? "يمكنك إضافة منتجات جديدة فيه" : "You can add new products to it"}</li>
              <li>✅ {language === "ar" ? "يمكنك حذف المنتجات منه" : "You can delete products from it"}</li>
              <li>❌ {language === "ar" ? "لكن لا يمكن حذف القسم نفسه" : "But you cannot delete the section itself"}</li>
            </ul>
          </div>
        ),
        centered: true,
        okText: language === "ar" ? "حسناً" : "OK",
      });
      return;
    }

    const sectionProducts = getProductsForSection(id);
    const count = sectionProducts.length;

    Modal.confirm({
      title: language === "ar" ? "تأكيد حذف القسم" : "Confirm Section Delete",
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>{language === "ar" ? "هل أنت متأكد من حذف هذا القسم؟" : "Are you sure you want to delete this section?"}</p>
          <p style={{ color: "#ff4d4f", marginTop: 10, fontWeight: 600, fontSize: 15 }}>
            {language === "ar"
              ? `⚠️ تحذير: سيتم نقل ${count} منتج إلى القسم المميز قبل حذف القسم!`
              : `⚠️ Warning: ${count} product${count !== 1 ? "s" : ""} will be reassigned to the Featured section!`}
          </p>
          <p style={{ color: "#8c8c8c", marginTop: 5, fontSize: 13 }}>
            {language === "ar" ? "لا يمكن التراجع عن هذا الإجراء" : "This action cannot be undone"}
          </p>
        </div>
      ),
      okText: language === "ar" ? "نعم، احذف القسم وانقل المنتجات" : "Yes, Delete Section & Reassign",
      okType: "danger",
      cancelText: language === "ar" ? "إلغاء" : "Cancel",
      centered: true,
      onOk: async () => {
        try {
          const featuredSection = sections.find((s) => s.is_featured);
          if (featuredSection && sectionProducts.length > 0) {
            await Promise.all(
              sectionProducts.map((p) => {
                const patchData = new FormData();
                patchData.append("section", featuredSection.id);
                return fetch(`${API_URL}${p.id || p._id}/`, { method: "PATCH", body: patchData });
              })
            );
          }
          const response = await fetch(`${SECTION_API_URL}${id}/`, { method: "DELETE" });
          if (response.ok) {
            setSections((prev) => prev.filter((s) => s.id !== id));
            Modal.success({
              title: language === "ar" ? "🎉 تم الحذف!" : "🎉 Deleted!",
              content: language === "ar"
                ? `✅ تم حذف القسم ونقل ${count} منتج بنجاح`
                : `✅ Section deleted and ${count} product${count !== 1 ? "s" : ""} reassigned successfully`,
              centered: true,
              okText: language === "ar" ? "حسناً" : "OK",
            });
            fetchProducts();
          } else {
            const data = await response.json();
            Modal.error({
              title: language === "ar" ? "❌ فشل الحذف" : "❌ Delete Failed",
              content: language === "ar" ? (data.message_ar || data.error || "فشل الحذف") : (data.message_en || data.error || "Failed to delete"),
              centered: true,
              okText: language === "ar" ? "حسناً" : "OK",
            });
          }
        } catch (err) {
          Modal.error({ title: language === "ar" ? "❌ خطأ في الاتصال" : "❌ Network Error", content: err.message, centered: true, okText: language === "ar" ? "حسناً" : "OK" });
        }
      },
    });
  };

  // ── Edit section order ────────────────────────────────────────────────────
  const handleEditSectionOrder = async () => {
    if (!editOrderValue || editOrderValue < 1) {
      Modal.error({
        title: language === "ar" ? "❌ ترتيب غير صحيح" : "❌ Invalid Order",
        content: language === "ar" ? "الترتيب 0 محجوز للقسم المميز، اختر رقم من 1 فأكثر" : "Order 0 is reserved for the featured section, choose 1 or higher",
        centered: true,
        okText: language === "ar" ? "حسناً" : "OK",
      });
      return;
    }
    try {
      const response = await fetch(`${SECTION_API_URL}${editingSectionId}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: editOrderValue }),
      });
      const data = await response.json();
      if (response.ok) {
        Modal.success({ title: language === "ar" ? "🎉 تم التحديث!" : "🎉 Updated!", content: language === "ar" ? "✅ تم تحديث الترتيب بنجاح!" : "✅ Order updated successfully!", centered: true, okText: language === "ar" ? "حسناً" : "OK" });
        setShowEditOrderModal(false);
        setEditingSectionId(null);
        fetchSections();
      } else {
        Modal.error({ title: language === "ar" ? "❌ فشل التحديث" : "❌ Update Failed", content: language === "ar" ? (data.error_ar || data.error || "حدث خطأ") : (data.error || "An error occurred"), centered: true, okText: language === "ar" ? "حسناً" : "OK" });
      }
    } catch (error) {
      Modal.error({ title: language === "ar" ? "❌ خطأ في الاتصال" : "❌ Network Error", content: error.message, centered: true, okText: language === "ar" ? "حسناً" : "OK" });
    }
  };

  // ── Edit section name ─────────────────────────────────────────────────────
  const handleEditSectionName = async () => {
    if (!editingSectionName.title_ar.trim() || !editingSectionName.title_en.trim()) return;
    try {
      const response = await fetch(`${SECTION_API_URL}${editingSectionName.id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title_ar: editingSectionName.title_ar.trim(), title_en: editingSectionName.title_en.trim() }),
      });
      if (response.ok) {
        Modal.success({ title: language === "ar" ? "🎉 تم التحديث!" : "🎉 Updated!", content: language === "ar" ? "✅ تم تحديث اسم القسم بنجاح!" : "✅ Section name updated successfully!", centered: true, okText: language === "ar" ? "حسناً" : "OK" });
        setShowEditSectionNameModal(false);
        fetchSections();
      } else {
        const data = await response.json();
        Modal.error({ title: "❌ Error", content: data.error || "Failed", centered: true });
      }
    } catch (err) {
      Modal.error({ title: "❌ Network Error", content: err.message, centered: true });
    }
  };

  // ── Badge handlers ─────────────────────────────────────────────────────────
  const handleSaveBadge = async () => {
    if (!newBadgeNameAr.trim() || !newBadgeNameEn.trim()) return;
    setIsSavingBadge(true);
    try {
      const response = await fetch(BADGES_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name_ar: newBadgeNameAr.trim(), name_en: newBadgeNameEn.trim(), color: newBadgeColor }),
      });
      const data = await response.json();
      if (response.ok) {
        setCustomBadges((prev) => [...prev, data]);
        setFormData((prev) => ({ ...prev, badge: language === "ar" ? data.name_ar : data.name_en }));
        closeBadgeModal();
      } else {
        Modal.error({ title: language === "ar" ? "❌ خطأ" : "❌ Error", content: data.error || "Failed to save badge", centered: true });
      }
    } catch (err) {
      Modal.error({ title: "❌ Network Error", content: err.message, centered: true });
    } finally {
      setIsSavingBadge(false);
    }
  };

  const handleUpdateBadge = async () => {
    if (!newBadgeNameAr.trim() || !newBadgeNameEn.trim() || !editingBadgeId) return;
    setIsSavingBadge(true);
    try {
      const oldBadge = customBadges.find((b) => b.id === editingBadgeId);
      const nameChanged = oldBadge && (oldBadge.name_ar !== newBadgeNameAr.trim() || oldBadge.name_en !== newBadgeNameEn.trim());
      await fetch(`${BADGES_API_URL}${editingBadgeId}/`, { method: "DELETE" });
      const postResponse = await fetch(BADGES_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name_ar: newBadgeNameAr.trim(), name_en: newBadgeNameEn.trim(), color: newBadgeColor }),
      });
      const data = await postResponse.json();
      if (postResponse.ok) {
        setCustomBadges((prev) => [...prev.filter((b) => b.id !== editingBadgeId), data]);
        if (nameChanged) {
          const affected = products.filter((p) => p.badge === oldBadge?.name_ar || p.badge === oldBadge?.name_en);
          for (const p of affected) {
            const form = new FormData();
            form.append("badge", language === "ar" ? newBadgeNameAr.trim() : newBadgeNameEn.trim());
            await fetch(`${API_URL}${p.id || p._id}/`, { method: "PATCH", body: form });
          }
          fetchProducts();
        }
        closeBadgeModal();
      } else {
        Modal.error({ title: language === "ar" ? "❌ خطأ" : "❌ Error", content: data.error || "Failed to update badge", centered: true });
      }
    } catch (err) {
      Modal.error({ title: "❌ Network Error", content: err.message, centered: true });
    } finally {
      setIsSavingBadge(false);
    }
  };

  const handleDeleteBadge = async () => {
    if (!badgeToDelete) return;
    setIsSavingBadge(true);
    try {
      const affected = products.filter((p) => p.badge === badgeToDelete.name_ar || p.badge === badgeToDelete.name_en);
      for (const p of affected) {
        const form = new FormData();
        form.append("badge", "");
        await fetch(`${API_URL}${p.id || p._id}/`, { method: "PATCH", body: form });
      }
      fetchProducts();
      const response = await fetch(`${BADGES_API_URL}${badgeToDelete.id}/`, { method: "DELETE" });
      if (response.ok) {
        setCustomBadges((prev) => prev.filter((b) => b.id !== badgeToDelete.id));
        setBadgeToDelete(null);
        setBadgeModalView("list");
      } else {
        try {
          const data = await response.json();
          Modal.error({ title: language === "ar" ? "❌ خطأ" : "❌ Error", content: data.error || "Failed to delete badge", centered: true });
        } catch { /* ignore parse error */ }
      }
    } catch (err) {
      Modal.error({ title: "❌ Network Error", content: err.message, centered: true });
    } finally {
      setIsSavingBadge(false);
    }
  };

  // ── Delete orphaned products ───────────────────────────────────────────────
  const handleDeleteSelectedOrphans = async () => {
    setIsDeletingOrphans(true);
    try {
      for (const id of selectedOrphans) {
        await fetch(`${API_URL}${id}/`, { method: "DELETE" });
      }
      setProducts((prev) => prev.filter((p) => !selectedOrphans.includes(p.id || p._id)));
      setSelectedOrphans([]);
      setShowDeleteOrphansModal(false);
      Modal.success({
        title: language === "ar" ? "🎉 تم الحذف!" : "🎉 Deleted!",
        content: language === "ar"
          ? `✅ تم حذف ${selectedOrphans.length} منتج بنجاح`
          : `✅ ${selectedOrphans.length} product${selectedOrphans.length !== 1 ? "s" : ""} deleted successfully`,
        centered: true,
        okText: language === "ar" ? "حسناً" : "OK",
      });
    } catch (err) {
      Modal.error({ title: language === "ar" ? "❌ خطأ في الاتصال" : "❌ Network Error", content: err.message, centered: true, okText: language === "ar" ? "حسناً" : "OK" });
    } finally {
      setIsDeletingOrphans(false);
    }
  };

  // ── Price helpers ──────────────────────────────────────────────────────────
  const getLivePreview = () => {
    const bb = parseInt(priceEditData.base_buy_price) || 0;
    if (priceEditData.metal === "gold") {
      return [
        { label: "24K", price: Math.round(bb * (24 / 21)) },
        { label: "21K", price: bb },
        { label: "18K", price: Math.round(bb * (18 / 21)) },
      ];
    }
    return [
      { label: "999", price: bb },
      { label: "925", price: Math.round(bb * (925 / 999)) },
      { label: "800", price: Math.round(bb * (800 / 999)) },
    ];
  };

  const handleUpdatePrices = async () => {
    try {
      const response = await fetchWithAuth(PRICES_API_URL, {
        method: "PUT",
        body: JSON.stringify(priceEditData),
      });
      const data = await response.json();
      if (response.ok) {
        Modal.success({ title: language === "ar" ? "✅ تم التحديث!" : "✅ Updated!", content: language === "ar" ? "تم تحديث الأسعار بنجاح" : "Prices updated successfully", centered: true });
        setShowPriceModal(false);
        fetchPrices();
        fetchProducts();
      } else {
        Modal.error({ title: language === "ar" ? "❌ خطأ" : "❌ Error", content: data.message || (language === "ar" ? "فشل التحديث" : "Update failed"), centered: true });
      }
    } catch (error) {
      Modal.error({ title: language === "ar" ? "❌ خطأ في الاتصال" : "❌ Network Error", content: error.message, centered: true });
    }
  };

  // ── Sections table columns ────────────────────────────────────────────────
  const columns = [
    {
      title: t.sectionTitleAr,
      dataIndex: "title_ar",
      key: "title_ar",
      ...getColumnSearchProps("title_ar", t.sectionTitleAr),
      render: (text, record) => (
        <span onClick={() => toggleSectionExpansion(record.id)} style={{ cursor: "pointer" }}>
          {text}
          {record.is_featured && (
            <span style={{ marginLeft: 8, background: "linear-gradient(135deg,#ffd700 0%,#ffed4e 100%)", color: "#856404", padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: "bold" }}>
              {t.featured}
            </span>
          )}
        </span>
      ),
    },
    {
      title: t.sectionTitleEn,
      dataIndex: "title_en",
      key: "title_en",
      ...getColumnSearchProps("title_en", t.sectionTitleEn),
    },
    {
      title: t.sectionOrder,
      dataIndex: "order",
      key: "order",
      sorter: (a, b) => a.order - b.order,
      render: (order, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontWeight: 600, fontSize: 16 }}>{order}</span>
          {!record.is_featured ? (
            <Button
              size="small" type="primary"
              onClick={() => { setEditingSectionId(record.id); setEditOrderValue(record.order); setShowEditOrderModal(true); }}
              style={{ fontSize: 12 }}
            >
              {t.editOrder}
            </Button>
          ) : (
            <span style={{ display: "inline-block", padding: "4px 8px", background: "#f8f9fa", color: "#6c757d", borderRadius: 4, fontSize: 11, fontStyle: "italic" }}>
              🔒 {language === "ar" ? "ثابت" : "Fixed"}
            </span>
          )}
        </div>
      ),
    },
    {
      title: t.productsCount,
      key: "productsCount",
      render: (_, record) => (
        <span style={{ background: "#e3f2fd", color: "#1976d2", padding: "4px 12px", borderRadius: 12, fontWeight: 600, fontSize: 14 }}>
          {getProductsForSection(record.id).length}
        </span>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) =>
        record.is_featured ? (
          <span style={{ display: "inline-block", padding: "8px 12px", background: "#f8f9fa", color: "#6c757d", borderRadius: 6, fontSize: 12, fontStyle: "italic" }}>
            {t.cannotDelete}
          </span>
        ) : (
          <div style={{ display: "flex", gap: 8 }}>
            <Tooltip title={t.edit} mouseEnterDelay={0} mouseLeaveDelay={0}>
              <button
                onClick={() => { setEditingSectionName({ id: record.id, title_ar: record.title_ar, title_en: record.title_en }); setShowEditSectionNameModal(true); }}
                style={{ background: "#07b5ff", color: "white", border: "none", borderRadius: 6, width: 34, height: 34, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <EditOutlined />
              </button>
            </Tooltip>
            <Tooltip title={language === "ar" ? "حذف" : "Delete"} mouseEnterDelay={0} mouseLeaveDelay={0}>
              <button
                onClick={() => handleDeleteSection(record.id)}
                style={{ background: "#dc3545", color: "white", border: "none", borderRadius: 6, width: 34, height: 34, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <DeleteFilled />
              </button>
            </Tooltip>
          </div>
        ),
    },
  ];

  // ── Orphaned products ──────────────────────────────────────────────────────
  const orphanedProducts = products.filter((p) => {
    if (!p.section) return true;
    return !sections.find((s) => s.id === p.section);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // JSX
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="admin-page">
      <Header
        language={language}
        onLanguageChange={onLanguageChange}
        navigate={navigate}
        onWishlistClick={null}
        onCartClick={null}
        adminMode={true}
        onLogout={onLogout}
      />

      <div className="admin-container">
        <header className="admin-header">
          <h1>{t.title}</h1>
          <p>{t.subtitle}</p>
        </header>

        {/* ── Price Management Dashboard ─────────────────────────────────── */}
        <section className="price-dashboard" style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={{ fontSize: "1.5rem", color: "#1a1a1a", margin: 0 }}>
              💰 {language === "ar" ? "إدارة الأسعار" : "Price Management"}
            </h2>
            <Button
              type="primary"
              onClick={() => {
                setPriceEditData({ metal: "gold", base_buy_price: allPrices?.karat_21_buy || 0, spread: (allPrices?.karat_21_sell - allPrices?.karat_21_buy) || 0 });
                setShowPriceModal(true);
              }}
              style={{ background: "#d4af37", borderColor: "#d4af37", color: "#1a1a1a", fontWeight: "bold" }}
            >
              {language === "ar" ? "تعديل الأسعار" : "Edit Prices"}
            </Button>
          </div>

          <div className="price-management-grid">
            {[
              { label: language === "ar" ? "الذهب" : "Gold", color: "#d4af37", border: "#d4af37", bg: "#fffcf0", itemBg: "#f0e2b6", items: [{ label: "24K", price: allPrices?.karat_24_buy }, { label: "21K", price: allPrices?.karat_21_buy }, { label: "18K", price: allPrices?.karat_18_buy }] },
              { label: language === "ar" ? "الفضة" : "Silver", color: "#555", border: "#ccc", bg: "#f8f9fa", itemBg: "#e0e0e0", items: [{ label: "999", price: allPrices?.fine_999_buy }, { label: "925", price: allPrices?.fine_925_buy }, { label: "800", price: allPrices?.fine_800_buy }] },
            ].map(({ label, color, border, bg, itemBg, items }) => (
              <div key={label} className="price-column">
                <h3 style={{ color, borderBottom: `2px solid ${border}`, paddingBottom: 10 }}>{label}</h3>
                <div className="price-cards-grid">
                  {items.map((item) => (
                    <div key={item.label} className="price-card-mini" style={{ background: bg, border: `1px solid ${itemBg}`, borderRadius: 8, padding: 10, textAlign: "center" }}>
                      <div style={{ fontWeight: "bold", fontSize: "1.1rem", marginBottom: 8, color }}>{item.label}</div>
                      <div style={{ fontWeight: 600, fontSize: "1rem", color: "#2c3e50" }}>{item.price || 0}</div>
                      <div style={{ fontSize: 11, color: "#999", marginTop: 4 }}>{language === "ar" ? "جنيه" : "EGP"}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Action buttons ─────────────────────────────────────────────── */}
        <div style={{ display: "flex", gap: 15, justifyContent: "center", marginBottom: 30, flexWrap: "wrap" }}>
          <button type="button" onClick={() => setShowProductModal(true)}
            style={{ background: "linear-gradient(135deg,#28a745 0%,#20c997 100%)", color: "white", border: "none", padding: "14px 32px", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 18, boxShadow: "0 4px 15px rgba(40,167,69,0.3)" }}>
            {t.createProduct}
          </button>
          <button type="button" onClick={() => setShowSectionModal(true)}
            style={{ background: "linear-gradient(135deg,#667eea 0%,#764ba2 100%)", color: "white", border: "none", padding: "14px 32px", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 18, boxShadow: "0 4px 15px rgba(102,126,234,0.3)" }}>
            {t.createSection}
          </button>
          <button type="button"
            onClick={() => { setShowInvoiceModal(true); setInvoiceLanguage(language); setCustomerName(""); }}
            style={{ background: "linear-gradient(135deg,#C9A84C 0%,#f5e6c0 50%,#C9A84C 100%)", color: "#1a1208", border: "none", padding: "14px 32px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 18, boxShadow: "0 4px 15px rgba(201,168,76,0.4)" }}>
            📄 {language === "ar" ? "إنشاء فاتورة" : "Create Invoice"}
          </button>
        </div>

        {/* ── Modals ─────────────────────────────────────────────────────── */}
        {showMoveProductModal && (
          <MoveProductModal
            language={language} t={t} sections={sections}
            productToMove={productToMove}
            newSectionForMove={newSectionForMove} setNewSectionForMove={setNewSectionForMove}
            isMovingProduct={isMovingProduct}
            onConfirm={handleMoveProductSubmit}
            onClose={closeMoveModal}
          />
        )}

        {showInvoiceModal && (
          <InvoiceModal
            language={language} products={products}
            invoiceItems={invoiceItems} setInvoiceItems={setInvoiceItems}
            invoiceLanguage={invoiceLanguage} setInvoiceLanguage={setInvoiceLanguage}
            customerName={customerName} setCustomerName={setCustomerName}
            isGenerating={isGenerating} setIsGenerating={setIsGenerating}
            detailModalState={detailModalState} setDetailModalState={setDetailModalState}
            closeDetailModal={closeDetailModal}
            logoBase64={logoBase64} urlToBase64={urlToBase64}
            onClose={closeInvoiceModal}
          />
        )}

        {showSectionModal && (
          <SectionCreateModal
            language={language} t={t}
            sectionFormData={sectionFormData} setSectionFormData={setSectionFormData}
            isSubmitting={isSubmitting}
            onSubmit={handleSectionSubmit}
            onClose={() => { setShowSectionModal(false); setSectionFormData({ title_ar: "", title_en: "", order: 1 }); }}
          />
        )}

        {showEditOrderModal && (
          <SectionEditOrderModal
            t={t}
            editOrderValue={editOrderValue} setEditOrderValue={setEditOrderValue}
            onConfirm={handleEditSectionOrder}
            onClose={() => { setShowEditOrderModal(false); setEditingSectionId(null); }}
          />
        )}

        {showEditSectionNameModal && (
          <SectionEditNameModal
            language={language} t={t}
            editingSectionName={editingSectionName} setEditingSectionName={setEditingSectionName}
            onConfirm={handleEditSectionName}
            onClose={() => setShowEditSectionNameModal(false)}
          />
        )}

        {showBadgeModal && (
          <BadgeModal
            language={language} t={t}
            badgeModalView={badgeModalView} setBadgeModalView={setBadgeModalView}
            customBadges={customBadges}
            editingBadgeId={editingBadgeId} setEditingBadgeId={setEditingBadgeId}
            badgeToDelete={badgeToDelete} setBadgeToDelete={setBadgeToDelete}
            newBadgeNameAr={newBadgeNameAr} setNewBadgeNameAr={setNewBadgeNameAr}
            newBadgeNameEn={newBadgeNameEn} setNewBadgeNameEn={setNewBadgeNameEn}
            newBadgeColor={newBadgeColor} setNewBadgeColor={setNewBadgeColor}
            isSavingBadge={isSavingBadge}
            products={products}
            onSave={handleSaveBadge}
            onUpdate={handleUpdateBadge}
            onDelete={handleDeleteBadge}
            onClose={closeBadgeModal}
          />
        )}

        {showDeleteOrphansModal && (
          <DeleteOrphansModal
            language={language}
            selectedOrphans={selectedOrphans}
            orphanedProducts={orphanedProducts}
            isDeletingOrphans={isDeletingOrphans}
            onConfirm={handleDeleteSelectedOrphans}
            onClose={() => setShowDeleteOrphansModal(false)}
          />
        )}

        {/* ── Product creation/edit modal ────────────────────────────────── */}
        {showProductModal && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, overflow: "auto", padding: 20 }}>
            <div style={{ background: "white", padding: 30, borderRadius: 12, maxWidth: 800, width: "100%", maxHeight: "90vh", overflow: "auto", boxShadow: "0 10px 40px rgba(0,0,0,0.2)" }}>
              <h3 style={{ marginBottom: 20, color: "#2c3e50", fontSize: 24, fontWeight: 700 }}>
                {editingProductId
                  ? (language === "ar" ? "🔄 تعديل المنتج" : "🔄 Edit Product")
                  : (language === "ar" ? "➕ إضافة منتج جديد" : "➕ Add New Product")}
              </h3>

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

                {/* Section select — only when adding */}
                {!editingProductId && (
                  <div ref={sectionRef} className="form-group">
                    <label style={{ display: "block", marginBottom: 8, fontWeight: 600, color: "#2c3e50" }}>
                      {t.selectSection} <span style={{ marginLeft: 4, color: "#e74c3c" }}>*</span>
                    </label>
                    <select
                      required value={formData.section || ""}
                      onChange={(e) => { setFormData({ ...formData, section: e.target.value }); setSectionError(false); }}
                      style={{ width: "100%", padding: "12px 15px", borderRadius: 8, border: sectionError ? "2px solid #e74c3c" : "2px solid #e0e0e0", fontSize: 16, background: "white" }}
                    >
                      <option value="" disabled>{t.noSection}</option>
                      {sections.filter((s) => !s.is_featured).map((s) => (
                        <option key={s.id} value={s.id}>{language === "ar" ? s.title_ar : s.title_en}</option>
                      ))}
                    </select>
                    {sectionError && <span style={{ color: "#e74c3c", fontSize: 14, marginTop: 6, display: "block" }}>{t.sectionError}</span>}
                  </div>
                )}

                {/* Name AR */}
                <div className="form-group">
                  <label htmlFor="name_ar">{t.productNameAr} *</label>
                  <input type="text" id="name_ar" name="name_ar" value={formData.name_ar} onChange={handleChange} required placeholder="مثال: خاتم ذهبي كلاسيكي" />
                </div>

                {/* Name EN */}
                <div className="form-group">
                  <label htmlFor="name_en">{t.productNameEn} *</label>
                  <input type="text" id="name_en" name="name_en" value={formData.name_en} onChange={handleChange} required placeholder="e.g., Classic Gold Ring" />
                </div>

                {/* Metal type */}
                <div className="form-group">
                  <label htmlFor="type" style={{ display: "block", marginBottom: 8, fontWeight: 600, color: "#2c3e50", fontSize: 16 }}>
                    {language === "ar" ? "نوع المعدن" : "Metal Type"} <span style={{ marginLeft: 4, color: "#000" }}>*</span>
                  </label>
                  <select id="type" name="type" value={formData.type} onChange={handleChange} required
                    style={{ width: "100%", padding: "14px 18px", borderRadius: 10, border: "2px solid #e0e0e0", fontSize: 16, background: "white", cursor: "pointer", fontWeight: 500, color: "#2c3e50" }}>
                    <option value="gold">{language === "ar" ? "ذهب" : "Gold"}</option>
                    <option value="silver">{language === "ar" ? "فضة" : "Silver"}</option>
                    <option value="accessories">{language === "ar" ? "إكسسوارات" : "Accessories"}</option>
                  </select>
                </div>

                {/* Karat */}
                {(formData.type === "gold" || formData.type === "silver") && (
                  <div className="form-group">
                    <label htmlFor="karat" style={{ display: "block", marginBottom: 8, fontWeight: 600, color: "#2c3e50", fontSize: 16 }}>
                      {language === "ar" ? "العيار" : "Karat / Fineness"} <span style={{ marginLeft: 4, color: "#e74c3c" }}>*</span>
                    </label>
                    <select id="karat" name="karat" value={formData.karat} onChange={handleChange} required
                      style={{ width: "100%", padding: "14px 18px", borderRadius: 10, border: "2px solid #e0e0e0", fontSize: 16, background: "white", cursor: "pointer", fontWeight: 500, color: "#2c3e50" }}>
                      {formData.type === "gold"
                        ? (<><option value="24K">24K</option><option value="21K">21K</option><option value="18K">18K</option></>)
                        : (<><option value="999">999</option><option value="925">925</option><option value="800">800</option></>)}
                    </select>
                  </div>
                )}

                {/* Price — accessories only */}
                {formData.type === "accessories" && (
                  <div className="form-group">
                    <label htmlFor="price">{language === "ar" ? "السعر ($)" : "Price ($)"} *</label>
                    <input type="number" id="price" name="price" value={formData.price} onChange={handleChange} required onWheel={(e) => e.target.blur()} min="0" step="0.01" placeholder="150" />
                  </div>
                )}

                {/* Weight */}
                {formData.type !== "accessories" && (
                  <div className="form-group">
                    <label htmlFor="weight">{language === "ar" ? "الوزن (جرام)" : "Weight (grams)"} *</label>
                    <input type="number" id="weight" name="weight" value={formData.weight} onChange={handleChange} required onWheel={(e) => e.target.blur()} min="0" step="0.01" placeholder="10.5" />
                    {formData.weight !== "" && (
                      <small style={{ marginTop: 6, display: "block", fontWeight: 600, color: parseFloat(formData.weight) < 3 ? "#1976d2" : "#28a745" }}>
                        {parseFloat(formData.weight) < 3
                          ? (language === "ar" ? "🔵 وزن خفيف" : "🔵 Light weight")
                          : (language === "ar" ? "🟢 وزن تقيل" : "🟢 Heavy weight")}
                      </small>
                    )}
                    <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8 }}>
                      <input type="checkbox" id="show_weight" name="show_weight" checked={formData.show_weight}
                        onChange={(e) => setFormData((prev) => ({ ...prev, show_weight: e.target.checked }))}
                        style={{ width: 16, height: 16, cursor: "pointer" }} />
                      <label htmlFor="show_weight" style={{ margin: 0, cursor: "pointer", fontWeight: "normal", fontSize: 14, color: "#555" }}>
                        {language === "ar" ? "إظهار الوزن في بطاقة المنتج" : "Show weight on product card"}
                      </label>
                    </div>
                  </div>
                )}

                {/* Manufacturing cost */}
                {formData.type !== "accessories" && formData.weight !== "" && parseFloat(formData.weight) > 0 && (
                  <div className="form-group">
                    <label htmlFor="manufacturing_cost">
                      {parseFloat(formData.weight) < 3
                        ? (language === "ar" ? "المصنعية (للقطعة كلها)" : "Manufacturing Cost (per piece)")
                        : (language === "ar" ? "المصنعية (للجرام)" : "Manufacturing Cost (per gram)")} *
                    </label>
                    <input type="number" id="manufacturing_cost" name="manufacturing_cost" value={formData.manufacturing_cost} onChange={handleChange} required onWheel={(e) => e.target.blur()} min="0" step="0.01" placeholder={language === "ar" ? "مثال: 2.5" : "e.g., 2.5"} />
                    <small style={{ color: "#6c757d", fontSize: 13, marginTop: 5, display: "block" }}>
                      {parseFloat(formData.weight) < 3
                        ? (language === "ar" ? "💡 مصنعية ثابتة للقطعة" : "💡 Flat cost per piece")
                        : (language === "ar" ? "💡 مصنعية لكل جرام" : "💡 Cost per gram")}
                    </small>
                  </div>
                )}

                {/* Badge & Stock */}
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="badge">{t.badge}</label>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <select id="badge" name="badge" value={formData.badge} onChange={handleChange} style={{ flex: 1 }}>
                        <option value="">{t.noBadge}</option>
                        <option value="Best Seller">{t.bestSeller}</option>
                        <option value="New Arrival">{t.newArrival}</option>
                        <option value="Limited Edition">{t.limitedEdition}</option>
                        {customBadges.map((b) => (
                          <option key={b.id} value={language === "ar" ? b.name_ar : b.name_en}>
                            {language === "ar" ? b.name_ar : b.name_en}
                          </option>
                        ))}
                      </select>
                      <button type="button" disabled={showBadgeModal}
                        onClick={() => { setBadgeModalView("list"); setShowBadgeModal(true); }}
                        style={{ width: 36, height: 36, background: "linear-gradient(135deg,#667eea 0%,#764ba2 100%)", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 20, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        +
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="stock">{t.stock} *</label>
                    <select id="stock" name="stock" value={formData.stock} onChange={handleChange} required>
                      <option value="In Stock">{t.inStock}</option>
                      <option value="Limited Stock">{t.limitedStock}</option>
                      <option value="Out of Stock">{t.outOfStock}</option>
                    </select>
                  </div>
                </div>

                {/* Image */}
                <div className="form-group">
                  <label>{t.image} *</label>
                  <div style={{ marginBottom: 10 }}>
                    {["url", "file"].map((type) => (
                      <label key={type} style={{ marginRight: 20 }}>
                        <input type="radio" name="imageType" value={type} checked={imageType === type} onChange={() => setImageType(type)} style={{ marginRight: 5 }} />
                        {type === "url" ? t.useUrl : t.uploadFile}
                      </label>
                    ))}
                  </div>
                  {imageType === "url" ? (
                    <input type="url" name="image_url" value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      placeholder="https://example.com/image.jpg" />
                  ) : (
                    <>
                      <button type="button" className="upload-image-btn"
                        onClick={() => document.getElementById("imageUploadInput").click()}
                        style={{ fontSize: 18 }}>
                        📷 {language === "ar" ? "اختيار صورة" : "Choose Image"}
                      </button>
                      <input id="imageUploadInput" type="file" name="image_file" accept="image/*"
                        style={{ display: "none" }} onChange={(e) => setSelectedFile(e.target.files[0])} />
                      {selectedFile && (
                        <p style={{ marginTop: 8, fontSize: 14 }}>
                          {language === "ar" ? "تم اختيار:" : "Selected:"} {selectedFile.name}
                        </p>
                      )}
                    </>
                  )}
                </div>

                {/* Short descriptions */}
                <div className="form-group">
                  <label htmlFor="shortDescription_ar">{t.shortDescAr} *</label>
                  <input type="text" id="shortDescription_ar" name="shortDescription_ar" value={formData.shortDescription_ar} onChange={handleChange} required maxLength="100" placeholder="وصف موجز من سطر واحد" />
                </div>
                <div className="form-group">
                  <label htmlFor="shortDescription_en">{t.shortDescEn} *</label>
                  <input type="text" id="shortDescription_en" name="shortDescription_en" value={formData.shortDescription_en} onChange={handleChange} required maxLength="100" placeholder="Brief one-line description" />
                </div>

                {/* Full descriptions */}
                <div className="form-group">
                  <label htmlFor="description_ar">{t.fullDescAr} *</label>
                  <textarea id="description_ar" name="description_ar" value={formData.description_ar} onChange={handleChange} required rows="4" placeholder="وصف تفصيلي للمنتج..." />
                </div>
                <div className="form-group">
                  <label htmlFor="description_en">{t.fullDescEn} *</label>
                  <textarea id="description_en" name="description_en" value={formData.description_en} onChange={handleChange} required rows="4" placeholder="Detailed product description..." />
                </div>

                {/* Submit / cancel */}
                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
                  <button type="button"
                    onClick={() => { setShowProductModal(false); setEditingProductId(null); setFormData(DEFAULT_FORM_DATA); setSelectedFile(null); setImageType("url"); setSectionError(false); }}
                    style={{ background: "#6c757d", color: "white", border: "none", padding: "12px 24px", borderRadius: 6, cursor: "pointer", fontWeight: 600, fontSize: 16 }}>
                    {t.cancel}
                  </button>
                  <button type="submit" disabled={isSubmitting}
                    style={{ background: isSubmitting ? "#ccc" : "#28a745", color: "white", border: "none", padding: "12px 24px", borderRadius: 6, cursor: isSubmitting ? "not-allowed" : "pointer", fontWeight: 600, fontSize: 16 }}>
                    {isSubmitting
                      ? (editingProductId ? t.updatingProduct : t.addingProduct)
                      : (editingProductId ? t.updateProduct : t.addProduct)}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {status.message && (
          <div className={`status-message ${status.type}`}>{status.message}</div>
        )}

        {/* ── Sections table ─────────────────────────────────────────────── */}
        {sections.length > 0 && (
          <div style={{ marginBottom: 30 }}>
            <h2 style={{ marginTop: 20, marginBottom: 20 }}>{t.sectionsList}</h2>
            <hr style={{ marginBottom: 20 }} />
            <Table
              columns={columns}
              dataSource={sections}
              rowKey="id"
              scroll={{ x: "max-content" }}
              pagination={{
                pageSize,
                showSizeChanger: true,
                pageSizeOptions: ["5", "10"],
                placement: ["bottomCenter"],
                onShowSizeChange: (_, size) => setPageSize(size),
              }}
              expandable={{
                expandedRowRender: (record) => {
                  const sectionProducts = getProductsForSection(record.id);
                  if (sectionProducts.length === 0) {
                    return (
                      <p style={{ textAlign: "center", color: "#6c757d", fontStyle: "italic", padding: 20 }}>
                        {language === "ar" ? "📭 لا توجد منتجات في هذا القسم" : "📭 No products in this section"}
                      </p>
                    );
                  }
                  return (
                    <div style={{ padding: 20, borderLeft: "4px solid #667eea" }}>
                      <h4 style={{ marginBottom: 15, color: "#667eea", fontSize: 16 }}>
                        {language === "ar" ? "📦 المنتجات في هذا القسم:" : "📦 Products in this section:"}
                      </h4>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,160px))", gap: 15, justifyContent: "start" }}>
                        {sectionProducts.map((product) => (
                          <div key={product.id || product._id}
                            style={{ background: "white", padding: 12, borderRadius: 8, border: "1px solid #e0e0e0", display: "flex", flexDirection: "column", gap: 8, width: 160, height: 320, overflow: "hidden", boxSizing: "border-box" }}>
                            <img
                              src={product.image || product.image_url || product.image_file || "https://via.placeholder.com/150"}
                              alt={language === "ar" ? product.name_ar : product.name_en}
                              style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 6, flexShrink: 0 }}
                            />
                            <strong style={{ fontSize: 13, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: 1.3, minHeight: 34 }}>
                              {language === "ar" ? (product.name_ar || product.name) : (product.name_en || product.name)}
                            </strong>
                            <span style={{ color: "#28a745", fontWeight: 600, fontSize: 13 }}>
                              ${Math.ceil(product.price / 5) * 5}
                            </span>
                            <span style={{
                              display: "inline-block", width: "fit-content",
                              background: product.type === "gold" ? "linear-gradient(135deg,#ffd700 0%,#ffed4e 100%)" : product.type === "accessories" ? "linear-gradient(135deg,#a8c0ff 0%,#3f2b96 100%)" : "linear-gradient(135deg,#c0c0c0 0%,#e8e8e8 100%)",
                              color: product.type === "gold" ? "#856404" : product.type === "accessories" ? "#ffffff" : "#393939",
                              padding: "3px 10px", borderRadius: 12, fontSize: 11, fontWeight: "bold",
                            }}>
                              {product.type === "gold"
                                ? (language === "ar" ? `ذهب ${product.karat || "21K"}` : `Gold ${product.karat || "21K"}`)
                                : product.type === "accessories"
                                  ? (language === "ar" ? "إكسسوارات" : "Accessories")
                                  : (language === "ar" ? `فضة ${product.karat || "999"}` : `Silver ${product.karat || "999"}`)}
                            </span>
                            <span className={`stock-badge ${product.stock?.toLowerCase().replace(/\s/g, "-")}`} style={{ fontSize: 11 }}>
                              {product.stock}
                            </span>
                            <div style={{ display: "flex", gap: 6, marginTop: "auto" }}>
                              <Tooltip title={t.edit} mouseEnterDelay={0} mouseLeaveDelay={0}>
                                <button onClick={() => {
                                  setEditingProductId(product.id || product._id);
                                  setFormData({
                                    name_ar: product.name_ar || product.name || "",
                                    name_en: product.name_en || product.name || "",
                                    type: product.type || "silver",
                                    karat: product.karat || (product.type === "gold" ? "21K" : "999"),
                                    weight: product.weight || "",
                                    show_weight: product.show_weight !== false,
                                    manufacturing_cost: product.manufacturing_cost || "",
                                    price: product.price,
                                    badge: product.badge || "",
                                    stock: product.stock,
                                    section: product.section,
                                    image_url: product.image_url || product.image || "",
                                    description_ar: product.description_ar || product.description || "",
                                    description_en: product.description_en || product.description || "",
                                    shortDescription_ar: product.shortDescription_ar || product.shortDescription || "",
                                    shortDescription_en: product.shortDescription_en || product.shortDescription || "",
                                  });
                                  setShowProductModal(true);
                                }}
                                  style={{ flex: 1, background: "#ffc107", color: "white", border: "none", padding: "7px 4px", borderRadius: 4, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                                  <EditOutlined />
                                </button>
                              </Tooltip>
                              <Tooltip title={t.moveProduct} mouseEnterDelay={0} mouseLeaveDelay={0}>
                                <button onClick={() => { setProductToMove(product); setNewSectionForMove(""); setShowMoveProductModal(true); }}
                                  style={{ flex: 1, background: "#17a2b8", color: "white", border: "none", padding: "7px 4px", borderRadius: 4, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                                  <SwapOutlined />
                                </button>
                              </Tooltip>
                              <Tooltip title={t.delete} mouseEnterDelay={0} mouseLeaveDelay={0}>
                                <button onClick={() => handleDelete(product.id || product._id)}
                                  style={{ flex: 1, background: "#dc3545", color: "white", border: "none", padding: "7px 4px", borderRadius: 4, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                                  <DeleteFilled />
                                </button>
                              </Tooltip>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                },
                expandedRowKeys: expandedSections,
                onExpand: (_, record) => toggleSectionExpansion(record.id),
              }}
            />
          </div>
        )}

        {/* ── Orphaned products ──────────────────────────────────────────── */}
        {orphanedProducts.length > 0 && (() => {
          const allSelected = orphanedProducts.every((p) => selectedOrphans.includes(p.id || p._id));
          return (
            <div style={{ marginTop: 40 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <input type="checkbox" checked={allSelected}
                    onChange={() => setSelectedOrphans(allSelected ? [] : orphanedProducts.map((p) => p.id || p._id))}
                    style={{ width: 18, height: 18, cursor: "pointer" }} />
                  <h2 style={{ margin: 0, color: "#ff9800" }}>⚠️ {language === "ar" ? "منتجات بدون قسم" : "Orphaned Products"}</h2>
                </div>
                {selectedOrphans.length > 0 && (
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <button onClick={() => setShowDeleteOrphansModal(true)}
                      style={{ background: "linear-gradient(135deg,#dc3545 0%,#c82333 100%)", color: "white", border: "none", padding: "10px 22px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 15, boxShadow: "0 4px 12px rgba(220,53,69,0.35)", display: "flex", alignItems: "center", gap: 8 }}>
                      🗑️ {language === "ar" ? "حذف المحدد" : "Delete Selected"}
                    </button>
                    <span style={{ color: "#6c757d", fontSize: 14, fontWeight: 500 }}>
                      {language === "ar" ? `${selectedOrphans.length} محدد` : `${selectedOrphans.length} selected`}
                    </span>
                  </div>
                )}
              </div>

              <p style={{ marginBottom: 15, color: "#6c757d", fontSize: 14 }}>
                {language === "ar"
                  ? `تم العثور على ${orphanedProducts.length} منتج بدون قسم. يرجى تعيين قسم لهم.`
                  : `Found ${orphanedProducts.length} product${orphanedProducts.length !== 1 ? "s" : ""} without a section. Please assign them to a section.`}
              </p>
              <hr style={{ marginBottom: 20 }} />

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))", gap: 20 }}>
                {orphanedProducts.map((product) => {
                  const pid = product.id || product._id;
                  const isSelected = selectedOrphans.includes(pid);
                  return (
                    <div key={pid}
                      onClick={() => setSelectedOrphans((prev) => prev.includes(pid) ? prev.filter((id) => id !== pid) : [...prev, pid])}
                      style={{ background: isSelected ? "#fff0f0" : "#fff8e1", padding: 20, borderRadius: 12, border: isSelected ? "2px solid #dc3545" : "2px solid #ff9800", display: "flex", flexDirection: "column", gap: 12, cursor: "pointer", position: "relative", transition: "transform 0.2s" }}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
                    >
                      {/* Circular checkbox */}
                      <div onClick={(e) => { e.stopPropagation(); setSelectedOrphans((prev) => prev.includes(pid) ? prev.filter((id) => id !== pid) : [...prev, pid]); }}
                        style={{ position: "absolute", top: 12, right: 12, width: 26, height: 26, borderRadius: "50%", background: isSelected ? "#dc3545" : "white", border: isSelected ? "2px solid #dc3545" : "2px solid #ccc", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 6px rgba(0,0,0,0.15)", zIndex: 2 }}>
                        {isSelected && <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7L5.5 10.5L12 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                      </div>

                      <span style={{ display: "inline-block", width: "fit-content", background: "#ff9800", color: "white", padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>
                        ⚠️ {language === "ar" ? "بدون قسم" : "No Section"}
                      </span>
                      <img src={product.image || product.image_url || "https://via.placeholder.com/250"} alt="" style={{ width: "100%", height: 200, objectFit: "cover", borderRadius: 8 }} />
                      {product.badge && (
                        <span style={{ display: "inline-block", width: "fit-content", background: "#667eea", color: "white", padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>{product.badge}</span>
                      )}
                      <strong style={{ fontSize: 16, color: "#2c3e50" }}>
                        {language === "ar" ? (product.name_ar || product.name) : (product.name_en || product.name)}
                      </strong>
                      <p style={{ fontSize: 14, color: "#6c757d", margin: 0, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                        {language === "ar" ? (product.shortDescription_ar || product.shortDescription) : (product.shortDescription_en || product.shortDescription)}
                      </p>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 20, fontWeight: 700, color: "#28a745" }}>${Math.ceil(product.price / 5) * 5}</span>
                        {(product.type === "gold" || product.type === "silver") && (
                          <span style={{ background: product.type === "gold" ? "#ffd700" : "#c0c0c0", color: product.type === "gold" ? "#856404" : "#393939", padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700 }}>{product.karat}</span>
                        )}
                      </div>
                      <span className={`stock-badge ${product.stock?.toLowerCase().replace(/\s/g, "-")}`} style={{ fontSize: 12, textAlign: "center", padding: 6, borderRadius: 6 }}>{product.stock}</span>

                      <div style={{ display: "flex", gap: 6, marginTop: "auto" }}>
                        {[
                          { bg: "#ffc107", icon: <EditOutlined />, title: t.edit, onClick: (e) => { e.stopPropagation(); setEditingProductId(product.id || product._id); setFormData({ name_ar: product.name_ar || product.name || "", name_en: product.name_en || product.name || "", type: product.type || "silver", karat: product.karat || (product.type === "gold" ? "21K" : "999"), weight: product.weight || "", show_weight: product.show_weight !== false, manufacturing_cost: product.manufacturing_cost || "", price: product.price, badge: product.badge || "", stock: product.stock, section: product.section, image_url: product.image_url || product.image || "", description_ar: product.description_ar || product.description || "", description_en: product.description_en || product.description || "", shortDescription_ar: product.shortDescription_ar || product.shortDescription || "", shortDescription_en: product.shortDescription_en || product.shortDescription || "" }); setShowProductModal(true); } },
                          { bg: "#17a2b8", icon: <SwapOutlined />, title: t.moveProduct, onClick: (e) => { e.stopPropagation(); setProductToMove(product); setNewSectionForMove(""); setShowMoveProductModal(true); } },
                          { bg: "#dc3545", icon: <DeleteFilled />, title: t.delete, onClick: (e) => { e.stopPropagation(); handleDelete(product.id || product._id); } },
                        ].map(({ bg, icon, title, onClick }) => (
                          <button key={title} onClick={onClick} title={title}
                            style={{ flex: 1, background: bg, color: "white", border: "none", padding: "7px 4px", borderRadius: 4, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {icon}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}
      </div>

      <Modal
        title={language === "ar" ? "📊 تعديل الأسعار اليومية" : "📊 Edit Daily Prices"}
        open={showPriceModal}
        onCancel={() => setShowPriceModal(false)}
        onOk={handleUpdatePrices}
        okText={language === "ar" ? "حفظ الأسعار" : "Save Prices"}
        cancelText={language === "ar" ? "إلغاء" : "Cancel"}
        width={600}
        centered
      >
        <div style={{ padding: "10px 0" }}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", marginBottom: 8, fontWeight: "bold" }}>
              {language === "ar" ? "نوع المعدن" : "Metal Type"}
            </label>
            <select
              value={priceEditData.metal}
              onChange={(e) => setPriceEditData((prev) => ({
                ...prev,
                metal: e.target.value,
                base_buy_price: e.target.value === "gold" ? (allPrices?.karat_21_buy || 0) : (allPrices?.fine_999_buy || 0),
                spread: e.target.value === "gold" ? ((allPrices?.karat_21_sell - allPrices?.karat_21_buy) || 0) : ((allPrices?.fine_999_sell - allPrices?.fine_999_buy) || 0),
              }))}
              style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #d9d9d9" }}
            >
              <option value="gold">{language === "ar" ? "الذهب" : "Gold"}</option>
              <option value="silver">{language === "ar" ? "الفضة" : "Silver"}</option>
            </select>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", marginBottom: 8, fontWeight: "bold" }}>
              {priceEditData.metal === "gold"
                ? (language === "ar" ? "سعر شراء 21K الأساسي" : "Base 21K Buy Price")
                : (language === "ar" ? "سعر شراء 999 الأساسي" : "Base 999 Buy Price")}
            </label>
            <Input
              type="number"
              value={priceEditData.base_buy_price}
              onChange={(e) => setPriceEditData((prev) => ({ ...prev, base_buy_price: e.target.value }))}
              placeholder="0"
            />
          </div>

          <div style={{ marginTop: 30 }}>
            <h4 style={{ marginBottom: 15, color: "#666", fontSize: 14, textTransform: "uppercase" }}>
              🔍 {language === "ar" ? "معاينة الأسعار" : "Live Preview"}
            </h4>
            <div style={{ background: "#f8f9fa", borderRadius: 8, overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 1, background: "#e0e0e0" }}>
                {getLivePreview().map((item) => (
                  <div key={item.label} style={{ background: "white", padding: 16, textAlign: "center" }}>
                    <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8, color: priceEditData.metal === "gold" ? "#d4af37" : "#555" }}>{item.label}</div>
                    <div style={{ fontWeight: 600, fontSize: 18, color: "#2c3e50" }}>{item.price}</div>
                    <div style={{ fontSize: 11, color: "#999", marginTop: 4 }}>{language === "ar" ? "جنيه" : "EGP"}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Admin;