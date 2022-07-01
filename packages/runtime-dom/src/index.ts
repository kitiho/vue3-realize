import { createRenderer, h } from '@vue/rumtime-core'
import { assign } from '@vue/shared'
import { nodeOps } from './nodeOps'
import { patchProp } from './patchProp'

const renderOptions = assign(nodeOps, { patchProp })

export function render(vnode, container) {
  createRenderer(renderOptions).render(vnode, container)
}

export * from '@vue/rumtime-core'
