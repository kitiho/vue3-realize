export function isObject(value) {
  return value !== null && typeof value === 'object'
}
export function isFunction(value) {
  return typeof value === 'function'
}
export const isArray = Array.isArray
export const assign = Object.assign
