export let activeEffect
class ReactiveEffect {
  // effect有可能失效，需要激活标识
  // 这个effect默认激活
  public active = true
  public deps = []
  public parent = null
  constructor(public fn) {

  }

  run() {
    // 非激活情况
    if (!this.active)
      return this.fn()
    // 进行依赖收集，核心就是 将当前的effect和用到的响应式数据关联在一起
    // 保存在全局activeEffect，稍后调用get，set操作的时候 就可以获取到这个effect
    try {
      this.parent = activeEffect
      activeEffect = this
      return this.fn()
    }
    finally {
      activeEffect = this.parent
      this.parent = null
    }
  }
}

export function effect(fn) {
  // fn根据状态变化重新执行
  const _effect = new ReactiveEffect(fn)
  _effect.run()
}

// 1. effect可以嵌套effect 流程类似树形结构 给effect加一个parent属性

// 对象 => 某个属性 => 多个effect
// {对象:{key:[]}} Weakmap来实现，effect数组用Set 去重
const targetMap = new WeakMap()
export function track(target, type, key) {
  if (!activeEffect)
    return
  let depsMap = targetMap.get(target)
  if (!depsMap)
    targetMap.set(target, (depsMap = new Map()))
  let dep = depsMap.get(key)
  if (!dep)
    depsMap.set(key, (dep = new Set()))
  const shouldTrack = !dep.has(activeEffect)
  if (shouldTrack) {
    dep.add(activeEffect)
    // 双向记录 不只是属性对应effect，effect也要对应属性
    // 没有存key 直接存key对应的dep 稍后直接清理
    activeEffect.deps.push(dep)
  }
}

// 触发，找出对应的effect，然后执行
export function trigger(target, type, key, newValue, oldValue) {
  const depsMap = targetMap.get(target)
  // 触发的值不在targetMap中
  if (!depsMap)
    return
  const effects = depsMap.get(key)
  effects && effects.forEach((effect) => {
    // 在执行effect的时候，又要执行自己，需要屏蔽掉，不能无限调用
    if (effect !== activeEffect)
      effect.run()
  })
}
