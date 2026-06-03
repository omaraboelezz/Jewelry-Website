// ─── API URLs ───────────────────────────────────────────────────────────────
export const API_URL        = "https://omarawad9.pythonanywhere.com/api/products/";
export const SECTION_API_URL = "https://omarawad9.pythonanywhere.com/api/sections/";
export const PRICES_API_URL  = "https://omarawad9.pythonanywhere.com/api/metal-prices/";
export const BADGES_API_URL  = "https://omarawad9.pythonanywhere.com/api/badges/";
export const CLOUDINARY_URL  = "https://api.cloudinary.com/v1_1/dpiwfb3sr/image/upload";

// ─── Cloudinary ─────────────────────────────────────────────────────────────
export const CLOUDINARY_UPLOAD_PRESET = "saudi_silver_upload";

// ─── Default form state ──────────────────────────────────────────────────────
export const DEFAULT_FORM_DATA = {
  name_ar: "",
  name_en: "",
  type: "silver",
  karat: "999",
  weight: "",
  show_weight: true,
  manufacturing_cost: "",
  price: "",
  badge: "",
  stock: "In Stock",
  section: "",
  image_url: "",
  image_file: null,
  description_ar: "",
  description_en: "",
  shortDescription_ar: "",
  shortDescription_en: "",
};

// ─── Default section form state ──────────────────────────────────────────────
export const DEFAULT_SECTION_FORM = {
  title_ar: "",
  title_en: "",
  order: 1,
};

// ─── Default detail modal state ──────────────────────────────────────────────
export const DEFAULT_DETAIL_MODAL = {
  visible: false,
  itemId: null,
  weight: "",
  karat: "",
  notes: "",
  customPrice: "",
};