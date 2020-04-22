const Store = require('electron-store');
const { v4: uuidv4 } = require('uuid');
const path = require('path')

class DataStore extends Store {
  constructor(settings) {
    super(settings)
    this.tracks = this.get('tracks') || []
  }
  // 保存音乐文件的数据
  saveTracks() {
    this.set('tracks', this.tracks)
    return this
  }
  getTracks() {
    return this.get('tracks') || []
  }
  addTracks(tracks) {
    const tracksWithProps = tracks.map(track => {
      return {
        id: uuidv4(),
        path: track,
        fileName: path.basename(track)
      }
    }).filter(track => {
      const currentTracksPath = this.getTracks().map(track => track.path)
      return currentTracksPath.indexOf(track.path) < 0
    })
    // 我们用展开操作符
    this.tracks = [...this.tracks, ...tracksWithProps]
    return this.saveTracks()
  }

  deleteTrack(deleteId) {
    this.tracks = this.tracks.filter(item => item.id !== deleteId)
    return this.saveTracks()
  }
}

module.exports = DataStore