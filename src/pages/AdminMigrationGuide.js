import translations from "./translations.json";
import {
  API_URL,
  SECTION_API_URL,
  PRICES_API_URL,
  BADGES_API_URL,
  CLOUDINARY_URL,
  CLOUDINARY_UPLOAD_PRESET,
  DEFAULT_FORM_DATA,
  DEFAULT_SECTION_FORM,
  DEFAULT_DETAIL_MODAL,
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

const t = translations[language] || translations.ar;

// ─── Replace all the individual modal useState calls with: ────────────────────
const {
  showProductModal, setShowProductModal,
  showSectionModal, setShowSectionModal,
  sectionFormData,  setSectionFormData,
  showEditOrderModal, setShowEditOrderModal,
  editingSectionId,   setEditingSectionId,
  editOrderValue,     setEditOrderValue,
  showEditSectionNameModal, setShowEditSectionNameModal,
  editingSectionName,       setEditingSectionName,
  showMoveProductModal, setShowMoveProductModal,
  productToMove,        setProductToMove,
  newSectionForMove,    setNewSectionForMove,
  isMovingProduct,      setIsMovingProduct,
  closeMoveModal,
  showInvoiceModal, setShowInvoiceModal,
  invoiceItems,     setInvoiceItems,
  isGenerating,     setIsGenerating,
  customerName,     setCustomerName,
  invoiceLanguage,  setInvoiceLanguage,
  closeInvoiceModal,
  detailModalState, setDetailModalState,
  closeDetailModal,
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
  showPriceModal, setShowPriceModal,
  priceEditData,  setPriceEditData,
  showDeleteOrphansModal, setShowDeleteOrphansModal,
  selectedOrphans,        setSelectedOrphans,
  isDeletingOrphans,      setIsDeletingOrphans,
} = useAdminModals();
