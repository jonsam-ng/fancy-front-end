# loadApp 加载微应用

<Badges :content="[{type: 'tip', text: '核心'}]" />

<TimeToRead />

## 目录

[[TOC]]

## loadApp

在 [核心 API](./apis.md) 中已经分析过，loadApp 这个函数会在 registerMicroApps、loadMicroApp 两个函数中调用。需要注意的是，需要保证  loadApp 在主程序 start 执行之后在执行，从 s-spa 的角度来说也就是 startSingleSpa 之后执行。主程序的 start 并不是一定得在注册微应用之后立即开启，主程序 start 的机会有两个，分别是 start 函数和 loadMicroApp 函数。

