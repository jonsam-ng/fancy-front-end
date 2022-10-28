(window.webpackJsonp=window.webpackJsonp||[]).push([[42],{414:function(t,a,s){"use strict";s.r(a);var r=s(2),e=Object(r.a)({},(function(){var t=this,a=t._self._c;return a("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[a("Badges",{attrs:{content:[{type:"tip",text:"React17"}]}}),t._v(" "),a("TimeToRead"),t._v(" "),a("h2",{attrs:{id:"目录"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#目录"}},[t._v("#")]),t._v(" 目录")]),t._v(" "),a("p"),a("div",{staticClass:"table-of-contents"},[a("ul",[a("li",[a("a",{attrs:{href:"#目录"}},[t._v("目录")])]),a("li",[a("a",{attrs:{href:"#运算规则"}},[t._v("运算规则")])]),a("li",[a("a",{attrs:{href:"#常用的技巧"}},[t._v("常用的技巧")]),a("ul",[a("li",[a("a",{attrs:{href:"#按位与"}},[t._v("按位与(&)")])]),a("li",[a("a",{attrs:{href:"#按位或"}},[t._v("按位或(|)")])]),a("li",[a("a",{attrs:{href:"#按位亦或"}},[t._v("按位亦或(^)")])]),a("li",[a("a",{attrs:{href:"#按位取反"}},[t._v("按位取反(~)")])]),a("li",[a("a",{attrs:{href:"#左移"}},[t._v("左移（<<）")])]),a("li",[a("a",{attrs:{href:"#右移"}},[t._v("右移（>>）")])])])]),a("li",[a("a",{attrs:{href:"#参考链接"}},[t._v("参考链接")])])])]),a("p"),t._v(" "),a("h2",{attrs:{id:"运算规则"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#运算规则"}},[t._v("#")]),t._v(" 运算规则")]),t._v(" "),a("table",[a("thead",[a("tr",[a("th",[t._v("符号")]),t._v(" "),a("th",[t._v("描述")]),t._v(" "),a("th",[t._v("运算规则")])])]),t._v(" "),a("tbody",[a("tr",[a("td",[t._v("&")]),t._v(" "),a("td",[t._v("与")]),t._v(" "),a("td",[t._v("两个位都为 1 时，结果才为 1")])]),t._v(" "),a("tr",[a("td",[t._v("|")]),t._v(" "),a("td",[t._v("或")]),t._v(" "),a("td",[t._v("两个位都为 0 时，结果才为 0")])]),t._v(" "),a("tr",[a("td",[t._v("^")]),t._v(" "),a("td",[t._v("异或")]),t._v(" "),a("td",[t._v("两个位相同为 0，相异为 1")])]),t._v(" "),a("tr",[a("td",[t._v("~")]),t._v(" "),a("td",[t._v("取反")]),t._v(" "),a("td",[t._v("0 变 1，1 变 0")])]),t._v(" "),a("tr",[a("td",[t._v("<<")]),t._v(" "),a("td",[t._v("左移")]),t._v(" "),a("td",[t._v("各二进位全部左移若干位，高位丢弃，低位补 0")])]),t._v(" "),a("tr",[a("td",[t._v(">>")]),t._v(" "),a("td",[t._v("右移")]),t._v(" "),a("td",[t._v("各二进位全部右移若干位，对无符号数，高位补 0，有符号数，各编译器处理方法不一样，有的补符号位（算术右移），有的补 0（逻辑右移）")])])])]),t._v(" "),a("h2",{attrs:{id:"常用的技巧"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#常用的技巧"}},[t._v("#")]),t._v(" 常用的技巧")]),t._v(" "),a("h3",{attrs:{id:"按位与"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#按位与"}},[t._v("#")]),t._v(" 按位与 (&)")]),t._v(" "),a("ul",[a("li",[t._v("清零。任何数与 0 结果都是 0.")]),t._v(" "),a("li",[t._v("取二进制数的指定位：0、1 与 1 与都是其本身，因此只要将需要取得二进制数位为 1，需要舍弃的位置为 0，如 00001111，取二进制数后四位。")]),t._v(" "),a("li",[t._v("判断奇偶：任何偶数的二进制的最后一位都是 0，任何奇数的二进制的最后一位都是 1。因此可以用 (x&1)===0 判断偶数，(x&1)===1 判断奇数，但是注意得是整数。")]),t._v(" "),a("li",[t._v("x & (x - 1) 用于消去二进制中 x 最后一位的 1。")]),t._v(" "),a("li",[t._v("位操作统计二进制中 1 的个数：")])]),t._v(" "),a("div",{staticClass:"language-js line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-js"}},[a("code",[a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("let")]),t._v(" count "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("0")]),t._v("  \n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("while")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("a"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("  \n  a "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("&=")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("a "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("-")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("1")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("  "),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 每计算一次二进制中就少了一个 1")]),t._v("\n  count"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("++")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("  \n"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n")])]),t._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[t._v("1")]),a("br"),a("span",{staticClass:"line-number"},[t._v("2")]),a("br"),a("span",{staticClass:"line-number"},[t._v("3")]),a("br"),a("span",{staticClass:"line-number"},[t._v("4")]),a("br"),a("span",{staticClass:"line-number"},[t._v("5")]),a("br")])]),a("h3",{attrs:{id:"按位或"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#按位或"}},[t._v("#")]),t._v(" 按位或 (|)")]),t._v(" "),a("ul",[a("li",[t._v("将二进制的某些位置置为 1：0、1 与 1 或都是 1，因此可以将需要置为 1 的位置为 1，如 00001111 将后四位置为 1。")]),t._v(" "),a("li",[t._v("将偶数变成奇数（整数）：将整数的二进制最后一位置为 1 就变成了奇数，如 (-4|1)=-3、(4|1)=5。")])]),t._v(" "),a("h3",{attrs:{id:"按位亦或"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#按位亦或"}},[t._v("#")]),t._v(" 按位亦或 (^)")]),t._v(" "),a("ul",[a("li",[t._v("翻转指定位：0/1 与 1 亦或就会翻转，与 0 亦或则会保持不变。按照这个规则，将需要翻转的位置 1，不需要翻转的位置 0 即可，如 00001111 将翻转后四位。")]),t._v(" "),a("li",[t._v("两数交换：")])]),t._v(" "),a("div",{staticClass:"language-js line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-js"}},[a("code",[t._v("a "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("^=")]),t._v(" b"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\nb "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("^=")]),t._v(" a"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\na "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("^=")]),t._v(" b"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n")])]),t._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[t._v("1")]),a("br"),a("span",{staticClass:"line-number"},[t._v("2")]),a("br"),a("span",{staticClass:"line-number"},[t._v("3")]),a("br")])]),a("p",[t._v("我们可以从某一个二进制位的变化来理解这个问题：")]),t._v(" "),a("div",{staticClass:"language-txt line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-txt"}},[a("code",[t._v("a:0 b:1\na:1 b:1\na:1 b:0\na:1 b:0\n")])]),t._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[t._v("1")]),a("br"),a("span",{staticClass:"line-number"},[t._v("2")]),a("br"),a("span",{staticClass:"line-number"},[t._v("3")]),a("br"),a("span",{staticClass:"line-number"},[t._v("4")]),a("br")])]),a("h3",{attrs:{id:"按位取反"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#按位取反"}},[t._v("#")]),t._v(" 按位取反 (~)")]),t._v(" "),a("p",[t._v("x 按位取反相当于 -(x+1)。")]),t._v(" "),a("ul",[a("li",[t._v("交互正负：a=~a + 1。")]),t._v(" "),a("li",[t._v("取绝对值：a=a>=0?a:~a+1。")])]),t._v(" "),a("h3",{attrs:{id:"左移"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#左移"}},[t._v("#")]),t._v(" 左移（<<）")]),t._v(" "),a("ul",[a("li",[t._v("每左移一位，相当于该数乘以 2。")])]),t._v(" "),a("h3",{attrs:{id:"右移"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#右移"}},[t._v("#")]),t._v(" 右移（>>）")]),t._v(" "),a("ul",[a("li",[t._v("每右移一位，相当于该数除以 2。")]),t._v(" "),a("li",[t._v("正整数和 0 右移 31 位是 0，负整数右移 31 位是 - 1。")]),t._v(" "),a("li",[t._v("16 位的无符号整数，将其高 8 位与低 8 位进行交换，求出交换后的值: a = (a>> 8) | (a << 8)。")])]),t._v(" "),a("h2",{attrs:{id:"参考链接"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#参考链接"}},[t._v("#")]),t._v(" 参考链接")]),t._v(" "),a("ul",[a("li",[a("a",{attrs:{href:"https://www.zhihu.com/question/38206659",target:"_blank",rel:"noopener noreferrer"}},[t._v("位运算有什么奇技淫巧？"),a("OutboundLink")],1)])])],1)}),[],!1,null,null,null);a.default=e.exports}}]);