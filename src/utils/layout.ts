import { LEFT, RIGHT, SIDE } from '../const'
import type { Children } from '../types/dom'
import type { Layout, LayoutChildren, JudgeDirection } from '../types/function'
import type { MindElixirInstance, NodeObj } from '../types/index'
import { createExpander, shapeTpc } from './dom'

const $d = document

// Set main nodes' direction and invoke layoutChildren()
export const layout: Layout = function () {
  console.time('layout')
  this.nodes.innerHTML = ''

  const tpc = this.createTopic(this.nodeData)
  shapeTpc(tpc, this.nodeData) // shape root tpc
  tpc.draggable = false
  const root = $d.createElement('me-root')
  root.appendChild(tpc)

  const mainNodes = this.nodeData.children
  if (!mainNodes || mainNodes.length === 0) return
  if (this.direction === SIDE) {
    // initiate direction of main nodes
    let lcount = 0
    let rcount = 0
    mainNodes.map(node => {
      if (node.direction === LEFT) {
        lcount += 1
      } else if (node.direction === RIGHT) {
        rcount += 1
      } else {
        if (lcount <= rcount) {
          node.direction = LEFT
          lcount += 1
        } else {
          node.direction = RIGHT
          rcount += 1
        }
      }
    })
  }
  layoutMainNode(this, mainNodes, root)
  console.timeEnd('layout')
}

const layoutMainNode = function (mei: MindElixirInstance, data: NodeObj[], root: HTMLElement) {
  const leftPart = $d.createElement('me-main')
  leftPart.className = 'lhs'
  const rightPart = $d.createElement('me-main')
  rightPart.className = 'rhs'
  for (let i = 0; i < data.length; i++) {
    const nodeObj = data[i]
    const grp = $d.createElement('me-wrapper')
    const top = mei.createParent(nodeObj)
    if (nodeObj.children && nodeObj.children.length > 0) {
      top.appendChild(createExpander(nodeObj.expanded))
      grp.appendChild(top)
      if (nodeObj.expanded !== false) {
        const children = mei.layoutChildren(nodeObj.children)
        grp.appendChild(children)
      }
    } else {
      grp.appendChild(top)
    }
    if (nodeObj.direction === LEFT) {
      leftPart.appendChild(grp)
    } else {
      rightPart.appendChild(grp)
    }
  }

  mei.nodes.appendChild(leftPart)
  mei.nodes.appendChild(root)
  mei.nodes.appendChild(rightPart)

  mei.nodes.appendChild(mei.lines)
}

/**
 * traversal data and generate dom structure of mind map
 * @ignore
 * @param {object} data node data object
 * @param {object} container node container(optional)
 * @param {number} direction main node direction(optional)
 * @return {ChildrenElement} children element.
 */
export const layoutChildren: LayoutChildren = function (data) {
  const chldr = $d.createElement('me-children') as Children

  for (let i = 0; i < data.length; i++) {
    const nodeObj = data[i]
    const grp = $d.createElement('me-wrapper')
    const top = this.createParent(nodeObj)

    if (nodeObj.children && nodeObj.children.length > 0) {
      top.appendChild(createExpander(nodeObj.expanded))
      grp.appendChild(top)
      if (nodeObj.expanded !== false) {
        const children = this.layoutChildren(nodeObj.children)
        grp.appendChild(children)
      }
    } else {
      grp.appendChild(top)
    }
    chldr.appendChild(grp)
  }
  return chldr
}

// Judge new added node L or R
export const judgeDirection: JudgeDirection = function (mainNode, obj) {
  if (this.direction === LEFT) {
    mainNode.className = 'lhs'
  } else if (this.direction === RIGHT) {
    mainNode.className = 'rhs'
  } else if (this.direction === SIDE) {
    const l = $d.querySelectorAll('.lhs').length
    const r = $d.querySelectorAll('.rhs').length
    if (l <= r) {
      mainNode.className = 'lhs'
      obj.direction = LEFT
    } else {
      mainNode.className = 'rhs'
      obj.direction = RIGHT
    }
  }
}
