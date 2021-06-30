# scheduleWork与任务调度

[[TOC]]

## scheduleWork()方法：为 Fiber 调度更新

scheduleWork 是 react 调度的起点。`scheduleWork(fiber, expirationTime)`传入fiber 和 expirationTime，可见 fiber 更新的调度是根据 expirationTime 来处理的。

在 `react-reconciler/src/ReactFiberWorkLoop.js` 中函数 `scheduleUpdateOnFiber()`实际上就是scheduleWork。

scheduleUpdateOnFiber代码如下：

```ts
/**
 * scheduleWork的别名，创建调度任务执行更新
 * @param {*} fiber 
 * @param {*} expirationTime 
 */
export function scheduleUpdateOnFiber(
    fiber: Fiber,
    expirationTime: ExpirationTime,
) {
    // 检查嵌套更新  
    checkForNestedUpdates();
    warnAboutInvalidUpdatesOnClassComponentsInDEV(fiber);
    // 从 fiber 到 root 标记 expirationTime，找到 root 
    const root = markUpdateTimeFromFiberToRoot(fiber, expirationTime);
    console.log("调度任务中root是：", root);
    // 关灯的打印情况：
    // 调度任务中root： FiberRootNode {tag: 0, current: FiberNode, containerInfo: div#root, pendingChildren: null, pingCache: null, …}
    // 如果 root 不存在直接退出调度
    if (root === null) {
        warnAboutUpdateOnUnmountedFiberInDEV(fiber);
        return;
    }
    // 检查中断
    checkForInterruption(fiber, expirationTime);
    // 记录调度更新
    recordScheduleUpdate();

    // TODO: computeExpirationForFiber also reads the priority. Pass the
    // priority as an argument to that function and this one.
    // 获得任务的优先级
    const priorityLevel = getCurrentPriorityLevel();

    if (expirationTime === Sync) {
        if (
            // 如果是 unbatchedUpdates 且不在 rendering 和 commit 状态
            // Check if we're inside unbatchedUpdates
            // 第一个条件是 executionContext 的值为 LegacyUnbatchedContext，第二个条件是， executionContext 不能处在 RenderContext 或者是 CommitContext 的阶段。
            (executionContext & LegacyUnbatchedContext) !== NoContext &&
            // Check if we're not already rendering
            (executionContext & (RenderContext | CommitContext)) === NoContext
        ) {
            // Register pending interactions on the root to avoid losing traced interaction data.
            // 追踪调度过程，包括计数、错误检测
            schedulePendingInteractions(root, expirationTime);

            // This is a legacy edge case. The initial mount of a ReactDOM.render-ed
            // root inside of batchedUpdates should be synchronous, but layout updates
            // should be deferred until the end of the batch.
            // 同步方式渲染 root
            performSyncWorkOnRoot(root);
        } else {
			      // 首次渲染，同步更新，确保root节点被调度
            ensureRootIsScheduled(root);
            // 调度追踪
            schedulePendingInteractions(root, expirationTime);
            // 同步调度，直接执行调度
            if (executionContext === NoContext) {
                // Flush the synchronous work now, unless we're already working or inside
                // a batch. This is intentionally inside scheduleUpdateOnFiber instead of
                // scheduleCallbackForFiber to preserve the ability to schedule a callback
                // without immediately flushing it. We only do this for user-initiated
                // updates, to preserve historical behavior of sync mode.
                // 刷新同步任务队列
                flushSyncCallbackQueue();
            }
        }
    } else {
        // 
        ensureRootIsScheduled(root);
        schedulePendingInteractions(root, expirationTime);
    }

    if (
        (executionContext & DiscreteEventContext) !== NoContext &&
        // Only updates at user-blocking priority or greater are considered
        // discrete, even inside a discrete event.
        (priorityLevel === UserBlockingPriority ||
            priorityLevel === ImmediatePriority)
    ) {
        // This is the result of a discrete event. Track the lowest priority
        // discrete update per root so we can flush them early, if needed.
        if (rootsWithPendingDiscreteUpdates === null) {
            rootsWithPendingDiscreteUpdates = new Map([[root, expirationTime]]);
        } else {
            const lastDiscreteTime = rootsWithPendingDiscreteUpdates.get(root);
            if (lastDiscreteTime === undefined || lastDiscreteTime > expirationTime) {
                rootsWithPendingDiscreteUpdates.set(root, expirationTime);
            }
        }
    }
}
```

### markUpdateTimeFromFiberToRoot 方法：更新 Fiber Tree 的 expirationTime

该函数用于获得 FiberRoot 对象，算出的本次更新的 expirationTime，更新 Fiber tree 上的 expirationTime。React 的每次更新其实是从整个 Fiber 树的根节点开始调度的。

```js
// 获取root节点，并且给root节点添加标记。
function markUpdateTimeFromFiberToRoot(fiber, expirationTime) {
  // Update the source fiber's expiration time
  // 同步 fiber 和 fiber.alternate 的 expirationTime
  // 如果 fiber 的 expirationTime 比 expirationTime 低，则说明 fiber 的优先级较低，则把 fiber 的优先级
  // 提高到当前优先级
  if (fiber.expirationTime < expirationTime) {
    fiber.expirationTime = expirationTime;
  }
  let alternate = fiber.alternate;
  if (alternate !== null && alternate.expirationTime < expirationTime) {
    alternate.expirationTime = expirationTime;
  }
  // Walk the parent path to the root and update the child expiration time.
  // 向上追溯到 root 节点并且更新子节点的超时时间，获取 fiber 的父节点
  let node = fiber.return;
  let root = null;
  // 如果 fiber 没有父节点且具有 HostRoot 的标记则次 fiber 就是 FiberRoot。
  if (node === null && fiber.tag === HostRoot) {
    // fiber.return 为空则没有父节点，这里直接找到 root 节点
    root = fiber.stateNode;
  } else {
    // 没有直接获取到 FiberRoot，则向上追溯
    while (node !== null) {
      // 更新 node 和 alternate 的超时时间
      alternate = node.alternate;
      if (node.childExpirationTime < expirationTime) {
        // 更新父节点的childExpirationTime，代表子节点的超时时间
        node.childExpirationTime = expirationTime;
        if (
          alternate !== null &&
          alternate.childExpirationTime < expirationTime
        ) {
          alternate.childExpirationTime = expirationTime;
        }
      } else if (
        alternate !== null &&
        alternate.childExpirationTime < expirationTime
      ) {
        alternate.childExpirationTime = expirationTime;
      }
      // 追溯到 root 节点
      if (node.return === null && node.tag === HostRoot) {
        root = node.stateNode;
        break;
      }
      node = node.return;
    }
  }

  if (root !== null) {
    // root 正是调度更新节点树的根节点
    if (workInProgressRoot === root) {
      // Received an update to a tree that's in the middle of rendering. Mark
      // that's unprocessed work on this root.
      // 标记更新节点树下一次更新时间，workInProgressRootNextUnprocessedUpdateTime 取较大值
      markUnprocessedUpdateTime(expirationTime);

      if (workInProgressRootExitStatus === RootSuspendedWithDelay) {
        // The root already suspended with a delay, which means this render
        // definitely won't finish. Since we have a new update, let's mark it as
        // suspended now, right before marking the incoming update. This has the
        // effect of interrupting the current render and switching to the update.
        // 根已经延迟暂停，这意味着这个渲染
        // 肯定不会完成。由于我们有新的更新，让我们将其标记为
        // 现在暂停，就在标记传入更新之前。这有
        // 中断当前渲染并切换到更新的效果。
        // TODO: This happens to work when receiving an update during the render
        // phase, because of the trick inside computeExpirationForFiber to
        // subtract 1 from `renderExpirationTime` to move it into a
        // separate bucket. But we should probably model it with an exception,
        // using the same mechanism we use to force hydration of a subtree.
        // TODO: This does not account for low pri updates that were already
        // scheduled before the root started rendering. Need to track the next
        // pending expiration time (perhaps by backtracking the return path) and
        // then trigger a restart in the `renderDidSuspendDelayIfPossible` path.
        markRootSuspendedAtTime(root, renderExpirationTime);
      }
    }
    // Mark that the root has a pending update.
    // 为 root 节点调度执行更新。
    markRootUpdatedAtTime(root, expirationTime);
  }

  return root;
}
```

- 这个方法的主要作用是：更新渲染树的 expirationTime，同时找到 root 节点。
- `node.return === null && node.tag === HostRoot` 是 root 节点的特征。


### checkForNestedUpdates() 检查嵌套更新

如果`nestedUpdateCount > NESTED_UPDATE_LIMIT` 会被判定为嵌套更新然后报`Maximum update depth exceeded`的错误。其中 `NESTED_UPDATE_LIMIT` 为50，这是为了防止嵌套更新的死循环。比如在 render 中调用 setState 的情况。


### 嵌套更新的层级数是如何计算的？

```ts
let nestedUpdateCount: number = 0;
let rootWithNestedUpdates: FiberRoot | null = null;
```

在函数`commitRootImpl()`中有如下代码来更新 `nestedUpdateCount`：

```ts
if (remainingExpirationTime === Sync) {
  // Count the number of times the root synchronously re-renders without
  // finishing. If there are too many, it indicates an infinite update loop.
  if (root === rootWithNestedUpdates) {
	  nestedUpdateCount++;
  } else {
	  nestedUpdateCount = 0;
	  rootWithNestedUpdates = root;
  }
} else {
  nestedUpdateCount = 0;
}
```

### checkForInterruption 方法

`checkForInterruption`方法会标记中断的 fiber，中断的 fiber 标记到`interruptedBy`上。

```ts
function checkForInterruption(
    fiberThatReceivedUpdate: Fiber,
    updateExpirationTime: ExpirationTime,
) {
    if (
        enableUserTimingAPI &&
        workInProgressRoot !== null &&
        updateExpirationTime > renderExpirationTime
        // 如果非首次渲染，且更新超时时间超过渲染超时时间则被标记为中断 fiber
    ) {
        interruptedBy = fiberThatReceivedUpdate;
    }
}
```

如果 fiber 的优先级比当前执行的渲染任务的优先级更高，则需要将正在执行的渲染任务终端，转而去执行当前 fiber 的渲染更新任务。

### recordScheduleUpdate 方法：记录调度更新的阶段

`recordScheduleUpdate`方法记录调度更新，标记当前调度是处于 commit 阶段还是处于 render 阶段，分别记录在标记`hasScheduledUpdateInCurrentCommit`和`hasScheduledUpdateInCurrentPhase`。

```ts
export function recordScheduleUpdate(): void {
    if (enableUserTimingAPI) {
        // isCommitting 标记当前是否处于 commit 阶段
        if (isCommitting) {
            // 标记在当前 commit 有调度更新
            hasScheduledUpdateInCurrentCommit = true;
        }
        if (
            // currentPhase 记录当前的生命周期阶段 
            currentPhase !== null &&
            currentPhase !== 'componentWillMount' &&
            currentPhase !== 'componentWillReceiveProps'
        ) {
            // 标记在当前阶段有调度更新
            hasScheduledUpdateInCurrentPhase = true;
        }
    }
}
```

由代码可以看到，无论是首次渲染还是非首次渲染都会调用`ensureRootIsScheduled`和`schedulePendingInteractions`这两个方法。可见这是两个核心方法。

现在重点看 `ensureRootIsScheduled` 和 `schedulePendingInteractions`方法。


## ensureRootIsScheduled 方法：确保 Root 被调度

```ts
// Use this function to schedule a task for a root. There's only one task per
// root; if a task was already scheduled, we'll check to make sure the
// expiration time of the existing task is the same as the expiration time of
// the next level that the root has work on. This function is called on every
// update, and right before exiting a task.
// 这个函数在 root 上调度任务，每个 root 节点只能有一个任务。如果某个 root 已经被调度了任务，则更新该任务的超时时间。
// 这个函数再每次更新和执行任务之前都被调用。
function ensureRootIsScheduled(root: FiberRoot) {
  //lastExpiredTime 初始值为 noWork，只有当任务过期时，会被更改为过期时间（markRootExpiredAtTime方法）
  const lastExpiredTime = root.lastExpiredTime;
  if (lastExpiredTime !== NoWork) {
    // 特殊情况：过期的工作应该同步刷新。
    // 同步更新，过期的root立即更新
    root.callbackExpirationTime = Sync;
    root.callbackPriority = ImmediatePriority;
    root.callbackNode = scheduleSyncCallback(
      performSyncWorkOnRoot.bind(null, root),
    );
    return;
  }

  const expirationTime = getNextRootExpirationTimeToWorkOn(root);
  const existingCallbackNode = root.callbackNode;
  // 没有调度任务
  if (expirationTime === NoWork) {
    // There's nothing to work on.
    if (existingCallbackNode !== null) {
      root.callbackNode = null;
      root.callbackExpirationTime = NoWork;
      root.callbackPriority = NoPriority;
    }
    return;
  }

  // TODO: If this is an update, we already read the current time. Pass the
  // time as an argument.
  // 获取当前时间与任务的优先级
  const currentTime = requestCurrentTime();
  const priorityLevel = inferPriorityFromExpirationTime(
    currentTime,
    expirationTime,
  );

  // If there's an existing render task, confirm it has the correct priority and
  // expiration time. Otherwise, we'll cancel it and schedule a new one.
  // 如果存在一个渲染任务，确认它具有正确的优先级和过期时间。 否则，我们将取消它并安排一个新的。
  if (existingCallbackNode !== null) {
    const existingCallbackPriority = root.callbackPriority;
    const existingCallbackExpirationTime = root.callbackExpirationTime;
    if ( // 检查是否是合法的渲染任务
      // Callback must have the exact same expiration time.
      existingCallbackExpirationTime === expirationTime &&
      // Callback must have greater or equal priority.
      existingCallbackPriority >= priorityLevel
    ) {
      // Existing callback is sufficient.
      return;
    }
    // Need to schedule a new task.
    // TODO: Instead of scheduling a new task, we should be able to change the
    // priority of the existing one.
    // 取消不合法的渲染任务
    cancelCallback(existingCallbackNode);
  }

  root.callbackExpirationTime = expirationTime;
  root.callbackPriority = priorityLevel;

  let callbackNode;
  // 同步的渲染任务
  if (expirationTime === Sync) {
    // 首次渲染调度
    // Sync React callbacks are scheduled on a special internal queue
    // 由单独的调度队列调度
    callbackNode = scheduleSyncCallback(performSyncWorkOnRoot.bind(null, root));
  } else if (disableSchedulerTimeoutBasedOnReactExpirationTime) {
    callbackNode = scheduleCallback(
      priorityLevel,
      performConcurrentWorkOnRoot.bind(null, root),
    );
  } else {
    // 异步的渲染任务调度
    callbackNode = scheduleCallback(
      priorityLevel,
      performConcurrentWorkOnRoot.bind(null, root),
      // Compute a task timeout based on the expiration time. This also affects
      // ordering because tasks are processed in timeout order.
      {timeout: expirationTimeToMs(expirationTime) - now()},
    );
  }

  root.callbackNode = callbackNode;
}
```

- 同步的调度调用了 `scheduleSyncCallback` 方法，异步的调度调用了 `scheduleCallback` 方法。

## scheduleSyncCallback 方法：同步渲染的调度

```ts
function scheduleSyncCallback(callback: SchedulerCallback) {
    // Push this callback into an internal queue. We'll flush these either in
    // the next tick, or earlier if something calls `flushSyncCallbackQueue`.
    if (syncQueue === null) {
        // 调度队列为空，新建调度队列，并且此任务将会被调度
        syncQueue = [callback];
        // Flush the queue in the next tick, at the earliest.
        // 标记当前正在被同步调度的节点，初始化调度
        immediateQueueCallbackNode = Scheduler_scheduleCallback(
            Scheduler_ImmediatePriority,
            flushSyncCallbackQueueImpl,
        );
    } else {
        // Push onto existing queue. Don't need to schedule a callback because
        // we already scheduled one when we created the queue.
        // 加入调度队列，暂时不被调度，因为在创建syncQueue时就已经初始化过了。
        syncQueue.push(callback);
    }
    return fakeCallbackNode;
}
```

- 同步任务由特殊的队列 `syncQueue` 调度，进入队列的首个任务将会初始化调度流程，其他任务只加入队列。
- 同步任务调度由 `Scheduler_scheduleCallback` 初始化调度，调度将会在下一个 tick 执行，或者在 `flushSyncCallbackQueue` 被调用时提前执行。
- `fakeCallbackNode` 返回一个虚假的 callback 节点，事实上是 {}。

## scheduleCallback 方法：异步渲染的调度

`scheduleCallback` 内部是调用 `Scheduler_scheduleCallback` 方法实现的，这个方法接收调度的优先级和 callback，返回一个新的调度任务。

```ts
export function scheduleCallback(
  reactPriorityLevel: ReactPriorityLevel,
  callback: SchedulerCallback,
  options: SchedulerCallbackOptions | void | null,
) {
  const priorityLevel = reactPriorityToSchedulerPriority(reactPriorityLevel);
  return Scheduler_scheduleCallback(priorityLevel, callback, options);
}
```

## Scheduler_scheduleCallback：生成调度任务，设置回调

`Scheduler_scheduleCallback` 来源于`unstable_scheduleCallback`方法，在独立的 scheduler/Scheduler.js 中。

`unstable_scheduleCallback`方法代码如下：

```ts
function unstable_scheduleCallback(priorityLevel, callback, options) {
    var currentTime = getCurrentTime();

    // 计算startTime 和 timeout
    var startTime;
    var timeout;
    if (typeof options === 'object' && options !== null) {
        var delay = options.delay;
        if (typeof delay === 'number' && delay > 0) {
            startTime = currentTime + delay;
        } else {
            startTime = currentTime;
        }
        timeout =
            typeof options.timeout === 'number' ?
            options.timeout :
            timeoutForPriorityLevel(priorityLevel);
    } else {
        timeout = timeoutForPriorityLevel(priorityLevel);
        startTime = currentTime;
    }
    // 计算 expirationTime
    var expirationTime = startTime + timeout;
    // 创建新的 task
    var newTask = {
        id: taskIdCounter++,
        callback,
        priorityLevel,
        startTime,
        expirationTime,
        sortIndex: -1,
    };
    if (enableProfiling) {
        newTask.isQueued = false;
    }

    if (startTime > currentTime) {
        // This is a delayed task.
        // startTime 大于 currentTime 则 task 被 delay
        // 延迟任务
        newTask.sortIndex = startTime;
        // 将新建的 task 添加至队列，延时任务加入到 timerQueue
        push(timerQueue, newTask);
        // 如果该新建 task 是最早 delay 的 task，即刚好是渲染队列队首的 task
        if (peek(taskQueue) === null && newTask === peek(timerQueue)) {
            // All tasks are delayed, and this is the task with the earliest delay.
            if (isHostTimeoutScheduled) {
                // Cancel an existing timeout.
                cancelHostTimeout();
            } else {
                isHostTimeoutScheduled = true;
            }
            // Schedule a timeout.设置延时， 主线程延时回调
            requestHostTimeout(handleTimeout, startTime - currentTime);
        }
    } else {
        // 即时任务
        newTask.sortIndex = expirationTime;
        // 即时任务加入到 taskQueue
        push(taskQueue, newTask);
        if (enableProfiling) {
            markTaskStart(newTask, currentTime);
            newTask.isQueued = true;
        }
        // Schedule a host callback, if needed. If we're already performing work,
        // wait until the next time we yield.
        if (!isHostCallbackScheduled && !isPerformingWork) {
            isHostCallbackScheduled = true;
            //  请求主线程回调
            requestHostCallback(flushWork);
        }
    }

    return newTask;
}
```

1. 如何计算 startTime 和 expirationTime？
 
- 如果 options中传了 delay，则 `startTime = currentTime + delay`，否则 `startTime = currentTime`。
- 如果 options 中传了 timeout，则 timeout 为 `options.timeout`， 否则会跟根据优先级计算 timeout，即 `timeout = timeoutForPriorityLevel(priorityLevel)`。
- `expirationTime = startTime + timeout`即超时时间为 `currentTime + delay + timeout`。

2. 如何判断是即时任务还是延时任务？

将 `startTime` 和 `currentTime` 进行比较，如果 `startTime > currentTime`，则认为是延时任务，否则就认为是即时任务。

结合 `currentTime` 的计算方法可知，只有 options 中 delay 存在且大于 0 时，才会被认为是延时任务。

3. callback 是如何处理的？

callback 被挂载到到 newTask 上，newTask 最终由 `unstable_scheduleCallback` 返回。

4. 即时任务和延时任务分别是如何处理的？

- 即时任务

即时任务会被加入到 `taskQueue` 队列中，由 `requestHostCallback` 调度，直接请求主线程回调。

- 延时任务

延时任务会被加入到 `timerQueue` 队列中，由 `requestHostTimeout` 调度，请求主线程延时回调。

5. `taskQueue`  和  `timerQueue` 的区别？

```ts
// Tasks are stored on a min heap
var taskQueue = [];
var timerQueue = [];
```

- 这两个队列都是小顶堆，初始化为`[]`。
- `taskQueue` 队列管理即时任务，`timerQueue` 队列管理延时任务，只有 `taskQueue` 中的任务才会被主线程立即回调。

6. 关于小顶堆

参考：
- [# JS数据结构与算法之《堆》](https://zhuanlan.zhihu.com/p/144699737)
- [# 前端进阶算法9：看完这篇，再也不怕堆排序、Top K、中位数问题面试了](https://github.com/sisterAn/JavaScript-Algorithms/issues/60)


### requestHostTimeout 方法和 requestHostCallback 方法

这两个方法去执行调度任务，详细请查看：[requestHostCallback 详解](./requestHostCallback.md)

## performSyncWorkOnRoot 方法：同步任务调度更新

## schedulePendingInteractions 方法：追踪调度过程

此方法内部调用 scheduleInteractions 方法。这个函数的主要作用是管理和更新pendingInteractionMap数据结构，其结构`Map(<expirationTime>, <Interactions Set>)`，interactions 是在任务调度的过程中创建的。下面来看看代码：

```ts
function scheduleInteractions(root, expirationTime, interactions) {
  // 这个功能由enableSchedulerTracing标志控制，
  if (!enableSchedulerTracing) {
    return;
  }
  // interactions 是挂载在 __interactionsRef.current 上的值。
  // pushInteractions 和 popInteractions 操作 interactions 的值
  if (interactions.size > 0) {
    const pendingInteractionMap = root.pendingInteractionMap;
    const pendingInteractions = pendingInteractionMap.get(expirationTime);
    // 还有 pending 的任务
    if (pendingInteractions != null) {
      interactions.forEach(interaction => {
        if (!pendingInteractions.has(interaction)) {
          // Update the pending async work count for previously unscheduled interaction.
          // 记录 pending 的同步任务的数量
          interaction.__count++;
        }
        // 将 interaction 加入到 pendingInteractions
        pendingInteractions.add(interaction);
      });
    } else {
      // 没有 pending 的任务，则新建一个interactions的集合加入到pendingInteractionMap。
      // pendingInteractionMap 的结构为 Map(<expirationTime>, <Interactions Set>)
      pendingInteractionMap.set(expirationTime, new Set(interactions));

      // Update the pending async work count for the current interactions.
      // 记录当前 pending 的任务数量
      interactions.forEach(interaction => {
        interaction.__count++;
      });
    }
    // 获得订阅者
    const subscriber = __subscriberRef.current;
    if (subscriber !== null) {
      // 获取当前调度的线程 id
      const threadID = computeThreadID(root, expirationTime);
      // 向订阅者发出 onWorkScheduled 的通知
      subscriber.onWorkScheduled(interactions, threadID);
    }
  }
}
```

下面是 pushInteractions 的代码：

```ts
function pushInteractions(root) {
  if (enableSchedulerTracing) {
    const prevInteractions: Set<Interaction> | null = __interactionsRef.current;
    __interactionsRef.current = root.memoizedInteractions;
    return prevInteractions;
  }
  return null;
}
```

可见 interactions 是从 root.memoizedInteractions 获取的，pushInteractions 返回上一次的 interactions。

## 小结

1. `scheduleUpdateOnFiber` 的执行原理

`scheduleUpdateOnFiber` 和 `ensureRootIsScheduled` 这两个函数结合在一起，大致可以看出 react 调度任务的脉络。在进行进人调度时，会根据当前是同步模式还是异步模式，以及是否是初次渲染采用不同的调度方法，总结如下。

| 同步/异步模式 | 初次渲染   | 操作                                           |
| ------------- | ---------- | ---------------------------------------------- |
| 同步          | 初次渲染   | 直接调用 `performSyncWorkOnRoot` 渲染更新      |
| 同步          | 非初次渲染 | 调用 `scheduleSyncCallback` 进行 callback 调度 |
| 异步          | -          | 调用 `scheduleCallback` 进行 callback 调度     |

由此，我们可以看出：

- 除了同步渲染且为初次渲染的情况下，才会跳过调度过程，直接进行渲染。否则，都会进行 callback 的调度渲染，调度渲染不会立即执行。
- 同步渲染由 `scheduleSyncCallback` 调度，异步渲染由 `scheduleCallback` 调度，最终都是由 `unstable_scheduleCallback` 来管理调度任务，`unstable_scheduleCallback` 的功能是创建任务、将任务分为延时任务和即时任务和调度任务的执行。

2. react 任务调度都做了些什么？

- react 调度是从 FiberRoot 开始的，FiberRoot 就是没有父节点且标记为 HostRoot 的节点。
- 调度开始，需要执行一些检查嵌套更新、检查中断更新、记录调度更新的操作，之后就会根据 expirationTime 来判断当前是什么更新模式，走上面的调度更新流程。
- 调度更新不仅会影响 Fiber 节点自身，还会可能会影响到 Fiber 的父节点，因为 `markUpdateTimeFromFiberToRoot` 会更新 fiber 的 `expirationTime`，如果 fiber 不是 fiberRoot，还会更新其父节点的 `childExpirationTime`。
- 在调度之后，`schedulePendingInteractions` 会对调度过程做一些统计、记录工作。
