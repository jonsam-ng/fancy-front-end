// import vue from 'vue/dist/vue.esm.browser'
import {
  removeElement,
  addPageWordsCount,
  addReadTimeCount,
  addPageView,
  getPageViewCouter,
} from "./plugins/siteInfo";
import LastReadingPopup from "./components/LastReadingPopup.vue";

export default ({
  Vue, // VuePress 正在使用的 Vue 构造函数
  options, // 附加到根实例的一些选项
  router, // 当前应用的路由实例
  siteData, // 站点元数据
  isServer, // 当前应用配置是处于 服务端渲染 或 客户端
}) => {
  // window.Vue = vue // 使页面中可以使用Vue构造函数 （使页面中的vue demo生效）
  /**
   * 站点和文章页信息模块
   */
  // if (!isServer) {
  //   router.beforeEach((to, from, next) => {
  //     next();
  //     if (
  //       to.path !== "/" &&
  //       to.path !== from.path &&
  //       siteData.themeConfig.blogInfo
  //     ) {
  //       // 如果页面是非首页，# 号也会触发路由变化，这里已经排除掉
  //       // 刷新页面或进入新的页面后，如果原来位置的内容还存在，则删除掉，最后重新插入渲染
  //       removeElement(".page-view-js");
  //       removeElement(".page-view");
  //       removeElement(".book-words");
  //       removeElement(".reading-time");
  //       siteData.pages.forEach((itemPage) => {
  //         if (itemPage.path == to.path) {
  //           if (
  //             itemPage.frontmatter.article == undefined ||
  //             itemPage.frontmatter.article
  //           ) {
  //             // 排除掉 article 为 false 的文章
  //             const { eachFileWords, pageView, pageIteration, readingTime } =
  //               siteData.themeConfig.blogInfo;
  //             // 下面两个 if 可以调换位置，从而让文章的浏览量和字数内容交换
  //             if (eachFileWords) {
  //               eachFileWords.forEach((itemFile) => {
  //                 if (itemFile.permalink == itemPage.frontmatter.permalink) {
  //                   addPageWordsCount(itemFile.wordsCount);
  //                   if (readingTime || readingTime == undefined) {
  //                     addReadTimeCount(itemFile.readingTime);
  //                   }
  //                 }
  //               });
  //             }
  //             if (pageView || pageView == undefined) {
  //               addPageView();
  //               // 挂载成功需要一点时间
  //               setTimeout(() => {
  //                 getPageViewCouter(pageIteration);
  //               }, 1500);
  //             }

  //             return;
  //           }
  //         }
  //       });
  //     }
  //   });
  // }

  // 判断是否绑定时间是否绑定成功
  let isMounted = false;
  // 最后一次阅读位置跳转
  Vue.component(LastReadingPopup.name, LastReadingPopup);
  Vue.mixin({
    // 有多少个 Vue 组件（md 文档），就执行多少次 mounted()，所以利用 if 判断只允许执行一次
    mounted() {
      if (!isMounted) {
        window.addEventListener("unload", this.saveLastReading); // 卸载窗口前，将数据存储，方便下次可以直接跳转位置
        isMounted = true;
      }
    },
    methods: {
      saveLastReading() {
        localStorage.setItem(
          "lastReading",
          JSON.stringify({
            path: this.$route.path,
            scrollTop: document.documentElement.scrollTop,
            timestamp: new Date().getTime(),
          })
        );
      },
    },
  });
};
