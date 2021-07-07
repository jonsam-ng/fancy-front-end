## scheduleCallback：

生成调度任务，设置回调

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