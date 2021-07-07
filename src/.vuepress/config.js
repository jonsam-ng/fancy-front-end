const { description } = require("../../package");
// root：custom github domain and donot need base.
const base = "/fe-source-reading/";
// React 源码目录
const reactPath = "/react";

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
      children: [`${reactPath}/scheduler/scheduleCallback`],
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
};

// 顶部导航配置
const nav = [
  // React 源码
  {
    text: "🍇 React 源码",
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
    text: "🍈 Github",
    link: "https://github.com/jonsam-ng/fe-source-reading",
  },
  {
    text: "🍓 博客",
    link: "https://www.jonsam.site",
  },
];

module.exports = {
  /**
   * Ref：https://v1.vuepress.vuejs.org/config/#title
   */
  title: "React 源码阅读笔记",
  // base,
  /**
   * Ref：https://v1.vuepress.vuejs.org/config/#description
   */
  description: "react 16.8.6 源码解析笔记",

  /**
   * Extra tags to be injected to the page HTML `<head>`
   *
   * ref：https://v1.vuepress.vuejs.org/config/#head
   */
  head: [
    ["link", { rel: "manifest", href: "/manifest.json" }],
    ["link", { rel: "icon", href: "/favicon.svg" }],
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
    repo: "",
    editLinks: false,
    docsDir: "",
    editLinkText: "",
    lastUpdated: false,
    logo: "/logo.png",
    nav,
    sidebar: {
      collapsable: false,
      "/react/": sidebar.react,
    },
    head: [
      ["meta", { name: "theme-color", content: "#f08d49" }],
      ["meta", { name: "apple-mobile-web-app-capable", content: "yes" }],
      [
        "meta",
        { name: "apple-mobile-web-app-status-bar-style", content: "black" },
      ],
    ],
  },

  /**
   * Apply plugins，ref：https://v1.vuepress.vuejs.org/zh/plugin/
   */
  plugins: [
    "@vuepress/plugin-back-to-top",
    "@vuepress/plugin-medium-zoom",
    "@vuepress/nprogress",
    "@vuepress/pwa",
    "vuepress-plugin-reading-time",
    "vuepress-plugin-global-toc",
  ],
};
