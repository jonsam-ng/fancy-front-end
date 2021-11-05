// React 文档目录
const reactPath = "/react";
// Vue3 文档目录
const vue3Path = "/vue3";

const sidebar = {
  // React 源码分析
  react: [
    {
      title: "开始上手",
      collapsable: true,
      path: `${reactPath}/`,
      sidebarDepth: 1,
    },
    {
      title: "基础",
      collapsable: false,
      path: `${reactPath}/basic/`,
      sidebarDepth: 2,
      children: [
        `${reactPath}/basic/chapter`,
        `${reactPath}/basic/ReactElement`,
        `${reactPath}/basic/ReactChildren`,
      ],
    },
    {
      title: "调和（Reconciliation）",
      collapsable: false,
      path: `${reactPath}/reconciliation/`,
      sidebarDepth: 2,
      children: [
        `${reactPath}/reconciliation/fiber`,
        `${reactPath}/reconciliation/reactChildFiber`,
        `${reactPath}/reconciliation/expirationTime`,
        `${reactPath}/reconciliation/scheduleWork`,
      ],
    },
    {
      title: "调度器（Scheduler）",
      collapsable: false,
      path: `${reactPath}/scheduler/`,
      sidebarDepth: 2,
      children: [
        `${reactPath}/scheduler/scheduleCallback`,
        `${reactPath}/scheduler/schedulerHostConfig`,
        `${reactPath}/scheduler/scheduler`,
      ],
    },
    {
      title: "更新器（Updater）",
      collapsable: false,
      path: `${reactPath}/updater/`,
      sidebarDepth: 2,
      children: [`${reactPath}/updater/workloop`],
    },
    {
      title: "渲染器（Render）",
      collapsable: false,
      path: `${reactPath}/render/`,
      sidebarDepth: 2,
      children: [`${reactPath}/render/ReactDOM.render`],
    },
    {
      title: "更新周期",
      collapsable: false,
      path: `${reactPath}/update/`,
      sidebarDepth: 2,
      children: [],
    },
    {
      title: "hooks 原理",
      collapsable: false,
      path: `${reactPath}/hooks/`,
      sidebarDepth: 2,
      children: [
        `${reactPath}/hooks/useState`,
        `${reactPath}/hooks/useEffect`,
        `${reactPath}/hooks/useRef`,
      ],
    },
    {
      title: "总结",
      collapsable: false,
      path: `${reactPath}/summary/`,
      sidebarDepth: 1,
      children: [`${reactPath}/summary/bitOperation`],
    },
  ],
  vue3: [
    {
      title: "开始上手",
      collapsable: true,
      path: `${vue3Path}/`,
      sidebarDepth: 1,
    },
    {
      title: "基础",
      collapsable: false,
      path: `${vue3Path}/basic/`,
      sidebarDepth: 2,
      children: [],
    },
    {
      title: "reactivity",
      collapsable: false,
      path: `${vue3Path}/reactivity/`,
      sidebarDepth: 2,
      children: [
        `${vue3Path}/reactivity/ref`,
        `${vue3Path}/reactivity/reactive`,
        `${vue3Path}/reactivity/handler`,
        `${vue3Path}/reactivity/effect`,
        `${vue3Path}/reactivity/computed`,
      ],
    },
    {
      title: "runtime-core",
      collapsable: false,
      path: `${vue3Path}/runtime-core/`,
      sidebarDepth: 2,
      children: [],
    },
    {
      title: "runtime-dom",
      collapsable: false,
      path: `${vue3Path}/runtime-dom/`,
      sidebarDepth: 2,
      children: [],
    },
  ],
};

// 顶部导航配置
const nav = [
  // React 源码
  {
    text: "React源码",
    ariaLabel: "React 源码菜单",
    items: [
      {
        text: "基础",
        link: `${reactPath}/basic/`,
      },
      {
        text: "调和（Reconciliation）",
        link: `${reactPath}/reconciliation/`,
      },
      {
        text: "调度器（Scheduler）",
        link: `${reactPath}/scheduler/`,
      },
      {
        text: "更新器（Updater）",
        link: `${reactPath}/updater/`,
      },
      {
        text: "渲染器（Render）",
        link: `${reactPath}/render/`,
      },
      {
        text: "hooks 原理",
        link: `${reactPath}/hooks/`,
      },
      {
        text: "总结",
        link: `${reactPath}/summary/`,
      },
    ],
  },
  {
    text: "vue3源码",
    ariaLabel: "vue3 源码菜单",
    items: [
      {
        text: "基础",
        link: `${vue3Path}/basic/`,
      },
      {
        text: "reactivity",
        link: `${vue3Path}/reactivity/`,
      },
    ],
  },
  {
    text: "博客",
    link: "https://www.jonsam.site",
  },
];

module.exports = { sidebar, nav };
