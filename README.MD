<p align="center"><a href="https://xugaoyi.com/" target="_blank" rel="noopener noreferrer"><img width="180" src="/docs/.vuepress/public/img/logo.png" alt="logo"></a></p>

<h2 align="center">Fancy Machine Learnning</h2>

# 开始上手

react 源码的阅读是很久之前的一项计划，读这个源码需要花费大量的时间，我主要是在闲暇时间里去完成的。一边阅读，一边做笔记，然后将笔记整理成文档，看到自己能够有一些内容产出，心里还是蛮高兴的。这份笔记的时间跨度很大，而且笔记也在不断的充实和积累。作为一种学习和积淀的过程，对自己来说也是收益颇丰。

## 说明

在这里我先要说明一些事项，以作为阅读之前的提醒。

| 事项          | 描述                                                            |
| ------------- | --------------------------------------------------------------- |
| React 版本    | v16.8.6                                                         |
| IDE           | VScode                                                          |
| 静态生成器    | VuePress                                                        |
| 源码 Repo     | https://github.com/jonsam-ng/ReactSourceCodeAnalyze.git         |
| 笔记源码 Repo | https://github.com/jonsam-ng/fe-source-reading                  |
| 笔记地址      | https://source.jonsam.site                                      |
| 阅读重点      | React 调度、更新的过程，diff 原理，重要的数据结构、hooks 原理等 |
| 阅读方式      | 运行源码、源码标注、笔记分析总结                                |

## 阅读方法

1. 运行和调试 React 源码。

```bash
git clone https://github.com/jonsam-ng/ReactSourceCodeAnalyze.git 
cd source-code-demo
yarn 
yarn start
```

2. 按照一定的阅读顺序阅读源码

## 许可证

[MIT](https://github.com/xugaoyi/vuepress-theme-vdoing/blob/master/LICENSE)
