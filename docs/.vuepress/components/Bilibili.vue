<template>
  <div class="biliPlayer">
    <iframe
      ref="sbplayer"
      :style="{ width }"
      :src="src"
      :allowfullscreen="afs"
      scrolling="no"
      frameborder="0"
      :sandbox="sandbox"
      class="player"
    ></iframe>
  </div>
</template>

<script>
import bvidUtil from "../../../utils/bvid";
export default {
  name: "Bilibili",
  data() {
    return {
      afs: [true, "true", "allowfullscreen"].includes(this.allowfullscreen)
        ? true
        : false,
    };
  },
  props: {
    // support avid and bvid
    id: {
      type: String,
      required: true,
    },
    danmaku: {
      type: Boolean,
      default: false,
      required: false,
    },
    page: {
      type: Number,
      default: 1,
      required: false,
    },
    sandbox: {
      type: String,
      default:
        "allow-top-navigation allow-same-origin allow-forms allow-scripts allow-popups",
      required: false,
    },
    allowfullscreen: {
      type: [String, Boolean],
      required: false,
      default: "allowfullscreen",
    },
    width: {
      type: String,
      required: false,
      default: "100%",
    },
    height: {
      type: Array,
      required: false,
      default: () => [9 / 16, 70],
    },
  },
  computed: {
    bvid() {
      if (!this.id || this.id.toLowerCase().startsWith("bv")) return this.id;
      const avid = this.id.toLowerCase().startsWith("av")
        ? this.id.slice(2)
        : this.id;
      return bvidUtil.av2bv(avid);
    },
    avid() {
      return bvidUtil.bv2av(this.bvid);
    },
    src() {
      return `//player.bilibili.com/player.html?bvid=${this.bvid}&page=${this.page}&danmaku=${this.danmaku}`;
    },
  },
  mounted() {
    this.$nextTick(() => {
      let sbplayer = this.$refs.sbplayer;
      if (!sbplayer) return;
      sbplayer.style.height = `${
        sbplayer.scrollWidth * this.height[0] + this.height[1]
      }px`;
    });
  },
};
</script>

<style scoped>
.biliPlayer {
  width: 100%;
}
.biliPlayer .player {
  width: 100%;
}
</style>
