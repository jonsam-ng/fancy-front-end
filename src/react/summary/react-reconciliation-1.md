# React 源码漂流记：React 调和器核心源码解读（一）

<Badges :content="[{type: 'tip', text: 'React17'}, {type: 'tip', text: '精简'}]" />

<TimeToRead />

## 目录

[[TOC]]

## 前言

从今天开始，开启我们的 React 源码阅读之旅。阅读 React 的源码陆陆续续也有几个月之久，其间也有不少的收获和感悟，趁此机会，整理成文章，与大家分享和讨论，同时也可以给想要开始阅读源码的伙伴一些启发吧。

开始今天的内容之前，我想先聊几个问题，因为这是 React 源码阅读系列的第一篇文章，我想先分享一下我对阅读源码的一下见解。

### 为什么读 React 源码？

可能有如下的场景让你开始关注 React 源码：

1. React 的使用已经得心应手了，迫切的想知道这些每天使用的 API 到底是什么原理？比如每天都用到 useState，那么究竟 useState 是如何处理组件的状态的呢？
2. 需求开发中遇到奇怪的问题，怎么都找不到原因，是否是我对 API 的理解和使用有偏差？
3. 业务太复杂，我的组件遇到了性能瓶颈，能榨干性能的手段悉数用尽，关于性能问题，是否还有其他的灵感呢？
4. 我想写大型组件库，能够达到 antd 那样强大的功能，我需要对 React 以及更多更底层的 API 有更多的理解。
5. 我想写框架玩玩，能否参照下 React 框架的思路？……

可能会遇到如下的问题，让你迫切的想要从 React 源码中找答案：

1. 我的 setState 为什么没有更新组件的状态？为什么我的组件渲染了这么多次？这会不会很消耗性能？
2. 为什么我需要给列表项设置 key 值，不设置 key 值会有什么问题？
3. 为什么需要使用 useRef，为什么要使用 useMemo、useCallback 进行性能优化？这种优化是否是越多越好？
4. 为什么 hook 只能在顶层使用，hook 为什么能够使业务逻辑得到复用？
5. 为什么我的数据丢失了响应性，闭包问题又如何解决？……

不管你是为什么开始关注到 React 的原理，不管你是否开启了阅读 React 源码的计划，关注这个系列的文章，我们可以一起学习、成长与进步。

### 怎么读 React 源码？

我有如下的方法推荐给你：

1. 断点调试，搜索脉络。通过简单的案例，从源码中打断点，逐步深入探索。好的搜索技巧可能帮助你快速找到你需要查看的函数。
2. 由表及里，笔记加强。从API 层，逐步向更深的实现逻辑追溯，直到形成知识的闭环。通过笔记记录自己的学习历程，不断更正和完善笔记内容。
3. 问题驱动，寻找答案。从业务需求中遇到的问题触发，从源码中寻找答案，直到解决疑惑为止。

阅读源码的建议：

1. 先关注核心逻辑，然后在关注实现细节。React 中有很多 Dev 环境、插件的代码或者是兼容性考虑的代码，可能会对你的阅读产生影响，可以跳过这些逻辑，只关注核心骨架。
2. 分层阅读。React 内部分成了很多模块，可以根据阅读进度分层阅读，直到最终能够将各个模块的内容联动起来。
3. 关注注释。源码中有很多详细的注释，关注注释可以给你更深的理解。

### 我们能从 React 源码中学习到什么？

- 对框架更深入的理解和掌握。
- 框架设计的思想和模式。
- js 的高级应用。

-----

熟悉 React 的小伙伴可能都知道，React 大致上可以分成调和器、调度器、渲染器几个部分。对应到 React 的源码里，最重要的就是有四个包，分别是 react、react-dom、scheduler、react-reconciler。克隆下源码，大概像是这样：

<img :src="$withBase('/assets/img/react-packages.png')" alt="React 源码包结构" data-zoomable>

先解释一下上述几个包的核心作用：

- react：导出 React 的核心 API，供外部应用使用。比如 Fragment、forwardRef、memo、hook全家桶等。
- react-dom：React 基于 web 的渲染层，导出一些渲染相关的 API，比如说 render、createPortal、createRoot 等。
- scheduler：React 中的调度器，负责任务队列的维护，基于优先级调度任务。
- react-reconciler：React 中的调和器，负责 React 渲染的整体流程。

本文将从渲染的整体流程入手，探究一下调度器的核心代码。有一些基础的内容或者代码细节，将会在系列文章中穿插着分享。

## updateContainer：星星之火，可以燎原

> updateContainer 是燎原的第一颗火星。

先看一段代码：

```js
// src/react/packages/react-reconciler/src/ReactFiberReconciler.new.js
export function updateContainer(
  // 待挂载的组件
  element: ReactNodeList,
  // 挂载容器
  container: OpaqueRoot,
): Lane {
  // 获取 RootFiber
  const current = container.current;
  const eventTime = requestEventTime();
  const lane = requestUpdateLane(current);
  // 更新 container 的 context 信息
  const context = getContextForSubtree();
  // 创建一个更新
  const update = createUpdate(eventTime, lane);
  // 将新建的更新入栈
  enqueueUpdate(current, update, lane);
  // 请求一次调度更新
  const root = scheduleUpdateOnFiber(current, lane, eventTime);

  return lane;
}
```

如果你调试过 React 的首次更新过程，你会知道 React 会走到这里。如果你往前追溯 updateContainer 的调用链条，你会发现这些调度都来自于应用层 API。首次渲染是一次同步渲染，通过 updateContainer 这个函数，创建第一个 update 对象，将首个 update 对象入队列，发起首次调度。可以说，这里是 React 引擎的点火器。

总结一下 updateContainer 核心功能：

- 初始化创建一个更新对象，并且将更新加入更新队列。
- 调用 scheduleUpdateOnFiber，(向调度器)发出一次调度的请求。【注：向调度器有些不妥，因为同步任务一般不会经过调度器，这里暂且这么表述，便于理解】

## scheduleUpdateOnFiber：剥丝抽茧，追本溯源

> scheduleUpdateOnFiber 从 FiberTree 的枝繁叶茂中找到了当初的那枚种子。

在 updateContainer 中，调用了 scheduleUpdateOnFiber 以在 fiber（此处指的是 RootFiber） 上调度一次更新，那么调度更新是如何在 fiber 上展开的呢？

首先来分析一下代码：

```js
// src/react/packages/react-reconciler/src/ReactFiberWorkLoop.new.js
let workInProgressRootRenderPhaseUpdatedLanes: Lanes = NoLanes;

export function mergeLanes(a: Lanes | Lane, b: Lanes | Lane): Lanes {
  return a | b;
}

export function scheduleUpdateOnFiber(
  //  RootFiber
  fiber: Fiber,
  // 调度优先级
  lane: Lane,
  eventTime: number,
): FiberRoot | null {
  // 检查嵌套更新，防止死循环
  checkForNestedUpdates();
  // 从 fiber 向上收集 lanes，root：FiberRoot = fiber.stateNode。对于 updateContainer 来说，这里 fiber 就是 RootFiber。
  const root = markUpdateLaneFromFiberToRoot(fiber, lane);

  // 标记 root 即将更新，root.pendingLanes |= lane
  markRootUpdated(root, lane, eventTime);
  // 如果当前已经是 Render 阶段，且 root 是待处理的 HostRoot，这时跳过渲染的调度请求，并且追踪 lane，加入到 Render 阶段的 lanes，就在在当前调度的回调中参与渲染，或者等待下次渲染。
  if (
    (executionContext & RenderContext) !== NoLanes &&
    root === workInProgressRoot
  ) {
    // 收集当前的 lane 到 workInProgressRootRenderPhaseUpdatedLanes，表示在当前 render 中当前正在渲染的 RootFiber 上的优先级队列。
    workInProgressRootRenderPhaseUpdatedLanes = mergeLanes(
      workInProgressRootRenderPhaseUpdatedLanes,
      lane,
    );
  } else {
    // 确保 HostRoot 发起调度请求
    ensureRootIsScheduled(root, eventTime);
  }
  return root;
}
```

关注入参的伙伴可能已经发现，这里传入的是 fiber，返回的和传递给 ensureRootIsScheduled 函数的却是 root。root 是 FiberRoot，并不是 Fiber。可以把 FiberRoot 理解为 FiberTree 的容器。FiberRoot 与 RootFiber 双向索引。之后会详细展开。

markUpdateLaneFromFiberToRoot 向上收集优先级的同时寻找到了 HostRoot 容器，因为渲染任务的调度是依托于容器的，而非 RootFiber。这个过程更像是一个抽丝剥茧的过程，root 才是被调度的目标。

这个函数的核心功能如下：

- 从 fiber 向父级收集 lanes，并且计算出 HostRoot。
- 调用 ensureRootIsScheduled，确保 HostRoot 发起同步或者异步调度。

## ensureRootIsScheduled：一花开两叶，结果自然成

> ensureRootIsScheduled 是封装调度任务的双线流水车间。

在上面对 scheduleUpdateOnFiber 的分析中，最重要的就是调用 ensureRootIsScheduled，以保证在 fiber 所在的 HostRoot 上调度更新，那么 HostRoot 上是如何继续调度的呢？继续来看代码。

```js
// src/react/packages/react-reconciler/src/ReactFiberWorkLoop.new.js
function ensureRootIsScheduled(root: FiberRoot, currentTime: number) {
  // 在本次调度之前的当前的记录的回调节点
  const existingCallbackNode = root.callbackNode;

  // 计算将要渲染的 lanes
  const nextLanes = getNextLanes(
    root,
    root === workInProgressRoot ? workInProgressRootRenderLanes : NoLanes,
  );
  // 无需要渲染的 lanes，直接重置退出
  if (nextLanes === NoLanes) {
    root.callbackNode = null;
    root.callbackPriority = NoLane;
    return;
  }

  // 获取 lanes 中优先级最高的 lane 作为本次调度的优先级
  const newCallbackPriority = getHighestPriorityLane(nextLanes);

  // 由于即将要生成新的调度，先将现在的调度节点上的回调取消掉
  if (existingCallbackNode != null) {
    cancelCallback(existingCallbackNode);
  }

  // 设置一个新的回调节点
  let newCallbackNode;
  // 如果是同步更新任务
  if (newCallbackPriority === SyncLane) {
      // 请求同步调度回调 performSyncWorkOnRoot，将该回调加入同步回调队列
      scheduleSyncCallback(performSyncWorkOnRoot.bind(null, root));
    if (supportsMicrotasks) {
     // 支持微任务的浏览器不用再请求调度器的回调
     scheduleMicrotask(() => {
       if (executionContext === NoContext) {
         // 消费完同步回调队列
         flushSyncCallbacks();
       }
     });
    } else {
      // 不支持微任务则向调度器请求回调，优先级 ImmediatePriority（立即回调），回调后执行 flushSyncCallbacks 将同步回调队列消费完
      scheduleCallback(ImmediateSchedulerPriority, flushSyncCallbacks);
    }
    // 同步更新执行完毕，将 newCallbackNode 置为 null，performSyncWorkOnRoot 不会用到此值
    newCallbackNode = null;
  } else {
    let schedulerPriorityLevel;
    // 将 lanes 转化为事件优先级，然后将事件优先级转化为调度优先级
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
    // 向调度器请求相应优先级的异步回调【也可能是立即执行的优先级】，回调后执行 performConcurrentWorkOnRoot，Scheduler.scheduleCallback 返回调度的 callbackNode(newTask)
    newCallbackNode = scheduleCallback(
      schedulerPriorityLevel,
      performConcurrentWorkOnRoot.bind(null, root),
    );
  }
  // 更新 callbackPriority 和 callbackNode 注意，此时只是发起调度，回调并未执行
  root.callbackPriority = newCallbackPriority;
  root.callbackNode = newCallbackNode;
}
```

ensureRootIsScheduled 将 HostRoot 上的调度任务区分为同步任务和异步任务。

这个函数有以下几个核心作用：

- 更新 root 的 callbackNode、callbackPriority 属性。下次 ensureRootIsScheduled 被调用会使用到。
- 同步更新调度：调用 scheduleSyncCallback 将同步回调 performSyncWorkOnRoot 推入同步回调队列 syncQueue；支持微任务的直接在微任务的回调执行 flushSyncCallbacks；不支持微任务时以 ImmediateSchedulerPriority 的优先级向调度器请求同步回调，回调时执行 flushSyncCallbacks 消费同步队列中所有的同步回调。
- 异步更新调度：根据 nextLanes 计算事件优先级，并且转化为调度优先级，以相应的调度优先级向调度器发起异步回调，回调时执行 performConcurrentWorkOnRoot。
- 注意同步调度中调用了 scheduleSyncCallback、scheduleCallback 两个函数不可混淆，scheduleCallback 是 Scheduler 提供的一种基于优先级机制的任务（回调）调度手段，performSyncWorkOnRoot 和 performConcurrentWorkOnRoot 才是真正要通过调度执行的任务。同步的任务通过同步回调队列的方式进行了优化处理。scheduleSyncCallback 是将同步的任务加入同步任务队列。调度器不是不可缺少的，如果浏览器支持微任务，同步任务的处理就可以交给微任务处理，而不经过调度器。

## scheduleSyncCallback 和 scheduleCallback

## 总结