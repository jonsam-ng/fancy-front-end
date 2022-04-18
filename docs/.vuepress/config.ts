import { resolve } from "path";
import { defineConfig4CustomTheme } from "vuepress/config";
import { VdoingThemeConfig } from "vuepress-theme-vdoing/types";
import htmlModules from "./config/htmlModules"; // 自定义插入的html块
import plugins from "./config/plugin.config";
import nav from "./config/nav.config";
import social from "./config/social.config";
import head from "./config/head.config";

const base = "/fancy-front-end";
const siteName = "Fancy FE";

export default defineConfig4CustomTheme<VdoingThemeConfig>({
  theme: "vdoing",
  locales: {
    "/": {
      lang: "zh-CN",
      title: siteName,
      description: "前端源码阅读栈，精读 React、Vue3 源码",
    },
  },
  themeConfig: {
    nav,
    sidebarDepth: 1,
    logo: `/assets/img/logo.png`,
    repo: "jonsam-ng/fe-source-reading",
    searchMaxSuggestions: 10,
    lastUpdated: "上次更新",
    docsDir: "docs",
    editLinks: true,
    editLinkText: "编辑",

    //*** 以下是Vdoing主题相关配置，文档：https://doc.xugaoyi.com/pages/a20ce8/ ***//
    category: true,
    tag: true,
    archive: true,
    categoryText: "随笔", // 碎片化文章（_posts文件夹的文章）预设生成的分类值，默认'随笔'
    // bodyBgImg: [], // body背景大图，默认无。 单张图片 String | 多张图片 Array, 多张图片时每隔15秒换一张。
    // bodyBgImgOpacity: 0.5, // body背景图透明度，选值 0.1~ 1.0, 默认0.5
    titleBadge: true,
    // titleBadgeIcons: [ // 文章标题前图标的地址，默认主题内置图标
    //   '图标地址1',
    //   '图标地址2'
    // ],
    contentBgStyle: 6, // 文章内容块的背景风格，默认无. 1 方格 | 2 横线 | 3 竖线 | 4 左斜线 | 5 右斜线 | 6 点状
    // 最近更新栏
    updateBar: {
      showToArticle: true, // 显示到文章页底部，默认true
      moreArticle: "/archives", // “更多文章”跳转的页面，默认'/archives'
    },
    rightMenuBar: true, // 是否显示右侧文章大纲栏，默认true (屏宽小于1300px下无论如何都不显示)
    sidebarOpen: true, // 初始状态是否打开左侧边栏，默认true
    pageButton: true, // 是否显示快捷翻页按钮，默认true

    // 侧边栏  'structuring' | { mode: 'structuring', collapsable: Boolean} | 'auto' | <自定义>    温馨提示：目录页数据依赖于结构化的侧边栏数据，如果你不设置为'structuring',将无法使用目录页
    sidebar: "structuring",

    // 文章默认的作者信息，(可在md文件中单独配置此信息) string | {name: string, link?: string}
    author: {
      name: "jonsam", // 必需
      link: "https://github.com/jonsam-ng", // 可选的
    },
    // 博主信息 (显示在首页侧边栏)
    blogger: {
      avatar:
        "https://www.jonsam.site/wp-content/uploads/2019/10/c1fbc401c64937aaec6cb53359e7c57eabd8e477-e1570649725791.gif",
      name: "Jonsam NG",
      slogan: "让有意义的事变得有意思，让有意思的事变得有意义",
    },
    social,
    footer: {
      createYear: 2022,
      copyrightInfo: `${siteName} | Made by <a href="https://www.jonsam.site" target="_blank">Jonsam</a> by ❤`,
    },
    // 自定义html(广告)模块
    htmlModules,
  },
  head,
  plugins,
  markdown: {
    lineNumbers: true,
    extractHeaders: ["h2", "h3", "h4", "h5", "h6"], // 提取标题到侧边栏的级别，默认['h2', 'h3']
  },
  // 监听文件变化并重新构建
  extraWatchFiles: [".vuepress/config.ts", ".vuepress/config/htmlModules.ts"],
  configureWebpack: {
    node: {
      global: true,
      process: true,
      self: true,
    },
  },
});
