'use strict'

import { app, protocol, BrowserWindow, ipcMain } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS3_DEVTOOLS } from 'electron-devtools-installer'
const isDevelopment = process.env.NODE_ENV !== 'production'

//update 추가
import { autoUpdater } from "electron-updater"

let win;

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

async function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION
    }
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS3_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  createWindow()
  let a = autoUpdater.checkForUpdates() 
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}

// HelloWorld.vue 안의 ipcRender.send 를 통해 호출되면 app_version을 확인한 후 HelloWorld.vue 로 보냄 
ipcMain.on('app_version',(event)=>{
  event.sender.send('app_version',{
    version:app.getVersion()
  })
})
// HelloWorld.vue 안의 ipcRender.send 를 통해 호출되면 앱을 종료하고 install을 시작함
ipcMain.on('restart_app',()=>{
  autoUpdater.quitAndInstall();
})


// 업데이트 오류시
autoUpdater.on('error', function(error) {
  win.webContents.send('error')
  console.error('error', error);
});

// 업데이트 체크
autoUpdater.on('checking-for-update',  () => {
  win.webContents.send('checking-for-update')
  console.log('checking-for-update');
});

// 업데이트할 내용이 있을 때
autoUpdater.on('update-available',  () => {
  win.webContents.send('update-available')
  console.log('A new update is available');
});

// 업데이트할 내용이 없을 때
autoUpdater.on('update-not-available',  () => {
  win.webContents.send('update-not-available')
  console.log('update-not-available');
});

//다운로드 완료되면 업데이트
autoUpdater.on('update-downloaded',  () => {
  console.log('update-downloaded');
  win.webContents.send('update-downloaded')
});