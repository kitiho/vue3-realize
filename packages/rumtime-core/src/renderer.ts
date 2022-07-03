import { ShapeFlags, isString } from '@vue/shared'
import { Text, createVNode, isSameVNode } from './vnode'

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

  // 将string arr 转成vnode arr
  function normalize(children, index) {
    if (isString(children[index])) {
      const vnode = createVNode(Text, null, children[index])
      children[index] = vnode
    }
    return children[index]
  }

  // 渲染children
  function mountChildren(children, container) {
    children.forEach((child, index) => {
      // 遍历一遍children 如果是string需要标准化处理一下 然后进行patch
      child = normalize(children, index)
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
    // 如果n1没有，则直接插入
    if (n1 === null) { hostInsert((n2.el = hostCreateText(n2.children, container)), container) }
    else {
      // 如果n1是有的
      const el = n2.el = n1.el
      if (n2.children !== n1.children)
        hostSetText(el, n2.children)
    }
  }

  function patchProps(oldProps, newProps, el) {
    for (const key in newProps)
      hostPatchProp(el, key, oldProps[key], newProps[key])

    for (const key in oldProps) {
      if (!(key in newProps))
        hostPatchProp(el, key, oldProps[key], null)
    }
  }
  function unmountChildren(children) {
    children.forEach(unmount)
  }
  // 全量更新
  function patchKeyChildren(c1, c2, el) {
    let i = 0
    let e1 = c1.length - 1
    let e2 = c2.length - 1
    // 从头
    while (i <= e1 && i <= e2) {
      const n1 = c1[i]
      const n2 = c2[i]
      if (isSameVNode(n1, n2))
        patch(n1, n2, el) // 比较两个节点的属性和children
      else
        break
      i++
    }

    // 从尾
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1]
      const n2 = c2[e2]
      if (isSameVNode(n1, n2))
        patch(n1, n2, el) // 比较两个节点的属性和children
      else
        break
      e1--
      e2--
    }

    console.log(i, e1, e2)
  }
  function patchChildren(n1, n2, el) {
    const c1 = n1 && n1.children
    const c2 = n2 && n2.children
    const prevShapeFlag = n1.shapeFlag
    const shapeFlag = n2.shapeFlag
    if (shapeFlag & ShapeFlags.TEXT_CHILD) {
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILD)
        unmountChildren(c1)
      if (c1 !== c2)
        hostSetElementText(el, c2)
    }
    else {
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILD) {
        if (shapeFlag & ShapeFlags.ARRAY_CHILD) {
          // diff
          patchKeyChildren(c1, c2, el) // 全量更新
        }
        else {
          unmountChildren(c1)
        }
      }
      else {
        // TODO
        if (prevShapeFlag & ShapeFlags.TEXT_CHILD)
          hostSetElementText(el, '')

        if (shapeFlag & ShapeFlags.ARRAY_CHILD)
          mountChildren(c2, el)
      }
    }
  }
  function patchElement(n1, n2, container) {
    const el = n2.el = n1.el
    const oldProps = n1.props || {}
    const newProps = n2.props || {}
    patchProps(oldProps, newProps, el)
    patchChildren(n1, n2, el)
  }
  function processElement(n1, n2, container) {
    if (n1 === null)
      mountElement(n2, container)

    else
      patchElement(n1, n2, container)
  }

  function patch(n1, n2, container) {
    // 如果前后是同一个节点 什么都不做
    if (n1 === n2)
      return

    // 如果n1 n2不相同 先把n1 unmount 置为null
    if (n1 && !isSameVNode(n1, n2)) {
      unmount(n1)
      n1 = null
    }

    const { type, shapeFlag } = n2
    // n2新的节点的type的不同类型
    switch (type) {
      case Text:
        processText(n1, n2, container)
        break
      default:
        if (shapeFlag & ShapeFlags.ELEMENT)
          processElement(n1, n2, container)
    }
  }

  function unmount(vnode) {
    hostRemove(vnode.el)
  }
  const render = (vnode, container) => {
    if (vnode === null) {
      if (container._vnode)
        unmount(container._vnode)
    }
    else {
      patch(container._vnode || null, vnode, container)
      container._vnode = vnode
    }
  }
  return { render }
}
