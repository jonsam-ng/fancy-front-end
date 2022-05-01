<template>
	<ClientOnly>
		<div class="pdf-wrapper">
			<div class="app-header">
				<div v-if="isLoading">努力加载中...</div>

				<div v-else>
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
					<div class="right">
						<button @click="onDownload" title="下载">
							<svg
								class="icon"
								viewBox="0 0 1024 1024"
								version="1.1"
								xmlns="http://www.w3.org/2000/svg"
								p-id="4231"
								width="16"
								height="16"
							>
								<path
									d="M709.487 501.104c-4.393-10.667-14.831-17.628-26.355-17.628H340.866c-11.524 0-21.962 6.959-26.355 17.628-4.45 10.61-1.997 22.932 6.161 31.089l171.133 171.133c5.59 5.533 12.892 8.328 20.193 8.328s14.603-2.796 20.193-8.328l171.133-171.133c8.101-8.157 10.553-20.48 6.161-31.089zM512 141.211c-31.489 0-57.044 25.499-57.044 57.044v285.222c0 31.546 25.556 57.044 57.044 57.044 31.546 0 57.044-25.499 57.044-57.044V198.255c0-31.546-25.499-57.044-57.044-57.044z m313.744 627.49H198.255c-31.489 0-57.044 25.499-57.044 57.045s25.556 57.044 57.044 57.044h627.489c31.546 0 57.044-25.499 57.044-57.044s-25.499-57.045-57.044-57.045z"
									p-id="4232"
									fill="#ffffff"
								></path>
							</svg>
						</button>
						<button @click="onOpenInNewTab" title="查看">
							<svg
								class="icon"
								viewBox="0 0 1024 1024"
								version="1.1"
								xmlns="http://www.w3.org/2000/svg"
								p-id="6542"
								width="16"
								height="16"
							>
								<path
									d="M518.537 778.457c-134.736 0-271.484-65.861-417.786-198.082-5.028-4.525-10.054-8.548-14.077-12.066-17.093-14.58-28.155-24.634-28.657-41.729-0.502-17.093 10.054-27.651 26.142-44.24 3.518-3.518 7.54-7.54 12.066-12.066 0 0 0 0 0 0 138.758-144.289 273.495-215.177 412.756-217.187 137.753-2.011 273.495 64.353 414.768 202.608 25.639 25.139 39.214 42.733 39.214 63.849 0 22.624-17.093 39.214-33.182 54.799-140.268 136.244-274.501 204.116-411.25 204.116zM112.817 524.567c2.011 2.011 4.525 4.022 6.537 6.032 4.022 3.518 9.05 8.043 14.58 12.567 135.744 122.167 258.916 182.999 376.559 185.012 124.178 2.513 249.869-59.826 384.1-189.538 4.525-4.525 15.584-15.084 18.098-19.607-1.508-3.018-6.537-10.559-24.132-28.155-131.216-128.202-254.894-190.039-379.073-188.029-125.185 2.011-248.358 67.871-377.061 201.602-4.525 5.028-9.05 9.05-12.567 12.567-2.011 3.018-4.525 5.531-7.041 7.54zM510.492 654.278c76.418 0 138.758-62.34 138.758-138.758s-62.34-138.758-138.758-138.758c-76.418 0-138.758 62.34-138.758 138.758 0 76.418 62.34 138.758 138.758 138.758z"
									p-id="6543"
									fill="#ffffff"
								></path>
							</svg>
						</button>
						<button>
							<span
								v-if="!showAllPages"
								@click="toggleShowAllPages"
								title="显示全部"
							>
								<svg
									t="1648994565342"
									class="icon"
									viewBox="0 0 1024 1024"
									version="1.1"
									xmlns="http://www.w3.org/2000/svg"
									p-id="12387"
									width="16"
									height="16"
								>
									<path
										d="M128 213.333333h768v85.333334H128z m0 170.666667h768v85.333333H128z m0 170.666667h768v85.333333H128z m0 170.666666h768v85.333334H128z"
										fill="#ffffff"
										p-id="12388"
									></path>
								</svg>
							</span>
							<span v-else @click="toggleShowAllPages" title="显示单页">
								<svg
									t="1648994759353"
									class="icon"
									viewBox="0 0 1024 1024"
									version="1.1"
									xmlns="http://www.w3.org/2000/svg"
									p-id="13343"
									width="16"
									height="16"
								>
									<path
										d="M678.9 98.6H217.4c-33.9 0-61.4 26.2-61.4 58.5v715.7c0 32.2 27.5 58.5 61.4 58.5h584.4c33.9 0 61.4-26.2 61.4-58.5V304.5L678.9 98.6z m103 204.8H658.4v-138l123.5 138z m8.1 564.8H230.4c-5.7 0-10.1-3.8-10.1-7.2V168.1c0-3.4 4.3-7.2 10.1-7.2h380.3v151c0 27.8 22.6 50.3 50.3 50.3h139V861c0 3.4-4.3 7.2-10 7.2z m-0.2 0"
										p-id="13344"
										fill="#ffffff"
									></path>
									<path
										d="M557 352c0 17.7-14.3 32-32 32H352c-17.7 0-32-14.3-32-32s14.3-32 32-32h173c17.6 0 32 14.3 32 32zM707.5 511c0 17.7-14.3 32-32 32h-321c-17.7 0-32-14.3-32-32s14.3-32 32-32h321c17.6 0 32 14.3 32 32zM707.5 670c0 17.7-14.3 32-32 32h-321c-17.7 0-32-14.3-32-32s14.3-32 32-32h321c17.6 0 32 14.4 32 32z"
										p-id="13345"
										fill="#ffffff"
									></path>
								</svg>
							</span>
						</button>
					</div>
				</div>
			</div>

			<div class="app-content">
				<VuePdfEmbed
					ref="pdfRef"
					:source="{
						url: src,
						//引入pdf.js字体
						cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@2.5.207/cmaps/',
						cMapPacked: true,
					}"
					:page="page"
					@password-requested="handlePasswordRequest"
					@rendered="handleDocumentRender"
					:disableAnnotationLayer="true"
				/>
			</div>
		</div>
	</ClientOnly>
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
			togglePageTimer: null,
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
			let value = +e.target.value;
			if (isNaN(value) || value % 1 !== 0) return;
			if (value <= 0) {
				e.target.value = 0;
				value = 0;
			}
			if (value > this.pageCount) {
				e.target.value = this.pageCount;
				value = this.pageCount;
			}
			this.page = value;
		},
		onOpenInNewTab() {
			if (!this.src) return;
			window.open(this.src);
		},
		onDownload() {
			if (!this.src) return;
			const link = document.createElement("a");
			link.href = this.src;
			link.download = this.src.match(/pdf\/(.*)\./)[1];
			link.click();
		},
		toggleShowAllPages() {
			if (this.isLoading) return;
			clearTimeout(this.togglePageTimer);
			this.togglePageTimer = setTimeout(() => {
				this.showAllPages = !this.showAllPages;
			}, 300);
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
	gap: 10px;
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
.pdf-wrapper .right button {
	border: none;
	outline: none;
	background: transparent;
	color: #fff;
	display: flex;
	align-items: center;
}
</style>
