import AfterPlugin from './after'
import BeforePlugin from './before'

/**
 * A plugin that adds the browser-specific logic to the editor.
 *
 * @param {Object} options
 * @return {Object}
 */

export default function DOMPlugin(options = {}) {
  const { plugins = [] } = options
  return [BeforePlugin(), ...plugins, AfterPlugin()]
}
