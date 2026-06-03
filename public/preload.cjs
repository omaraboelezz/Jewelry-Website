const { contextBridge, ipcRenderer } = require('electron');

// ✅ عرض APIs آمنة للـ Renderer Process
contextBridge.exposeInMainWorld('electron', {
  platform: process.platform,
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron,
  },
  // يمكنك إضافة APIs مخصصة هنا
  // مثال: إرسال إشعارات، حفظ ملفات، إلخ
});