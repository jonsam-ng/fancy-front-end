<template>
  <div class="player-container">
    <vue-core-video-player
      :src="src"
      :muted="muted"
      :cover="cover"
      :volume="volume"
      :preload="preload"
      :loop="loop"
      :logo="logo"
      :title="title"
      :controls="controls"
      :autoplay="autoplay"
      :lang="lang"
    />
  </div>
</template>

<script>
export default {
  name: "VideoPlayer",
  props: {
    src: {
      type: [String, Array], // 视频链接
      require: true, // 必要
    },
    muted: {
      type: Boolean,
      default: false, // 设置为 true, 视频会静音
    },
    cover: {
      type: String, // 显示视频的封面，如果设置 autoplay，自动播放成功后，不会显示
    },
    volume: {
      type: Number, // 控制视频音量(0-1)
      default: 0.5,
    },
    preload: {
      validator: function (value) {
        return ["none", "metadata", "auto "].indexOf(value) !== -1; // 'none' 表示不会预加载视频, 'metadata' 表示只加载视频 metadata 信息部分
      },
      default: "metadata",
    },
    loop: {
      type: Boolean, // 会循环播放当前视频
      default: false,
    },
    logo: {
      type: String, // 显示播放器的 logo
    },
    title: {
      type: String, // 展示视频的标题，方便 SEO
    },
    controls: {
      type: [Boolean, String], // 可以用来控制底部控制栏的显示隐藏
      // String: 'fixed' 表示底部导航栏会一直固定显示, 'auto' 表示底部导航栏在用户未产生任何交互操作后自动消失，默认的形式
      // Boolean: false 表示始终不显示导航栏, true 默认值；它和设置 'auto' 形式类似
      validator: function (value) {
        return ["fixed", "auto", false, true].indexOf(value) !== -1;
      },
      default: "auto",
    },
    autoplay: {
      type: Boolean,
      default: false,
    },
    lang: { type: String, default: "zh-CN" },
  },
};
</script>

<style></style>
