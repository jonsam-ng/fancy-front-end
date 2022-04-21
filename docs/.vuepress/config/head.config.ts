/*****************************************************************************************
 *                                 配置head
 ******************************************************************************************/

export default [
  ["link", { rel: "icon", href: `/assets/img/favicon.ico` }],
  ["meta", { name: "referrer", content: "no-referrer-when-downgrade" }],
  ["meta", { name: "apple-mobile-web-app-capable", content: "yes" }],
  ["meta", { name: "apple-mobile-web-app-status-bar-style", content: "black" }],
  // ["link", { rel: "manifest", href: "/manifest.json" }],
  // [
  //   "link",
  //   { rel: "apple-touch-icon", href: "/icons/apple-touch-icon-152x152.png" },
  // ],
  // [
  //   "link",
  //   {
  //     rel: "mask-icon",
  //     href: "/icons/safari-pinned-tab.svg",
  //     color: "#3eaf7c",
  //   },
  // ],
  // [
  //   "meta",
  //   {
  //     name: "msapplication-TileImage",
  //     content: "/icons/msapplication-icon-144x144.png",
  //   },
  // ],
  // ["meta", { name: "msapplication-TileColor", content: "#000000" }],
  [
    "meta",
    {
      name: "keywords",
      content: "前端源码,React源码,Vue源码,Vu3源码,Webpack源码",
    },
  ],
  // ["meta", { name: "baidu-site-verification", content: "7F55weZDDc" }], // 百度统计的站长验证（你可以去掉）
  ["meta", { name: "theme-color", content: "#3CB982" }], // 移动浏览器主题颜色
  [
    "link",
    {
      rel: "stylesheet",
      href: "//at.alicdn.com/t/font_3314748_9xij1pv3h4i.css",
    },
  ],

  // [
  //   'script',
  //   {
  //     'data-ad-client': 'ca-pub-7828333725993554',
  //     async: 'async',
  //     src: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js',
  //   },
  // ], // 网站关联Google AdSense 与 html格式广告支持（你可以去掉）
];
