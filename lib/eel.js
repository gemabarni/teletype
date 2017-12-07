const Dat = require('dat-node');

module.exports = class EELBackend {
  createHostPortalBinding() {
    return new Promise((resolve, reject) => {
      this.path = atom.project.rootDirectories[0].path;
      console.log('Eel path:', this.path);

      Dat(this.path, { live: true }, (err, dat) => {
        if (err) {
          return reject(err)
        }

        this.dat = dat;

        this.dat.importFiles({ watch: true })
        this.dat.joinNetwork({ live: true, upload: true, download: true })

        console.log('Dat ready:', this.dat)
        console.log('Dat public key:', this.dat.key.toString('hex'))

        // stats = this.dat.trackStats();
        // console.log('Eel stats:', stats);
        // stats.on('update', console.log);

        resolve(this.dat.key.toString('hex'))
      })
    })
  }

  createGuestPortalBinding(key) {
    return new Promise((resolve, reject) => {
      this.path = atom.project.rootDirectories[0].path;
      console.log('Eel path:', this.path);

      Dat(this.path, { key: key, live: true }, (err, dat) => {
        if (err) {
          return reject(err)
        }

        this.dat = dat;
        this.dat.joinNetwork({ live: true, upload: true, download: true })

        console.log('Dat ready', this.dat)
        console.log('Dat public key:', this.dat.key.toString('hex'))

        // stats = this.dat.trackStats()
        // console.log('Eel stats:', stats)
        // stats.on('update', console.log)

        resolve()
      })
    })
  }
}
