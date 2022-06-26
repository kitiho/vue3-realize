import { isObject } from '@vue/shared'
import { ReactiveFlags, mutableHandlers } from './baseHandler'

const reactiveMap = new WeakMap()

// 将数据转换成响应式数据
export function reactive(target) {
  if (!isObject(target))
    return

  const existingProxy = reactiveMap.get(target)
  if (existingProxy)
    return existingProxy

  // #3
  if (target[ReactiveFlags.IS_REACTIVE])
    return target

  // 创建Proxy
  const proxy = new Proxy(target, mutableHandlers)

  reactiveMap.set(target, proxy)

  return proxy
}

// 1. proxy的get不能直接返回target[key]，要用Reflect
// 2. 同样的target，都用reactive，要做缓存
// 3. data -> proxy1 ，再去reactive proxy1, map找不到, 可以访问ReactiveFlags.IS_REACTIVE去判断是不是已经做了响应式处理
