const { app, Menu, BrowserWindow, ipcMain, shell, dialog, } = require('electron');
const path = require('node:path');
const os = require('node:os');
const log = require('electron-log');

// 開発中はここをtrueにする
// trueにするとブラウザの開発ツールがアプリの画面に表示される
const isDev = false;

let mainWindow; // Main Window

const createWindow = () => {
  // Create the browser Main Window.
  mainWindow = new BrowserWindow({
    title: '画像リサイズ君',
    width: 500,
    height: 600,
    icon: `${__dirname}/assets/icons/Icon_256x256.png`,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  })
  
  mainWindow.loadFile('index.html')
  
  // Open the DevTools.
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
};

const createAboutWindow = () => {
  // Create the browser window.
  const aboutWindow = new BrowserWindow({
    title: 'About 画像リサイズ君',
    width: 300,
    height: 300,
    icon: `${__dirname}/assets/icons/Icon_256x256.png`,
    resizable: false,
    backgroundColor: 'white',
  })

  // load the about.html of the app.
  aboutWindow.loadFile(path.join(__dirname, `about.html`));
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  // Add menu
  const mainMenu = Menu.buildFromTemplate(menu)
  // Menu.setApplicationMenu(mainMenu)
  Menu.setApplicationMenu(null)

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

const menu = [
  ...(process.platform === 'darwin' ? [{ 
    label: app.name,
    submenu: [
      {
        label: '画像リサイズ君について',
        click: createAboutWindow
      },
      { type: 'separator' },
      {
        role: 'quit', // Include "Quit" for macOS
        label: app.name + 'を終了'
      }
    ]
   }] : [{
    label: 'ヘルプ',
    submenu: [
      {
        label: '画像リサイズ君について',
        click: createAboutWindow
      },
      {
        role: 'fileMenu',
      }
    ]
   }])
];

ipcMain.on('open-file-dialog', (event) => {
  dialog.showOpenDialog({
      properties: ['openFile'] // Open file dialog
  }).then(result => {
      if (!result.canceled) {
          // Send the selected file path back to the renderer process
          event.sender.send('selected-file', result.filePaths[0]);
      }
  }).catch(err => {
      log.error('Error selecting file:', err);
  });
});

ipcMain.on('image:minimize', async (e, options) => {
  options.destination = path.join(os.homedir(), 'image-resized');
  await resizeImage(options);
});


async function resizeImage({ imgPath, quality, destination }) {
  try {
    // Validate imgPath
    if (!imgPath) {
      throw new Error('画像パスの取得に失敗しました')
    }

    // Import the modules dynamically inside the function
    const { default: imageMin } = await import('imagemin')
    const { default: imageminMozjpeg } = await import('imagemin-mozjpeg')
    const { default: imageminPngquant } = await import('imagemin-pngquant')
    const { default: slash } = await import('slash')

    const normalizedImgPath = slash(imgPath)
    // Use the dynamically imported modules
    const files = await imageMin([normalizedImgPath], {
      destination: destination,
      plugins: [
        imageminMozjpeg({ quality }),
        imageminPngquant({
          quality: [quality / 100, quality / 100],
        }),
      ],
    })

    // Log the file
    log.info(slash(imgPath))
    // Open the destination directory
    shell.openPath(destination)

    // Send a message to the renderer process with the value of quality
    mainWindow.webContents.send('image:done')
    
  } catch (error) {
    log.error(error)
  }
}


if (process.platform === 'darwin') {
  menu.unshift({ role: 'appMenu' });
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
