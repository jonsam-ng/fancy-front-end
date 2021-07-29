# scheduleCallback与调度任务

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
        // 任务 id 
        id: taskIdCounter++,
        // 任务执行完之后的回调
        callback,
        // 任务的优先级
        priorityLevel,
        // 开始时间
        startTime,
        // 超时时间：经过多长时间没执行的话必须执行
        expirationTime,
        // 任务排序的索引
        sortIndex: -1,
    };
    if (enableProfiling) {
        newTask.isQueued = false;
    }

    if (startTime > currentTime) {
        // This is a delayed task.
        // startTime 大于 currentTime 则 task 被 delay
        // 延迟任务
        // 延迟的任务队列将以 startTime 进行排序
        newTask.sortIndex = startTime;
        // 将新建的 task 添加至队列，延时任务加入到 
        // 延迟任务有队列 timerQueue 维护
        push(timerQueue, newTask);
        // 如果该新建 task 是最早 delay 的 task，即刚好是渲染队列队首的 task
        if (peek(taskQueue) === null && newTask === peek(timerQueue)) {
            // All tasks are delayed, and this is the task with the earliest delay.
            if (isHostTimeoutScheduled) {
                // Cancel an existing timeout.
                // 如果现在有延迟任务预约，就将这个延迟任务的预约取消
                cancelHostTimeout();
            } else {
              // 如果没有延迟任务的预约，就预约任务的回调
                isHostTimeoutScheduled = true;
            }
            // Schedule a timeout.
            // 设置延时， 主线程延时回调，传入延迟时长和回调函数
            requestHostTimeout(handleTimeout, startTime - currentTime);
        }
    } else {
        // 即时任务，将以 expirationTime 进行排序
        newTask.sortIndex = expirationTime;
        // 即时任务加入到 taskQueue
        // 即时任务由队列 taskQueue 维护
        push(taskQueue, newTask);
        if (enableProfiling) {
            markTaskStart(newTask, currentTime);
            newTask.isQueued = true;
        }
        // Schedule a host callback, if needed. If we're already performing work,
        // wait until the next time we yield.
        //如果当前并没被其他即时任务预约，也没有正在回调某个任务
        if (!isHostCallbackScheduled && !isPerformingWork) {
            // 预约当前任务
            isHostCallbackScheduled = true;
            // 请求主线程回调
            requestHostCallback(flushWork);
        }
    }

    return newTask;
}
```

这个函数的作用是：创建调度任务请求主线程回调。具体来看：

- 将回调包装成任务，并且由相对的任务队列来管理。
- 区分即时任务和延时任务，即时任务由 taskQueue 管理，延时任务由 timerQueue 管理。
- 如果是即时任务，则请求主线程回调，如果是延时任务，则请求主线程延时回调。

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

7. 下面这三个函数由 SchedulerHostConfig 实现，前面我们已经知道 requestAnimationFrame 和 requestIdleCallback 这两个函数可以实现浏览器中任务执行的优先级，但是由于 API 兼容性（requestIdleCallback）的问题，react 内部进行了实现，用 requestAnimationFrame 和 setTimeout 模拟实现 requestIdleCallback。这部分我们将在 SchedulerHostConfig 中分析。

- requestHostTimeout：请求主线程延时回调
- cancelHostTimeout：取消主线程延迟回调
- requestHostCallback：请求主线程回调
