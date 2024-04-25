// @ts-check

/**
 * Ipfs
 *
 * @export
 * @function Shadow
 * @param {CustomElementConstructor} [ChosenHTMLElement = HTMLElement]
 * @return {CustomElementConstructor | *}
 */
export default class Ipfs extends HTMLElement {
  constructor() {
    super()
    console.log('view hooked');
  }
}
