
# React 中的事件监听机制


<TimeToRead />

## 目录

[[TOC]]

```js
// src/react/packages/react-dom/src/events/DOMPluginEventSystem.js
export function listenToNativeEvent(
  // 监听的时间名称
  domEventName: DOMEventName,
  // 是否是在捕获过程键监听
  isCapturePhaseListener: boolean,
  // 时间委托监听的对象（container 或者 document）
  target: EventTarget,
): void {

  let eventSystemFlags = 0;
  if (isCapturePhaseListener) {
    eventSystemFlags |= IS_CAPTURE_PHASE;
  }
  addTrappedEventListener(
    target,
    domEventName,
    eventSystemFlags,
    isCapturePhaseListener,
  );
}
```

<!-- TODO -->