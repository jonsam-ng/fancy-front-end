# scheduleWork调度更新

[[TOC]]

## scheduleWork()方法

`scheduleWork(fiber, expirationTime)`传入fiber 和 expirationTime，可见 fiber 更新的调度是根据 expirationTime 来处理的。

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
    checkForNestedUpdates();
    warnAboutInvalidUpdatesOnClassComponentsInDEV(fiber);
    // 从 fiber 到 root 标记 expirationTime
    const root = markUpdateTimeFromFiberToRoot(fiber, expirationTime);
    console.log("调度任务中root是：", root);
    // 关灯的打印情况：
    // 调度任务中root： FiberRootNode {tag: 0, current: FiberNode, containerInfo: div#root, pendingChildren: null, pingCache: null, …}
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
            (executionContext & LegacyUnbatchedContext) !== NoContext &&
            // Check if we're not already rendering
            (executionContext & (RenderContext | CommitContext)) === NoContext
        ) {
            // Register pending interactions on the root to avoid losing traced interaction data.
            schedulePendingInteractions(root, expirationTime);

            // This is a legacy edge case. The initial mount of a ReactDOM.render-ed
            // root inside of batchedUpdates should be synchronous, but layout updates
            // should be deferred until the end of the batch.
            performSyncWorkOnRoot(root);
        } else {
			      // 首次渲染，同步更新
            ensureRootIsScheduled(root);
            schedulePendingInteractions(root, expirationTime);
            if (executionContext === NoContext) {
                // Flush the synchronous work now, unless we're already working or inside
                // a batch. This is intentionally inside scheduleUpdateOnFiber instead of
                // scheduleCallbackForFiber to preserve the ability to schedule a callback
                // without immediately flushing it. We only do this for user-initiated
                // updates, to preserve historical behavior of sync mode.
                flushSyncCallbackQueue();
            }
        }
    } else {
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

### markUpdateTimeFromFiberToRoot 方法

```js
// 获取root节点，并且给root节点添加标记。
function markUpdateTimeFromFiberToRoot(fiber, expirationTime) {
  // Update the source fiber's expiration time
  // 同步 fiber 和 fiber.alternate 的 expirationTime
  if (fiber.expirationTime < expirationTime) {
    fiber.expirationTime = expirationTime;
  }
  let alternate = fiber.alternate;
  if (alternate !== null && alternate.expirationTime < expirationTime) {
    alternate.expirationTime = expirationTime;
  }
  // Walk the parent path to the root and update the child expiration time.
  // 向上追溯到 root 节点并且更新子节点的超时时间
  let node = fiber.return;
  let root = null;
  if (node === null && fiber.tag === HostRoot) {
    // fiber.return 为空则没有父节点，这里直接找到 root 节点
    root = fiber.stateNode;
  } else {
    while (node !== null) {
      // 更新 node 和 alternate 的超时时间
      alternate = node.alternate;
      if (node.childExpirationTime < expirationTime) {
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

如果`nestedUpdateCount > NESTED_UPDATE_LIMIT` 会被判定为嵌套更新然后报`Maximum update depth exceeded`的错误。其中 `NESTED_UPDATE_LIMIT` 为50，这是为了防止嵌套更新的死循环。


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

### recordScheduleUpdate 方法

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


## ensureRootIsScheduled 方法

```ts
// Use this function to schedule a task for a root. There's only one task per
// root; if a task was already scheduled, we'll check to make sure the
// expiration time of the existing task is the same as the expiration time of
// the next level that the root has work on. This function is called on every
// update, and right before exiting a task.
function ensureRootIsScheduled(root: FiberRoot) {
    const lastExpiredTime = root.lastExpiredTime;
    if (lastExpiredTime !== NoWork) {
        // Special case: Expired work should flush synchronously.
        // 同步更新，不需要调度
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
    const currentTime = requestCurrentTime();
    const priorityLevel = inferPriorityFromExpirationTime(
        currentTime,
        expirationTime,
    );

    // If there's an existing render task, confirm it has the correct priority and
    // expiration time. Otherwise, we'll cancel it and schedule a new one.
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
            {
                timeout: expirationTimeToMs(expirationTime) - now()
            },
        );
    }

    root.callbackNode = callbackNode;
}
```

- 同步的调度调用了 `scheduleSyncCallback` 方法，异步的调度调用了 `scheduleCallback` 方法。

#### scheduleSyncCallback 方法

```ts
function scheduleSyncCallback(callback: SchedulerCallback) {
    // Push this callback into an internal queue. We'll flush these either in
    // the next tick, or earlier if something calls `flushSyncCallbackQueue`.
    if (syncQueue === null) {
        // 调度队列为空，新建调度队列，并且此任务将会被调度
        syncQueue = [callback];
        // Flush the queue in the next tick, at the earliest.
        // 标记当前正在被同步调度的节点
        immediateQueueCallbackNode = Scheduler_scheduleCallback(
            Scheduler_ImmediatePriority,
            flushSyncCallbackQueueImpl,
        );
    } else {
        // Push onto existing queue. Don't need to schedule a callback because
        // we already scheduled one when we created the queue.
        // 加入调度队列，暂时不被调度
        syncQueue.push(callback);
    }
    return fakeCallbackNode;
}
```
- 同步任务由特殊的队列 `syncQueue` 调度，进入队列的首个任务将会被调度，其他任务只加入队列。
- 同步任务调度由 `Scheduler_scheduleCallback` 调度，调度将会在下一个 tick 执行，或者在 `flushSyncCallbackQueue` 被调用时提前执行。

#### scheduleCallback 方法

来源于`unstable_scheduleCallback`方法，在独立的 scheduler/Scheduler.js 中。

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
        // 如果该新建 task 是最早 delay 的 task，即刚好是队首的 task
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

## schedulePendingInteractions 方法

此方法内部调用 scheduleInteractions 方法。