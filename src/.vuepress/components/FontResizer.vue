<template>
  <div class="container">
    <i @click="change(-1)">➖</i><i @click="change(1)">➕</i>
  </div>
</template>

<script>
export default {
  name: "FontResizer",
  methods: {
    change(amount) {
      const html = document.querySelector("html");
      const prev = parseInt(getComputedStyle(html)?.fontSize);
      html.style.fontSize = prev + amount + "px";
    },
  },
};
</script>

<style scoped>
div.container {
  margin: 0 0 0 20px;
}
i {
  padding: 0 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bolder;
  font-style: normal;
}
</style>
