# Apps

<Badges :content="[]" />

<TimeToRead />

## 目录

[[TOC]]

## registerApplication

registerApplication 注册微应用。

```js
const apps = [];
export const isInBrowser = typeof window !== "undefined";
export function registerApplication(
  appNameOrConfig,
  appOrLoadApp,
  activeWhen,
  customProps
) {
  // 参数消毒
  const registration = sanitizeArguments(
    appNameOrConfig,
    appOrLoadApp,
    activeWhen,
    customProps
  );
  // 检查重复注册
  if (getAppNames().indexOf(registration.name) !== -1)
    throw Error(
      formatErrorMessage(
        21,
        __DEV__ &&
          `There is already an app registered with name ${registration.name}`,
        registration.name
      )
    );
  // 加入微应用列表，并合并默认配置
  apps.push(
    assign(
      {
        loadErrorTime: null,
        status: NOT_LOADED,
        parcels: {},
        devtools: {
          overlays: {
            options: {},
            selectors: [],
          },
        },
      },
      registration
    )
  );

  if (isInBrowser) {
    // 代理 jq 的路由
    ensureJQuerySupport();
    // 调整路由监听，初始化或者应用配置变化
    reroute();
  }
}
```

1. 参数消毒

sanitizeArguments 这样的思想在设计复杂的门面 API 时可以参考，既可以过滤掉非法的参数，也可以对参数的传参行为进行加强。

2. map 与 mapper

```js
export function getAppNames() {
  return apps.map(toName);
}
export function toName(app) {
  return app.name;
}
```

将 map、forEach 等传入回调函数的方法与回调本身分离开来，赋予 mapper 以一定的逻辑功能点，能够提供复用代码的目的。

3. formatErrorMessage

```js
export function formatErrorMessage(code, msg, ...args) {
  return `single-spa minified message #${code}: ${
    msg ? msg + " " : ""
  }See https://single-spa.js.org/error/?code=${code}${
    args.length ? `&arg=${args.join("&arg=")}` : ""
  }`;
}
```

错误信息日志在很多框架中都有设计，可以参考各种写法，有些可能需要与官方文档向关联。但是这种把 code 耦合在逻辑代码中的做法有点不妥。

## unregisterApplication

unregisterApplication 删除微应用。

```js
export function unregisterApplication(appName) {
  // 未找到卸载微应用
  if (apps.filter((app) => toName(app) === appName).length === 0) {
    // ......
  }

  return unloadApplication(appName).then(() => {
    // 卸载应用并且将应用从箣竹列表中删除
    const appIndex = apps.map(toName).indexOf(appName);
    apps.splice(appIndex, 1);
  });
}
```

## unloadApplication

unloadApplication  unload 微应用。

```js
export function unloadApplication(appName, opts = { waitForUnmount: false }) {
  // ......

  const appUnloadInfo = getAppUnloadInfo(toName(app));
  // 在 unload 之前需要等待应用 unmount（即等应用 unmount 之后才能 unload）
  if (opts && opts.waitForUnmount) {
    // We need to wait for unmount before unloading the app
    if (appUnloadInfo) {
      // Someone else is already waiting for this, too
      // 应用已经正在 unload，返回这个 promise
      return appUnloadInfo.promise;
    } else {
      // We're the first ones wanting the app to be resolved.
      // 将应用加入到 unload 队列，并且返回这个 promise，promise 将在应用 unload 时 resolve
      const promise = new Promise((resolve, reject) => {
        addAppToUnload(app, () => promise, resolve, reject);
      });
      return promise;
    }
  } else {
    /* We should unmount the app, unload it, and remount it immediately.*/
    let resultPromise;
    // 不必等待 unmount，直接将之 unload 
    if (appUnloadInfo) {
      // Someone else is already waiting for this app to unload
      resultPromise = appUnloadInfo.promise;
      // 立即  unload 应用，因为之前已经等待式 unload，现在又立即 unload，所以将之前的 promise.resolve 传入
      immediatelyUnloadApp(app, appUnloadInfo.resolve, appUnloadInfo.reject);
    } else {
      // We're the first ones wanting the app to be resolved.
      // 创建 promise，在 promise 中将应用加入到 unload 列表，并立即 unload 应用
      resultPromise = new Promise((resolve, reject) => {
        addAppToUnload(app, () => resultPromise, resolve, reject);
        immediatelyUnloadApp(app, resolve, reject);
      });
    }
    // 返回 unload promise
    return resultPromise;
  }
}
```

- 这里提出了 unmount 和 unload 的概念。之后会详细了解两者的区别。
- 分成了四种情况，是否在 unload 之前等待 unmount、是否已经存在于 unload 列表中。可见 unload 本身应该是异步的，因此才返回一个 promise，并承诺应用 unload 时在 promise 中会 resolve。这其中 unmount 的过程是个很重要的因素，因为 unmount 的阻塞才需要区分是否去等待 unmount 的过程，才需要用 unload 的队列来管理这样一个异步的任务队列。可见这里的设计很巧妙。
- 等待 unmount 会等待一个怎样的过程，这个过程如何借宿并且自动触发 unload，我们下文知晓。

## immediatelyUnloadApp

立即 unload 应用。

在 unloadApplication 中的 `waitForUnmount` 为 false 时，立即 unload 应用。