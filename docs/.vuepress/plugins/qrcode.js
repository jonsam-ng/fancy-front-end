import QrCode from "../components/QrCode.vue";
import Vue from "vue";

// 判断是否绑定时间是否绑定成功
let isMounted = false;

export default {
  data() {
    return {
      qr: null,
    };
  },
  updated() {
    if (!isMounted || !this.qr) return;
    // Execute after waiting for dom to load
    const navLink = document.querySelector(".nav-links");
    const qrcodeBtn = document.querySelector(".qrcodeBtn");
    if (navLink != null && qrcodeBtn == null) {
      this.$nextTick(() => {
        const navItem = document.createElement("DIV");
        navItem.className += "nav-item";
        navItem.appendChild(this.qr.$el);
        navLink.appendChild(navItem);
      });
    }
  },
  mounted() {
    if (this.qr || isMounted) return;
    isMounted = true;
    // Create qrcode component
    const C = Vue.extend(QrCode);
    const qr = new C();
    qr.$mount();
    this.qr = qr;
  },
};
