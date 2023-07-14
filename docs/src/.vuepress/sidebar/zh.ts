import { sidebar } from "vuepress-theme-hope";

export const zhSidebar = sidebar({
  "/zh/": [
    "",
    {
      text: "使用文档",
      icon: "document",
      prefix: "guide/",
      children: "structure",
    },
  ],
});
