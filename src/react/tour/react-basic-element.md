# React 源码漂流记：React Element 与基础概念

<Badges :content="[{type: 'tip', text: 'React17'}, {type: 'tip', text: '精简'}]" />

<TimeToRead />

## 目录

[[TOC]]

## 前言

这是React 源码漂流记系列文章的第一篇。从今天开始，开启我们的 React 源码阅读之旅。我阅读 React 的源码陆陆续续也有几个月之久，其间也有不少的收获和感悟，趁此机会，整理成文章，与大家分享和讨论，同时也可以给想要开始阅读源码的伙伴一些启发吧。

开始今天的内容之前，我想先聊几个问题，因为这是 React 源码阅读系列的第一篇文章，我想先分享一下我对阅读源码的一下见解。

### 前置知识

- 熟悉 Javascript 语言。
- 熟练使用 React 框架，并且有一定的开发经验。

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
3. 问题驱动，寻找答案。从业务需求中遇到的问题出发，从源码中寻找答案，直到解决疑惑为止。

阅读源码的建议：

1. 先关注核心逻辑，然后在关注实现细节。React 中有很多 Dev 环境、插件的代码或者是兼容性考虑的代码，可能会对你的阅读产生影响，可以跳过这些逻辑，只关注核心骨架。
2. 分层阅读。React 内部分成了很多模块，可以根据阅读进度分层阅读，直到最终能够将各个模块的内容联动起来。
3. 关注注释。源码中有很多详细的注释，关注注释可以给你更深的理解。

### 我们能从 React 源码中学习到什么？

- 对框架更深入的理解和掌握。
- 框架设计的思想和模式。
- js 的高级应用。

### 本系列的文章怎么解读 React 源码？

- 源码：源码本身是最重要的，文章中列出的源码都是已经提炼处理的核心的代码，去除了 dev 环境、各种插件或者非核心的代码，防止对您阅读产生影响。
- 篇幅：内容的篇幅不会很长，每篇文章会严格控制在 15 分钟阅读时间之内。如果您关注某些细节问题，可以参见【扩展】部分，这一部分会对本篇文章产生的若干细节问题进行扩展，当然如果您只关注骨干内容也可以跳过这一部分。
- 内容：源码的解读难以逃脱个人理解的范围，所以如果有错误的地方、或者您有不同的见解、更多的问题，还请及时指正或者在评论区提出。当然也有一些问题，会在【问题】部分列出，作为对文章内容的消化。

## React API 概况

在 react 包中 React.js 文件中对 React 有如下定义，通过这个定义，我们可以对 React 的核心 API 初步认识。

```js
const React = {
  // 提供了用于处理 children 不透明数据结构的实用方法。
  // 操作 ReactChildren 的方法。ReactChildren不是数组。这里模拟数组的一些方法。
  Children: { 
    map,
    forEach,
    count,
    toArray,
    only,
  },
  // 创建一个能够通过 ref 属性附加到 React 元素的 ref。
  createRef, 
  // 定义类组件需集成自 Component
  Component,
  // PureComponent 以浅层对比 prop 和 state 的方式来实现 shouldComponentUpdate 函数。
  PureComponent, 
  // 创建一个 Context 对象。当组件订阅了这个 Context 对象，组件会从组件树中离自身最近的那个匹配的 Provider 中读取到当前的 context 值。
  createContext,
  // forwardRef 会创建一个React组件，这个组件能够将其接受的 ref 属性转发到其组件树下的另一个组件中。
  forwardRef, 
  // lazy 函数能让你像渲染常规组件一样处理动态引入（的组件）。
  lazy, 
  // memo 检查 props 变更，以此通过记忆组件渲染结果的方式来提高组件的性能表现。
  memo,
  // Hook API
  // 返回一个 memoized 回调函数。
  useCallback,
  // 接收一个 context 对象，并返回距离 <MyContext.Provider> 最近的 context 的当前值。
  useContext,
  // 接收一个包含命令式、且可能有副作用代码的函数完成副作用操作。React 的纯函数式世界通往命令式世界的逃生通道
  useEffect,
  // 在使用 ref 时自定义暴露给父组件的实例值。
  useImperativeHandle,
  // 可用于在 React 开发者工具中显示自定义 hook 的标签。
  useDebugValue,
  // 所有的 DOM 变更之后同步调用 effect。可以使用它来读取 DOM 布局并同步触发重渲染。在浏览器执行绘制之前，useLayoutEffect 内部的更新计划将被同步刷新。
  useLayoutEffect,
  // 返回一个 memoized 值。
  useMemo,
  // useState 的替代方案。它接收一个 reducer，并返回当前的 state 以及与其配套的 dispatch 方法。
  useReducer,
  // useRef 返回一个可变的 ref 对象，其 .current 属性被初始化为传入的参数，返回的 ref 对象在组件的整个生命周期内持续存在。
  useRef,
  // 返回一个 state，以及更新 state 的函数。
  useState,
  // Fragments 允许你将子列表分组，而无需向 DOM 添加额外节点。
  Fragment: REACT_FRAGMENT_TYPE,
  // Profiler 测量一个 React 应用多久渲染一次以及渲染一次的“代价”。
  Profiler: REACT_PROFILER_TYPE,
  // StrictMode 是一个用来突出显示应用程序中潜在问题的工具。
  StrictMode: REACT_STRICT_MODE_TYPE, 
  // Suspense 可以指定加载指示器，以防其组件树中的某些子组件尚未具备渲染条件。
  Suspense: REACT_SUSPENSE_TYPE, // 与lazy结合使用，指定一个feedback。
  // 创建并返回指定类型的新 React 元素。
  createElement: __DEV__ ? createElementWithValidation : createElement,
  // 以 element 元素为样板克隆并返回新的 React 元素。
  cloneElement: __DEV__ ? cloneElementWithValidation : cloneElement,
  // 验证对象是否为 React 元素
  isValidElement: isValidElement,
};
```

其中比较重要的大致为：

- 元素相关：Children、createElement、cloneElement。
- 组件相关：Component、PureComponent、createRef、Fragment、forwardRef
- hooks api: useCallback,useContext,useEffect,useImperativeHandle,useDebugValue,useLayoutEffect,useMemo,useReducer,useRef,useState。
- 优化相关：lazy、memo、Suspense。
- 其他：createContext。

## JSX

### 介绍

什么是 JSX？

> JSX(JavaScript Syntax Extension，JavaScript 语法扩展)是 JavaScript 语法的扩展，最初用于 React，它提供一种类似于 HTML 的语法来
结构化的编写组件。【来自[JSX](https://en.wikipedia.org/wiki/JSX_(JavaScript))】

React 开发者对于 JSX 应该是很熟悉了，更专业一点来说：

- JSX 是一种将 JS 和 HTML 混合编写组件的语法糖，其语法需要通过 babel 解析之后才能被浏览器识别。
- JSX 语法可以通过 [@babel/plugin-transform-react-jsx-source](https://babeljs.io/docs/en/babel-plugin-transform-react-jsx-source) 插件进行解析。

### 为什么使用 JSX？

关于 JSX 更详细的内容，React 官方文档中 [JSX 简介](https://zh-hans.reactjs.org/docs/introducing-jsx.html) 已经讲的很清楚了，此处不再赘述。但是我想浅谈一下我对 React 选择 JSX 背后的哲学原因的理解。

> React 认为渲染逻辑本质上与其他 UI 逻辑内在耦合。
>
> React 并没有采用将标记与逻辑进行分离到不同文件这种人为地分离方式，而是通过将二者共同存放在称之为“组件”的松散耦合单元之中，来实现关注点分离。【来自 React 官方文档：[为什么使用 JSX？](https://zh-hans.reactjs.org/docs/introducing-jsx.html#why-jsx)】

- `渲染逻辑与 UI 逻辑耦合`是 React、Vue 等框架流行带来的组件化理念的必然结果。组件化要求我们将样式（UI 逻辑）与行为（渲染逻辑）封装到组件中已达到代码复用之目的，这也是组件化开发带来的最大的红利。
- `将标记与逻辑进行分离到不同文件` 这种思维方式在框架诞生之前编写原生 JS 时最常用的代码分离的手段，当然框架的组件化驱动的理念促使这种做法被放弃，取而代之的有如下的两种常见的新的理念，这两种理念都达到了`将二者共同存放在称之为“组件”的松散耦合单元之中，来实现关注点分离` 的目的。
  - JSX：以 React.js、Solid.js 框架为代表。将 HTML 和 JavaScript 混合编写组件。
  - SFC：以 Vue.js 和 svelte.js 框架为代表。单文件组件将组件分为 `template`、`style`和 `script` 三个部分。

### JSX 如何 解析为 JS？

让我们使用 [babel-transform-react-jsx](https://babeljs.io/repl#?browsers=defaults%2C%20not%20ie%2011%2C%20not%20ie_mob%2011&build=&builtIns=false&corejs=3.21&spec=false&loose=false&code_lz=MYewdgzgLgBAwuADuApmWBeGAKAlDDAPhgG8AoASACcUoBXKsHMmVmAHgBMBLANxmgBPADYoMJEqGEgqALhgByAMQAzNeoUBfTYRZtW7ABYBGGMGEBDCBAwAiKNyijbhQygs8wAc3YB6E7r6Bjz85lY2tgBGIJyCLqDoaFB-IYFsKXxprLhkmkA&debug=false&forceAllTransforms=false&shippedProposals=false&circleciRepo=&evaluate=true&fileSize=false&timeTravel=true&sourceType=module&lineWrap=true&presets=env%2Creact%2Cstage-2&prettier=true&targets=&version=7.17.9&externalPlugins=&assumptions=%7B%7D) 对如下的代码进行转换：

```js
const work = () => {dosomething();}
const Conponent = () => {
	return (
    <div style={{color: '#ffffff'}}>
      <h1 class="title">heading</h1>
      <div class="body" onClick={work}>content</div>
    </div>
    )
}
```

转换结果如下：

```js
const work = () => {
  dosomething();
};

const Conponent = () => {
  return /*#__PURE__*/ React.createElement(
    "div",
    {
      style: {
        color: "#ffffff"
      }
    },
    /*#__PURE__*/ React.createElement(
      "h1",
      {
        class: "title"
      },
      "heading"
    ),
    /*#__PURE__*/ React.createElement(
      "div",
      {
        class: "body",
        onClick: work
      },
      "content"
    )
  );
};
```

分析上面的解析过程可知：

- babel 插件在解析 jsx 代码时，js 部分是不需要解析的，html 部分会被解析为 React.createElement 语法。
- 静态的部分会被加上 `/*#__PURE__*/` 的静态内容标记。
- 多个子节点并不是通过数组传入而是以多个参数的形式传入的，这个可以通过 rest 运算符处理。

JSX 会将代码中 html 转化为渲染函数（h 函数、createElement函数）的语法糖，以方便框架对 JSX 的内容进行处理。这实际上使得 JSX 语法与框架解耦，使 JSX 能够运用到各种实现了渲染函数的框架之中。

## ReactElement

下面将介绍 ReactElement 以及 ReactElement 相关的工具函数。

### createElement

createElement 创建创建 React 元素（ReactElement）。先来看一个例子，假如一个经过 babel 解析过的 JSX 代码如下：

```js
React.createElement("div", {
    class: "class_name",
    id: "id_name",
    key: "key_name",
    ref: "ref_name"
}, React.createElement("span", null, "Tom"), React.createElement("span", null, "Jerry"));
```

以上的执行结果如下：

```js
{
    $$typeof: REACT_ELEMENT_TYPE,
    type：'div'，
    key: 'key_name',
    ref: "ref_name",
    props: {
        class: "class_name",
        id: "id_name",
        children: [
            React.createElement("span", null, "Tom"),
            React.createElement("span", null, "Jerry")
        ]
    }
     _owner: ReactCurrentOwner.current,
}
```

这便是 ReactElement 的真面目了。React 是基于 VDOM 的运行时框架，其内部节点的创建、更新、patch、删除都是通过 VDOM 来实现的。

我们通常熟知的 VDOM 节点，包括 type、attr、children 三个元素，那么我们再来看 ReactElement 的特征，ReactElement 对象也包含了这三个属性，只不过 attr 和 children 是放在 props 中的，我们知道 React 组件的设计哲学是`组件是靠两条腿走路的的，分别是props 和 state，props 关注组件与外部的状态，state 关注组件内部的状态`，这一点也是符合理念的。

下面的内容我们将从源码的角度继续探究：

createElement 的源码：

```ts
// 根据元素类型 type，元素属性 config 和元素子节点（数组） children 创建 react 元素
export function createElement(type, config, children) {
  let propName;

  // Reserved names are extracted
  const props = {};

  let key = null;
  let ref = null;
  let self = null;
  let source = null;

  if (config != null) {
    // 检查是否添加了 ref 属性
    if (hasValidRef(config)) {
      ref = config.ref;
    }
    // 检查是否添加了 key 属性
    if (hasValidKey(config)) {
      key = '' + config.key;
    }

    self = config.__self === undefined ? null : config.__self;
    source = config.__source === undefined ? null : config.__source;
    // 添加至属性对象
    for (propName in config) {
      if (
        hasOwnProperty.call(config, propName) &&
        !RESERVED_PROPS.hasOwnProperty(propName)
      ) {
        props[propName] = config[propName];
      }
    }
  }

  // Children can be more than one argument, and those are transferred onto
  // the newly allocated props object.
  const childrenLength = arguments.length - 2;
  if (childrenLength === 1) {
    // 单一子节点直接赋值
    // children 是放到 props 上的，因此可以通过 props 的 children 获得组件内部内容
    props.children = children;
  } else if (childrenLength > 1) {
    const childArray = Array(childrenLength);
    for (let i = 0; i < childrenLength; i++) {
      childArray[i] = arguments[i + 2];
    }
    props.children = childArray;
  }

  // Resolve default props
  // 元素默认的属性
  if (type && type.defaultProps) {
    const defaultProps = type.defaultProps;
    for (propName in defaultProps) {
      if (props[propName] === undefined) {
        props[propName] = defaultProps[propName];
      }
    }
  }
  return ReactElement(
    // 元素类型
    type,
    // 内部属性
    key,
    ref,
    self,
    source,
    ReactCurrentOwner.current,
    // 元素属性
    props,
  );
}
```

## 总结