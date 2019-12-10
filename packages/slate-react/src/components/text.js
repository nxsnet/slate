import React from 'react'

import Leaf from './leaf'
import DATA_ATTRS from '../constants/data-attributes'

/**
 * Text node.
 *
 * @type {Component}
 */

const Text = React.forwardRef((props, ref) => {
  const { decorations, node, parent, editor, style } = props
  const { key } = node
  const leaves = node.getLeaves(decorations)
  let at = 0

  return (
    <span
      ref={ref}
      style={style}
      {...{
        [DATA_ATTRS.OBJECT]: node.object,
        [DATA_ATTRS.KEY]: key,
      }}
    >
      {leaves.map((leaf, index) => {
        const { text } = leaf
        const offset = at
        at += text.length

        return (
          <Leaf
            key={`${node.key}-${index}`}
            block={parent}
            editor={editor}
            index={index}
            decorations={leaf.decorations}
            node={node}
            offset={offset}
            parent={parent}
            leaves={leaves}
            text={text}
          />
        )
      })}
    </span>
  )
})

/**
 * Export.
 *
 * @type {Component}
 */

export default Text
