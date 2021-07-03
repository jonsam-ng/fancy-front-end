# expirationTime与优先级

[[TOC]]


## 调度优先级

react 中优先级分为四种:

```txt
事件优先级：按照用户事件的交互紧急程度，划分的优先级
更新优先级：事件导致React产生的更新对象（update）的优先级（update.lane）
任务优先级：产生更新对象之后，React去执行一个更新任务，这个任务所持有的优先级
调度优先级：Scheduler依据React更新任务生成一个调度任务，这个调度任务所持有的优先级
```

参考：[React中的优先级](https://zhuanlan.zhihu.com/p/343754137)

这里我们探讨的是调度优先级。在上文中我们已经知道虽然 js 是单线程执行的，但是现代的浏览器可以通过 `requestIdleCallback` 和 `requestAnimationFrame` 来执行不同优先级的任务。通过这种优先级的管理，可以让页面的渲染更加流畅，而不至于让低优先级的任务阻塞了高优先级的任务的执行。

react 中配合浏览器来实现优先级管理的正是前文所述的 fiber 系统，只是前文我们主要在研究 fiber 在渲染中的创建和更新流程，现在我们就来着重分析 fiber 系统对于优先级管理所发挥的重要角色。这里我们只分析优先级的管理，至于不同优先级的任务是如何具体执行的，我们将在渲染器中具体分析。

## expirationTime

react 中的调度优先级是通过 `expirationTime` 来实现的（暂不考虑新版本中的 lanes）。`expirationTime` 字面意思是“到期时间”或者“过期时间”，。