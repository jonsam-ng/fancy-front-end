const { description } = require("../../package");
// root：custom github domain and donot need base.
const base = "/fe-source-reading/";
// React 源码目录
const reactPath = "/react";
const vue3Path = "/vue3";

// 侧边栏配置
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
      children: [],
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
      children: [`${reactPath}/hooks/useState`, `${reactPath}/hooks/useEffect`],
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
        `${vue3Path}/reactivity/effect`,
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

module.exports = {
  /**
   * Ref：https://v1.vuepress.vuejs.org/config/#title
   */
  title: "FE Source Stack",
  // base,
  /**
   * Ref：https://v1.vuepress.vuejs.org/config/#description
   */
  description: "源码阅读：react、vue3、webpack...",

  /**
   * Extra tags to be injected to the page HTML `<head>`
   *
   * ref：https://v1.vuepress.vuejs.org/config/#head
   */
  head: [
    ["link", { rel: "manifest", href: "/manifest.json" }],
    ["link", { rel: "icon", href: "/logo.png" }],
    ["meta", { name: "theme-color", content: "#3eaf7c" }],
    ["meta", { name: "apple-mobile-web-app-capable", content: "yes" }],
    [
      "meta",
      { name: "apple-mobile-web-app-status-bar-style", content: "black" },
    ],
  ],

  /**
   * Theme configuration, here is the default theme configuration for VuePress.
   *
   * ref：https://v1.vuepress.vuejs.org/theme/default-theme-config.html
   */
  themeConfig: {
    repo: "https://github.com/jonsam-ng/fe-source-reading",
    repoLabel: "Github",
    docsDir: "src",
    docsBranch: "master",
    editLinks: true,
    editLinkText: "编辑页面",
    lastUpdated: "上次更新",
    darkMode: true,
    logo: "/logo.png",
    smoothScroll: true,
    nav,
    sidebarDepth: 2,
    sidebar: {
      collapsable: false,
      "/react/": sidebar.react,
      "/vue3/": sidebar.vue3,
    },
  },

  /**
   * Apply plugins，ref：https://v1.vuepress.vuejs.org/zh/plugin/
   */
  plugins: {
    "@vuepress/back-to-top": true,
    "@vuepress/nprogress": true,
    "@vuepress/pwa": true,
    "vuepress-plugin-reading-time": true,
    "vuepress-plugin-global-toc": true,
    "@vuepress/last-updated": true,
    "@vuepress/medium-zoom": {
      selector: "img[data-zoomable]",
    },
  },
  markdown: {
    lineNumbers: true,
  },
};
