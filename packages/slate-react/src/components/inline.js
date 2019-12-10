import React from 'react'

import DATA_ATTRS from '../constants/data-attributes'

export default class Inline extends React.Component {
  ref = React.createRef()

  shouldComponentUpdate(nextProps) {
    return this.props.node !== nextProps.node
  }

  render() {
    const { editor, node, parent } = this.props

    // Attributes that the developer must mix into the element in their
    // custom node renderer component.
    const attributes = {
      [DATA_ATTRS.OBJECT]: node.object,
      [DATA_ATTRS.KEY]: node.key,
      ref: this.ref,
    }

    return editor.run('renderInline', {
      attributes,
      editor,
      node,
      parent,
    })
  }
}
