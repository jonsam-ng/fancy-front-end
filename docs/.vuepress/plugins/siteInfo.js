let busuanzi;
/**
 * 如果元素存在，则删除
 */
function removeElement(selector) {
  var element = document.querySelector(selector);
  if (element) {
    element.parentNode.removeChild(element);
  }
}

/**
 * 文章页的访问量
 */
function getPageViewCouter(iterationTime = 3000) {
  if (busuanzi) {
    busuanzi.fetch();
  } else {
    busuanzi = require("busuanzi.pure.js");
  }
  var i = 0;
  var defaultCouter = "9999";
  // 如果 require 没有获取成功，则手动获取
  // 但是容易产生访问量叠加，如果只需要第一次获取数据（可能获取失败），可注释掉，此内容是第一次获取失败后，重新获取访问量，可能导致访问量再次 + 1
  // 取决于访问人的网络，以及 setTimeout 的时间（需求调节）
  setTimeout(() => {
    let interval = setInterval(() => {
      const pageView = document.querySelector(".view-data");
      if (pageView) {
        i += iterationTime;
        if (i > iterationTime * 10) {
          pageView.innerText = defaultCouter;
          clearInterval(interval); // 10 秒后无法获取，则取消获取
        }
        if (pageView.innerText == "") {
          // 手动获取访问量
          busuanzi.fetch();
        } else {
          clearInterval(interval);
        }
      } else {
        clearInterval(interval);
      }
    }, iterationTime);
  }, iterationTime);
}
/**
 * 添加浏览量元素
 */
function addPageView() {
  // 创建访问量的元素
  let template = document.createElement("div");
  template.title = "浏览量";
  template.className = "page-view iconfont icon-view";
  template.style.float = "left";
  template.style.marginLeft = "20px";
  template.style.fontSize = "0.8rem";
  // template.innerHTML = '<span id="busuanzi_container_page_pv" style="display: none; margin-left: 3px"><a style="color: #888" href="javascript:;" id="busuanzi_value_page_pv" class="view-data"></a></span>';
  template.innerHTML =
    '<a style="color: #888; margin-left: 3px" href="javascript:;" id="busuanzi_value_page_pv" class="view-data"><i title="正在获取..." class="loading iconfont icon-loading"></i></a>';
  mountedView(template);
  // 添加 loading 效果
  let style = document.createElement("style");
  style.innerHTML = `@keyframes turn {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
  .loading {
    display: inline-block;
    animation: turn 1s linear infinite;
    -webkit-animation: turn 1s linear infinite;
  }`;
  document.head.appendChild(style);
}
/**
 * 添加当前文章页的字数元素
 */
function addPageWordsCount(wordsCount) {
  if (wordsCount) {
    let template = document.createElement("div");
    template.title = "文章字数";
    template.className = "book-words iconfont icon-book";
    template.style.float = "left";
    template.style.marginLeft = "20px";
    template.style.fontSize = "0.8rem";

    template.innerHTML = `<a href="javascript:;" style="margin-left: 3px; color: #888">${wordsCount}</a>`;
    mountedView(template);
  }
}

/**
 * 添加预计的阅读时间
 */
function addReadTimeCount(readTimeCount) {
  let template = document.createElement("div");
  template.title = "预阅读时长";
  template.className = "reading-time iconfont icon-shijian";
  template.style.float = "left";
  template.style.marginLeft = "20px";
  template.style.fontSize = "0.8rem";
  template.innerHTML = `<a href="javascript:;" style="margin-left: 3px; color: #888">${readTimeCount}</a>`;
  mountedView(template);
}

/**
 * 挂载目标到页面上
 */
function mountedView(
  template,
  moutedParentEvent = ".articleInfo-wrap > .articleInfo > .info"
) {
  var i = 0;
  let interval = setInterval(() => {
    i++;
    const parentElement = document.querySelector(moutedParentEvent);
    if (parentElement) {
      if (!isMountedView(template, parentElement)) {
        parentElement.appendChild(template);
        clearInterval(interval);
      }
    } else if (i > 1 * 10) {
      // 10 秒后清除
      clearInterval(interval);
    }
  }, 1000);
}
/**
 * 目标是否已经挂载在页面上
 */
function isMountedView(element, parentElement) {
  if (element.parentNode == parentElement) {
    return true;
  } else {
    return false;
  }
}

export {
  removeElement,
  getPageViewCouter,
  addPageView,
  addPageWordsCount,
  addReadTimeCount,
  mountedView,
  isMountedView,
};
