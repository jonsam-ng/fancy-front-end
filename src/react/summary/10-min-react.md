# 10 分钟看懂 React 框架原理

<Badges :content="[{type: 'tip', text: 'React17'}]" />

<TimeToRead />

## 目录

[[TOC]]

## ReactDOMHostConfig

下面我们先探究一下生产更新的来源，主要分析 updateContainer 和 scheduleUpdateOnFiber 两个函数。

## updateContainer

更新是如何开始的？我们首先从 updateContainer 的调用来源开始追溯。

调用 updateContainer 的函数包括： legacyRenderSubtreeIntoContainer、ReactDOMRoot.prototype.render、ReactDOMRoot.prototype.unmount、hydrateRoot、scheduleRoot。ReactDOMRoot 由 ReactDOM.createRoot 创建。scheduleRoot 在 `src/react/packages/react-reconciler/src/ReactFiberHotReloading.new.js` 文件中。

```txt
// 应用层 API
legacyRenderSubtreeIntoContainer <- ReactDOM.hydrate
                                 <- ReactDOM.render
                                 <- ReactDOM.unmountComponentAtNode
```

由上面的分析可以看出，updateContainer 主要来源于应用层调用，这种调用生产了更新渲染的需求。那么 updateContainer 主要做了什么？

```ts
// src/react/packages/react-reconciler/src/ReactFiberReconciler.new.js
export function updateContainer(
  element: ReactNodeList,
  container: OpaqueRoot,
  parentComponent: ?React$Component<any, any>,
  callback: ?Function,
): Lane {
  // 获取 RootFiber
  const current = container.current;
  const eventTime = requestEventTime();
  const lane = requestUpdateLane(current);

  // 更新 container 的 context 信息
  const context = getContextForSubtree(parentComponent);
  if (container.context === null) {
    container.context = context;
  } else {
    container.pendingContext = context;
  }

  // 创建一个更新
  const update = createUpdate(eventTime, lane);
  // Caution: React DevTools currently depends on this property
  // being called "element".
  update.payload = {element};

  callback = callback === undefined ? null : callback;
  if (callback !== null) {
    update.callback = callback;
  }

  // 将新建的更新入栈
  enqueueUpdate(current, update, lane);
  // 请求一次调度更新
  const root = scheduleUpdateOnFiber(current, lane, eventTime);
  if (root !== null) {
    entangleTransitions(root, current, lane);
  }

  return lane;
}
```

updateContainer 关键功能如下：

- 继续完善 FiberRoot 信息：context、pendingContext。
- 初始化创建一个更新对象，添加属性 payload、callback，并且将更新加入更新队列。
- 调用 scheduleUpdateOnFiber，向调度器发出一次调度的请求。

## scheduleUpdateOnFiber

在 updateContainer 中，调用了 scheduleUpdateOnFiber 以在 fiber 上调度一次更新，那么调度更新是如何在 fiber 上展开的呢？

首先来分析一下代码：

```ts
// src/react/packages/react-reconciler/src/ReactFiberWorkLoop.new.js
// Lanes that were updated during the render phase (*not* an interleaved event).
let workInProgressRootRenderPhaseUpdatedLanes: Lanes = NoLanes;
// Whether to root completed, errored, suspended, etc.
let workInProgressRootExitStatus: RootExitStatus = RootIncomplete;
export function mergeLanes(a: Lanes | Lane, b: Lanes | Lane): Lanes {
  return a | b;
}
export function scheduleUpdateOnFiber(
  fiber: Fiber,
  lane: Lane,
  eventTime: number,
): FiberRoot | null {
  // 检查嵌套更新，防止死循环
  checkForNestedUpdates();
  // 从 fiber 向上收集 lanes，root：FiberRoot = fiber.stateNode。
  const root = markUpdateLaneFromFiberToRoot(fiber, lane);
  if (root === null) {
    return null;
  }

  // Mark that the root has a pending update.
  // 标记 root 即将更新，root.pendingLanes |= lane
  markRootUpdated(root, lane, eventTime);
  // 如果当前已经是 Render 阶段，且 root 是待处理的 HostRoot，这时跳过渲染，并且追踪 lane，提高任务优先级，等待下次渲染
  if (
    (executionContext & RenderContext) !== NoLanes &&
    root === workInProgressRoot
  ) {
    // Track lanes that were updated during the render phase
    // 收集当前的 lane 到 workInProgressRootRenderPhaseUpdatedLanes
    workInProgressRootRenderPhaseUpdatedLanes = mergeLanes(
      workInProgressRootRenderPhaseUpdatedLanes,
      lane,
    );
  } else {
    if (root === workInProgressRoot) {
      // 如果 RootSuspendedWithDelay 为 RootSuspendedWithDelay，则标记 root 为 suspend。
      if (workInProgressRootExitStatus === RootSuspendedWithDelay) {
        // The root already suspended with a delay, which means this render
        // definitely won't finish. Since we have a new update, let's mark it as
        // suspended now, right before marking the incoming update. This has the
        // effect of interrupting the current render and switching to the update.
        // TODO: Make sure this doesn't override pings that happen while we've
        // already started rendering.
        markRootSuspended(root, workInProgressRootRenderLanes);
      }
    }
    // 确保 HostRoot 向调度器发起调度请求，
    ensureRootIsScheduled(root, eventTime);
    if (
      lane === SyncLane &&
      executionContext === NoContext &&
      (fiber.mode & ConcurrentMode) === NoMode &&
      // Treat `act` as if it's inside `batchedUpdates`, even in legacy mode.
      !(__DEV__ && ReactCurrentActQueue.isBatchingLegacy)
    ) {
      // 如果是同步更新，context 还是 NoContext 阶段，fiber.mode 不是 ConcurrentMode，且 prd 环境 ReactCurrentActQueue.isBatchingLegacy 为 true
      // 在初次加载时重置 workInProgressRootRenderTargetTime 并且 flushSyncCallbacks。
      // Flush the synchronous work now, unless we're already working or inside
      // a batch. This is intentionally inside scheduleUpdateOnFiber instead of
      // scheduleCallbackForFiber to preserve the ability to schedule a callback
      // without immediately flushing it. We only do this for user-initiated
      // updates, to preserve historical behavior of legacy mode.
      resetRenderTimer();
      flushSyncCallbacksOnlyInLegacyMode();
    }
  }
  return root;
}
```

这个函数的核心功能如下：

- 从 fiber 向父级收集 lanes，并且计算出 HostRoot。
- 调用 ensureRootIsScheduled，确保 HostRoot 发起同步或者异步调度。
- 如果是初次启动应用，执行一些初始化工作。

下面我们将以 scheduleUpdateOnFiber 函数作为突破口，一层层的往下追溯，看看 React 的更新具体是怎样的流程，以及更新产生的来源到底是什么？

::: warning 
<- 表示代码向下追溯，即前面的函数被后面的函数调用或者使用。<<< 表示省略追溯过程，因为从前面的过程中可以推出。... 表示忽略此过程。
:::

```txt
scheduleUpdateOnFiber <- updateDehydratedSuspenseComponent <- updateSuspenseComponent <- attemptEarlyBailoutIfNoScheduledUpdate <- beginWork
                                                                                      <- beginWork
                      <- classComponentUpdater[enqueueSetState、enqueueReplaceState、enqueueForceUpdate] <- adoptClassInstance <- mountIndeterminateComponent <- beginWork
                                                                                                                              <- constructClassInstance <- updateClassComponent <- mountLazyComponent <- beginWork
                                                                                                                                                                                <- beginWork
                                                                                                                                                        <- mountIncompleteClassComponent <- beginWork
                                                                                                        <- callComponentWillMount <- mountClassInstance <- updateClassComponent <- mountLazyComponent <- beginWork
                                                                                                                                                                                <- beginWork
                                                                                                                                                        <- mountIncompleteClassComponent <- beginWork
                                                                                                        <- callComponentWillReceiveProps <- resumeMountClassInstance <- updateClassComponent <<< beginWork
                                                                                                                                         <- updateClassInstance <<< beginWork
                      <- [DEV]forceStoreRerender <- updateStoreInstance <- mountSyncExternalStore ...
                                                                   <- updateSyncExternalStore ...
                                            <- subscribeToStore ...
                      <- [enableCache]refreshCache <- mountRefresh ...
                      <- dispatchReducerAction <- mountReducer <- reducer.dispatch[useReducer]
                      <- dispatchSetState <- useMutableSource <- stateHook.queue.dispatch <- dispatchAction[queue.reducer(state, dispatch)]  <- useState
                                          <- mountState <- HooksDispatcherOnMount.useState <- ReactCurrentDispatcher.current <- useState
                                                        <- mountTransition <- HooksDispatcherOnMount.useTransition <- useTransition
                                                        <- mountDeferredValue <- HooksDispatcherOnMount.useDeferredValue <- useDeferredValue
                      <- updateContainer <<< ReactDOM[hydrate、render、unmountComponentAtNode、createRoot、hydrateRoot、scheduleRoot]
                      <!-- <- attemptSynchronousHydration -->
                      <!-- <- attemptDiscreteHydration -->
                      <!-- <- attemptContinuousHydration -->
                      <!-- <- attemptHydrationAtCurrentPriority -->

beginWork <- workLoopConcurrent <- renderRootConcurrent <- performConcurrentWorkOnRoot <- ensureRootIsScheduled[root.callbackNode] <- scheduleUpdateOnFiber <<< beginWork
          <- performUnitOfWork <- workLoopSync <- renderRootSync <- performConcurrentWorkOnRoot <<< beginWork
                               <- workLoopConcurrent <- renderRootConcurrent <- performConcurrentWorkOnRoot <<< beginWork

commitRoot <- finishConcurrentRender[RootErrored、RootSuspended、RootSuspendedWithDelay、RootCompleted] <- performConcurrentWorkOnRoot
           <- performSyncWorkOnRoot
```

从上面的分析过程，我们可以得出很多重要的信息，总结如下：

### 一个闭环

从上面可以清晰的看出，从 scheduleUpdateOnFiber 往上追溯时，最终追溯到了 beginWork，然后从 beginWork 继续追溯，最终追溯到 scheduleUpdateOnFiber。大致过程如下：

```txt
钩子（生命周期）和事件系统 -> 应用层行为：dispatchSetState、classComponentUpdater、dispatchReducerAction、updateContainer 
-> scheduleUpdateOnFiber -> ensureRootIsScheduled -> performSyncWorkOnRoot、performConcurrentWorkOnRoot 
-> renderRootSync、renderRootConcurrent -> workLoopSync、workLoopConcurrent 
-> performUnitOfWork -> beginWork -> mount、update 组件 -> 调用生命周期函数、响应事件系统 -> commitRoot -> ...
```

有一下几点需要注意：

- 应用层行为分别可以对应 FC setState、类组件 this.setState、useReducer 的 dispatch 和 ReactDOM 的一系列操作，如 hydrate、render、unmountComponentAtNode、createRoot、hydrateRoot、scheduleRoot。
- 从 ensureRootIsScheduled -> performConcurrentWorkOnRoot 中间还有调度器的调度过程，包括 scheduleSyncCallback 和 scheduleCallback，分别对应同步任务的调度和异步任务的调度。
- 在 performSyncWorkOnRoot、performConcurrentWorkOnRoot 执行之后，有一个 commitRoot 的操作。
- beginWork -> mount、update 组件 这个过程中涉及的内容较为繁琐，可以参考更新器的部分。

一个完整的同步的渲染回调的调用函数栈，可以参考下图：

<img :src="$withBase('/assets/img/react-call-stack.png')" alt="react-call-stack" data-zoomable />

### 更新的来源

更新主要来源于应用层的一些行为：dispatchSetState、classComponentUpdater、dispatchReducerAction、updateContainer 和 ReactDOM 的一系列操作，如 hydrate、render、unmountComponentAtNode、createRoot、hydrateRoot、scheduleRoot。大致包括应用 mount 阶段对 ReactDOM API 调用引起的同步更新，类组件和 FC 状态更新、useReducer 的 dispatch 的调用，以及最新 ConcurrentAPI 如 useTransition、useDeferredValue 等。

下面我们从一个更为直接的角度来探究 React 更新的来源。现在我们知道，如果需要更新，则会将更新入栈，我们从这个角度来分析一下，在代码中搜索 `enqueueUpdate(`：

调用 `enqueueUpdate(` 主要在如下几个模块：

- src/react/packages/react-reconciler/src/ReactFiberClassComponent.new.js
- src/react/packages/react-reconciler/src/ReactFiberHooks.new.js
- src/react/packages/react-reconciler/src/ReactFiberReconciler.new.js
- src/react/packages/react-reconciler/src/ReactFiberThrow.new.js
- src/react/packages/react-reconciler/src/ReactFiberWorkLoop.new.js

然后分析下分别在哪些函数中出现：

```txt
>> ReactFiberClassComponent
classComponentUpdater[enqueueSetState、enqueueReplaceState、enqueueForceUpdate]

>> ReactFiberHooks
dispatchReducerAction
dispatchSetState

>> ReactFiberReconciler
updateContainer

// 以下的 Update 为 ErrorUpdate

>> ReactFiberThrow
markSuspenseBoundaryShouldCapture <- throwException <- handleError <- renderRootSync/renderRootConcurrent

>> ReactFiberWorkLoop
captureCommitPhaseErrorOnRoot <- captureCommitPhaseError <- safelyCallCommitHookLayoutEffectListMount/safelyCallComponentWillUnmount/safelyCallComponentDidMount/safelyAttachRef/safelyDetachRef/safelyCallDestroy/commitBeforeMutationEffects_complete/commitMutationEffects_begin/commitMutationEffects_complete/commitLayoutMountEffects_complete/reappearLayoutEffects_complete/commitPassiveMountEffects_complete
captureCommitPhaseError <<< ...
```

可以看出，与前文的分析基本一致。

关于 useTransition、useDeferredValue 可以参考：[淺談 React Concurrent Mode & 相關功能(Fiber、Suspense、useTransition、useDeferredValue)](https://ithelp.ithome.com.tw/articles/10281124)

## ensureRootIsScheduled

在上面对 scheduleUpdateOnFiber 的分析中，最重要的就是调用 ensureRootIsScheduled，以保证在 fiber 所在的 HostRoot 上调度更新，那么 HostRoot 上是如何继续调度的呢？

```ts
function ensureRootIsScheduled(root: FiberRoot, currentTime: number) {
  const existingCallbackNode = root.callbackNode;

  // Check if any lanes are being starved by other work. If so, mark them as
  // expired so we know to work on those next.
  // 将饿死的 lens 标记为超时以一并更新
  markStarvedLanesAsExpired(root, currentTime);

  // Determine the next lanes to work on, and their priority.
  // 计算将要渲染的 lanes
  const nextLanes = getNextLanes(
    root,
    root === workInProgressRoot ? workInProgressRootRenderLanes : NoLanes,
  );
  // 无需要渲染的 lanes
  if (nextLanes === NoLanes) {
    // Special case: There's nothing to work on.
    if (existingCallbackNode !== null) {
      cancelCallback(existingCallbackNode);
    }
    root.callbackNode = null;
    root.callbackPriority = NoLane;
    return;
  }

  // We use the highest priority lane to represent the priority of the callback.
  // 获取 lanes 中优先级最高的 lane 作为 callback 的优先级
  const newCallbackPriority = getHighestPriorityLane(nextLanes);

  // Check if there's an existing task. We may be able to reuse it.
  const existingCallbackPriority = root.callbackPriority;
  // 由于即将要生成新的 callback，先将现在的 callback 取消掉
  if (existingCallbackNode != null) {
    // Cancel the existing callback. We'll schedule a new one below.
    cancelCallback(existingCallbackNode);
  }

  // Schedule a new callback.
  let newCallbackNode;
  // 如果是同步更新任务
  if (newCallbackPriority === SyncLane) {
    // Special case: Sync React callbacks are scheduled on a special
    // internal queue
    if (root.tag === LegacyRoot) {
      if (__DEV__ && ReactCurrentActQueue.isBatchingLegacy !== null) {
        ReactCurrentActQueue.didScheduleLegacyUpdate = true;
      }
      scheduleLegacySyncCallback(performSyncWorkOnRoot.bind(null, root));
    } else {
      // 请求同步调度回调 performSyncWorkOnRoot，将该回调加入同步回调队列
      scheduleSyncCallback(performSyncWorkOnRoot.bind(null, root));
    }
    if (supportsMicrotasks) {
      // Flush the queue in a microtask.
      if (__DEV__ && ReactCurrentActQueue.current !== null) {
        // Inside `act`, use our internal `act` queue so that these get flushed
        // at the end of the current scope even when using the sync version
        // of `act`.
        ReactCurrentActQueue.current.push(flushSyncCallbacks);
      } else {
        scheduleMicrotask(() => {
          // In Safari, appending an iframe forces microtasks to run.
          // https://github.com/facebook/react/issues/22459
          // We don't support running callbacks in the middle of render
          // or commit so we need to check against that.
          if (executionContext === NoContext) {
            // It's only safe to do this conditionally because we always
            // check for pending work before we exit the task.
            // 消费完同步回调队列
            flushSyncCallbacks();
          }
        });
      }
    } else {
      // Flush the queue in an Immediate task.
      // 向调度器请求回调，优先级 ImmediatePriority（立即回调），回调后执行 flushSyncCallbacks 将同步回调队列消费完
      scheduleCallback(ImmediateSchedulerPriority, flushSyncCallbacks);
    }
    // 同步更新执行完毕，将 newCallbackNode 置为 null
    newCallbackNode = null;
  } else {
    let schedulerPriorityLevel;
    // 将 lanes 转化为事件优先级
    switch (lanesToEventPriority(nextLanes)) {
      // 离散事件优先级：ImmediateSchedulerPriority
      case DiscreteEventPriority:
        schedulerPriorityLevel = ImmediateSchedulerPriority;
        break;
      // 连续事件优先级：UserBlockingSchedulerPriority
      case ContinuousEventPriority:
        schedulerPriorityLevel = UserBlockingSchedulerPriority;
        break;
      // 默认事件优先级：NormalSchedulerPriority
      case DefaultEventPriority:
        schedulerPriorityLevel = NormalSchedulerPriority;
        break;
      // Idle 事件优先级：IdleSchedulerPriority
      case IdleEventPriority:
        schedulerPriorityLevel = IdleSchedulerPriority;
        break;
      default:
        schedulerPriorityLevel = NormalSchedulerPriority;
        break;
    }
    // 向调度器请求相应优先级的异步回调，回调后执行 performConcurrentWorkOnRoot，Scheduler.scheduleCallback 返回调度的 callbackNode(newTask)
    newCallbackNode = scheduleCallback(
      schedulerPriorityLevel,
      performConcurrentWorkOnRoot.bind(null, root),
    );
  }
  // 更新 callbackPriority 和 callbackNode 注意，此时异步回调并未执行
  root.callbackPriority = newCallbackPriority;
  root.callbackNode = newCallbackNode;
}
```

这个函数有以下几个关键作用：

- 更新 root 的 callbackNode、callbackPriority 属性。
- 同步更新调度：调用 scheduleSyncCallback 将同步回调 performSyncWorkOnRoot 推入同步回调队列 syncQueue，并且以 ImmediateSchedulerPriority 的优先级向调度器请求同步回调，回调时执行 flushSyncCallbacks 消费同步队列中所有的同步回调。
- 异步更新调度：根据 nextLanes 计算事件优先级，并且转化为调度优先级，以相应的调度优先级向调度器发起异步回调，回调时执行 performConcurrentWorkOnRoot。
- 注意同步调度中调用了 scheduleSyncCallback、scheduleCallback 两个函数不可混淆，scheduleCallback 只是 Scheduler 提供的一种基于优先级机制的任务（回调）调度手段，performSyncWorkOnRoot 和 performConcurrentWorkOnRoot 才是真正要通过调度执行的任务。同步的任务通过同步回调队列的方式进行了优化处理。调度器不是不可替换的，如果浏览器支持微任务，同步任务的处理就可以交给微任务处理，而不经过调度器。

nextLanes 优先级是如何计算的？参见 [Lane 与优先级](/react/reconciliation/lane)

### DiscreteEventPriority 和 ContinuousEventPriority

离散事件：discreteEvent，常见的如：click, keyup, change；
用户阻塞事件：userBlocking，常见的如：dragEnter, mouseMove, scroll；
连续事件：continuous，常见的如：error, progress, load, ；

更多解析可以参考：[React 中的事件监听机制](./event-listener)

### scheduleMicrotask 与 queueMicrotask

可以看到，如果浏览器支持 queueMicrotask，同步调度就不用经过调度器，而是直接交由微任务和处理，这样既减少了 performSyncWorkOnRoot 执行的压力，同时又要比 setTimeout 这样的宏任务更快的执行。queueMicrotask 可以由 Promise 来模拟。queueMicrotask() 方法将微任务排队以调用 callback。

> queueMicrotask adds the function (task) into a queue and each function is executed one by one (FIFO) after the current task has completed its work and when there is no other code waiting to be run before control of the execution context is returned to the browser's event loop.

```ts
const localPromise = typeof Promise === 'function' ? Promise : undefined;
export const supportsMicrotasks = true;
export const scheduleMicrotask: any =
  typeof queueMicrotask === 'function'
    ? queueMicrotask
    : typeof localPromise !== 'undefined'
    ? callback =>
        localPromise
          .resolve(null)
          .then(callback)
          .catch(handleErrorInNextTick)
    : scheduleTimeout; // TODO: Determine the best fallback here.

function handleErrorInNextTick(error) {
  setTimeout(() => {
    throw error;
  });
}
```

了解更多关于微任务可以参考：

- [在 JavaScript 中通过 queueMicrotask() 使用微任务](https://developer.mozilla.org/zh-CN/docs/Web/API/HTML_DOM_API/Microtask_guide)
- [An Introduction to JavaScript's queueMicrotask](https://www.freecodecamp.org/news/queuemicrotask/)
- [caniuse: queueMicrotask API](https://caniuse.com/?search=queueMicrotask)

## scheduleSyncCallback 和 scheduleCallback

在上面对 ensureRootIsScheduled 的分析中我们知道，ensureRootIsScheduled 对同步任务和异步任务分别进行了同步调度和异步调度，分别调用 scheduleSyncCallback 和 scheduleCallback，那么具体同步调度和异步调度是如何进行的呢？

### scheduleSyncCallback 和 flushSyncCallbacks

```ts
export function scheduleSyncCallback(callback: SchedulerCallback) {
  // Push this callback into an internal queue. We'll flush these either in
  // the next tick, or earlier if something calls `flushSyncCallbackQueue`.
  if (syncQueue === null) {
    syncQueue = [callback];
  } else {
    // Push onto existing queue. Don't need to schedule a callback because
    // we already scheduled one when we created the queue.
    syncQueue.push(callback);
  }
}

export function flushSyncCallbacks() {
  // isFlushingSyncQueue 是 syncQueue 的互斥锁 
  if (!isFlushingSyncQueue && syncQueue !== null) {
    // Prevent re-entrance.
    isFlushingSyncQueue = true;
    let i = 0;
    const previousUpdatePriority = getCurrentUpdatePriority();
    try {
      const isSync = true;
      const queue = syncQueue;
      // TODO: Is this necessary anymore? The only user code that runs in this
      // queue is in the render or commit phases.
      setCurrentUpdatePriority(DiscreteEventPriority);
      // flush syncQueue，每个 callback 可以返回一个新的 callback
      for (; i < queue.length; i++) {
        let callback = queue[i];
        do {
          callback = callback(isSync);
        } while (callback !== null);
      }
      // 重置 syncQueue
      syncQueue = null;
      includesLegacySyncCallbacks = false;
    } catch (error) {
      // If something throws, leave the remaining callbacks on the queue.
      // 如果syncQueue 中每个 RootCallback 发生了错误，则跳过此项
      if (syncQueue !== null) {
        syncQueue = syncQueue.slice(i + 1);
      }
      // Resume flushing in the next tick
      // 调度在下一个 tick 中继续执行
      scheduleCallback(ImmediatePriority, flushSyncCallbacks);
      throw error;
    } finally {
      setCurrentUpdatePriority(previousUpdatePriority);
      isFlushingSyncQueue = false;
    }
  }
  return null;
}
```

这两个函数有如下关键作用：

- 维护同步回调的 syncQueue，以在同步回调到来时 flush syncQueue。

更多分析，请参考 [React 首次渲染过程](/react/summary/first-render.html#flushsync) 中的 flushSyncCallbacks 函数分析。

### scheduleCallback

参考[调度器](/react/scheduler)章节内容。

## performSyncWorkOnRoot

```ts
// This is the entry point for synchronous tasks that don't go
// through Scheduler
function performSyncWorkOnRoot(root) {
  // 如果当前是 Render 阶段或者 Commit 阶段就报错，因为此时应该还在 Batch 阶段
  if ((executionContext & (RenderContext | CommitContext)) !== NoContext) {
    throw new Error('Should not already be working.');
  }
  // 进入 Render 阶段前，先把 effects 和 callbacks 都消费掉。
  flushPassiveEffects();
  // 获取即将渲染的 lanes
  let lanes = getNextLanes(root, NoLanes);
  if (!includesSomeLane(lanes, SyncLane)) {
    // There's no remaining sync work left.
    ensureRootIsScheduled(root, now());
    return null;
  }

  let exitStatus = renderRootSync(root, lanes);
  if (root.tag !== LegacyRoot && exitStatus === RootErrored) {
    // If something threw an error, try rendering one more time. We'll render
    // synchronously to block concurrent data mutations, and we'll includes
    // all pending updates are included. If it still fails after the second
    // attempt, we'll give up and commit the resulting tree.
    const errorRetryLanes = getLanesToRetrySynchronouslyOnError(root);
    if (errorRetryLanes !== NoLanes) {
      lanes = errorRetryLanes;
      exitStatus = recoverFromConcurrentError(root, errorRetryLanes);
    }
  }

  if (exitStatus === RootFatalErrored) {
    const fatalError = workInProgressRootFatalError;
    prepareFreshStack(root, NoLanes);
    markRootSuspended(root, lanes);
    ensureRootIsScheduled(root, now());
    throw fatalError;
  }

  // We now have a consistent tree. Because this is a sync render, we
  // will commit it even if something suspended.
  const finishedWork: Fiber = (root.current.alternate: any);
  root.finishedWork = finishedWork;
  root.finishedLanes = lanes;
  commitRoot(root);

  // Before exiting, make sure there's a callback scheduled for the next
  // pending level.
  ensureRootIsScheduled(root, now());

  return null;
}
```

分析一下这个函数：

- flushPassiveEffects 中主要调用 flushSyncCallbacks、commitPassiveUnmountEffects、commitPassiveMountEffects 这三个函数。调用这个函数的目的是什么？我们注意到， performSyncWorkOnRoot 会随着 scheduleSyncCallback 的调用而被执行，因此在 performSyncWorkOnRoot 执行时，很可能又有新的同步任务加入到同步回调队列中，所以为了提高同步渲染的效率，同时满足同步任务今早执行的目的，在 renderRootSync 之前，重新消费 SyncCallbacks。

<!-- TODO commitPassiveUnmountEffects、commitPassiveMountEffects -->

## performConcurrentWorkOnRoot

## renderRootSync

## renderRootConcurrent

## workLoopSync

## workLoopConcurrent

## performUnitOfWork

## beginWork

## completeWork

## commitRoot
