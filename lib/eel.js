const hypercore = require('hypercore');
const hyperdiscovery = require('hyperdiscovery');
const ram = require('random-access-memory');
const Dat = require('dat-node');
const { EventEmitter } = require('events')

module.exports = class EELBackend extends EventEmitter {
  constructor() {
    super()
    this.portals = {};
    this.feed = null;
  }

  createHostPortalBinding() {
    return new Promise((resolve, reject) => {
      this.path = atom.project.rootDirectories[0].path;
      console.log('Eel path:', this.path);
      this.feed = hypercore(() => { return ram() }, { valueEncoding: 'json' });

      this.feed.on('ready', () => {
        console.log('FEED READY', this.feed)
        console.log('FEED PUBLIC KEY:', this.feed.key.toString('hex'))

        var sw = hyperdiscovery(this.feed, { live: true })
        sw.on('connection', (peer, type) => {
          console.log('connected to', sw.connections.length, 'peers')
          peer.on('close', () => {
            console.log('peer disconnected')
          })
        })
      })

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

        this.feed.append({ event: 'dat', key: this.dat.key.toString('hex') })

        resolve(this.feed.key.toString('hex'))
      })
    })
  }

  createGuestPortalBinding(key) {
    return new Promise((resolve, reject) => {
      this.path = atom.project.rootDirectories[0].path;
      console.log('Eel path:', this.path);
      var feed = hypercore(function() { return ram() }, key, { valueEncoding: 'json' })

      feed.on('ready', () => {
        console.log('FEED READY', feed)
        console.log('FEED PUBLIC KEY:', feed.key.toString('hex'))

        var sw = hyperdiscovery(feed, { live: true })
        sw.on('connection', function (peer, type) {
          console.log('connected to', sw.connections.length, 'peers')
          peer.on('close', function () {
            console.log('peer disconnected')
          })
        })

        feed.get(0, (err, data) => {
          console.log(data)
          if (data.event === 'dat') {
            console.log('DAT', data)
              Dat(this.path, { key: data.key, live: true }, (err, dat) => {
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
          } else {
              throw Error('WTF')
          }

          var rs = feed.createReadStream({live: true})
          rs.on('data', (data) => {
            console.log('STREAM DATA', data);
            if (data.event === 'portal-open') {
              console.log('PORTAL OPEN', data.uuid, data.file);
              this.portals[data.file] = data.uuid;
              // console.log(this.portals);
              this.emit('portal-open', { file: data.file, id: data.uuid })
            }
            if (data.event === 'portal-close') {
              console.log('PORTAL CLOSE', data.file);
              delete this.portals[data.file];
              console.log(this.portals);
            }
          })
        });

      })
    })
  }

  portalOpen(id, filename) {
    if (!this.feed)
      throw Error('Allow only from master')

    console.log('Append portal-open', { event: 'portal-open', uuid: id, file: filename })
    this.feed.append({ event: 'portal-open', uuid: id, file: filename });
  }

  portalClose(filename) {
    if (!this.feed)
      throw Error('Allow only from master')

    console.log('Append portal-close', { event: 'portal-close', file: filename })
    this.feed.append({ event: 'portal-close', file: filename });
  }

  portalUuid(filename) {
    if (this.portals[filename])
      return this.portals[filename];

    return null;
  }
}
