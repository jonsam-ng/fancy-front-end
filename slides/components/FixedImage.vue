<template>
  <img v-if="!!src" :src="src" class="absolute" :style="styles" />
</template>

<script>
export default {
  name: "FixedImage",
  props: {
    src: {
      type: String,
      default: "",
    },
    l: { type: String, default: "initial" },
    r: { type: String, default: "initial" },
    t: { type: String, default: "initial" },
    b: { type: String, default: "initial" },
    w: { type: String, default: "auto" },
    o: { type: Number, default: 0.6 },
  },
  data() {
    return {
      styles: `z-index: -1; opacity: ${this.o}; left: ${this.l}; right: ${this.r}; top: ${this.t}; bottom: ${this.b}; width: ${this.w}`,
    };
  },
};
</script>
