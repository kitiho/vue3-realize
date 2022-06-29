import { assign } from '@vue/shared'
import { nodeOps } from './nodeOps'
import { patchProp } from './patchProp'

const renderOptions = assign(nodeOps, { patchProp })
export { renderOptions }
