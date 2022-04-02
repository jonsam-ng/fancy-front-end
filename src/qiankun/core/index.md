# Core

先看下整体的目录结构：

```txt
.
├── addons
│   ├── engineFlag.ts
│   ├── index.ts
│   └── runtimePublicPath.ts
├── apis.ts
├── effects.ts
├── error.ts
├── errorHandler.ts
├── globalState.ts
├── index.ts
├── interfaces.ts
├── loader.ts
├── prefetch.ts
├── sandbox
│   ├── common.ts
│   ├── index.ts
│   ├── legacy
│   │   └── sandbox.ts
│   ├── patchers
│   │   ├── css.ts
│   │   ├── dynamicAppend
│   │   │   ├── common.ts
│   │   │   ├── forLooseSandbox.ts
│   │   │   ├── forStrictSandbox.ts
│   │   │   └── index.ts
│   │   ├── historyListener.ts
│   │   ├── index.ts
│   │   ├── interval.ts
│   │   └── windowListener.ts
│   ├── proxySandbox.ts
│   └── snapshotSandbox.ts
├── utils.ts
└── version.ts
```

大致可以分成核心 api、沙箱和插件几个部分。