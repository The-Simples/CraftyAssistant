---
home: true
icon: home
title: CraftyAssitant
heroImage: /logo.svg
bgImage: https://theme-hope-assets.vuejs.press/bg/6-light.svg
bgImageDark: https://theme-hope-assets.vuejs.press/bg/6-dark.svg
bgImageStyle:
  background-attachment: fixed
heroText: CraftyAssitant
tagline: MC 相关 Discord 机器人的一站式方案。
actions:
  - text: 如何使用
    link: ./guide/
    type: primary

  - text: 邀请至服务器
    link: https://discord.com/api/oauth2/authorize?client_id=1122729387587018806&permissions=277025392640&scope=bot%20applications.commands

highlights:
  - header: 高度集成与永不下线
    image: /assets/image/box.svg
    bgImage: https://theme-hope-assets.vuejs.press/bg/3-light.svg
    bgImageDark: https://theme-hope-assets.vuejs.press/bg/3-dark.svg
    highlights:
      - title: 多不为繁，自由开关
        icon: setting-filling
        details: 多数指令为 slash 指令，你可以在服务器设置中自由限制可以使用的频道和身份组。
        link: ./guide/
      - title: 由 Cloudflare Workers 驱动, 低延迟且高在线率
        icon: cloudflare
        details: 你知道吗？Discord 也在使用 Cloudflare 的服务，这意味着我们响应速度接近内网，并且只有当 Discord 停机的时候我们才可能离线。
        link: ./guide/

  - header: 丰富的特性
    description: 我们将一直维护机器人以更好地服务于您。
    image: /assets/image/layout.svg
    bgImage: https://theme-hope-assets.vuejs.press/bg/5-light.svg
    bgImageDark: https://theme-hope-assets.vuejs.press/bg/5-dark.svg
    highlights:
      - title: /mcflags
        icon: flag
        details: 启动 Flags 生成，不再为找标签烦恼。
        link: ./guide/mcflags

      - title: /spark
        icon: light
        details: 只需提供 spark 链接，我们会为你进行一些通用的配置文件扫描。
        link: ./guide/spark

      - title: /curseforge | /modrinth
        icon: palette
        details: 无需离开聊天频道，即可与朋友分享自己找到的模组。
        link: ./guide/modrinth

      - title: /mappings
        icon: mind-mapping
        details: 对日志的混淆名感到头疼？快速查找映射表，我们做了很多缓存来保证响应迅速！(目前不可用）
        link: ./guide/mappings

      - title: /mcserver
        icon: cloud-server
        details: 检查服务器状态，亦或是在游戏外查看 Motd，来试试吧。
        link: ./guide/mcserver
		
      - title: /mcuser
        icon: idcard
        details: 想获取玩家的 UUID 或头？不仅于此，我们还为你提供渲染好了皮肤。
        link: ./guide/mcuser

copyright: false
footer: MIT Licensed, Copyright © 2023-present The-Simples
---

