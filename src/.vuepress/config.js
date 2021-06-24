const { description } = require("../../package");
// root 
const base = '/fe-source-reading/';
// React 源码目录
const reactPath = '/react';

const sidebar = {
  react: [
      {
        title: "开始上手",
        collapsable: false,
        path: `${reactPath}/`,
      },
      {
        title: "任务调度",
        collapsable: false,
        path: `${reactPath}/schedule/`,
        sidebarDepth: 1,
        children: [`${reactPath}/schedule/scheduleWork`],
      },
      {
        title: "创建更新",
        collapsable: false,
        path: `${reactPath}/render/`,
        sidebarDepth: 1,
        children: [`${reactPath}/render/ReactDOM.render`],
      },
      {
        title: "hooks 原理",
        collapsable: false,
        path: `${reactPath}/hooks/`,
        sidebarDepth: 1,
        children: [`${reactPath}/hooks/useState`, `${reactPath}/hooks/useEffect`],
      },
    ]
}

module.exports = {
  /**
   * Ref：https://v1.vuepress.vuejs.org/config/#title
   */
  title: "React 源码阅读笔记",
  base,
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
    logo: '/logo.png',
    nav: [
      {
        text: "React 源码",
        ariaLabel: 'React 源码菜单',
        items: [
          {
            text: '任务调度',
            link: `${reactPath}/schedule/`,
          },
          {
            text: '创建更新',
            link: `${reactPath}/render/`,
          },
          {
            text: 'hooks 原理',
            link: `${reactPath}/hooks/`,
          }
        ]
      },
      {
        text: "Github",
        link: "https://github.com/jonsam-ng/react-source-reading",
      },
    ],
    sidebar: {
       collapsable: false,
      '/react/': sidebar.react,
    },
    head: [
        ['meta', { name: 'theme-color', content: '#f08d49' }],
        ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
        ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black' }],
    ]
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
