<template>
  <ClientOnly>
    <p class="article-state">
      词量: <span>{{ $page.readingTime.words }}</span
      >&nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;阅读时长:
      <span>{{ Math.ceil($page.readingTime.minutes) }}分钟</span>
    </p>
  </ClientOnly>
</template>

<script>
export default {
  name: "TimeToRead",
};
</script>

<style scoped>
p.article-state {
  font-size: 12px;
  border-left: 10px solid #44aaab;
  padding-left: 10px;
  margin: 0.5rem 0 !important;
}
p.article-state span {
  font-size: 14px;
  color: #2c3e50;
  font-weight: 600;
}
</style>
