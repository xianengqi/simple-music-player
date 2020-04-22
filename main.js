const { app, BrowserWindow, ipcMain, dialog } = require('electron')

const DataStore = require('./renderer/musicDataStore')

const myStore = new DataStore({ 'name': 'Music Data' })

console.log(app.getPath('userData'));
class AppWindow extends BrowserWindow {
  constructor(config, fileLocation) {
    const basicConfig = {
      width: 800,
      height: 600,
      webPreferences: {
        // 设置为true可以使用node的api
        nodeIntegration: true
      }
    }
    const finalConfig = { ...basicConfig, ...config }
    super(finalConfig)
    this.loadFile(fileLocation)
    this.once('ready-to-show', () => {
      this.show()
    })
  }
}

app.on('ready', () => {
  // 主窗口
  const mainWindow = new AppWindow({}, './renderer/index.html')
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('page did finish');
    mainWindow.send('getTracks', myStore.getTracks())
  })
  // ipcMain.on来获取子窗口
  ipcMain.on('add-music-window', () => {
    const addWindowMusic = new AppWindow({
      width: 600,
      height: 500,
      parent: mainWindow
    }, './renderer/addMusic.html')
  })

  // 数据持久化
  ipcMain.on('add-tracks', (event, tracks) => {
    const updateTracks = myStore.addTracks(tracks).getTracks()
    // console.log(updateTracks);
    mainWindow.send('getTracks', updateTracks)
  })
  // 删除音乐
  ipcMain.on('delete-track', (event, id) => {
    const updatedTracks = myStore.deleteTrack(id).getTracks()
    mainWindow.send('getTracks', updatedTracks)
  })

  ipcMain.on('open-music-file', (event) => {
    dialog.showOpenDialog({
      properties: [
        'openFile',
        'multiSelections'
      ],
      filters: [
        { name: 'Music', extensions: ['mp3'] }
      ]
    }).then(files => {
      if (files.filePaths) {
        event.sender.send('select-file', files.filePaths)
      }
    })
  })
})