
# useState 状态更新原理

[[toc]]

在 react 包中 react.js 文件导出了 hooks 相关的 API，包括：
```js
useCallback, // 函数缓存

useContext, // 从 context 中获得 provider 传递的数据，经常和 createContext 和 context.Provider 一起使用。

useEffect, // 执行副作用，包括网络请求，数据交互，UI 更新等。

useImperativeHandle, // 将组件内部的变量或者方法暴露给外部，外部可使用 ref 进行调用。

useDebugValue, // debug 时的优化项

useLayoutEffect, // 在 UI 更新之后执行副作用

useMemo, // 缓存变量

useReducer, // 用于状态管理（数据共享），可以调用 reducer，常与 useContext 一起使用

useRef, // 非响应式的数据暂存

useState, // 响应式的组件状态管理
```
我们先来看 useState 的原理。

## dispatcher 分发器
### 定义
所有的 hooks 从 react 包中 ReactHooks.js 导出定义，useState 定义如下：

```js
function useState < S > (initialState: (() => S) | S) {
    const dispatcher = resolveDispatcher();
    return dispatcher.useState(initialState);
}
```

从这个定义里可以看出：
1. S 是 state 的泛型，useState 传入一个初始的状态 initialState ，初始状态可以直接传入，也可以函数式传入。当初始状态需要较多的计算量时，可以使用函数返回值的方式传入。
2. 所有的 hook 都需要经过 resolveDispatcher 返回的 dispatcher 来调度执行和更新。

### dispatcher 是什么？如何生成的？
先来看 `resolveDispatcher`这个函数，这个函数负责找到当前的分发器，ReactCurrentDispatcher 用来追踪当前的分发器：
```js
const dispatcher = ReactCurrentDispatcher.current;
```
如果找不到分发器，就会报我们使用 hook 最常见的错误：
```txt
Invalid hook call. Hooks can only be called inside of the body of a function component.
```
ReactCurrentDispatcher 被放在了 ReactSharedInternals 中，从 react-reconciler 包中 ReactFiberHooks.js 中可以看到 Dispatcher 类型：
```js
type Dispatcher = {
    readContext < T > (
        context: ReactContext < T > ,
        observedBits: void | number | boolean,
    ): T,
    useState < S > (initialState: (() => S) | S): [S, Dispatch < BasicStateAction < S >> ],
    useReducer < S,
    I,
    A > (
        reducer: (S, A) => S,
        initialArg: I,
        init ? : (I) => S,
    ): [S, Dispatch < A > ],
    useContext < T > (
        context: ReactContext < T > ,
        observedBits: void | number | boolean,
    ): T,
    useRef < T > (initialValue: T): {
        current: T
    },
    useEffect(
        create: () => (() => void) | void,
        deps: Array < mixed > | void | null,
    ): void,
    useLayoutEffect(
        create: () => (() => void) | void,
        deps: Array < mixed > | void | null,
    ): void,
    useCallback < T > (callback: T, deps: Array < mixed > | void | null): T,
    useMemo < T > (nextCreate: () => T, deps: Array < mixed > | void | null): T,
    useImperativeHandle < T > (
        ref: {
            current: T | null
        } | ((inst: T | null) => mixed) | null | void,
        create: () => T,
        deps: Array < mixed > | void | null,
    ): void,
    useDebugValue < T > (value: T, formatterFn: ? (value: T) => mixed): void,
    useResponder < E,
    C > (
        responder: ReactEventResponder < E, C > ,
        props: Object,
    ): ReactEventResponderListener < E,
    C > ,
};
```
可见所有的 hook 都是由 dispatcher 来调度执行的。那么 dispatcher 只有一种吗？dispatcher 不止以一种，包括 ContextOnlyDispatcher、HooksDispatcherOnMount、HooksDispatcherOnUpdate 三种，还有一些 dev 环境的 dispatcher。
可以把 dispatcher 看做是一个 hook 的分发器，在不同的渲染阶段由不同的分发器来进行调度。那么不同的分发器有什么区别呢？我们来看一下这三种分发器：
```js
export const ContextOnlyDispatcher: Dispatcher = {
    readContext,

    useCallback: throwInvalidHookError,
    useContext: throwInvalidHookError,
    useEffect: throwInvalidHookError,
    useImperativeHandle: throwInvalidHookError,
    useLayoutEffect: throwInvalidHookError,
    useMemo: throwInvalidHookError,
    useReducer: throwInvalidHookError,
    useRef: throwInvalidHookError,
    useState: throwInvalidHookError,
    useDebugValue: throwInvalidHookError,
    useResponder: throwInvalidHookError,
};

const HooksDispatcherOnMount: Dispatcher = {
    readContext,

    useCallback: mountCallback,
    useContext: readContext,
    useEffect: mountEffect,
    useImperativeHandle: mountImperativeHandle,
    useLayoutEffect: mountLayoutEffect,
    useMemo: mountMemo,
    useReducer: mountReducer,
    useRef: mountRef,
    useState: mountState,
    useDebugValue: mountDebugValue,
    useResponder: createResponderListener,
};

const HooksDispatcherOnUpdate: Dispatcher = {
    readContext,

    useCallback: updateCallback,
    useContext: readContext,
    useEffect: updateEffect,
    useImperativeHandle: updateImperativeHandle,
    useLayoutEffect: updateLayoutEffect,
    useMemo: updateMemo,
    useReducer: updateReducer,
    useRef: updateRef,
    useState: updateState,
    useDebugValue: updateDebugValue,
    useResponder: createResponderListener,
};
```
可见分发器的区别在于 hook 的实例是不同的，ContextOnlyDispatcher 中直接报 `Invalid hook call` 的错误，HooksDispatcherOnMount 中是 Mount 阶段的 hook，而HooksDispatcherOnUpdate 中是 update 阶段的 hook。一个很明显的区别就是 HooksDispatcherOnMount 中的 hook 会做一些初始化、初始值的操作，而 HooksDispatcherOnUpdate 中的 hook 主要做一些更新的操作。

### 当前的 dispatcher 是什么？dispatcher 是如何调度的？

上面已经说明了 dispatcher 是什么，以及会怎么初始化，现在探讨一下当前的 dispatcher 是怎么设置的。HooksDispatcherOnMount、HooksDispatcherOnUpdate 这两种 dispatcher，在 renderWithHooks 函数中设置。ContextOnlyDispatcher 还会在 resetHooks 函数中设置。

先看一下 renderWithHooks 函数，去除 dev 代码：

```js
function renderWithHooks(
    current: Fiber | null,
    workInProgress: Fiber,
    Component: any,
    props: any,
    refOrContext: any,
    nextRenderExpirationTime: ExpirationTime,
): any {
    renderExpirationTime = nextRenderExpirationTime;
    // 这是当前正在渲染的 Fiber 
    currentlyRenderingFiber = workInProgress;
    // 如果当前的 fiber 已经存在，说明是 update 阶段
    nextCurrentHook = current !== null ? current.memoizedState : null;
    
    // current?.memoizedState 为 true ,则 dispatcher 为 HooksDispatcherOnUpdate，否则为 HooksDispatcherOnMount
    ReactCurrentDispatcher.current =
        nextCurrentHook === null ?
        HooksDispatcherOnMount :
        HooksDispatcherOnUpdate;
    
    // 执行 Component() 函数即执行 FC，返回需要渲染的 VDom, 可见 FC 的参数为：props 和 refOrContext
    let children = Component(props, refOrContext);

    // dispatchAction 调用时，进入循环，dispatchAction 即为需要更新状态重新渲染时
    if (didScheduleRenderPhaseUpdate) {
        do {
            // 标志位置为了 false，则只会执行一次
            didScheduleRenderPhaseUpdate = false;
            // 记录渲染的次数，如果numberOfReRenders > RE_RENDER_LIMIT,就会报 Too many re-renders 的错误。
            numberOfReRenders += 1;
            
            // Start over from the beginning of the list
            nextCurrentHook = current !== null ? current.memoizedState : null;
            nextWorkInProgressHook = firstWorkInProgressHook;

            currentHook = null;
            workInProgressHook = null;
            componentUpdateQueue = null;


            ReactCurrentDispatcher.current = __DEV__ ?
                HooksDispatcherOnUpdateInDEV :
                HooksDispatcherOnUpdate;

            children = Component(props, refOrContext);
        } while (didScheduleRenderPhaseUpdate);

        renderPhaseUpdates = null;
        numberOfReRenders = 0;
    }

    // We can assume the previous dispatcher is always this one, since we set it
    // at the beginning of the render phase and there's no re-entrancy.
    // 渲染完毕后的 dispatcher 为 ContextOnlyDispatcher
    ReactCurrentDispatcher.current = ContextOnlyDispatcher;

    // 更新 renderedWork 
    const renderedWork: Fiber = (currentlyRenderingFiber: any);

    renderedWork.memoizedState = firstWorkInProgressHook;
    renderedWork.expirationTime = remainingExpirationTime;
    renderedWork.updateQueue = (componentUpdateQueue: any);
    renderedWork.effectTag |= sideEffectTag;

    // This check uses currentHook so that it works the same in DEV and prod bundles.
    // hookTypesDev could catch more cases (e.g. context) but only in DEV bundles.
    const didRenderTooFewHooks =
        currentHook !== null && currentHook.next !== null;

    // 做清理工作，防止这些变量污染下次执行
    renderExpirationTime = NoWork;
    currentlyRenderingFiber = null;

    currentHook = null;
    nextCurrentHook = null;
    firstWorkInProgressHook = null;
    workInProgressHook = null;
    nextWorkInProgressHook = null;

    remainingExpirationTime = NoWork;
    componentUpdateQueue = null;
    sideEffectTag = 0;

    invariant(
        !didRenderTooFewHooks,
        'Rendered fewer hooks than expected. This may be caused by an accidental ' +
        'early return statement.',
    );

    // 返回更新后的组件
    return children;
}
```

由这个函数可以看出：

1. current 是当前已经渲染或的 Fiber，是现在的 Fiber，`current.memoizedState` 在类组件中保存的是 Fiber 当前的状态，而在函数是组件中无法通过 this 来引用 state，因此current.memoizedState 中保存的是 hook。
2. 渲染 hook 时会根据 `current.memoizedState` 的值来判断是属于挂载阶段还是更新阶段，如果是挂载阶段，使用的 dispatcher 就是 `HooksDispatcherOnMount`，如果是更新阶段，使用的 dispatcher 就是 `HooksDispatcherOnUpdate`。
3. 在 `dispatchAction` 被调用时，会更新状态重新渲染。
4. 渲染完毕后，dispatcher 就是 `ContextOnlyDispatcher`。即 renderWithHooks 没有重新调用时，dispatcher 是不会生效的。
5. `renderWithHooks` 将函数式组件进行返回更新后的组件（VDom）。


## useState 的原理

经过上面的分析得知，在不同的生命周期使用的 dispatcher 是不同的，主要分为 mount、update 和 contextOnly 这三种。我们在调用相应的 hook 时，其实是由不同的 dispatcher 来接管的。

下面我们来看下 useState 是如何更新状态的：

### mount phase 的 useState

在挂载阶段，`HooksDispatcherOnMount` 引用的是 `mountState`。那就看看 `mountState` 函数：

```js
function mountState < S > (
    initialState: (() => S) | S,
): [S, Dispatch < BasicStateAction < S >> ] {
    // hook 上记载了当前的 hook 的信息
    const hook = mountWorkInProgressHook();
    if (typeof initialState === 'function') {
        initialState = initialState();
    }
    // 初始状态被记载到memoizedState和baseState，其中 memoizedState 是上一次状态，baseState 是最初状态
    hook.memoizedState = hook.baseState = initialState;
    // 生成更新对象，准备入队列
    const queue = (hook.queue = {
        last: null,
        dispatch: null,
        lastRenderedReducer: basicStateReducer,
        lastRenderedState: (initialState: any),
    });
    // 生成 setState 的回调方法，每个 setState 实质上是一个 dispatchAction
    const dispatch: Dispatch <
        BasicStateAction < S > , >
        = (queue.dispatch = (dispatchAction.bind(
            null,
            // Flow doesn't know this is non-null, but we do.
            ((currentlyRenderingFiber: any): Fiber),
            queue,
        ): any));
    return [hook.memoizedState, dispatch];
}
```

这里可以看出：

1. useState 在 Mount 阶段将初始状态记录在 `hook.baseState` 上，并且生成了一个状态更新的对象，这个更新对象上挂载了 dispatch：当前的 setState 方法、lastRenderedState：上次渲染的 State 。
2. 每个 setState 回调实质上就是一个 dispatchAction，这个 dispatchAction 依赖于 currentlyRenderingFiber：当前渲染的 Fiber、queue：状态更新对象。

### dispatchAction 调度更新

如果这时我们调用了 setState 去更新状态，会发生什么呢？那我们就来看看 `dispatchAction` 这个函数：

```js
function dispatchAction < S, A > (
        fiber: Fiber, // 当前渲染的 Fiber
        queue: UpdateQueue < S, A > , // 状态更新对象
        action: A,
    ) {
        // 避免渲染死循环，最多可连续渲染 25 次
        invariant(
            numberOfReRenders < RE_RENDER_LIMIT,
            'Too many re-renders. React limits the number of renders to prevent ' +
            'an infinite loop.',
        );

        const alternate = fiber.alternate;
        if (
            fiber === currentlyRenderingFiber ||
            (alternate !== null && alternate === currentlyRenderingFiber)
        ) { // 是否是当前需要渲染的 Fiber，进入渲染阶段
            // This is a render phase update. Stash it in a lazily-created map of
            // queue -> linked list of updates. After this render pass, we'll restart
            // and apply the stashed updates on top of the work-in-progress hook.
            // 所有的 updates 会保存在一个 map 中，结构是： queue -> linked list
            // 进入渲染状态的标志
            didScheduleRenderPhaseUpdate = true;
            // 创建一个更新句柄
            const update: Update < S, A > = {
                expirationTime: renderExpirationTime,
                suspenseConfig: null,
                action,
                eagerReducer: null,
                eagerState: null,
                next: null,
            };
            if (__DEV__) {
                update.priority = getCurrentPriorityLevel();
                // renderPhaseUpdates 是存放 update queue 的一个队列，如果队列为空，则初始化队列
                if (renderPhaseUpdates === null) {
                    renderPhaseUpdates = new Map();
                }
                // 取出当前 queue 中的 update 队列的首项
                const firstRenderPhaseUpdate = renderPhaseUpdates.get(queue);
                // 如果当前 queue 为空，则将创建的 update 放入队列
                if (firstRenderPhaseUpdate === undefined) {
                    renderPhaseUpdates.set(queue, update);
                } else {
                    // 将 queue 队列中首项追加到队尾
                    // Append the update to the end of the list.
                    let lastRenderPhaseUpdate = firstRenderPhaseUpdate;
                    while (lastRenderPhaseUpdate.next !== null) {
                        lastRenderPhaseUpdate = lastRenderPhaseUpdate.next;
                    }
                    lastRenderPhaseUpdate.next = update;
                }
            } else {
                const currentTime = requestCurrentTime();
                const suspenseConfig = requestCurrentSuspenseConfig();
                const expirationTime = computeExpirationForFiber(
                    currentTime,
                    fiber,
                    suspenseConfig,
                );

                const update: Update < S, A > = {
                    expirationTime,
                    suspenseConfig,
                    action,
                    eagerReducer: null,
                    eagerState: null,
                    next: null,
                };

                if (__DEV__) {
                    update.priority = getCurrentPriorityLevel();
                }
                // update 的数据结构，环状单向链表
                // Append the update to the end of the list.
                const last = queue.last;
                if (last === null) {
                    // 如果这是一个空队列，即 update 就是首次更新，那就将 update 构成环形单向链表。
                    // This is the first update. Create a circular list.
                    update.next = update;
                } else {
                    // 如果队列非空，队尾的 next 即为 first
                    const first = last.next;
                    if (first !== null) {
                        // 如果队尾是有指向的，也就是已经形成了环形单向链表，那就直接把 update 放到队尾。
                        // 即 update 的 next 指向 first。
                        // Still circular.
                        update.next = first;
                    }
                    // 如果没有成环，把 update 置于队尾
                    last.next = update;
                }
                // 更新队尾指针
                queue.last = update;

                if ( // mount 阶段
                    fiber.expirationTime === NoWork &&
                    (alternate === null || alternate.expirationTime === NoWork)
                ) {
                    // The queue is currently empty, which means we can eagerly compute the
                    // next state before entering the render phase. If the new state is the
                    // same as the current state, we may be able to bail out entirely.
                    const lastRenderedReducer = queue.lastRenderedReducer;
                    if (lastRenderedReducer !== null) {
                        let prevDispatcher;
                        try {
                            const currentState: S = (queue.lastRenderedState: any);
                            const eagerState = lastRenderedReducer(currentState, action);
                            // Stash the eagerly computed state, and the reducer used to compute
                            // it, on the update object. If the reducer hasn't changed by the
                            // time we enter the render phase, then the eager state can be used
                            // without calling the reducer again.
                            update.eagerReducer = lastRenderedReducer;
                            update.eagerState = eagerState;
                            if (is(eagerState, currentState)) {
                                // Fast path. We can bail out without scheduling React to re-render.
                                // It's still possible that we'll need to rebase this update later,
                                // if the component re-renders for a different reason and by that
                                // time the reducer has changed.
                                return;
                            }
                        } catch (error) {
                            // Suppress the error. It will throw again in the render phase.
                        } finally {
                            if (__DEV__) {
                                ReactCurrentDispatcher.current = prevDispatcher;
                            }
                        }
                    }
                }

                // 调度 fiber 上的更新
                scheduleWork(fiber, expirationTime);
            }
        }
```

下面重点看一下 dispatchAction 中的数据结构。

-  dispatchAction 数据结构是 map<queue, linked list>，其中 update 构成单向环形链表。
-  scheduleWork(fiber, expirationTime) 会调度 fiber 的更新。
-  react update 数据结构图如下图。

![react update 数据结构.png](/assets/img/react%20update%20数据结构.png)

update 对象是如何处理的？

update 对象是根据 queue.last 指针来确定的，也就是说可以通过 last 指针找到最新的 update 。那么 dispatchAction 这个函数的主要作用就是：

- 将 hook 运行所产生的的 update 添加到链表中，便于 scheduleWork 以及之后的程序去调度使用。
- 同时对于挂载阶段的首次 update 也做了特殊的处理，在进入渲染之前就开始计算下一个 state，即 eagerState。
- scheduleWork 正是任务调度中的起始部分。


### render phase 的 useState

在 render 阶段，HooksDispatcherOnUpdate 这个 dispatcher 所调用的是 `updateState` 这个函数。

下面我们就来看看这个函数：

```js
function updateState<S>(
  initialState: (() => S) | S,
): [S, Dispatch<BasicStateAction<S>>] {
  return updateReducer(basicStateReducer, (initialState: any));
}
```

这里可以看到：
- updateState 是依赖于 updateReducer 来处理状态变化的，后面我们会看到 useReducer 在 update 阶段所使用的正是 updateReducer。
- updateReducer 接受初始状态 initialState，返回一个 state 和 一个 dispatch 函数，这符合我们对 useReducer 的认知。可见 useReducer 是 useState 的副产物，或者说 useReducer 是 useState 状态管理的基础。
- useState 使用的 reducer 是 basicStateReducer。
  

#### 什么是 reducer 和 basicStateReducer？

```js
function reducer(state, action): state {}
```

reducer 就是一个状态转换机，接受一个 state 和 用于转换 state 的 action，返回一个新的 state。

```js
function basicStateReducer<S>(state: S, action: BasicStateAction<S>): S {
  return typeof action === 'function' ? action(state) : action;
}
```

`basicStateReducer` 就是说：如果 action 是一个状态转换器（即时函数），将就将原状态交由转换器进行转换，返回新的状态，否则就像 action 视为一个返回新状态。看到这里，和 useState 中 dispatch 的用法就契合上了，useState 使用了 basicStateReducer，可见 dispatch 的实质就是一个 basicStateReducer。


下面来看一下 updateReducer 是如何处理的，解决了这个问题，我们可以同时弄清楚 useReducer 的原理了。

## updateReducer 更新状态

请看 updateReducer 函数的源码：

```js
function updateReducer<S, I, A>(
  reducer: (S, A) => S,
  initialArg: I,
  init?: I => S,
): [S, Dispatch<A>] {
  // 当前正在调度的 hook
  const hook = updateWorkInProgressHook();
  // queue 就是上文中分析的 hook 更新的数据结构，queue 非空，即 queue 中的 update 一定不会为空。
  // 因为在useState mount 阶段会初始化一个 Update，并且 last 指针指向他。
  const queue = hook.queue;
  invariant(
    queue !== null,
    'Should have a queue. This is likely a bug in React. Please file an issue.',
  );

  // 最近用于渲染的 reducer 记录在 queue 上
  queue.lastRenderedReducer = reducer;
  // 如果 hook 已经 render 过
  if (numberOfReRenders > 0) {
    // This is a re-render. Apply the new render phase updates to the previous
    // work-in-progress hook.
    // 这里的 dispatch 是在上一次 setState 是挂载到 queue 上的，如果是 mount 阶段，
    // 也会返回一个 dispatch，可参照 mount 阶段
    const dispatch: Dispatch<A> = (queue.dispatch: any);
    // renderPhaseUpdates 中记录了更新队列，结构是  Map<UpdateQueue,Update>
    // 更新队列非空
    if (renderPhaseUpdates !== null) {
      // Render phase updates are stored in a map of queue -> linked list
      // 获取当前 hook 的第一个更新
      const firstRenderPhaseUpdate = renderPhaseUpdates.get(queue);
      // 如果没有需要更新的，则不必走下面的 reduce 过程
      if (firstRenderPhaseUpdate !== undefined) {
        // 经过下面 reduce 的过程，当前 queue 下所有的更新应该都被处理，
        // 所以这里可以提前将 queue 删掉，因为 queue 下面的 update 链表已经保存在 firstRenderPhaseUpdate
        // firstRenderPhaseUpdate 正在更新链表的头指针
        // 这里实际上是断开了 queue 和 firstRenderPhaseUpdate 的指向关系
        renderPhaseUpdates.delete(queue);
        // state reduce 过程以 memoizedState 为初始状态
        let newState = hook.memoizedState;
        let update = firstRenderPhaseUpdate;
        // 这个循环说明在useState的状态更新过程中，会将 update 组成一个一个的 queue，每个 queue 中的
        // 所有的 update 都是一起更新的，也就是一个更新链。河阳可以避免产生过多的无意义的 re-render，
        // 提高更新的效率。
        // 这里建表的更新是从链首到链首依次更新的。
        do {
          // Process this render phase update. We don't have to check the
          // priority because it will always be the same as the current
          // render's.
          // 每个 update 上都有一个 action ,具体可见上文 update 的结构
          // setState 的 action 是一个 BasicStateAction
          const action = update.action;
          // reducer 将当前状态转换为新状态
          newState = reducer(newState, action);
          // 指针移到下一个 update
          update = update.next;
        } while (update !== null);

        // Mark that the fiber performed work, but only if the new state is
        // different from the current state.
        // 如果最新状态 newState 和原状态 memoizedState 不一致，则 didReceiveUpdate 为 true
        // 表示在 fiber 上执行了更新
        if (!is(newState, hook.memoizedState)) {
          markWorkInProgressReceivedUpdate();
        }
        // 更新 memoizedState，方便下次 render
        hook.memoizedState = newState;
        // Don't persist the state accumulated from the render phase updates to
        // the base state unless the queue is empty.
        // TODO: Not sure if this is the desired semantics, but it's what we
        // do for gDSFP. I can't remember why.
        // 除非队列为空，否则不要将渲染阶段更新累积的状态持久化到基本状态。
        if (hook.baseUpdate === queue.last) {
          hook.baseState = newState;
        }
        // lastRenderedState 记录上一次的 state，此次 render 后，updates 链表将被回收，但是 map 
        // 上的 queue 却没有丢，并且将上次渲染状态更新为 newState
        queue.lastRenderedState = newState;
        // 经过 render 之后返回新状态 newState 和 dispatch 函数。dispatch 实际上是从 queue 上取的。
        return [newState, dispatch];
      }
    }
    // 没有经过 render，只需返回原状态 memoizedState。
    return [hook.memoizedState, dispatch];
  }
  
  // hook 首次 render,之所以要区分开，是因为首次 render 需要做一些初始化工作
  // The last update in the entire queue
  const last = queue.last;
  // The last update that is part of the base state.
  const baseUpdate = hook.baseUpdate;
  const baseState = hook.baseState;

  // Find the first unprocessed update.找到第一个未处理的更新
  let first;
  // baseUpdate 为上次的更新
  if (baseUpdate !== null) {
    if (last !== null) {
      // For the first update, the queue is a circular linked list where
      // `queue.last.next = queue.first`. Once the first update commits, and
      // the `baseUpdate` is no longer empty, we can unravel the list.
      // 这是首次 update，update.next ==== update, 如果是首次渲染，baseUpdate 应该为空
      // 而此处 baseUpdate 不为空，说明经过了首次渲染，所以将链表解开
      last.next = null;
    }
    // 正常情况下直接取 baseUpdate.next
    first = baseUpdate.next;
  } else {
    // 没有上次更新，取 last.next
    first = last !== null ? last.next : null;
  }
  if (first !== null) {
    // reduce 的初始状态
    let newState = baseState;
    let newBaseState = null;
    let newBaseUpdate = null;
    let prevUpdate = baseUpdate;
    let update = first;
    let didSkip = false;
    // 循环 reduce 状态，获取最新状态
    do {
      const updateExpirationTime = update.expirationTime;
      // 该 update 太新，未超过 renderExpirationTime，优先级较低
      if (updateExpirationTime < renderExpirationTime) {
        // Priority is insufficient. Skip this update. If this is the first
        // skipped update, the previous update/state is the new base
        // update/state.
        // 对于优先级较低的 update,会先跳过。如果首次跳过，就应该对 newBaseUpdate、 newBaseState
        // 赋原值，否则不改变值即可
        if (!didSkip) {
          didSkip = true;
          newBaseUpdate = prevUpdate;
          newBaseState = newState;
        }
        // remainingExpirationTime 表示当前队列中不用立即渲染的低优先级的 update 中距离 renderExpirationTime
        // 最近的超时时间，这个时间越大，在下次渲染中该队列的优先级越大
        // Update the remaining priority in the queue.
        if (updateExpirationTime > remainingExpirationTime) {
          remainingExpirationTime = updateExpirationTime;
          markUnprocessedUpdateTime(remainingExpirationTime);
        }
      // 优先级达到标准的 update 会进行渲染
      } else {
        // This update does have sufficient priority.

        // Mark the event time of this update as relevant to this render pass.
        // TODO: This should ideally use the true event time of this update rather than
        // its priority which is a derived and not reverseable value.
        // TODO: We should skip this update if it was already committed but currently
        // we have no way of detecting the difference between a committed and suspended
        // update here.
        markRenderEventTimeAndConfig(
          updateExpirationTime,
          update.suspenseConfig,
        );

        // Process this update.
        if (update.eagerReducer === reducer) {
          // If this update was processed eagerly, and its reducer matches the
          // current reducer, we can use the eagerly computed state.
          // 如果有提前计算的 reducer, 并且和当前的 reducer 一样，可以使用提前计算的结果
          newState = ((update.eagerState: any): S);
        } else {
          // reduce 新的状态
          const action = update.action;
          newState = reducer(newState, action);
        }
      }
      // 保存原来的状态
      prevUpdate = update;
      // 移向下一个 update
      update = update.next;
      // first 已经执行过，移动到链尾
    } while (update !== null && update !== first);

    // 如果有首次跳过中断的 update，newBaseUpdate 记录中断前的 update，否则记录最新的 update
    if (!didSkip) {
      newBaseUpdate = prevUpdate;
      newBaseState = newState;
    }

    // Mark that the fiber performed work, but only if the new state is
    // different from the current state.
    // 标记前后状态是否确实有更新，didReceiveUpdate 标记为 true 时，才会真正去更新 Fiber
    if (!is(newState, hook.memoizedState)) {
      markWorkInProgressReceivedUpdate();
    }

    hook.memoizedState = newState;
    hook.baseUpdate = newBaseUpdate;
    hook.baseState = newBaseState;

    queue.lastRenderedState = newState;
  }

  const dispatch: Dispatch<A> = (queue.dispatch: any);
  return [hook.memoizedState, dispatch];
}
```

上面这个函数的信息量很大，总结如下。

- updateReducer 主要的作用就是：处理 updates 链表，更新 state 的状态。
- queue 是 hook 上的管理更新的数据结构。queue 中包含了的数据如下。

| 参数                | 描述                                   |
| ------------------- | -------------------------------------- |
| lastRenderedReducer | 用于 reducer 状态的 reducer            |
| dispatch            | 暴露给用户的修改状态的action           |
| last                | 指向 update queue 中首个 update 的指针 |
| lastRenderedState   | 上一次渲染的状态                       |

- dispatch 和 reducer 的区别：

```js
function dispatch(state || () => state): void // 本质上就是一个 action
function reducer(state, action): state // 本质上是一个状态转换器
```

- numberOfReRenders 会随着 renderWithHooks 的调用增加，记录的是 renderWithHooks 的调用次数。renderWithHooks 主要在 react-reconciler 包中 ReactFiberBeginWork.js 中使用，这个函数是渲染 FC 组件的，返回组件的 VDOM。 numberOfReRenders 只有增加、重置两种操作。在 finishHooks 和 resetHooks 函数中会将 numberOfReRenders 重置为 0；这说明在 hook finish 之前，会 render 多次。

- renderExpirationTime 是一个常量 `NoWork = 0`，因此 updateExpirationTime 应该是负数，当这个过期时间达到 0 时，才具有渲染的与优先级，否则会被跳过，并更新 remainingExpirationTime（remainingExpirationTime 是逐渐变大的）。

- updateReducer 结构图：

![updateReducer 结构图￼](/assets/img/updateReducer%20结构图￼.png)

## 一些问题

看到这里还有一些细节问题：

### useState 状态更新为什么会引起 UI 更新？

在这个部分里，只是对 newState 做了计算，最终 newState 被挂载在了 hook.memoizedState 上（也就是说更新了 hook.memoizedState 的值），在需要 reRender 时将 didReceiveUpdate 标记为了 true。真正的 UI 的更新，还得跟 render 部分和 上文中的 dispatchAction 有关。didReceiveUpdate 主要在 react-reconciler 包中 ReactFiberBeginWork.js 中被使用。useState 只是对 didReceiveUpdate 做了标记，UI 更新会在 setState 之后 dispatchAction 中 scheduleWork 的调用后进行调度更新。

### renderPhaseUpdates 管理更新

下面仅展示 renderPhaseUpdates 的内容。
renderPhaseUpdates 数据结构如下：

```js
let renderPhaseUpdates: Map<
  UpdateQueue<any, any>,
  Update<any, any>,
> | null = null;
```

updateReducer 中：

```js
if (renderPhaseUpdates !== null) {
  const firstRenderPhaseUpdate = renderPhaseUpdates.get(queue);
  if (firstRenderPhaseUpdate !== undefined) {
    renderPhaseUpdates.delete(queue);
  }
}
```

dispatchAction 中：

```js
if (renderPhaseUpdates === null) {
  renderPhaseUpdates = new Map();
}
const firstRenderPhaseUpdate = renderPhaseUpdates.get(queue);
if (firstRenderPhaseUpdate === undefined) {
  renderPhaseUpdates.set(queue, update);
}
```

- 可见其本质是一个 Map，在 dispatchAction 中初始化，并且将 setState 所产生的更新装进 map，每个 useState 对应 map 中的一个 queue，queue 中是一个环状链表，last 指向首个 update。
- 在 resetHooks 中被重置为 null，在 updateReducer 中 queue 被消费。

### 为什么 setState 是状态的替换，而不是状态的补充？

我们知道 setState 实质上创建饿更新并将 queue 上的 update 链表的建构更新了，并且通知了 scheduleWork 调度更新。因此在更新中 updateReducer 生成了 newState，这里的 newState 重新渲染了页面。updateReducer 中更新 newState 靠的就是 reducer，在 useState 中使用的 reducer 就是 `basicStateReducer`。basicStateReducer 是将 setState 中的状态直接替换了原来的状态。因此，setState 实际上是状态的替换。如果想要状态的补充，可以在 setState 中将原来的状态进行 merge，这不修改 setState 的本质特点，但是相比之下会更加灵活。

```ts
export function useMergedState<T>(initialState: T) {
  const [state, setState] = useState<T>(initialState);
  let mergeState: any = setState;
  if (typeof state === 'object') {
    mergeState = (value: T) => {
      if (value && typeof value === 'object') {
        setState({
          ...state,
          ...value,
        });
      } else {
        setState(value);
      }
    };
  }
  return [state, setState, mergeState];
}
```

-------

至此 useState 的原理就明晰了。下面简单总结下：

- 各种 hook api 都是由 dispatcher 管理的，不同的渲染阶段会使用不同的 dispatcher，当然 dev 环境也会有 dev 环境的 dispatcher。

- mount 阶段调用 mountState 初始化 state 并生成 queue 在 dispatchAction 中加入 renderPhaseUpdates，并且直接由 dispatchAction 调度渲染。

- render 阶段调用 updateState 利用 reducer 更新 state 和 dispatch，这里并没有直接 调度渲染。

- 在 setState 被使用时就调用了 dispatchAction 调度渲染。dispatchAction 创建更新对象，更新 update 环形链表的结构，并且调用了 scheduleWork 去调度更新 Fiber。

## 参考链接

- [官方文档](https://reactjs.org/docs/hooks-reference.html#usestate)