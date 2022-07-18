const path = require("path");
const chalk = require("chalk");
const fs = require("fs");
const log = console.log;

const deleteRecursiveSync = function (p) {
	let files = [];
	if (fs.existsSync(p)) {
		files = fs.readdirSync(p);
		files.forEach(function (file, index) {
			const curPath = path.join(p, file);
			if (fs.statSync(curPath).isDirectory()) {
				// recurse
				deleteRecursiveSync(curPath);
			} else {
				// delete file
				fs.unlinkSync(curPath);
			}
		});
		fs.rmdirSync(p);
	}
};

const copyRecursiveSync = function (src, dest) {
	const exists = fs.existsSync(src);
	if (!exists) {
		log(chalk.red("src file(dir) not exist.\n"), { src });
		return;
	}
	const stats = fs.statSync(src);
	const isDirectory = stats.isDirectory();
	if (isDirectory) {
		if (!fs.existsSync(dest)) {
			fs.mkdirSync(dest);
		}
		fs.readdirSync(src).forEach(function (child) {
			copyRecursiveSync(path.join(src, child), path.join(dest, child));
		});
	} else {
		fs.copyFileSync(src, dest);
	}
};

const resolve = (p) => path.resolve(__dirname, p);

log(chalk.yellow("copy slides to docs dist"));

const slidesDir = resolve("../slides/dist");

const docsDir = resolve("../docs/.vuepress/dist");

const dest = path.join(docsDir, "slides");

log(chalk.yellow("Delete slides of docs dist.\n"), { dest });
deleteRecursiveSync(dest);

copyRecursiveSync(slidesDir, dest);
