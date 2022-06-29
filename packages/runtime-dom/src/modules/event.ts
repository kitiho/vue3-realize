export function patchEvent(el, eventName, nextValue) {
  const invokers = el._vei || (el._vei = {})
  const exists = invokers[eventName]

  if (exists) {
    exists.value = nextValue
  }
  else {
    const event = eventName.slice(2).toLowerCase()
    if (nextValue) {
      const invoker = invokers[eventName] = createInvoker(nextValue)
      el.addEventListener(event, invoker)
    }
    else if (exists) {
      el.removeEventListener(event, exists)
      invokers[eventName] = undefined
    }
  }
}
function createInvoker(callback) {
  const invoker = e => invoker.value(e)
  invoker.value = callback
  return invoker
}
