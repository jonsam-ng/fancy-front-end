const { sidebar, nav } = require("./sidebar.config");
const { description } = require("../../package");
// root：custom github domain and donot need base.
const base = "/fe-source-reading/";

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
