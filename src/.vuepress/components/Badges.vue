<!--
 * @Description: Some description
 * @Version: 1.0
 * @Author: jonsam
 * @Date: 2021-07-30 00:19:39
 * @LastEditors: jonsam
 * @LastEditTime: 2021-08-03 22:47:53
-->
<template>
  <div class="badge-group">
    <span class="group-tag">标签：</span>
    <Badge
      :text="item.text"
      :type="item.type"
      v-for="item in content"
      :key="item.text"
    />
  </div>
</template>

<script>
export default {
  name: "Badges",
  props: ["content"],
};
</script>

<style scoped>
.badge-group {
  margin-top: 10px;
  font-size: 10px;
  border-left: 10px solid #44aaab;
  padding-left: 10px;
}
.badge-group >>> span {
  font-size: 10px;
}
.group-tag {
  line-height: 18px;
}
</style>
