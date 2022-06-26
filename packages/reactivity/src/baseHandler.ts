import { isObject } from '@vue/shared'
import { track, trigger } from './effect'
import { reactive } from './reactive'
export const enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive',
}
export const mutableHandlers = {
  // 取值
  get(target, key, receiver) {
    // #3
    if (key === ReactiveFlags.IS_REACTIVE)
      return true

    // 依赖收集 track 将key和effect关联起来
    track(target, 'get', key)
    // 不能用target[key], {alias(){this.name}}只会走一次get
    const res = Reflect.get(target, key, receiver)
    if (isObject(res))
      return reactive(res)
    return res
  },
  // 设置值
  set(target, key, value, receiver) {
    // 去代理上设置值
    const oldValue = target[key]
    const result = Reflect.set(target, key, value, receiver)
    // 值变化了，就要更新
    if (oldValue !== value)
      trigger(target, 'set', key, value, oldValue)

    return result
  },
}

