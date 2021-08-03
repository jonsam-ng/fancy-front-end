# Reactive

<TimeToRead />

## 目录

[[TOC]]

## Proxy

Proxy 对象用于创建一个对象的代理，从而实现基本操作的拦截和自定义（如属性查找、赋值、枚举、函数调用等）。

```ts
const p = new Proxy(target, handler)
```

- target: 要使用 Proxy 包装的目标对象（可以是任何类型的对象，包括原生数组，函数，甚至另一个代理）。
- handler: 一个通常以函数作为属性的对象，各属性中的函数分别定义了在执行各种操作时代理 p 的行为。
  
详见：[MDN: Proxy](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy)

## createReactiveObject

<Badges :content="[{type: 'tip', text: '重要'}]" />

先来看一个最为重要的函数，这是实现 reactive/shallowReactive/readonly/shallowReadonly 这四个 api 的核心。

```ts
export interface Target {
  [ReactiveFlags.SKIP]?: boolean
  [ReactiveFlags.IS_REACTIVE]?: boolean // 是否是 reactive 类型值
  [ReactiveFlags.IS_READONLY]?: boolean // 是否是 readonly 类型值
  [ReactiveFlags.RAW]?: any // 表示原始的值。
}

function createReactiveObject(
  target: Target, // reactive target
  isReadonly: boolean, // 是否只读
  baseHandlers: ProxyHandler<any>, // 基本的 handlers，object/array
  collectionHandlers: ProxyHandler<any>, // COLLECTION 类别的 handlers，map/set/weakMap/weakSet
  proxyMap: WeakMap<Target, any> // 保存 Map(t, p) 集合
) {
  // reactive 只作用于 object
  if (!isObject(target)) {
    if (__DEV__) {
      console.warn(`value cannot be made reactive: ${String(target)}`)
    }
    return target
  }
  // target is already a Proxy, return it.
  // exception: calling readonly() on a reactive object
  // 已经是一个 Proxy 对象，返回其本身
  // 如果原始值已经存在，但是又不是 readonly 值和 reactive 值。
  if (
    target[ReactiveFlags.RAW] &&
    !(isReadonly && target[ReactiveFlags.IS_REACTIVE])
  ) {
    return target
  }
  // target already has corresponding Proxy
  // target 对应的 Proxy 对象已经存在于 proxyMap 中，返回这个 existingProxy。
  const existingProxy = proxyMap.get(target)
  if (existingProxy) {
    return existingProxy
  }
  // only a whitelist of value types can be observed.
  // getTargetType 获取 target 的分类：INVALID、COMMON、COLLECTION
  // 不支持的类型返回其本身。
  const targetType = getTargetType(target)
  if (targetType === TargetType.INVALID) {
    return target
  }
  // 根据 target 创建一个 Proxy 对象。
  // COLLECTION 使用 collectionHandlers，否则使用 baseHandlers
  const proxy = new Proxy(
    target,
    targetType === TargetType.COLLECTION ? collectionHandlers : baseHandlers
  )
  // 将 proxy 对象加入到 proxyMap 中，结构: Map<target, proxy>。
  proxyMap.set(target, proxy)
  // 返回的是 proxy 对象，也就是说 target 的属性和行为将会被拦截，即是响应式。
  return proxy
}
```

分析如下：

- 接收 5 个参数，target: 响应式的目标对象，也就是我们传入了需要响应式的值，isReadonly：是否只读，baseHandlers：基本的 handlers，用于 object/array，collectionHandlers：COLLECTION 类别的 handlers，适用于 map/set/weakMap/weakSet，proxyMap 保存 Map(target, proxy) 映射的 Map。
- 考虑到的特殊情况：不是 object，已经是一个 Proxy 对象，target 对应的 Proxy 对象已经存在于 proxyMap 中，不支持的类型。

由此可见，handlers 和 proxyMap 将是很重要的部分。也是实现响应式 api 的核心。

## reactive

<Badges :content="[{type: 'tip', text: '重要'}]" />

::: tip 官网释义
Returns a reactive copy of the object.

The reactive conversion is "deep"—it affects all nested properties. In the
ES2015 Proxy based implementation, the returned proxy is **not** equal to the
original object. It is recommended to work exclusively with the reactive
proxy and avoid relying on the original object.

返回对象的响应式副本。

响应式转换是“深层的”：会影响对象内部所有嵌套的属性。基于 ES2015 的 Proxy 实现，返回的代理对象不等于原始对象。建议仅使用代理对象而避免依赖原始对象。
:::

源码如下：

```ts
export function reactive(target: object) {
  // if trying to observe a readonly proxy, return the readonly version.
  // readonly 值不可变，返回其本身
  if (target && (target as Target)[ReactiveFlags.IS_READONLY]) {
    return target
  }
  return createReactiveObject(
    target,
    false,
    mutableHandlers,
    mutableCollectionHandlers,
    reactiveMap
  )
}

export const mutableHandlers: ProxyHandler<object> = {
  get,
  set,
  deleteProperty,
  has,
  ownKeys
}

export const mutableCollectionHandlers: ProxyHandler<CollectionTypes> = {
  get: /*#__PURE__*/ createInstrumentationGetter(false, false)
}

export const reactiveMap = new WeakMap<Target, any>()
```

handles 细节部分在 handler 文章中具体分析。

## readonly

::: tip 官网释义
Takes an object (reactive or plain) or a ref and returns a readonly proxy to the original. A readonly proxy is deep: any nested property accessed will be readonly as well.

接受一个对象 (响应式或纯对象) 或 ref 并返回原始对象的只读代理。只读代理是深层的：任何被访问的嵌套 property 也是只读的。
:::

```ts
export function readonly<T extends object>(
  target: T
): DeepReadonly<UnwrapNestedRefs<T>> {
  return createReactiveObject(
    target,
    true,
    readonlyHandlers,
    readonlyCollectionHandlers,
    readonlyMap
  )
}

export const readonlyHandlers: ProxyHandler<object> = {
  get: readonlyGet,
  set(target, key) {
    return true
  },
  deleteProperty(target, key) {
    return true
  }
}

export const readonlyCollectionHandlers: ProxyHandler<CollectionTypes> = {
  get: /*#__PURE__*/ createInstrumentationGetter(true, false)
}

export const readonlyMap = new WeakMap<Target, any>()
```

- readonly 的对象的属性值是不可被 set 和 delete，均返回 true。

## shallowReactive

::: tip 官网释义
Creates a reactive proxy that tracks reactivity of its own properties but does not perform deep reactive conversion of nested objects (exposes raw values).

创建一个响应式代理，它跟踪其自身 property 的响应性，但不执行嵌套对象的深层响应式转换 (暴露原始值)。
:::

```ts
export function shallowReactive<T extends object>(target: T): T {
  return createReactiveObject(
    target,
    false,
    shallowReactiveHandlers,
    shallowCollectionHandlers,
    shallowReactiveMap
  )
}

export const shallowReactiveHandlers = /*#__PURE__*/ extend(
  {},
  mutableHandlers,
  {
    get: shallowGet,
    set: shallowSet
  }
)

export const shallowCollectionHandlers: ProxyHandler<CollectionTypes> = {
  get: /*#__PURE__*/ createInstrumentationGetter(false, true)
}

export const shallowReactiveMap = new WeakMap<Target, any>()

export const extend = Object.assign
```

## shallowReadonly

::: tip 官网释义
Creates a proxy that makes its own properties readonly, but does not perform deep readonly conversion of nested objects (exposes raw values).

创建一个 proxy，使其自身的 property 为只读，但不执行嵌套对象的深度只读转换 (暴露原始值)。
:::

## isReadonly

::: tip 官网释义
Checks if an object is a readonly proxy created by readonly.

检查对象是否是由 readonly 创建的只读代理。
:::

```ts
export function isReadonly(value: unknown): boolean {
  return !!(value && (value as Target)[ReactiveFlags.IS_READONLY])
}
```

isReadonly 是通过检查 target 的 `__v_isReadonly` 标记实现的。

## isReactive

::: tip 官网释义
Checks if an object is a reactive proxy created by reactive.

检查对象是否是由 reactive 创建的响应式代理。
:::

```ts
export function isReactive(value: unknown): boolean {
  if (isReadonly(value)) {
    return isReactive((value as Target)[ReactiveFlags.RAW])
  }
  return !!(value && (value as Target)[ReactiveFlags.IS_REACTIVE])
}
```

如果 value 只读，检查原始值是否是 reactive 类型，否则检查 `__v_isReactive` 标记。

## isProxy

::: tip 官网释义
Checks if an object is a proxy created by reactive or readonly.

检查对象是否是由 reactive 或 readonly 创建的 proxy。
:::

```ts
export function isProxy(value: unknown): boolean {
  return isReactive(value) || isReadonly(value)
}
```

检查是否是 reactive 类型或者 readonly 类型值。

## markRaw

## toRaw
