# ReactChildFiber 的创建

[[TOC]]

ReactChildFiber 的创建过程分为调和和挂载两个部分。这两个部分都调用了 `ChildReconciler` 这个函数。这个函数比较复杂，我们分解来看。

```js
export const reconcileChildFibers = ChildReconciler(true);
export const mountChildFibers = ChildReconciler(false);
```

## reconcileChildFibers

ChildReconciler(shouldTrackSideEffects)。

ChildReconciler 返回函数 reconcileChildFibers，根据传入参数 shouldTrackSideEffects 的值不同，分别起到了调和和挂载的功能。执行 reconcileChildFibers 将返回创建或者更新的 fiber。

先来看看 reconcileChildFibers 这个函数：

```js
function reconcileChildFibers(
  returnFiber: Fiber, // 父级 fiber
  currentFirstChild: Fiber | null, // 当前的 child
  newChild: any, // 新传来的 Child
  expirationTime: ExpirationTime,
): Fiber | null {
  // This function is not recursive.
  // If the top level item is an array, we treat it as a set of children,
  // not as a fragment. Nested arrays on the other hand will be treated as
  // fragment nodes. Recursion happens at the normal flow.

  // Handle top level unkeyed fragments as if they were arrays.
  // This leads to an ambiguity between <>{[...]}</> and <>...</>.
  // We treat the ambiguous cases above the same.
  const isUnkeyedTopLevelFragment =
    typeof newChild === 'object' &&
    newChild !== null &&
    newChild.type === REACT_FRAGMENT_TYPE &&
    newChild.key === null;
  // 如果是没有 key 值的 fragment 元素，则取他的 children，这个 Children 可能是数组。
  // 这里是我们使用 <></> 语法糖的原理
  if (isUnkeyedTopLevelFragment) {
    newChild = newChild.props.children;
  }

  // Handle object types
  const isObject = typeof newChild === 'object' && newChild !== null;
  // newChild 是单独的 ReactElement。
  if (isObject) {
    switch (newChild.$$typeof) {
      // 普通的 ReactElement（包括 fragment）
      case REACT_ELEMENT_TYPE:
        return placeSingleChild(
          reconcileSingleElement(
            returnFiber,
            currentFirstChild,
            newChild,
            expirationTime,
          ),
        );
      // Portal ReactElement
      case REACT_PORTAL_TYPE:
        return placeSingleChild(
          reconcileSinglePortal(
            returnFiber,
            currentFirstChild,
            newChild,
            expirationTime,
          ),
        );
    }
  }
  // newChild 字符或者数字
  if (typeof newChild === 'string' || typeof newChild === 'number') {
    return placeSingleChild(
      reconcileSingleTextNode(
        returnFiber,
        currentFirstChild,
        '' + newChild,
        expirationTime,
      ),
    );
  }

  // children 数组
  if (isArray(newChild)) {
    return reconcileChildrenArray(
      returnFiber,
      currentFirstChild,
      newChild,
      expirationTime,
    );
  }

  // newChild 是具有迭代器的对象
  if (getIteratorFn(newChild)) {
    return reconcileChildrenIterator(
      returnFiber,
      currentFirstChild,
      newChild,
      expirationTime,
    );
  }

  if (isObject) {
    throwOnInvalidObjectType(returnFiber, newChild);
  }

  if (__DEV__) {
    if (typeof newChild === 'function') {
      warnOnFunctionType();
    }
  }
  // newChild 是 undefined 或者是具有 key 值的顶层的 fragment 元素
  if (typeof newChild === 'undefined' && !isUnkeyedTopLevelFragment) {
    // If the new child is undefined, and the return fiber is a composite
    // component, throw an error. If Fiber return types are disabled,
    // we already threw above.
    switch (returnFiber.tag) {
      // 如果父级是类组件
      case ClassComponent: {
        if (__DEV__) {
          const instance = returnFiber.stateNode;
          if (instance.render._isMockFunction) {
            // We allow auto-mocks to proceed as if they're returning null.
            break;
          }
        }
      }
      // Intentionally fall through to the next case, which handles both
      // functions and classes
      // eslint-disable-next-lined no-fallthrough
      // 如果父级是函数式组件
      case FunctionComponent: {
        const Component = returnFiber.type;
        invariant(
          false,
          '%s(...): Nothing was returned from render. This usually means a ' +
            'return statement is missing. Or, to render nothing, ' +
            'return null.',
          Component.displayName || Component.name || 'Component',
        );
      }
    }
  }
  // 其余的情况视为空，直接将 currentFirstChild 删除并返回 null。
  // Remaining cases are all treated as empty.
  return deleteRemainingChildren(returnFiber, currentFirstChild);
}
```

这个函数的主要作用就是根据父级 fiber（returnFiber）、当前的 fiber（currentFirstChild）和新传来的 ReactElement (newChild)，创建或者更新子级 fiber。

分析一下主要的过程：

- `isUnkeyedTopLevelFragment` 判断 NewChild 是否是 FRAGMENT，如果是 就取 `newChild.props.children`。 这里是我们使用 `<></>` 语法糖的原理。
- 判断 newChild 如果是普通的 ReactElement，分为 SingleElement 类型和 SinglePortal 类型，分别调用 `reconcileSingleElement` 和 `reconcileSinglePortal` 进行调和。
- 判断 newChild 如果是 string 或者 number 类型，调用 reconcileSingleTextNode 进行调和。
- 判断 newChild 如果是数组，调用 reconcileChildrenArray 进行调和。
- 判断 newChild 如果是具有迭代器的对象，调用 `reconcileChildrenIterator` 进行调和。
- 其他情况则根据是类组件还是函数组件进行报错处理。
- placeSingleChild 为返回的 newFiber 在 shouldTrackSideEffects 为 true 时添加 "Placement" 的 effectTag 标记。

### reconcileSingleElement

这个函数对单一元素进行调和处理。

```js
function reconcileSingleElement(
  returnFiber: Fiber,
  currentFirstChild: Fiber | null,
  element: ReactElement,
  expirationTime: ExpirationTime,
): Fiber {
  const key = element.key;
  let child = currentFirstChild;
  while (child !== null) {
    // TODO: If key === null and child.key === null, then this only applies to
    // the first item in the list.
    if (child.key === key) {
      // 找到element的 key 的 fiber
      if (
        child.tag === Fragment
          ? element.type === REACT_FRAGMENT_TYPE
          : child.elementType === element.type ||
            // Keep this check inline so it only runs on the false path:
            (__DEV__
              ? isCompatibleFamilyForHotReloading(child, element)
              : false)
      ) {
        // 如果是同种元素类型
        // 删除其他兄弟节点
        deleteRemainingChildren(returnFiber, child.sibling);
        // merge props
        const existing = useFiber(
          child,
          element.type === REACT_FRAGMENT_TYPE
            ? element.props.children
            : element.props,
          expirationTime,
        );
        existing.ref = coerceRef(returnFiber, child, element);
        existing.return = returnFiber;
        if (__DEV__) {
          existing._debugSource = element._source;
          existing._debugOwner = element._owner;
        }
        // 只在 相同 key 相同元素类型时提前 return
        return existing;
      } else {
        // 不是同种类型
        deleteRemainingChildren(returnFiber, child);
        break;
      }
    } else {
      // 不等于 element 的 key 的 fiber
      deleteChild(returnFiber, child);
    }
    child = child.sibling;
  }
 // child 为 null，没有找到同 key 同类型的元素
 // 不能通过 merge props 的方法改造已有的 fiber,只能创建新的 fiber。
  if (element.type === REACT_FRAGMENT_TYPE) {
    // 从 fragment 元素创建 fiber
    const created = createFiberFromFragment(
      element.props.children,
      returnFiber.mode,
      expirationTime,
      element.key,
    );
    created.return = returnFiber;
    return created;
  } else {
    const created = createFiberFromElement(
      element,
      returnFiber.mode,
      expirationTime,
    );
    created.ref = coerceRef(returnFiber, currentFirstChild, element);
    created.return = returnFiber;
    return created;
  }
}
```

- 在 while 循环里试图从 child 及其兄弟节点中找到与 newChild 的 key 值相同的 fiber，如果没找到 child 及其兄弟节点全部会被删除，如果找到了而且刚好是同种类型的元素（包括 fragment），这时就将剩余的兄弟节点全部删除，将找到的 fiber 改造为新的 fiber。如果 key 相同但是元素不相同，同样删除所有的节点，走后面新建 fiber 的流程。
- 在原有的 fiber 上改造成新的 fiber 是函数 `useFiber` 实现的。`createWorkInProgress` 会从 fiber 中去除 workInProgress 的 fiber 并对 pendingProps 进行融合。

```js
function useFiber(
  fiber: Fiber,
  pendingProps: mixed,
  expirationTime: ExpirationTime,
): Fiber {
  // merge fiber props 并 返回新的 fiber
  // We currently set sibling to null and index to 0 here because it is easy
  // to forget to do before returning it. E.g. for the single child case.
  // 创建 work-in-progress 的 fiber，注入 element 的 props
  const clone = createWorkInProgress(fiber, pendingProps, expirationTime);
  clone.index = 0;
  clone.sibling = null;
  return clone;
}
```

### reconcileSinglePortal

这个函数是对单一 portal 元素进行调和。原理与 `reconcileSingleElement` 相似，不再赘述。


## mountChildFibers