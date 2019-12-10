import React from 'react'

import Block from './block'
import Inline from './inline'
import Text from './text'

export default class Document extends React.Component {
  tmp = { nodeRefs: {} }

  shouldComponentUpdate(nextProps) {
    return this.props.node !== nextProps.node
  }

  render() {
    const { editor, node } = this.props

    const children = []

    for (const child of node.nodes) {
      const Component =
        child.object === 'text'
          ? Text
          : child.object === 'block' ? Block : Inline
      const i = children.length

      children.push(
        <Component
          key={child.key}
          editor={editor}
          node={child}
          parent={node}
          // COMPAT: We use this map of refs to lookup a DOM node down the
          // tree of components by path.
          ref={ref => {
            if (ref) {
              this.tmp.nodeRefs[i] = ref
            } else {
              delete this.tmp.nodeRefs[i]
            }
          }}
        />
      )
    }

    return children
  }
}
