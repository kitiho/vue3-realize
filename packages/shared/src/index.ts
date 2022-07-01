export function isObject(value) {
  return value !== null && typeof value === 'object'
}
export function isFunction(value) {
  return typeof value === 'function'
}
export const isArray = Array.isArray
export const isString = value => typeof value === 'string'
export const assign = Object.assign

export const enum ShapeFlags {
  ELEMENT = 1,
  FUNCTIONAL_COMPONENT = 1 << 1,
  STATEFUL_COMPONENT = 1 << 2,
  TEXT_CHILD = 1 << 3,
  ARRAY_CHILD = 1 << 4,
  SLOTS_CHILD = 1 << 5,
  TELEPORT = 1 << 6,
  SUSPENSE = 1 << 7,
  COMPONENT_SHOULD_KEEP_ALIVE = 1 << 8,
  COMPONENT_KEPT_ALIVE = 1 << 9,
  COMPONENT = ShapeFlags.STATEFUL_COMPONENT | ShapeFlags.FUNCTIONAL_COMPONENT,
}
