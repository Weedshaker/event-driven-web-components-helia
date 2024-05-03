// @ts-check

/**
 * https://helia.io/
 * expl.: https://github.com/ipfs-examples/helia-examples/blob/main/examples/helia-esbuild/src/index.js
 * 
 *
 * @export
 * @param {CustomElementConstructor} [ChosenHTMLElement = HTMLElement]
 * @return {CustomElementConstructor | *}
 */
export default class Ipfs extends HTMLElement {
  async connectedCallback () {
    // https://github.com/ipfs-examples/helia-101/blob/main/301-networking.js

    // try next: https://sgtpooki-helia-playground.on.fleek.co/

    
    // create two helia nodes
    const node1 = await this.createNode()
    //const node2 = await this.createNode()
    
    // connect them together
    /*
    const multiaddrs = node2.libp2p.getMultiaddrs()
    if (multiaddrs[0]) await node1.libp2p.dial(multiaddrs[0])
    */
    
    // create a filesystem on top of Helia, in this case it's UnixFS
    const fs = await this.getUnixfs(node1)

    // we will use this TextEncoder to turn strings into Uint8Arrays
    const encoder = new TextEncoder()

    // add the bytes to your node and receive a unique content identifier
    const cid = await fs.addBytes(encoder.encode('Hello World Dude'))

    console.log('Added file:', cid.toString())

    // create a filesystem on top of the second Helia node
    //const fs2 = await this.getUnixfs(node2)
    const fs2 = await this.getUnixfs(node1)

    // this decoder will turn Uint8Arrays into strings
    const decoder = new TextDecoder()
    let text = ''

    // use the second Helia node to fetch the file from the first Helia node
    for await (const chunk of fs2.cat(cid)) {
      text += decoder.decode(chunk, {
        stream: true
      })
    }

    console.log('Fetched file contents:', text)
  }

  /**
   * unixfs
   *
   * @returns {Promise<any>}
   */
  getUnixfs (node = this.createNode()) {
    return Promise.all([
      this.loadDependency('HeliaUnixfs', 'unixfs.min.js'),
      node
    ]).then(([unixfs, node]) => unixfs.unixfs(node))
  }

  /**
   * ipns
   *
   * @returns {Promise<any>}
   */
  getIpns (node = this.createNode()) {
    return Promise.all([
      this.loadDependency('HeliaIpns', 'ipns.min.js'),
      node
    ]).then(([ipns, node]) => ipns.ipns(node))
  }

  /**
   * json
   *
   * @returns {Promise<any>}
   */
  getJson (node = this.createNode()) {
    return Promise.all([
      this.loadDependency('HeliaJson', 'json.min.js'),
      node
    ]).then(([json, node]) => json.json(node))
  }

  /**
   * create helia node
   *
   * @returns {Promise<any>}
   */
  createNode () {
    // code adjusted from example https://github.com/ipfs-examples/helia-examples/blob/main/examples/helia-101/README.md
    // libp2p
    const storesAndLibp2p = Promise.all([
      this.loadDependency('ChainsafeLibp2PNoise', 'libp2p-noise.min.js'),
      this.loadDependency('ChainsafeLibp2PYamux', 'libp2p-yamux.min.js'),
      this.loadDependency('Libp2PBootstrap', 'bootstrap.min.js'),
      this.loadDependency('Libp2PIdentify', 'identify.min.js'),
      this.loadDependency('Libp2PWebsockets', 'websockets.min.js'),
      this.loadDependency('BlockstoreCore', 'blockstore-core.min.js'),
      this.loadDependency('DatastoreCore', 'datastore-core.min.js'),
      this.loadDependency('Libp2P', 'libp2p.min.js')
    ]).then(([noise, yamux, bootstrap, identify, websockets, BlockstoreCore, DatastoreCore, libp2p]) => {
      const datastore = new DatastoreCore.MemoryDatastore()
      const blockstore = new BlockstoreCore.MemoryBlockstore()
      return {
        datastore,
        blockstore,
        libp2p: libp2p.createLibp2p({
          datastore,
          transports: [
            websockets.webSockets()
          ],
          connectionEncryption: [
            noise.noise()
          ],
          streamMuxers: [
            yamux.yamux()
          ],
          peerDiscovery: [
            bootstrap.bootstrap({
              list: [
                '/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN',
                '/dnsaddr/bootstrap.libp2p.io/p2p/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa',
                '/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb',
                '/dnsaddr/bootstrap.libp2p.io/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt'
              ]
            })
          ],
          services: {
            identify: identify.identify()
          }
        })
      }
    })
    // helia
    return Promise.all([
      this.loadDependency('Helia', 'helia.min.js'),
      storesAndLibp2p
    ]).then(([helia, storesAndLibp2p]) => {
      const {datastore, blockstore, libp2p} = storesAndLibp2p
      return helia.createHelia({
        datastore,
        blockstore,
        libp2p
      })
    })
  }

  /**
   * fetch dependency
   *
   * @returns {Promise<any>}
   */
  loadDependency (globalNamespace, fileName) {
    // make it global to self so that other components can know when it has been loaded
    return this[`_loadDependency${globalNamespace}`] || (this[`_loadDependency${globalNamespace}`] = new Promise((resolve, reject) => {
      // @ts-ignore
      if (document.head.querySelector(`#${globalNamespace}`) || self[globalNamespace]) return resolve(self[globalNamespace])
      const script = document.createElement('script')
      script.setAttribute('type', 'module')
      script.setAttribute('async', '')
      script.setAttribute('id', globalNamespace)
      script.setAttribute('src', `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}../helia_dist/${fileName}`)
      // @ts-ignore
      script.onload = () => self[globalNamespace]
        // @ts-ignore
        ? resolve(self[globalNamespace])
        : reject(new Error(`${globalNamespace} does not load into the global scope!`))
      document.head.appendChild(script)
    }))
  }
}
