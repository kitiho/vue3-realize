import { isObject } from '@vue/shared'
import { track, trigger } from './effect'
import { reactive } from './reactive'
export const enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive',
}
// proxy的get和set处理逻辑
export const mutableHandlers = {
  get(target, key, receiver) {
    // 如果target本身就是一个proxy的时候，key命中ReactiveFlags.IS_REACTIVE
    if (key === ReactiveFlags.IS_REACTIVE)
      return true

    // 依赖收集 track 将key和effect关联起来
    track(target, 'get', key)

    // 不能用target[key], {alias(){this.name}}只会走一次get
    // 使用Reflect返回值
    const res = Reflect.get(target, key, receiver)

    // 如果要取的值还是一个对象，再次对其做响应式处理
    if (isObject(res))
      return reactive(res)

    // 如果不是对象
    return res
  },

  set(target, key, value, receiver) {
    // 拿到原来的值和新的值做比较
    const oldValue = target[key]
    // 通过Reflect拿proxy对应的值
    const result = Reflect.set(target, key, value, receiver)

    // 值变化了，就要更新
    if (oldValue !== value)
      // 值发生变化，需要触发值对应的effect
      trigger(target, 'set', key, value, oldValue)
    // 返回值
    return result
  },
}

