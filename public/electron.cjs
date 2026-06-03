// public/electron.cjs
const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const isDev = !app.isPackaged;

let mainWindow;
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      devTools: isDev,
      webSecurity: true, // ✅ أمان
      allowRunningInsecureContent: false, // ✅ أمان
    },
    icon: path.join(__dirname, 'icon.png'),
    show: false,
    backgroundColor: '#ffffff',
    autoHideMenuBar: !isDev, // ✅ إخفاء القائمة في Production
    titleBarStyle: 'default',
    frame: true, // ✅ إظهار إطار النافذة
  });

  const startUrl = isDev
    ? 'http://localhost:5173'
    : 'https://elsaudi-jewelry.vercel.app/';

  mainWindow.loadURL(startUrl);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // ✅ إظهار النافذة بعد التحميل الكامل
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  // ✅ معالجة أخطاء التحميل
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {

    // في Production، حاول إعادة التحميل
    if (!isDev) {
      setTimeout(() => {
        mainWindow.loadURL(startUrl);
      }, 1000);
    }
  });

  // ✅ منع الروابط الخارجية من فتح نوافذ جديدة
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    // افتح الروابط الخارجية في المتصفح الافتراضي
    if (url.startsWith('http://') || url.startsWith('https://')) {
      require('electron').shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  // ✅ منع التنقل لروابط خارجية
  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    const currentUrl = mainWindow.webContents.getURL();

    // السماح فقط بالتنقل داخل التطبيق
    if (isDev) {
      if (parsedUrl.origin !== 'http://localhost:5173') {
        event.preventDefault();
      }
    } else {
      if (!navigationUrl.startsWith('https://elsaudi-jewelry.vercel.app')) {
        event.preventDefault();
      }
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // ✅ إنشاء قائمة مخصصة
  createMenu();
}

// ✅ إنشاء Application Menu
function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            if (mainWindow) mainWindow.reload();
          }
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'delete' },
        { type: 'separator' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    }
  ];

  // إضافة DevTools menu في Development فقط
  if (isDev) {
    template.push({
      label: 'Developer',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        {
          label: 'Clear Cache',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.session.clearCache();
            }
          }
        }
      ]
    });
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// ✅ إنشاء النافذة عند جاهزية التطبيق
app.whenReady().then(() => {
  createWindow();

  // ✅ على Mac، إعادة إنشاء النافذة عند الضغط على أيقونة Dock
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// ✅ إغلاق التطبيق عند إغلاق جميع النوافذ (ماعدا macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// ✅ تعطيل تحذيرات Security (في Development فقط)
if (isDev) {
  process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';
}