import { defineUserConfig } from "vuepress";
import theme from "./theme.js";
import { searchProPlugin } from "vuepress-plugin-search-pro";
export default defineUserConfig({
  base: "/",

  locales: {
    "/": {
      lang: "en-US",
      title: "CraftyAssistant",
      description: "The documentation for CraftyAssistant discord bot.",
    },
    "/zh/": {
      lang: "zh-CN",
      title: "CraftyAssistant",
      description: "CraftyAssistant 是一个和 MC 相关的 Discord 机器人。",
    },
  },
  plugins: [
    searchProPlugin({
      // 索引全部内容
      indexContent: true,
      // 为分类和标签添加索引
      customFields: [
        {
          getter: (page) => page.frontmatter.category,
          formatter: "分类：$content",
        },
        {
          getter: (page) => page.frontmatter.tag,
          formatter: "标签：$content",
        },
      ],
    }),
  ],
  theme,

  // Enable it with pwa
  // shouldPrefetch: false,
});
