import { ShapeFlags, isString } from '@vue/shared'
import { Text, createVNode } from './vnode'

export function createRenderer(renderOptions) {
  const {
    insert: hostInsert,
    remove: hostRemove,
    setElementText: hostSetElementText,
    setText: hostSetText,
    parentNode: hostParentNode,
    nextSibling: hostNextSibling,
    createElement: hostCreateElement,
    createText: hostCreateText,
    patchProp: hostPatchProp,
  } = renderOptions

  function normalize(child) {
    if (isString(child))
      return createVNode(Text, null, child)

    return child
  }
  function mountChildren(children, container) {
    children.forEach((child) => {
      child = normalize(child)
      patch(null, child, container)
    })
  }
  function mountElement(vnode, container) {
    const { type, props, children, shapeFlag } = vnode
    const el = vnode.el = hostCreateElement(type, props)
    if (props) {
      for (const key in props)
        hostPatchProp(el, key, null, props[key])
    }
    if (shapeFlag & ShapeFlags.TEXT_CHILD)
      hostSetElementText(el, children)
    else if (shapeFlag & ShapeFlags.ARRAY_CHILD)
      mountChildren(children, el)

    hostInsert(el, container)
  }
  function processText(n1, n2, container) {
    if (n1 === null)
      hostInsert((n2.el = hostCreateText(n2.children, container)), container)
  }

  function patch(n1, n2, container) {
    if (n1 === n2)
      return

    if (n1 === null) {
      const { type, shapeFlag } = n2
      switch (type) {
        case Text:
          processText(n1, n2, container)
          break
        default:
          if (shapeFlag & ShapeFlags.ELEMENT)
            mountElement(n2, container)
      }
    }
    else {

    }
  }

  const render = (vnode, container) => {
    if (vnode === null) {
      // unmount()
    }
    else {
      patch(container._vnode || null, vnode, container)
      container._vnode = vnode
    }
  }
  return { render }
}
