import { defineConfig } from "vite";

export default defineConfig({
	slidev: {
		vue: {
			/* vue options */
		},
		markdown: {
			/* markdown-it options */
			markdownItSetup(md) {
				/* custom markdown-it plugins */
			},
		},
		/* options for other plugins */
	},
});
