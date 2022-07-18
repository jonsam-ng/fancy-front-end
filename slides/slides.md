---
# try also 'default' to start simple
theme: seriph
themeConfig:
  primary: '#3CB982'

routerMode: 'hash'
# random image from a curated Unsplash collection by Anthony
# like them? see https://unsplash.com/collections/94734566/slidev
background: https://source.unsplash.com/collection/94734566/1920x1080
favicon: 'https://source.jonsam.site/assets/img/favicon.ico'
# apply any windi css classes to the current slide
class: 'text-center'
# https://sli.dev/custom/highlighters.html
highlighter: shiki
# show line numbers in code blocks
lineNumbers: true
fonts:
  # 基础字体
  sans: '微软雅黑'
  # 与 windicss 的 `font-serif` css 类一同使用
  serif: 'Robot Slab'
  # 用于代码块、内联代码等
  mono: 'Fira Code'
---

# 幻灯片

<div class="pt-12">
  <span @click="$slidev.nav.next" class="px-2 py-1 rounded cursor-pointer" hover="bg-white bg-opacity-10">
    查看目录 <carbon:arrow-right class="inline"/>
  </span>
</div>
---

# 目录

微前端架构：从框架到原理

- 📝 <Link to="3">微前端架构：从框架到原理（一）—— 微前端基础与 single-spa 初探</Link>

---
layout: cover
---

# 微前端架构：从框架到原理（一）

微前端基础与 single-spa 初探

---
src: ./docs/mfe1.md
---
