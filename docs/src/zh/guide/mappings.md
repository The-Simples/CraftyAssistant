---
title: Mappings
icon: mind-mapping
---

## /mappings

**\<\> - Required \[\] - Optional**

### **\<mapping\>** | String
搜索 Mappings 的种类。

`MOJANG` eg. `net.minecraft.commands.arguments.item.FunctionArgument`
<br>`SPIGOT` eg. `net.minecraft.commands.arguments.item.ArgumentTag`
<br>`SERAGE`(FORGE) eg. `net.minecraft.src.C_4638_`

Fabric use:
<br>`YARN`(eg. `net.minecraft.command.argument.CommandFunctionArgumentType`) 
<br>`INTERMEDIARY`(eg. `net.minecraft.class_2284`)

QuiltMC use:
<br>`QUILTMC`(eg. `net.minecraft.command.argument.CommandFunctionArgumentType`) 
<br>`HASHED`(eg. `net.minecraft.unmapped.C_edcdjeqn`)

### **\<type\>** | String
用于指定搜索类型 **Not fully impltemented**
<br>`class` | ~~field~~ | ~~method~~

### **\<query\>** | String (Auto-completion)
搜索关键词
<br>`class` | ~~field~~ | ~~method~~

### **\[version\]** | String (Auto-completion)
选择可用版本。
