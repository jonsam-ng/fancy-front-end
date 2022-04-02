<template>
  <div class="pdf-wrapper">
    <div class="app-header">
      <template v-if="isLoading">
        努力加载中...
      </template>

      <template v-else>
        <span v-if="showAllPages">共 {{ pageCount }} 页</span>

        <span v-else>
          <button :disabled="page <= 1" @click="page--">❮</button>

          {{ page }} <span>/</span> {{ pageCount }}

          <button :disabled="page >= pageCount" @click="page++">❯</button>

          <input
            @change="onChangePage"
            type="number"
            value="1"
            class="changePage"
          />
        </span>

        <label class="right">
          <input v-model="showAllPages" type="checkbox" />
          <span>显示全部</span>
        </label>
      </template>
    </div>

    <div class="app-content">
      <VuePdfEmbed
        ref="pdfRef"
        :source="src"
        :page="page"
        @password-requested="handlePasswordRequest"
        @rendered="handleDocumentRender"
      />
    </div>
  </div>
</template>

<script>
import VuePdfEmbed from "vue-pdf-embed/dist/vue2-pdf-embed";

export default {
  name: "Pdf",
  components: {
    VuePdfEmbed,
  },
  props: { src: String },
  data() {
    return {
      isLoading: true,
      page: 1,
      pageCount: 1,
      showAllPages: false,
    };
  },
  watch: {
    showAllPages() {
      this.page = this.showAllPages ? null : 1;
    },
  },
  methods: {
    handleDocumentRender() {
      this.isLoading = false;
      this.pageCount = this.$refs.pdfRef.pageCount;
    },
    handlePasswordRequest(callback, retry) {
      callback(prompt(retry ? "请在此输入查看密码" : "请输入查看密码"));
    },
    onChangePage(e) {
      const value = +e.target.value;
      if (
        isNaN(value) ||
        value % 1 !== 0 ||
        value <= 0 ||
        value > this.pageCount
      )
        return;
      this.page = value;
    },
  },
};
</script>

<style>
.pdf-wrapper .vue-pdf-embed > div {
  margin-bottom: 8px;
  box-shadow: 0px 0px 8px 4px rgba(0, 0, 0, 0.1);
}
.light-mode .pdf-wrapper .app-header {
  background-color: rgba(72, 72, 72, 1);
}
.pdf-wrapper .app-header {
  padding: 16px;
  box-shadow: 0 2px 8px 4px rgba(0, 0, 0, 0.1);
  background-color: rgba(72, 72, 72, 0.65);
  color: #fff;
  border-radius: 20px;
}
.pdf-wrapper .app-header button {
  border-radius: 2px;
  outline: none;
  border: none;
  cursor: pointer;
}
.pdf-wrapper .app-header button:disabled {
  cursor: not-allowed;
}
.pdf-wrapper .app-header .changePage {
  outline: none;
  width: 60px;
  margin-left: 12px;
  border-radius: 2px;
  border: none;
  padding-left: 4px;
}
.pdf-wrapper .app-header span {
  margin: 0 2px;
}
.pdf-wrapper .app-content {
  padding: 24px 16px;
}

.pdf-wrapper .right {
  float: right;
  cursor: pointer;
  display: flex;
  align-items: center;
}
.pdf-wrapper .right input {
  border: none;
  outline: none;
  border-radius: 2px;
  cursor: pointer;
  vertical-align: middle;
  margin: 0;
  padding: 0;
  margin-right: 5px;
}
</style>
