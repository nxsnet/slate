import { Block } from 'slate'
import safelyGetParentKeyNode from './safely-get-parent-key-node'
import DATA_ATTRS from '../constants/data-attributes'

export default function sanitizeDomOnError(editor, domNode, fn) {
  try {
    return fn()
  } catch (e) {
    console.warn('Safely handling caught error, reconciling dom', e)

    // Woo!  So, if we get here, something has gone horribly wrong and the browser has modified the dom in a way
    // that slate can no longer understand.  So, in this event, we are going to replace the entire line (which changes
    // the react key and forces react to re-build the dom), and this will get everything back into a working state
    // hopefully.
    const domElement = safelyGetParentKeyNode(domNode)
    if (domElement == null) return

    const key = domElement.getAttribute(DATA_ATTRS.KEY)
    const slateNode = editor.value.document.getNode(key)
    if (slateNode == null) return

    const blockNode =
      slateNode.object === 'block'
        ? slateNode
        : editor.value.document.getClosestBlock(slateNode.key)
    if (blockNode == null) return

    editor.replaceNodeByKey(blockNode.key, Block.create(blockNode.toJSON()))
  }
}
