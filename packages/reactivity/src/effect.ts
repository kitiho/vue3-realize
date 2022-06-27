export let activeEffect

// 清空effect的deps
function cleanupEffect(effect) {
  // 拿到effect的deps
  const { deps } = effect

  // 遍历一遍deps
  for (let i = 0; i < deps.length; i++)
    // deps里面装的都是effect对应的key对应的effects们，是set数据结构，即[set,set,set..]，在这些Set中使用delete删除自身即可
    deps[i].delete(effect)

  // 将自身effect的deps长度置为0
  effect.deps.length = 0
}

export class ReactiveEffect {
  // effect有可能失效，需要激活标识
  // 这个effect默认激活
  public active = true

  // 用来保存effect对应的key的effects
  public deps = []

  // 用于effect中调effect记录上一个effect
  public parent = null

  // ReactiveEffect的构造函数
  constructor(public fn, public scheduler) { }

  // run方法
  run() {
    // 判断effect是否激活，如果没有激活，就执行就完了，不用进行依赖收集
    if (!this.active)
      return this.fn()

    // 进行依赖收集，核心就是 将当前的effect和用到的响应式数据关联在一起
    // 保存在全局activeEffect，稍后调用get，set操作的时候 就可以获取到这个effect
    try {
      // 记录一下parent
      this.parent = activeEffect

      // 把当前的effect设置为全局的activeEffect
      activeEffect = this

      // 每次执行的时候，清空一下effects记录的deps
      cleanupEffect(this)

      // 执行传入的函数
      return this.fn()
    }
    finally {
      // 执行完毕后，把当前的全局的activeEffect设成parent
      activeEffect = this.parent

      // 把此effect的parent置空
      this.parent = null
    }
  }

  // stop方法，用于停止effect
  stop() {
    // 如果effect还是激活的
    if (this.active) {
      // 把active设置为false
      this.active = false

      // 清空effects记录的deps
      cleanupEffect(this)
    }
  }
}

// effect方法，传入一个函数，和一个带有scheduler的options对象
export function effect(fn, options: any = {}) {
  // 创建一个ReactiveEffect对象
  const _effect = new ReactiveEffect(fn, options.scheduler)

  // 先执行一遍传入的函数
  _effect.run()

  // 定义一个runner，并将其绑定为effect的run，并且改变this
  const runner = _effect.run.bind(_effect)

  // 给runner添加一个effect属性保存其effect
  runner.effect = _effect

  // effect函数返回runner
  return runner
}

// effect可以嵌套effect 流程类似树形结构 给effect加一个parent属性

// 对象 => 某个属性 => 多个effect
// {对象:{key:[]}} Weakmap来实现，effect数组用Set 去重
const targetMap = new WeakMap()
export function track(target, type, key) {
  // 如果不是在effect中取值，就不需要收集依赖
  if (!activeEffect)
    return

  // 在targetMap中找target对应的key们
  let depsMap = targetMap.get(target)

  // 如果没有找到，就创建一个
  if (!depsMap)
    targetMap.set(target, (depsMap = new Map()))

  // 在key们中找key对应的effect们
  let dep = depsMap.get(key)

  // 如果没有找到，就创建一个
  if (!dep)
    depsMap.set(key, (dep = new Set()))

  trackEffects(dep)
}
export function trackEffects(dep) {
  if (activeEffect) {
    // 找到key对应的effect们，判断一下当前的effect是不是在其中
    const shouldTrack = !dep.has(activeEffect)

    // 如果还不在其中，就需要把当前的effect加入到deps中
    if (shouldTrack) {
      dep.add(activeEffect)

      // 不只是key对应的effects要记录，同时当前的effect对象要需要记录key对应的effects，双向记录，方便后续清理
      activeEffect.deps.push(dep)
    }
  }
}

// 触发，找出对应的effect，然后执行
export function trigger(target, type, key, newValue, oldValue) {
  // 在targetMap中寻找target对应的key们
  const depsMap = targetMap.get(target)

  // 如果没有key们，说明没有依赖，直接返回
  if (!depsMap)
    return

  // 在key们中找key对应的effect们
  const effects = depsMap.get(key)
  triggerEffects(effects)
}

export function triggerEffects(effects) {
  if (effects) {
    // 先新建一份effects
    effects = new Set(effects)

    // 对effects做一个遍历
    effects.forEach((effect) => {
      // 需要触发执行的effect不能是当前的effect，自己触发自己
      if (effect !== activeEffect) {
        // 如果effect有scheduler，就用scheduler来执行
        if (effect.scheduler)
          effect.scheduler()

        // 否则就用run
        else
          effect.run()
      }
    })
  }
}

