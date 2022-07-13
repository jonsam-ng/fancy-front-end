// 判断是否绑定时间是否绑定成功
let isMounted = false;

export default {
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
};
