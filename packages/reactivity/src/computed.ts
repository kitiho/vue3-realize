import { isFunction } from '@vue/shared'
import { ReactiveEffect, activeEffect, trackEffects, triggerEffects } from './effect'

// computed方法，传入一个getter setter对象或者一个函数
export function computed(getterOrOptions) {
  // 判断传入的是不是函数，如果是函数那么就只有getter
  const onlyGetter = isFunction(getterOrOptions)

  // 定义getter和setter
  let getter
  let setter

  if (onlyGetter) {
    // 如果只有getter，那么getter就是传入的函数
    getter = getterOrOptions

    // setter无
    setter = () => { console.warn('no set') }
  }

  // 如果传入的是对象，那么就有getter和setter
  else {
    getter = getterOrOptions.get
    setter = getterOrOptions.set
  }

  // 返回一个ComputedRefImpl对象
  return new ComputedRefImpl(getter, setter)
}
// ComputedRefImpl类，computed对象
class ComputedRefImpl {
  // 创建一个computed对象就会有一个effect
  public effect

  // 用于检测是否修改过
  public _dirty = true

  // 一些标识flag
  public __v_isReadonly = true
  public __v_isRef = true

  // 用来记录computed的值
  public _value

  // 用于记录computed值的effects
  public dep

  constructor(public getter, public setter) {
    // 创建一个effect，并传入一个scheduler，当computed里面用到的值变化时，就会触发，执行scheduler
    this.effect = new ReactiveEffect(getter, () => {
      // 如果computed用到的值变化了，说明computed值也会变，就需要触发一下computed值的effects，并且把dirty设置为true
      if (!this._dirty) {
        this._dirty = true
        triggerEffects(this.dep)
      }
    })
  }

  get value() {
    // 当取computed值的时候，如果是在effect中使用computed值的话，需要收集computed值的依赖effects
    if (activeEffect)
      trackEffects(this.dep || (this.dep = new Set()))

    // 如果dirty为true，说明computed值变化了，需要重新计算computed值
    if (this._dirty) {
      // 通过effect的run方法来重新计算computed值
      this._value = this.effect.run()

      // 设置dirty为false，表示computed值没有变化，做一个缓存
      this._dirty = false
    }
    return this._value
  }

  set value(newValue) {
    this.setter(newValue)
  }
}
