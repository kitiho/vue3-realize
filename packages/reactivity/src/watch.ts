import { isFunction, isObject } from '@vue/shared'
import { ReactiveEffect } from './effect'
import { isReactive } from './reactive'

// 对响应式对象做递归遍历
function traversal(value, set = new Set()) {
  // 如果不是对象直接返回
  if (!isObject(value))
    return value

  // 用一个set来记录一下已经遍历过的对象，防止循环引用，如果已经遍历过了，就不用再遍历了
  if (set.has(value))
    return value

  // 每次遍历之前先把当前对象放入set中
  set.add(value)

  // 遍历对象的属性
  for (const key in value)
    // 做递归
    traversal(value[key], set)

  return value
}
export function watch(source, cb) {
  // 定义getter 看source是对象还是方法
  let getter

  // 如果传的是对象，先看是不是响应式的
  if (isReactive(source))

    // 如果是响应式的，变成方法形式，对对象做一个递归遍历，目的是要在effect中拿到所有的属性
    getter = () => traversal(source)
  else if (isFunction(source))
    getter = source
  else
    return

  // 定义一个cleanup函数，用来执行，第二次watch执行上一次watch的cleanup函数
  let cleanup
  // 保存cleanup回调
  const saveCleanup = (fn) => {
    cleanup = fn
  }

  // 定义老值
  let oldValue

  // job是effect的scheduler，后面effect使用到的值更改了就会执行
  const job = () => {
    // 如果有cleanup函数，就执行
    if (cleanup)
      cleanup()

    // 通过effect.run获得新的值
    const newValue = effect.run()

    // 将watch的回调执行一遍
    cb(newValue, oldValue, saveCleanup)

    // 更新老值
    oldValue = newValue
  }
  // 定义一个effect，getter传过来，当getter的值变化时，执行job
  const effect = new ReactiveEffect(getter, job)

  // 记录下老值，第二次才会用到
  oldValue = effect.run()
}
