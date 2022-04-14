/*****************************************************************************************
 *                                 文档集路径配置
 ******************************************************************************************/
// React 文档目录
const reactPath = "/react";
// Vue3 文档目录
const vue3Path = "/vue3";
// 数据结构目录
const dataStructurePath = "/data-structure";
// 算法目录
const algorithmPath = "/algorithm";
// webpack 目录
const webpackPath = "/webpack";
// vite 目录
const vitePath = "/vite";
// am-editor 目录
const amEditorPath = "/am-editor";
// typescript-utility
const typescriptUtilityPath = "/typescript-utility";
// JQuery 目录
const jQueryPath = "/jquery";
// qiankun 目录
const qiankunPath = "/qiankun";
// snabbdom 目录
const snabbdomPath = "/snabbdom";
// antd vue 目录
const antdVuePath = "/antd-vue";
// hls 目录
const hlsPath = "/hls";
// create react app 目录
const craPath = "/cra";
// solid 目录
const solidPath = "/solid";
// svelte 目录
const sveltePath = "/svelte";
// axios 目录
const axiosPath = "/axios";
// express 目录
const expressPath = "/express";
// html2canvas 目录
const html2canvasPath = "/html2canvas";
// single-spa 目录
const singleSpaPath = "/single-spa";

/*****************************************************************************************
 *                                 侧边栏配置
 ******************************************************************************************/

const sidebar = {
  // ========== React ========== //
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
        `${reactPath}/basic/faq`,
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
      children: [
        `${reactPath}/summary/bitOperation`,
        `${reactPath}/summary/first-render`,
        `${reactPath}/summary/10-min-react`,
      ],
    },
    {
      title: "React 源码漂流记",
      collapsable: false,
      path: `${reactPath}/tour/`,
      sidebarDepth: 1,
      children: [
        `${reactPath}/tour/react-basic-element`,
        `${reactPath}/tour/react-basic-children`,
        `${reactPath}/tour/react-reconciliation-1`,
        `${reactPath}/tour/react-reconciliation-2`,
      ],
    },
  ],
  // ========== vue3 ========== //
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
  // ========== 算法 ========== //
  algorithm: [
    {
      title: "开始上手",
      collapsable: true,
      path: `${algorithmPath}/`,
      sidebarDepth: 1,
    },
  ],
  // ========== 数据结构 ========== //
  dataStructure: [
    {
      title: "开始上手",
      collapsable: true,
      path: `${dataStructurePath}/`,
      sidebarDepth: 1,
    },
    {
      title: "链表",
      collapsable: false,
      path: `${dataStructurePath}/linked-list/`,
      sidebarDepth: 2,
      children: [`${dataStructurePath}/linked-list/single`],
    },
  ],
  // ========== Vite ========== //
  vite: [
    {
      title: "开始上手",
      collapsable: true,
      path: `${vitePath}/`,
      sidebarDepth: 1,
    },
    {
      title: "基础",
      collapsable: false,
      path: `${vitePath}/basic/`,
      sidebarDepth: 2,
      children: [],
    },
    {
      title: "vite-core",
      collapsable: false,
      path: `${vitePath}/vite/`,
      sidebarDepth: 2,
      children: [`${vitePath}/vite/cli`, `${vitePath}/vite/server`],
    },
  ],
  // ========== amEditor 富文本编辑器 ========== //
  amEditor: [
    {
      title: "开始上手",
      collapsable: true,
      path: `${amEditorPath}/`,
      sidebarDepth: 1,
    },
    {
      title: "engine",
      collapsable: false,
      path: `${amEditorPath}/engine/`,
      sidebarDepth: 2,
      children: [
        `${amEditorPath}/engine/engine-basic`,
        `${amEditorPath}/engine/engine`,
        `${amEditorPath}/engine/container`,
        `${amEditorPath}/engine/change`,
        `${amEditorPath}/engine/range`,
      ],
    },
  ],
  // ========== TypeScript ========== //
  typescriptUtility: [
    {
      title: "开始上手",
      collapsable: true,
      path: `${typescriptUtilityPath}/`,
      sidebarDepth: 1,
    },
    {
      title: "基础",
      collapsable: false,
      path: `${typescriptUtilityPath}/basic/`,
      sidebarDepth: 2,
      children: [
        `${typescriptUtilityPath}/basic/basic-types`,
        `${typescriptUtilityPath}/basic/type-manipulation`,
        `${typescriptUtilityPath}/basic/classes`,
        `${typescriptUtilityPath}/basic/reference`,
      ],
    },
    {
      title: "Utility Types",
      collapsable: false,
      path: `${typescriptUtilityPath}/utility-types/`,
      sidebarDepth: 2,
      children: [
        `${typescriptUtilityPath}/utility-types/basic`,
        `${typescriptUtilityPath}/utility-types/mapped-types`,
      ],
    },
  ],
  // ========== JQuery ========== //
  JQuery: [
    {
      title: "开始上手",
      collapsable: true,
      path: `${jQueryPath}/`,
      sidebarDepth: 1,
    },
    {
      title: "JQuery 源码分析",
      path: `${jQueryPath}/jq-book`,
    },
    {
      title: "JQuery 源码注释",
      path: `${jQueryPath}/jq-source`,
    },
    {
      title: "JQuery 源码扩展",
      path: `${jQueryPath}/extend`,
    },
  ],
  // ========== qianKun 微前端框架 ========== //
  qianKun: [
    {
      title: "开始上手",
      collapsable: true,
      path: `${qiankunPath}/`,
      sidebarDepth: 1,
    },
    {
      title: "Core",
      collapsable: false,
      path: `${qiankunPath}/core/`,
      sidebarDepth: 2,
      children: [
        `${qiankunPath}/core/apis`,
        `${qiankunPath}/core/loader`,
        `${qiankunPath}/core/effects`,
      ],
    },
    {
      title: "Sandbox",
      collapsable: false,
      path: `${qiankunPath}/sandbox/`,
      sidebarDepth: 2,
      children: [
        `${qiankunPath}/sandbox/sandbox`,
        `${qiankunPath}/sandbox/proxySandbox`,
        `${qiankunPath}/sandbox/snapshotSandbox`,
      ],
    },
    {
      title: "import-html-entry",
      collapsable: true,
      path: `${qiankunPath}/import-html-entry`,
      sidebarDepth: 1,
    },
  ],
  // ========== snabbdom ========== //
  snabbdom: [
    {
      title: "开始上手",
      collapsable: true,
      path: `${snabbdomPath}/`,
      sidebarDepth: 1,
    },
    {
      title: "Core",
      collapsable: false,
      path: `${snabbdomPath}/core/`,
      sidebarDepth: 2,
      children: [
        `${snabbdomPath}/core/init`,
        `${snabbdomPath}/core/h`,
        `${snabbdomPath}/core/vnode`,
        `${snabbdomPath}/core/jsx`,
        `${snabbdomPath}/core/thunk`,
      ],
    },
  ],
  html2canvas: [
    {
      title: "开始上手",
      collapsable: true,
      path: `${html2canvasPath}/`,
      sidebarDepth: 1,
    },
    {
      title: "Core",
      collapsable: false,
      path: `${html2canvasPath}/core/`,
      sidebarDepth: 2,
      children: [],
    },
  ],
  singleSpa: [
    {
      title: "开始上手",
      collapsable: true,
      path: `${singleSpaPath}/`,
      sidebarDepth: 1,
    },
    {
      title: "applications",
      collapsable: false,
      path: `${singleSpaPath}/app/`,
      sidebarDepth: 2,
      children: [`${singleSpaPath}/app/apps`],
    },
  ],
};

/*****************************************************************************************
 *                                 文档目录路径映射
 ******************************************************************************************/
const registeredSidebars = {
  collapsable: false,
  "/react/": sidebar.react,
  "/vue3/": sidebar.vue3,
  "/algorithm/": sidebar.algorithm,
  "/data-structure/": sidebar.dataStructure,
  "/vite/": sidebar.vite,
  "/am-editor": sidebar.amEditor,
  "/typescript-utility": sidebar.typescriptUtility,
  "/jquery": sidebar.JQuery,
  "/qiankun": sidebar.qianKun,
  "/snabbdom": sidebar.snabbdom,
  "/html2canvas": sidebar.html2canvas,
  "/single-spa": sidebar.singleSpa,
};

/*****************************************************************************************
 *                                 顶部导航配置
 ******************************************************************************************/
const nav = [
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
      {
        text: "React 源码漂流记",
        link: `${reactPath}/tour/`,
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
    text: "数据结构与算法",
    ariaLabel: "数据结构与算法",
    items: [
      {
        text: "数据结构",
        link: `${dataStructurePath}/`,
      },
      {
        text: "算法",
        link: `${algorithmPath}/`,
      },
      {
        text: "设计模式",
        link: "http://docs.jonsam.site/project-5/",
      },
    ],
  },
  {
    text: "更多",
    ariaLabel: "更多内容",
    items: [
      {
        text: "webpack源码",
        link: `${webpackPath}/`,
      },
      {
        text: "am-editor源码",
        link: `${amEditorPath}/`,
      },
      {
        text: "ant-design-vue源码",
        link: `${antdVuePath}/`,
      },
      {
        text: "hls.js源码",
        link: `${hlsPath}/`,
      },
      {
        text: "create-react-app源码",
        link: `${craPath}/`,
      },
      {
        text: "vite源码",
        link: `${vitePath}/`,
      },
      {
        text: "solid.js源码",
        link: `${solidPath}/`,
      },
      {
        text: "svelte源码",
        link: `${sveltePath}/`,
      },
      {
        text: "axios源码",
        link: `${axiosPath}/`,
      },
      {
        text: "express源码",
        link: `${expressPath}/`,
      },
      {
        text: "Typescript Utility",
        link: `${typescriptUtilityPath}/`,
      },
      {
        text: "JQuery 源码",
        link: `${jQueryPath}/`,
      },
      {
        text: "qiankun 源码",
        link: `${qiankunPath}/`,
      },
      {
        text: "snabbdom 源码",
        link: `${snabbdomPath}/`,
      },
      {
        text: "single-spa 源码",
        link: `${singleSpaPath}/`,
      },
    ],
  },
  {
    text: "博客",
    link: "https://www.jonsam.site",
  },
];

module.exports = { sidebar, nav, registeredSidebars };
