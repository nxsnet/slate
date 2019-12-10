import React from 'react'
import { IS_FIREFOX } from 'slate-dev-environment'

import OffsetKey from '../utils/offset-key'
import DATA_ATTRS from '../constants/data-attributes'

export default class Leaf extends React.Component {
  constructor(props) {
    super(props)
    this.ref = React.createRef()
    // This component may have skipped rendering due to native operations being
    // applied. If an undo is performed React will see the old and new shadow DOM
    // match and not apply an update. Forces each render to actually reconcile.
    this.forceUpdateFlag = false
  }

  shouldComponentUpdate(nextProps) {
    // If a native operation has made the text content the same as what
    // we are going to make it, skip. Maintains the native spell check handling.
    const isZeroWidth = nextProps.text === ''
    const domNode = this.ref.current
    const domTextContent = domNode.textContent
    const reactTextContent = isZeroWidth ? '\uFEFF' : nextProps.text

    if (domTextContent !== reactTextContent) {
      return true
    }

    const oldDecorations = this.props.decorations.map(d => d.type).join(' ')
    const newDecorations = nextProps.decorations.map(d => d.type).join(' ')

    if (oldDecorations !== newDecorations) {
      return true
    }

    // If we should be a zero width node, but there is some text content in the dom, then allow react to clean it up
    if (isZeroWidth && domTextContent.replace(/[\uFEFF]/g, '') !== '') {
      return true
    }

    const isOnly =
      nextProps.parent.nodes.size === 1 && nextProps.leaves.length === 1
    const isLineBreak = false
    const shouldHaveLineBreak =
      (IS_FIREFOX && isLineBreak) || (!IS_FIREFOX && (isLineBreak || isOnly))

    // Otherwise, we shouldn't have to touch the text node at all, we might need to strip the zero-width attributes though!
    if (!isZeroWidth) {
      if (domNode.hasAttribute(DATA_ATTRS.ZERO_WIDTH)) {
        domNode.removeAttribute(DATA_ATTRS.ZERO_WIDTH)
      }

      if (domNode.hasAttribute(DATA_ATTRS.LENGTH)) {
        domNode.removeAttribute(DATA_ATTRS.LENGTH)
      }

      if (!domNode.hasAttribute(DATA_ATTRS.STRING)) {
        domNode.setAttribute(DATA_ATTRS.STRING, 'true')
      }
    } else {
      if (!domNode.hasAttribute(DATA_ATTRS.ZERO_WIDTH)) {
        domNode.setAttribute(DATA_ATTRS.ZERO_WIDTH, 'n')
      }

      if (!domNode.hasAttribute(DATA_ATTRS.LENGTH)) {
        domNode.setAttribute(DATA_ATTRS.LENGTH, '0')
      }

      if (domNode.hasAttribute(DATA_ATTRS.STRING)) {
        domNode.removeAttribute(DATA_ATTRS.STRING, 'true')
      }
    }

    if (!shouldHaveLineBreak) {
      for (const child of domNode.childNodes) {
        if (child.tagName === 'BR') {
          domNode.removeChild(child)
        }
      }
    } else {
      let hasLineBreak = false

      for (const child of domNode.childNodes) {
        if (child.tagName === 'BR') {
          hasLineBreak = true
          break
        }
      }

      if (!hasLineBreak) {
        domNode.appendChild(window.document.createElement('br'))
      }
    }

    return false
  }

  componentDidMount() {
    this.forceUpdateFlag = !this.forceUpdateFlag
  }

  componentDidUpdate() {
    this.forceUpdateFlag = !this.forceUpdateFlag
  }

  render() {
    const {
      decorations,
      node,
      index,
      offset,
      text,
      editor,
      parent,
      leaves,
    } = this.props

    const offsetKey = OffsetKey.stringify({
      key: node.key,
      index,
    })
    const isOnly = parent.nodes.size === 1 && leaves.length === 1
    const isLineBreak = false
    const isZeroWidth = text === ''
    const shouldHaveLineBreak =
      (IS_FIREFOX && isLineBreak) || (!IS_FIREFOX && (isLineBreak || isOnly))

    const attrs = {
      [DATA_ATTRS.LEAF]: true,
      [DATA_ATTRS.OFFSET_KEY]: offsetKey,
      key: this.forceUpdateFlag ? 'A' : 'B',
    }

    let children = isZeroWidth ? (
      <span
        ref={this.ref}
        {...{
          [DATA_ATTRS.ZERO_WIDTH]: isLineBreak ? 'n' : 'z',
          [DATA_ATTRS.LENGTH]: 0,
        }}
      >
        {'\uFEFF'}
        {shouldHaveLineBreak ? <br /> : null}
      </span>
    ) : (
      <span
        ref={this.ref}
        {...{
          [DATA_ATTRS.STRING]: true,
        }}
      >
        {text}
        {shouldHaveLineBreak ? <br /> : null}
      </span>
    )

    if (text !== '') {
      for (const decoration of decorations) {
        const ret = editor.run('renderDecoration', {
          editor,
          decorations,
          node,
          offset,
          text,
          decoration,
          children,
          attributes: {
            [DATA_ATTRS.OBJECT]: 'decoration',
          },
        })

        if (ret) {
          children = ret
        }
      }
    }
    return <span {...attrs}>{children}</span>
  }
}
