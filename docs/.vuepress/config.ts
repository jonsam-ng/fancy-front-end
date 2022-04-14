import { resolve } from "path";
import { defineConfig4CustomTheme } from "vuepress/config";
import { VdoingThemeConfig } from "vuepress-theme-vdoing/types";
import htmlModules from "./config/htmlModules"; // 自定义插入的html块
import plugins from "./config/plugin.config";
import nav from "./config/nav.config";
import social from "./config/social.config";
import head from "./config/head.config";
import {
  readFileList,
  readTotalFileWords,
  readEachFileWords,
} from "./webSiteInfo/readFile";

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
  // base: `${base}/`,
  themeConfig: {
    nav,
    sidebarDepth: 1,
    logo: `assets/img/logo.png`,
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
  // 站点配置（首页 & 文章页）
  // blogInfo: {
  //   blogCreate: "2022-4-9", // 博客创建时间
  //   indexView: true, // 开启首页的访问量和排名统计，默认 true（开启）
  //   pageView: true, // 开启文章页的浏览量统计，默认 true（开启）
  //   readingTime: true, // 开启文章页的预计阅读时间，条件：开启 eachFileWords，默认 true（开启）。可在 eachFileWords 的 readEachFileWords 的第二个和第三个参数自定义，默认 1 分钟 300 中文、160 英文
  //   eachFileWords: readEachFileWords([""], 300, 160), // 开启每个文章页的字数。readEachFileWords(['xx']) 关闭 xx 目录（可多个，可不传参数）下的文章页字数和阅读时长，后面两个参数分别是 1 分钟里能阅读的中文字数和英文字数。无默认值。readEachFileWords() 方法默认排除了 article 为 false 的文章
  //   mdFileCountType: "archives", // 开启文档数。1. archives 获取归档的文档数（默认）。2. 数组 readFileList(['xx']) 排除 xx 目录（可多个，可不传参数），获取其他目录的文档数。提示：readFileList() 获取 docs 下所有的 md 文档（除了 `.vuepress` 和 `@pages` 目录下的文档）
  //   totalWords: "archives", // 开启本站文档总字数。1. archives 获取归档的文档数（使用 archives 条件：传入 eachFileWords，否则报错）。2. readTotalFileWords(['xx']) 排除 xx 目录（可多个，可不传参数），获取其他目录的文章字数。无默认值
  //   moutedEvent: ".tags-wrapper", // 首页的站点模块挂载在某个元素后面（支持多种选择器），指的是挂载在哪个兄弟元素的后面，默认是热门标签 '.tags-wrapper' 下面，提示：'.categories-wrapper' 会挂载在文章分类下面。'.blogger-wrapper' 会挂载在博客头像模块下面
  //   // 下面两个选项：第一次获取访问量失败后的迭代时间
  //   indexIteration: 2500, // 如果首页获取访问量失败，则每隔多少时间后获取一次访问量，直到获取成功或获取 10 次后。默认 3 秒。注意：设置时间太低，可能导致访问量 + 2、+ 3 ......
  //   pageIteration: 2500, // 如果文章页获取访问量失败，则每隔多少时间后获取一次访问量，直到获取成功或获取 10 次后。默认 3 秒。注意：设置时间太低，可能导致访问量 + 2、+ 3 ......
  //   // 说明：成功获取一次访问量，访问量 + 1，所以第一次获取失败后，设置的每个隔段重新获取时间，将会影响访问量的次数。如 100 可能每次获取访问量 + 3
  // },
});
