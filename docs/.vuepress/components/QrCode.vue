<template>
  <div class="qrcodeBtn" @mousedown.stop="showQrCode" title="手机查看">
    <svg
      t="1652063987836"
      viewBox="0 0 1024 1024"
      xmlns="http://www.w3.org/2000/svg"
      p-id="2096"
      width="16"
      height="16"
    >
      <path
        d="M891.01653333 648.53333333V530.0224h-180.224v60.07466667h120.14933334V648.53333333z m-59.52853333 59.52853334v-58.9824h-60.6208v60.07466666h60.07466667v120.69546667h-57.89013334V771.41333333h-62.2592V649.6256h-60.07466666v60.07466667H591.18933333v-59.52853334h-60.6208v60.07466667h60.07466667v59.52853333h-60.07466667v120.14933334h60.07466667v-120.14933334h60.07466667v119.6032h60.07466666V831.488h61.71306667v58.43626667h118.51093333V708.06186667z m-180.77013333-58.9824V530.56853333l-120.14933334-0.54613333v60.07466667h60.07466667v58.9824zM132.98346667 133.5296v361.54026667h360.448V133.5296h-360.448z m226.64533333 226.64533333h-92.84266667v-92.84266666h92.84266667v92.84266666z m-226.64533333 169.84746667v359.90186667h360.448V530.0224h-360.448z m226.64533333 226.0992h-92.84266667v-92.84266667h92.84266667v92.84266667z m170.93973333-622.592v360.448h360.448v-360.448h-360.448z m229.92213334 226.64533333h-92.84266667v-92.84266666h92.84266667v92.84266666z"
        fill="#2C2C2C"
        p-id="2097"
      ></path>
    </svg>
    <qrcode-vue
      id="qrcodeContainer"
      v-if="show"
      ref="qrcodeContainer"
      :value="qrcodeText"
      :size="qrSize"
      level="H"
    />
  </div>
</template>

<script>
import QrcodeVue from "qrcode.vue";

function isRealNum(val) {
  if (val == null || val.toString().replace(/\s/g, "") === "") {
    return false;
  }

  if (typeof val == "") {
    return false;
    boolean;
  }

  if (!isNaN(val)) {
    return true;
  } else {
    return false;
  }
}

export default {
  components: {
    QrcodeVue,
  },
  data() {
    return {
      show: false, //show or hide
      qrcodeText: "", // url
      qrSize: 100, //square size
      channelQR: "",
    };
  },
  props: {
    size: {
      type: [String, Number],
      default: "small",
    },
    channel: {
      type: Boolean,
      default: false,
    },
  },
  mounted() {
    // tranform size
    let newV = this.size;

    let realSize = "";
    switch (newV) {
      case "small":
        realSize = 100;
        break;
      case "medium":
        realSize = 150;
        break;
      case "big":
        realSize = 200;
        break;
      default:
        if (isRealNum(newV)) {
          const min = Math.min(window.innerHeight, window.innerWidth);
          newV = ~~newV;
          if (newV < 10) {
            realSize = 10;
          } else if (newV > min) {
            realSize = min;
          } else {
            realSize = newV;
          }
        } else {
          realSize = 100;
        }
        break;
    }
    this.qrSize = realSize;

    // handle channel
    if (this.channel) {
      this.channelQR =
        location.href.indexOf("?") > -1 ? "&channel=qrcode" : "?channel=qrcode";
    }

    document.documentElement.addEventListener("mousedown", () => {
      this.show = false;
    });
  },
  methods: {
    showQrCode() {
      this.show = !this.show;

      if (this.show) {
        this.$nextTick(() => {
          this.qrcodeText = location.href + this.channelQR;
        });
      }
    },
  },
};
</script>

<style lang="stylus">
.qrcodeBtn {
  position: relative;
  user-select: none;
  svg {
    vertical-align: middle;
  }

  &:hover {
    color: $accentColor;
    cursor: pointer;
  }

  #qrcodeContainer {
    position: absolute;
    right: 0;
    top: 50px;
  }
}
</style>
