import {
  BrowserWindow,
  type BrowserWindowConstructorOptions,
  app,
  globalShortcut,
  screen,
} from 'electron'

let displays: Electron.Display[] = []
let wins: Electron.BrowserWindow[] = []

function createWindow() {
  wins = []

  displays.map(display => {
    const options = {
      x: display.bounds.x,
      y: display.bounds.y,
      width: display.bounds.width,
      height: display.bounds.height,
      transparent: true,
      frame: false,
      titleBarStyle: 'customButtonsOnHover',
      alwaysOnTop: true,
      hasShadow: false,
      webPreferences: {
        nodeIntegration: true,
      },
    } as BrowserWindowConstructorOptions

    wins.push(new BrowserWindow(options))
  })

  for (const win of wins) {
    // Allows the window stay on top of all other windows
    win.setAlwaysOnTop(true, 'screen-saver')
    // Keep the window on all workspaces
    win.setVisibleOnAllWorkspaces(true)
    // and load the index.html of the app.
    win.loadFile('src/renderer/index.html')
  }
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
    setTimeout(createWindow, 200)
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

const isMacOS = process.platform === 'darwin'

// Allows app display on top of fullscreen apps
if (isMacOS) {
  app.dock.hide()
}
