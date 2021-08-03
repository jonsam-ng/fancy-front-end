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
```

我们着重关注：mutableHandlers，mutableCollectionHandlers，reactiveMap 这 3 项。

### mutableHandlers

```ts
export const mutableHandlers: ProxyHandler<object> = {
  get,
  set,
  deleteProperty,
  has,
  ownKeys
}
```

### mutableCollectionHandlers

### reactiveMap

## readonly

## isReactive

## isReadonly

## isProxy

## shallowReactive

## shallowReadonly

## markRaw

## toRaw
