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
  constructor() {
    super()
    this.loadDependency('Helia', 'helia.min.js').then(helia => console.log('controller hooked', {heliaClient: helia}))
    this.loadDependency('HeliaUnixfs', 'unixfs.min.js').then(HeliaUnixfs => console.log('controller hooked', {unixfsClient: HeliaUnixfs}))
    this.loadDependency('HeliaIpns', 'ipns.min.js').then(HeliaIpns => console.log('controller hooked', {ipnsClient: HeliaIpns}))
    this.loadDependency('HeliaJson', 'json.min.js').then(HeliaJson => console.log('controller hooked', {jsonClient: HeliaJson}))
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
