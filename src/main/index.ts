import {
  BaseWindow,
  WebContentsView,
  app,
  globalShortcut,
  screen,
  type BaseWindowConstructorOptions,
} from 'electron'

let displays: Electron.Display[] = []
let wins: Electron.BaseWindow[] = []

function createWindow() {
  displays.map(display => {
    const options = {
      x: display.bounds.x,
      y: display.bounds.y,
      width: display.bounds.width,
      height: display.bounds.height,
      transparent: true,
      frame: false,
      titleBarStyle: 'customButtonsOnHover',
      hasShadow: false,
      maximizable: false,
      resizable: false,
      fullscreenable: false,
      alwaysOnTop: true,
      backgroundColor: '#00000001',
      webPreferences: {
        nodeIntegration: true,
      },
    } as BaseWindowConstructorOptions

    const win = new BaseWindow(options)
    win.setAlwaysOnTop(true, 'screen-saver')
    win.setVisibleOnAllWorkspaces(true, {
      visibleOnFullScreen: true,
    })

    const view = new WebContentsView()
    view.setBounds({ x: display.bounds.x,
      y: display.bounds.y,
      width: display.bounds.width,
      height: display.bounds.height, 
    })
    view.setBackgroundColor('#00000001')
    // Allows the window stay on top of all other windows
    win.contentView.addChildView(view)
    view.webContents.loadFile('src/renderer/index.html')

    wins.push(win)
  })
}

let isVisible = true
function createShortcuts() {
  globalShortcut.register('Alt+Shift+w', () => {
    if (isVisible) {
      for (const win of wins) {
        win.destroy()
      }
    } else {
      createWindow()
    }

    isVisible = !isVisible
  })
}

// To enable transparency on Linux
if (process.platform === 'linux') {
  app.commandLine.appendSwitch('enable-transparent-visuals')
  app.disableHardwareAcceleration()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app
  .whenReady()
  .then(() => {
    displays = screen.getAllDisplays()
    setTimeout(() => {
      app.dock.hide(); 
      createWindow()
      app.dock.show();
    }, 200)
  })
  .then(createShortcuts)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})