import { isArray, isObject } from '@vue/shared'
import { trackEffects, triggerEffects } from './effect'
import { reactive } from './reactive'

// ref函数 返回一个RefImpl对象
export function ref(value) {
  return new RefImpl(value)
}

// 将值转换成reactive
function toReactive(value) {
  // 只有对象才能被转成reactive
  return isObject(value) ? reactive(value) : value
}
class RefImpl {
  // 获取value .value
  public _value

  // flag
  public __v_isRef = true

  // 记录依赖
  public dep = new Set()

  constructor(public rawValue) {
    // 将原value转换为reactive
    this._value = toReactive(rawValue)
  }

  get value() {
    // get值的时候，需要收集依赖，（在effect中使用ref的时候）
    trackEffects(this.dep)
    return this._value
  }

  set value(newValue) {
    // 更改值的时候，看一下新值和旧值是不是相同的
    if (newValue !== this.rawValue) {
      // 更改值，需要触发依赖的effects
      triggerEffects(this.dep)

      // 将_value设置为新值，新值同样需要转换为reactive
      this._value = toReactive(newValue)

      // 更新旧值
      this.rawValue = newValue
    }
  }
}

// 做一层代理
class ObjectRefImpl {
  constructor(public object, public key) { }
  // 劫持get .value 返回原对象（proxy）的值 这里就会依赖收集
  get value() {
    return this.object[this.key]
  }

  // 劫持set .value 直接设置原对象（proxy）的值 触发依赖
  set value(newValue) {
    this.object[this.key] = newValue
  }
}

// 将值代理一下，劫持一下get set
export function toRef(object, key) {
  return new ObjectRefImpl(object, key)
}

// toRefs 解构时使用 解构出来的值可以用.value
export function toRefs(object) {
  // 创建一个新的对象，判断一下数组
  const result = isArray(object) ? new Array(object.length) : {}

  // 遍历对象，将每个值转换一下
  for (const key in object)
    result[key] = toRef(object, key)

  // 返回新的对象
  return result
}

// 用于在使用ref时不用.value
export function proxyRefs(object) {
  // 创建一个proxy，代理get，set
  return new Proxy(object, {
    get(target, key, receiver) {
      // 当去取值的时候，先通过Reflect取，如果是一个ref对象就返回它的.value，就不用再写.value了
      const r = Reflect.get(target, key, receiver)
      return r.__v_isRef ? r.value : r
    },
    set(target, key, value, receiver) {
      // 当去更改值的时候，拿到老的值，看一下是不是ref对象，如果是，就更改它的value
      const oldValue = target[key]
      if (oldValue.__v_isRef) {
        oldValue.value = value
        return true
      }

      // 如果不是ref对象，直接通过Reflect更改
      else {
        return Reflect.set(target, key, value, receiver)
      }
    },
  })
}
