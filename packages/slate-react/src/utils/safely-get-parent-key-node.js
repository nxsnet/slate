import SELECTORS from '../constants/selectors'

export default function safelyGetParentKeyNode(node) {
  if (node == null) return null

  if (node.closest == null) node = node.parentElement
  if (node.hasAttribute(SELECTORS.KEY)) return node
  return node.closest(SELECTORS.KEY)
}
