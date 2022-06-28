import { isObject } from '@vue/shared'
import { ReactiveFlags, mutableHandlers } from './baseHandler'

const reactiveMap = new WeakMap()

// 将数据转换成响应式数据
export function reactive(target) {
  // 判断是不是对象，如果不是对象，直接返回
  if (!isObject(target))
    return

  // 如果已经被代理过了
  const existingProxy = reactiveMap.get(target)
  if (existingProxy)
    return existingProxy

  // 如果就是一个proxy
  if (target[ReactiveFlags.IS_REACTIVE])
    return target

  // 创建一个新的proxy
  const proxy = new Proxy(target, mutableHandlers)

  // 将proxy和target关联起来 保存到reactiveMap中
  reactiveMap.set(target, proxy)

  return proxy
}

// 1. proxy的get不能直接返回target[key]，要用Reflect
// 2. 同样的target，都用reactive，要做缓存
// 3. data -> proxy1 ，再去reactive proxy1, map找不到, 可以访问ReactiveFlags.IS_REACTIVE去判断是不是已经做了响应式处理

export function isReactive(value) {
  return !!(value && value[ReactiveFlags.IS_REACTIVE])
}
