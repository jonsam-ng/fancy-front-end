<template>
  <div
    class="absolute right-0 bottom-0 top-0 left-0 bg"
    style="z-index: -999"
  />
</template>

<script>
export default {
  data() {
    return {};
  },
};
</script>

<style>
.html .bg {
  position: relative;
  z-index: -999;
}
html:not(.dark) .bg:before,
html.dark .bg:before {
  content: " ";
  display: block;
  position: absolute;
  left: 0px;
  top: 0px;
  width: 100%;
  height: 100%;
  opacity: 0.6;
  background-repeat: no-repeat;
  background-position: 50%;
  background-size: cover;
  z-index: -999;
}
html:not(.dark) .bg:before {
  /* 亮色模式 css 样式 */
  background-image: url(https://cdn.staticaly.com/gh/jonsam-ng/image-hosting@master/20220718/image.66x85kqvamc0.png);
  opacity: 0.9;
}
html.dark .bg:before {
  /* 暗色模式 css 样式 */
  background-image: url(https://cdn.staticaly.com/gh/jonsam-ng/image-hosting@master/20220719/image.p0gwnsncmc0.png);
  opacity: 0.2;
}
/* global styles */
h1,
h2,
h3,
h4,
h5,
h6 {
  display: inline-block;
}
</style>
