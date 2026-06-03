import { useState } from "react";
import { DEFAULT_DETAIL_MODAL, DEFAULT_SECTION_FORM } from "./adminConstants";

/**
 * useAdminModals
 * Centralises every modal open/close state used in the Admin page so the
 * parent component doesn't have to declare ~20 individual useState calls.
 *
 * Returns an object with:
 *   - each state value
 *   - each setter (prefixed with "set")
 *   - convenience helpers where useful
 */
const useAdminModals = () => {
  // ── Product modal ──────────────────────────────────────────────────────────
  const [showProductModal, setShowProductModal]     = useState(false);

  // ── Section create modal ───────────────────────────────────────────────────
  const [showSectionModal, setShowSectionModal]     = useState(false);
  const [sectionFormData,  setSectionFormData]      = useState(DEFAULT_SECTION_FORM);

  // ── Section edit-order modal ───────────────────────────────────────────────
  const [showEditOrderModal,  setShowEditOrderModal]  = useState(false);
  const [editingSectionId,    setEditingSectionId]    = useState(null);
  const [editOrderValue,      setEditOrderValue]      = useState(0);

  // ── Section edit-name modal ────────────────────────────────────────────────
  const [showEditSectionNameModal, setShowEditSectionNameModal] = useState(false);
  const [editingSectionName,       setEditingSectionName]       = useState({
    id: null, title_ar: "", title_en: "",
  });

  // ── Move product modal ─────────────────────────────────────────────────────
  const [showMoveProductModal, setShowMoveProductModal] = useState(false);
  const [productToMove,        setProductToMove]        = useState(null);
  const [newSectionForMove,    setNewSectionForMove]    = useState("");
  const [isMovingProduct,      setIsMovingProduct]      = useState(false);

  // ── Invoice modal ──────────────────────────────────────────────────────────
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceItems,     setInvoiceItems]     = useState([]);
  const [isGenerating,     setIsGenerating]     = useState(false);
  const [customerName,     setCustomerName]     = useState("");
  const [invoiceLanguage,  setInvoiceLanguage]  = useState("ar");

  // ── Invoice item detail modal ──────────────────────────────────────────────
  const [detailModalState, setDetailModalState] = useState(DEFAULT_DETAIL_MODAL);

  // ── Badge modal ────────────────────────────────────────────────────────────
  const [showBadgeModal,   setShowBadgeModal]   = useState(false);
  const [badgeModalView,   setBadgeModalView]   = useState("list"); // "list" | "form" | "confirmDelete"
  const [editingBadgeId,   setEditingBadgeId]   = useState(null);
  const [badgeToDelete,    setBadgeToDelete]    = useState(null);
  const [newBadgeNameAr,   setNewBadgeNameAr]   = useState("");
  const [newBadgeNameEn,   setNewBadgeNameEn]   = useState("");
  const [newBadgeColor,    setNewBadgeColor]    = useState("#667eea");
  const [isSavingBadge,    setIsSavingBadge]    = useState(false);

  // ── Price modal ────────────────────────────────────────────────────────────
  const [showPriceModal,  setShowPriceModal]  = useState(false);
  const [priceEditData,   setPriceEditData]   = useState({
    metal: "gold",
    base_buy_price: 0,
    spread: 0,
  });

  // ── Orphan delete modal ────────────────────────────────────────────────────
  const [showDeleteOrphansModal, setShowDeleteOrphansModal] = useState(false);
  const [selectedOrphans,        setSelectedOrphans]        = useState([]);
  const [isDeletingOrphans,      setIsDeletingOrphans]      = useState(false);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const closeMoveModal = () => {
    setShowMoveProductModal(false);
    setProductToMove(null);
    setNewSectionForMove("");
  };

  const closeInvoiceModal = () => {
    setShowInvoiceModal(false);
    setInvoiceItems([]);
    setCustomerName("");
  };

  const closeDetailModal = () => setDetailModalState(DEFAULT_DETAIL_MODAL);

  const closeBadgeModal = () => {
    setShowBadgeModal(false);
    setBadgeModalView("list");
    setNewBadgeNameAr("");
    setNewBadgeNameEn("");
    setNewBadgeColor("#667eea");
    setEditingBadgeId(null);
  };

  const resetBadgeForm = () => {
    setNewBadgeNameAr("");
    setNewBadgeNameEn("");
    setNewBadgeColor("#667eea");
    setEditingBadgeId(null);
    setBadgeModalView("list");
  };

  return {
    // product
    showProductModal, setShowProductModal,

    // section create
    showSectionModal, setShowSectionModal,
    sectionFormData,  setSectionFormData,

    // section edit order
    showEditOrderModal, setShowEditOrderModal,
    editingSectionId,   setEditingSectionId,
    editOrderValue,     setEditOrderValue,

    // section edit name
    showEditSectionNameModal, setShowEditSectionNameModal,
    editingSectionName,       setEditingSectionName,

    // move product
    showMoveProductModal, setShowMoveProductModal,
    productToMove,        setProductToMove,
    newSectionForMove,    setNewSectionForMove,
    isMovingProduct,      setIsMovingProduct,
    closeMoveModal,

    // invoice
    showInvoiceModal, setShowInvoiceModal,
    invoiceItems,     setInvoiceItems,
    isGenerating,     setIsGenerating,
    customerName,     setCustomerName,
    invoiceLanguage,  setInvoiceLanguage,
    closeInvoiceModal,

    // detail
    detailModalState, setDetailModalState,
    closeDetailModal,

    // badge
    showBadgeModal,  setShowBadgeModal,
    badgeModalView,  setBadgeModalView,
    editingBadgeId,  setEditingBadgeId,
    badgeToDelete,   setBadgeToDelete,
    newBadgeNameAr,  setNewBadgeNameAr,
    newBadgeNameEn,  setNewBadgeNameEn,
    newBadgeColor,   setNewBadgeColor,
    isSavingBadge,   setIsSavingBadge,
    closeBadgeModal,
    resetBadgeForm,

    // price
    showPriceModal, setShowPriceModal,
    priceEditData,  setPriceEditData,

    // orphans
    showDeleteOrphansModal, setShowDeleteOrphansModal,
    selectedOrphans,        setSelectedOrphans,
    isDeletingOrphans,      setIsDeletingOrphans,
  };
};

export default useAdminModals;