#!/usr/bin/env sh

# 确保脚本抛出遇到的错误
set -e

# 生成静态文件
npm run build

# 进入生成的文件夹
cd docs/.vuepress/dist

# deploy to github pages
echo 'source.jonsam.site' > CNAME

git config --global user.name "wuqingshan"
git config --global user.email "wuqingshan@xylink.com"

if [ -z "$GITHUB_TOKEN" ]; then
  msg='deploy: deploy to pages'
  githubUrl=git@github.com:jonsam-ng/fe-source-reading.git
else
  msg='deploy: auto deploy by github actions'
  githubUrl=https://jonsam-ng:${GITHUB_TOKEN}@github.com/jonsam-ng/fe-source-reading.git
fi
git init
git add -A
git commit -m "${msg}"
git push -f $githubUrl master:gh-pages

# deploy to coding pages
# echo 'google.com, pub-7828333725993554, DIRECT, f08c47fec0942fa0' > ads.txt # 谷歌广告相关文件

# if [ -z "$CODING_TOKEN" ]; then  # -z 字符串 长度为0则为true；$CODING_TOKEN来自于github仓库`Settings/Secrets`设置的私密环境变量
#   codingUrl=git@e.coding.net:xgy/xgy.git
# else
#   codingUrl=https://HmuzsGrGQX:${CODING_TOKEN}@e.coding.net/xgy/xgy.git
# fi
# git add -A
# git commit -m "${msg}"
# git push -f $codingUrl master # 推送到coding

cd -
rm -rf docs/.vuepress/dist
