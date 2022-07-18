<template>
  <div :class="classes">
    <p v-if="!!title" class="title">{{ title }}</p>
    <slot />
  </div>
</template>

<script>
export default {
  props: {
    type: { type: String, default: "info" },
    title: { type: String, default: "" },
  },
  data() {
    return {
      classes: `alert alert-` + this.type,
    };
  },
};
</script>

<style scoped>
.alert {
  margin: 16px 0;
  border: 1px solid transparent;
  border-radius: 8px;
  padding: 16px;
  line-height: 24px;
  font-size: 14px;
}
.alert.alert-info {
  border-color: rgba(60, 60, 60, 0.12);
  color: rgba(60, 60, 60, 0.7);
  background-color: #f9f9f9;
}
.alert .title {
  margin: 0;
  font-weight: 700;
}
.alert.alert-tip {
  border-color: rgba(66, 184, 131, 0.5);
  color: #155f3e;
  background-color: rgba(66, 184, 131, 0.05);
}
.alert.alert-warning,
.alert.alert-warn {
  border-color: rgba(255, 197, 23, 0.5);
  color: #ad850e;
  background-color: rgba(255, 197, 23, 0.05);
}
.alert.alert-danger,
.alert.alert-error {
  border-color: rgba(237, 60, 80, 0.5);
  color: #ab2131;
  background-color: rgba(237, 60, 80, 0.05);
}
</style>
