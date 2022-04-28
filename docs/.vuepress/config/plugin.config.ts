import { UserPlugins } from "vuepress/config";
import baiduCode from "./baiduCode"; // 百度统计hm码
import dayjs from "dayjs";

/*****************************************************************************************
 *                                 配置插件
 ******************************************************************************************/

export default <UserPlugins>[
	"vuepress-plugin-baidu-autopush", // 百度自动推送
	[
		"@vuepress/plugin-pwa",
		{
			serviceWorker: true,
			updatePopup: true,
		},
	],
	"vuepress-plugin-reading-time",
	[
		"vuepress-plugin-baidu-tongji", // 百度统计
		{ hm: baiduCode },
	],
	// 全文搜索。 ⚠️注意：此插件会在打开网站时多加载部分js文件用于搜索，导致初次访问网站变慢。如在意初次访问速度的话可以不使用此插件！（推荐：vuepress-plugin-thirdparty-search）
	"fulltext-search",
	// 可以添加第三方搜索链接的搜索框（继承原官方搜索框的配置参数）
	// 'thirdparty-search': {
	//   thirdparty: [
	//     {
	//       title: '在MDN中搜索',
	//       frontUrl: 'https://developer.mozilla.org/zh-CN/search?q=', // 搜索链接的前面部分
	//       behindUrl: '', // 搜索链接的后面部分，可选，默认 ''
	//     },
	//     {
	//       title: '在Runoob中搜索',
	//       frontUrl: 'https://www.runoob.com/?s=',
	//     },
	//     {
	//       title: '在Vue API中搜索',
	//       frontUrl: 'https://cn.vuejs.org/v2/api/#',
	//     },
	//     {
	//       title: '在Bing中搜索',
	//       frontUrl: 'https://cn.bing.com/search?q=',
	//     },
	//     {
	//       title: '通过百度搜索本站的',
	//       frontUrl: 'https://www.baidu.com/s?wd=site%3Axugaoyi.com%20',
	//     },
	//   ],
	// },
	[
		"one-click-copy", // 代码块复制按钮
		{
			copySelector: [
				'div[class*="language-"] pre',
				'div[class*="aside-code"] aside',
			], // String or Array
			copyMessage: "复制成功", // default is 'Copy successfully and then paste it for use.'
			duration: 1000, // prompt message display time.
			showInMobile: false, // whether to display on the mobile side, default: false.
		},
	],
	[
		"demo-block", // demo演示模块 https://github.com/xiguaxigua/vuepress-plugin-demo-block
		{
			settings: {
				// jsLib: ['http://xxx'], // 在线示例(jsfiddle, codepen)中的js依赖
				// cssLib: ['http://xxx'], // 在线示例中的css依赖
				// vue: 'https://cdn.jsdelivr.net/npm/vue/dist/vue.min.js', // 在线示例中的vue依赖
				jsfiddle: false, // 是否显示 jsfiddle 链接
				codepen: true, // 是否显示 codepen 链接
				horizontal: false, // 是否展示为横向样式
			},
		},
	],
	[
		"vuepress-plugin-zooming", // 放大图片
		{
			selector: ".theme-vdoing-content img:not(.no-zoom)", // 排除class是no-zoom的图片
			options: {
				bgColor: "rgba(0,0,0,0.6)",
			},
		},
	],
	[
		"vuepress-plugin-comment", // 评论
		{
			choosen: "gitalk",
			options: {
				clientID: "d3180fd85e7addd9c036",
				clientSecret: "933c6df009c1d8264e247ce9c1a68687dff0b5f6",
				repo: "fancy-front-end", // GitHub 仓库
				owner: "jonsam-ng", // GitHub仓库所有者
				admin: ["jonsam-ng"], // 对仓库有写权限的人
				// distractionFreeMode: true,
				pagerDirection: "last", // 'first'正序 | 'last'倒序
				id: "<%- (frontmatter.permalink || frontmatter.to.path).slice(-16) %>", //  页面的唯一标识,长度不能超过50
				title: "「评论」<%- frontmatter.title %>", // GitHub issue 的标题
				labels: ["Gitalk", "Comment"], // GitHub issue 的标签
				body: "页面：<%- window.location.origin + (frontmatter.to.path || window.location.pathname) %>", // GitHub issue 的内容
			},
		},
	],
	[
		"@vuepress/last-updated", // "上次更新"时间格式
		{
			transformer: (timestamp, lang) => {
				return dayjs(timestamp).format("YYYY/MM/DD, HH:mm:ss");
			},
		},
	],
	["@renovamen/vuepress-plugin-katex", { strict: false }],
	{
		name: "custom-plugins",
		globalUIComponents: ["LastReadingPopup", "GlobalTip", "BlockToggle"], // 2.x 版本 globalUIComponents 改名为 clientAppRootComponentFiles
	},
];
