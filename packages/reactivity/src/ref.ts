import { isArray, isObject } from '@vue/shared'
import { trackEffects, triggerEffects } from './effect'
import { reactive } from './reactive'

export function ref(value) {
  return new RefImpl(value)
}
function toReactive(value) {
  return isObject(value) ? reactive(value) : value
}
class RefImpl {
  public _value
  public __v_isRef = true
  public dep = new Set()
  constructor(public rawValue) {
    this._value = toReactive(rawValue)
  }

  get() {
    trackEffects(this.dep)
    return this._value
  }

  set(newValue) {
    if (newValue !== this.rawValue) {
      triggerEffects(this.dep)
      this._value = toReactive(newValue)
      this.rawValue = newValue
    }
  }
}

// 做一层代理
class ObjectRefImpl {
  constructor(public object, public key) {}
  get value() {
    return this.object[this.key]
  }

  set value(newValue) {
    this.object[this.key] = newValue
  }
}

export function toRef(object, key) {
  return new ObjectRefImpl(object, key)
}

export function toRefs(object) {
  const result = isArray(object) ? new Array(object.length) : {}
  for (const key in object)
    result[key] = toRef(object, key)
  return result
}
