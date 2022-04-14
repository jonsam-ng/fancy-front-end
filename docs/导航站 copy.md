---
title: 导航站
date: 2022-01-11 14:03:46   
permalink: /link/
categories:
  - 
tags: 
  - 
---

## 搜索引擎

<ClientOnly>
  <Card :cardData="cardData0" :cardListSize=3 carTitlColor="#000" carHoverColor="#000" />
</ClientOnly>

## 前端开发

<ClientOnly>
  <Card :cardData="cardData1" :cardListSize=3 carTitlColor="#000" carHoverColor="#000" />
</ClientOnly>

<script>
export default {
  data() {
    return {
      cardData0: [
        {
          id: "0",
          cardSrc: "http://www.baidu.com/",
          cardImgSrc:
            "https://cdn.jsdelivr.net/gh/Kele-Bingtang/static/img/tools/20220104224044.png",
          cardName: "百度",
          cardContent:
            "百度——全球最大的中文搜索引擎及最大的中文网站，全球领先的人工智能公司",
        },
        {
          cardSrc: "http://www.google.com/",
          cardImgSrc:
            "https://cdn.jsdelivr.net/gh/Kele-Bingtang/static/img/tools/20220104225539.png",
          cardName: "Google",
          cardContent: "全球最大的搜索引擎公司",
        },
        {
          cardSrc: "https://www.bing.com/",
          cardImgSrc:
            "https://cdn.jsdelivr.net/gh/Kele-Bingtang/static/img/tools/20220104224430.png",
          cardName: "Bing",
          cardContent: "微软公司推出的用以取代Live Search的搜索引擎",
        },
      ],
      cardData1: [
      ],
    };
  },
};
</script>
