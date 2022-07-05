var VueRuntimeDom = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // packages/runtime-dom/src/index.ts
  var src_exports = {};
  __export(src_exports, {
    Text: () => Text,
    createRenderer: () => createRenderer,
    createVNode: () => createVNode,
    h: () => h,
    isSameVNode: () => isSameVNode,
    isVNode: () => isVNode,
    render: () => render
  });

  // packages/shared/src/index.ts
  function isObject(value) {
    return value !== null && typeof value === "object";
  }
  var isArray = Array.isArray;
  var isString = (value) => typeof value === "string";
  var assign = Object.assign;

  // packages/rumtime-core/src/vnode.ts
  function isVNode(value) {
    return !!(value && value.__v_isVNode);
  }
  var Text = Symbol("Text");
  function isSameVNode(n1, n2) {
    return n1.type === n2.type && n1.key === n2.key;
  }
  function createVNode(type, props, children = null) {
    const shapeFlag = isString(type) ? 1 /* ELEMENT */ : 0;
    const vnode = {
      __v_isVNode: true,
      shapeFlag,
      type,
      props,
      children,
      key: props?.key,
      el: null
    };
    if (children) {
      let childType = 0;
      if (isArray(children)) {
        childType = 16 /* ARRAY_CHILD */;
      } else {
        children = String(children);
        childType = 8 /* TEXT_CHILD */;
      }
      vnode.shapeFlag |= childType;
    }
    return vnode;
  }

  // packages/rumtime-core/src/renderer.ts
  function createRenderer(renderOptions2) {
    const {
      insert: hostInsert,
      remove: hostRemove,
      setElementText: hostSetElementText,
      setText: hostSetText,
      parentNode: hostParentNode,
      nextSibling: hostNextSibling,
      createElement: hostCreateElement,
      createText: hostCreateText,
      patchProp: hostPatchProp
    } = renderOptions2;
    function normalize(children, index) {
      if (isString(children[index])) {
        const vnode = createVNode(Text, null, children[index]);
        children[index] = vnode;
      }
      return children[index];
    }
    function mountChildren(children, container) {
      children.forEach((child, index) => {
        child = normalize(children, index);
        patch(null, child, container);
      });
    }
    function mountElement(vnode, container, anchor) {
      const { type, props, children, shapeFlag } = vnode;
      const el = vnode.el = hostCreateElement(type, props);
      if (props) {
        for (const key in props)
          hostPatchProp(el, key, null, props[key]);
      }
      if (shapeFlag & 8 /* TEXT_CHILD */)
        hostSetElementText(el, children);
      else if (shapeFlag & 16 /* ARRAY_CHILD */)
        mountChildren(children, el);
      hostInsert(el, container, anchor);
    }
    function processText(n1, n2, container) {
      if (n1 === null) {
        hostInsert(n2.el = hostCreateText(n2.children, container), container);
      } else {
        const el = n2.el = n1.el;
        if (n2.children !== n1.children)
          hostSetText(el, n2.children);
      }
    }
    function patchProps(oldProps, newProps, el) {
      for (const key in newProps)
        hostPatchProp(el, key, oldProps[key], newProps[key]);
      for (const key in oldProps) {
        if (!(key in newProps))
          hostPatchProp(el, key, oldProps[key], void 0);
      }
    }
    function unmountChildren(children) {
      children.forEach(unmount);
    }
    function patchKeyChildren(c1, c2, el) {
      let i = 0;
      let e1 = c1.length - 1;
      let e2 = c2.length - 1;
      while (i <= e1 && i <= e2) {
        const n1 = c1[i];
        const n2 = c2[i];
        if (isSameVNode(n1, n2))
          patch(n1, n2, el);
        else
          break;
        i++;
      }
      while (i <= e1 && i <= e2) {
        const n1 = c1[e1];
        const n2 = c2[e2];
        if (isSameVNode(n1, n2))
          patch(n1, n2, el);
        else
          break;
        e1--;
        e2--;
      }
      if (i > e1) {
        if (i <= e2) {
          while (i <= e2) {
            const nextPos = e2 + 1;
            const anchor = nextPos < c2.length ? c2[nextPos].el : null;
            patch(null, c2[i], el, anchor);
            i++;
          }
        }
      } else if (i > e2) {
        if (i <= e1) {
          while (i <= e1) {
            unmount(c1[i]);
            i++;
          }
        }
      }
      console.log(i, e1, e2);
      const s1 = i;
      const s2 = i;
      const keyToNewIndexMap = /* @__PURE__ */ new Map();
      const toBePatched = e2 - s2 + 1;
      const newIndexToOldIndexMap = new Array(toBePatched).fill(0);
      for (let i2 = s2; i2 <= e2; i2++)
        keyToNewIndexMap.set(c2[i2].key, i2);
      for (let i2 = s1; i2 <= e1; i2++) {
        const oldChild = c1[i2];
        const newIndex = keyToNewIndexMap.get(oldChild.key);
        if (!newIndex) {
          unmount(oldChild);
        } else {
          newIndexToOldIndexMap[newIndex - s2] = i2 + 1;
          patch(oldChild, c2[newIndex], el);
        }
      }
      console.log(newIndexToOldIndexMap);
      for (let i2 = toBePatched - 1; i2 >= 0; i2--) {
        const index = i2 + s2;
        const current = c2[index];
        const anchor = index + 1 < c2.length ? c2[index + 1].el : null;
        if (newIndexToOldIndexMap[i2] === 0)
          patch(null, current, el, anchor);
        else
          hostInsert(current.el, el, anchor);
      }
      console.log(keyToNewIndexMap);
    }
    function patchChildren(n1, n2, el) {
      const c1 = n1 && n1.children;
      const c2 = n2 && n2.children;
      const prevShapeFlag = n1.shapeFlag;
      const shapeFlag = n2.shapeFlag;
      if (shapeFlag & 8 /* TEXT_CHILD */) {
        if (prevShapeFlag & 16 /* ARRAY_CHILD */)
          unmountChildren(c1);
        if (c1 !== c2)
          hostSetElementText(el, c2);
      } else {
        if (prevShapeFlag & 16 /* ARRAY_CHILD */) {
          if (shapeFlag & 16 /* ARRAY_CHILD */) {
            patchKeyChildren(c1, c2, el);
          } else {
            unmountChildren(c1);
          }
        } else {
          if (prevShapeFlag & 8 /* TEXT_CHILD */)
            hostSetElementText(el, "");
          if (shapeFlag & 16 /* ARRAY_CHILD */)
            mountChildren(c2, el);
        }
      }
    }
    function patchElement(n1, n2) {
      const el = n2.el = n1.el;
      const oldProps = n1.props || {};
      const newProps = n2.props || {};
      patchProps(oldProps, newProps, el);
      patchChildren(n1, n2, el);
    }
    function processElement(n1, n2, container, anchor) {
      if (n1 === null)
        mountElement(n2, container, anchor);
      else
        patchElement(n1, n2);
    }
    function patch(n1, n2, container, anchor = null) {
      if (n1 === n2)
        return;
      if (n1 && !isSameVNode(n1, n2)) {
        unmount(n1);
        n1 = null;
      }
      const { type, shapeFlag } = n2;
      switch (type) {
        case Text:
          processText(n1, n2, container);
          break;
        default:
          if (shapeFlag & 1 /* ELEMENT */)
            processElement(n1, n2, container, anchor);
      }
    }
    function unmount(vnode) {
      hostRemove(vnode.el);
    }
    const render2 = (vnode, container) => {
      if (vnode === null) {
        if (container._vnode)
          unmount(container._vnode);
      } else {
        patch(container._vnode || null, vnode, container);
        container._vnode = vnode;
      }
    };
    return { render: render2 };
  }

  // packages/rumtime-core/src/h.ts
  function h(type, propsChildren, children) {
    const l = arguments.length;
    if (l === 2) {
      if (isObject(propsChildren) && !isArray(propsChildren)) {
        if (isVNode(propsChildren))
          return createVNode(type, null, [propsChildren]);
        else
          return createVNode(type, propsChildren);
      } else {
        return createVNode(type, null, propsChildren);
      }
    } else if (l > 3) {
      children = Array.from(arguments).slice(2);
    } else if (l === 3) {
    }
    return createVNode(type, propsChildren, children);
  }

  // packages/runtime-dom/src/nodeOps.ts
  var nodeOps = {
    insert(child, parent, anchor = null) {
      parent.insertBefore(child, anchor);
    },
    remove(child) {
      const parent = child.parentNode;
      if (parent)
        parent.removeChild(child);
    },
    setElementText(element, text) {
      element.textContent = text;
    },
    setText(node, text) {
      node.nodeValue = text;
    },
    querySelector(selector) {
      return document.querySelector(selector);
    },
    parentNode(node) {
      return node.parentNode;
    },
    nextSibling(node) {
      return node.nextSibling;
    },
    createElement(tagName) {
      return document.createElement(tagName);
    },
    createText(text) {
      return document.createTextNode(text);
    }
  };

  // packages/runtime-dom/src/modules/attr.ts
  function patchAttr(el, key, nextValue) {
    if (nextValue)
      el.setAttribute(key, nextValue);
    else
      el.removeAttribute(key);
  }

  // packages/runtime-dom/src/modules/class.ts
  function patchClass(el, nextValue) {
    if (nextValue === null)
      el.removeAttribute("class");
    else
      el.className = nextValue;
  }

  // packages/runtime-dom/src/modules/event.ts
  function patchEvent(el, eventName, nextValue) {
    const invokers = el._vei || (el._vei = {});
    const exists = invokers[eventName];
    if (exists) {
      exists.value = nextValue;
    } else {
      const event = eventName.slice(2).toLowerCase();
      if (nextValue) {
        const invoker = invokers[eventName] = createInvoker(nextValue);
        el.addEventListener(event, invoker);
      } else if (exists) {
        el.removeEventListener(event, exists);
        invokers[eventName] = void 0;
      }
    }
  }
  function createInvoker(callback) {
    const invoker = (e) => invoker.value(e);
    invoker.value = callback;
    return invoker;
  }

  // packages/runtime-dom/src/modules/style.ts
  function patchStyle(el, prevValue, nextValue = {}) {
    for (const key in nextValue)
      el.style[key] = nextValue[key];
    if (prevValue) {
      for (const key in prevValue) {
        if (!nextValue[key])
          el.style[key] = "";
      }
    }
  }

  // packages/runtime-dom/src/patchProp.ts
  function patchProp(el, key, prevValue, nextValue) {
    if (key === "class")
      patchClass(el, nextValue);
    else if (key === "style")
      patchStyle(el, prevValue, nextValue);
    else if (/^on[^a-z]/.test(key))
      patchEvent(el, key, nextValue);
    else
      patchAttr(el, key, nextValue);
  }

  // packages/runtime-dom/src/index.ts
  var renderOptions = assign(nodeOps, { patchProp });
  function render(vnode, container) {
    createRenderer(renderOptions).render(vnode, container);
  }
  return __toCommonJS(src_exports);
})();
//# sourceMappingURL=runtime-dom.global.js.map
