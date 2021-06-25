# fiber 的理解

## 调和（Reconciliation）

Reconciliation 就是在渲染时，调用组件树中的组件的 render 方法渲染组件，以及组件的更新和卸载。

### Fiber Reconciliation

React 15.X 中 Stack Reconciler 缺乏对渲任务优先级的管理，渲染任务可能会阻塞线程，导致其他高优先级的任务无法执行，造成页面卡顿。

Fiber Reconciliation 是 React16 提出，使渲染任务分段执行，不阻塞主线程，当进程中有更高优先级的任务时就阻塞渲染任务去执行更高优先级的任务。

#### fiber 的功能

fiber 实例与组件实例意义对应，负责组件实例的渲染更新。fiber 实例之前组成 Fiber Tree，可以实现更细粒度的渲染控制。

fiber 提供的功能有：

- 可切分，可中断任务；
- 可重用各分阶段任务，且可以设置优先级；
- 可以在父子组件任务间前进后退切换任务；
- render方法可以返回多元素（即可以返回数组）；
- 支持异常边界处理异常；

#### 浏览器

这种优先级的控制在浏览器中依赖于这两个 Api：

```txt
requestIdleCallback: 在线程空闲时期调度执行低优先级函数；
requestAnimationFrame: 在下一个动画帧调度执行高优先级函数；
```

- requestIdleCallback 执行低优先级的任务，如数据获取。可分为多个 idle callback 将任务细分，具有 deadline，防止执行时间过程阻塞 UI 渲染。
- requestAnimationFrame 执行高优先级的任务，如交互动画。

不支持这种 Api 的浏览器可以用 js 来模拟。

fiber、Fiber 与组件的关系：

- fiber 实例与组件实例以一对一，Fiber Tree 对应组件树，Fiber Root 对应组件树根节点。
- Fiber 只应用的调和算法，fiber 负责组件实例的渲染。
