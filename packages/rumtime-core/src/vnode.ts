import { ShapeFlags, isArray, isString } from '@vue/shared'
export function isVNode(value) {
  return !!(value && value.__v_isVNode)
}
export const Text = Symbol('Text')
export function createVNode(type, props, children = null) {
  const shapeFlag = isString(type) ? ShapeFlags.ELEMENT : 0
  const vnode = {
    __v_isVNode: true,
    shapeFlag,
    type,
    props,
    children,
    key: props?.key,
    el: null,
  }
  if (children) {
    let childType = 0
    if (isArray(children)) {
      childType = ShapeFlags.ARRAY_CHILD
    }
    else {
      children = String(children)
      childType = ShapeFlags.TEXT_CHILD
    }
    vnode.shapeFlag |= childType
  }

  return vnode
}
