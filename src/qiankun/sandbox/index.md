# Sandbox

<Badges :content="[{type: 'tip', text: '核心'}]" />

<TimeToRead />

## 目录

[[TOC]]

## Shadow DOM

> Method of establishing and maintaining functional boundaries between DOM trees and how these trees interact with each other within a document, thus enabling better functional encapsulation within the DOM & CSS.

Web components 的一个重要属性是封装——可以将标记结构、样式和行为隐藏起来，并与页面上的其他代码相隔离，保证不同的部分不会混在一起，可使代码更加干净、整洁。其中，Shadow DOM 接口是关键所在，它可以将一个隐藏的、独立的 DOM 附加到一个元素上。

::: warning 注意
Shadow DOM 不支持 IE 浏览器，查看[支持情况](https://caniuse.com/?search=shadow%20DOM)，但是可以通过 [polyfill](https://github.com/webcomponents/polyfills/tree/master/packages/webcomponentsjs) 获取支持。
:::

参考：

- [Using shadow DOM](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM)
- [深入理解Shadow DOM v1](https://segmentfault.com/a/1190000019115050)

参考：

- [15分钟快速理解qiankun的js沙箱原理及其实现](https://juejin.cn/post/6920110573418086413)

## WindowProxy

> A WindowProxy object is a wrapper for a Window object. A WindowProxy object exists in every browsing context. All operations performed on a WindowProxy object will also be applied to the underlying Window object it currently wraps. Therefore, interacting with a WindowProxy object is almost identical to directly interacting with a Window object. When a browsing context is navigated, the Window object its WindowProxy wraps is changed.

参考：
- [WIKI：WindowProxy](https://developer.mozilla.org/en-US/docs/Glossary/WindowProxy)

## Object.getOwnPropertyDescriptor()

> Object.getOwnPropertyDescriptor() 方法返回指定对象上一个自有属性对应的属性描述符。（自有属性指的是直接赋予该对象的属性，不需要从原型链上进行查找的属性）。

该方法允许对一个属性的描述进行检索。在 Javascript 中， 属性 由一个字符串类型的“名字”（name）和一个“属性描述符”（property descriptor）对象构成。更多关于属性描述符类型以及他们属性的信息可以查看：Object.defineProperty.

- [MDN: Object.getOwnPropertyDescriptor()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/getOwnPropertyDescriptor)

```js
Object.defineProperty(obj, prop, descriptor)
```
