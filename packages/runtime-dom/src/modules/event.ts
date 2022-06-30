export function patchEvent(el, eventName, nextValue) {
  // 在元素上面添加一个_vei属性用来保存所有的事件回调
  const invokers = el._vei || (el._vei = {})

  // 要去更改元素的绑定事件，先看看是不是已经有了这个事件的回调
  const exists = invokers[eventName]

  if (exists) {
    // 如果已经有了，直接覆盖
    exists.value = nextValue
  }
  else {
    // 去掉eventName的on前缀
    const event = eventName.slice(2).toLowerCase()

    // 如果nextValue不为空
    if (nextValue) {
      // 赋值，先创建一个invoker，然后把其赋值到el的_vei对象上
      const invoker = invokers[eventName] = createInvoker(nextValue)

      // 绑定事件
      el.addEventListener(event, invoker)
    }
    // 如果nextValue为空，就是要解绑事件
    else if (exists) {
      el.removeEventListener(event, exists)
      invokers[eventName] = undefined
    }
  }
}
function createInvoker(callback) {
  // 创建一个invoker，这个invoker就是事件的回调
  const invoker = e => invoker.value(e)

  // 然后把invoker的value设置为callback
  invoker.value = callback
  return invoker
}
