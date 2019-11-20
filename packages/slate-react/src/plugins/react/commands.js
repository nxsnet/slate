import { Block } from 'slate'

/**
 * A set of commands for the React plugin.
 *
 * @return {Object}
 */

function CommandsPlugin() {
  /**
   * Takes a `node`, find the matching `domNode` and uses it to set the text
   * in the `node`.
   *
   * @param {Editor} editor
   * @param {Node} node
   */

  function reconcileNode(editor, node) {
    const { value } = editor
    const { document, selection } = value
    const path = document.getPath(node.key)

    const domElement = editor.findDOMNode(path)
    const block = document.getClosestBlock(path)

    // Get text information
    const { text } = node
    let { textContent: domText } = domElement

    const isLastNode = block.nodes.last() === node
    const lastChar = domText.charAt(domText.length - 1)

    // COMPAT: If this is the last leaf, and the DOM text ends in a new line,
    // we will have added another new line in <Leaf>'s render method to account
    // for browsers collapsing a single trailing new lines, so remove it.
    if (isLastNode && lastChar === '\n') {
      domText = domText.slice(0, -1)
    }

    // If the text is no different, abort.
    // Ignore all zero-width spaces here.  There will definitely be some in the dom
    // and we don't want those to make slate thing that the dom does not match the slate AST:
    if (text.replace(/[\uFEFF]/g, '') === domText.replace(/[\uFEFF]/g, ''))
      return

    let entire = selection.moveAnchorTo(path, 0).moveFocusTo(path, text.length)

    entire = document.resolveRange(entire)

    // Change the current value to have the leaf's text replaced.
    editor.insertTextAtRange(
      entire,
      domText.replace(/[\uFEFF]/g, ''),
      node.marks
    )
    return
  }

  /**
   * Takes text from the `domNode` and uses it to set the text in the matching
   * `node` in Slate.
   *
   * @param {Editor} editor
   * @param {DOMNode} domNode
   */

  function reconcileDOMNode(editor, domNode) {
    try {
      const domElement = domNode.parentElement.closest('[data-key]')
      const node = editor.findNode(domElement)
      editor.reconcileNode(node)
    } catch (e) {
      console.error(e)

      // Woo!  So, if we get here, something has gone horribly wrong and the browser has modified the dom in a way
      // that slate can no longer understand.  So, in this event, we are going to replace the entire line (which changes
      // the react key and forces react to re-build the dom), and this will get everything back into a working state
      // hopefully.
      const domElement =
        domNode.hasAttribute && domNode.hasAttribute('data-key')
          ? domNode
          : domNode.parentElement.closest('[data-key]')
      if (domElement == null) return

      const slateNode = editor.value.document.getChild(
        domNode.getAttribute('data-key')
      )
      if (slateNode == null) return

      const blockNode =
        slateNode.object === 'block'
          ? slateNode
          : editor.value.document.getClosestBlock(slateNode.key)
      if (blockNode == null) return

      editor.replaceNodeByKey(blockNode.key, Block.create(blockNode.toJSON()))
    }
  }

  return {
    commands: {
      reconcileNode,
      reconcileDOMNode,
    },
  }
}

export default CommandsPlugin
