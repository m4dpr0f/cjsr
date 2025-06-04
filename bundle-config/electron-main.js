const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets/icon.png'),
    title: 'ChickenJockey Scribe Racer - Matrix Federation Node',
    show: false
  });

  // Load the app
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile('dist/index.html');
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Create application menu
  createMenu();
}

function createMenu() {
  const template = [
    {
      label: 'Game',
      submenu: [
        {
          label: 'New Race',
          accelerator: 'CmdOrCtrl+N',
          click: () => mainWindow.webContents.send('menu-new-race')
        },
        {
          label: 'Quick Practice',
          accelerator: 'CmdOrCtrl+P',
          click: () => mainWindow.webContents.send('menu-practice')
        },
        { type: 'separator' },
        {
          label: 'Matrix Federation',
          submenu: [
            {
              label: 'Connect to Federation',
              click: () => mainWindow.webContents.send('menu-federation-connect')
            },
            {
              label: 'Start Local Server',
              click: () => mainWindow.webContents.send('menu-start-server')
            },
            {
              label: 'Federation Settings',
              click: () => mainWindow.webContents.send('menu-federation-settings')
            }
          ]
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => app.quit()
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' }
      ]
    }
  ];

  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    });
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// IPC handlers for federation features
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('show-federation-dialog', async () => {
  const result = await dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'CJSR Matrix Federation',
    message: 'Connect to the global CJSR network?',
    detail: 'This will allow you to race against players from other servers and share progress across the federation.',
    buttons: ['Connect', 'Start Local Server', 'Cancel'],
    defaultId: 0,
    cancelId: 2
  });
  return result.response;
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
  });
});