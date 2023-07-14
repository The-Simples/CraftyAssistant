---
title: Mappings
icon: mind-mapping
---

## /mappings

**\<\> - Required \[\] - Optional**

### **\<mapping\>** | String
Used to specify mapping type.

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
Use to specify search type. **Not fully impltemented**
<br>`class` | ~~field~~ | ~~method~~

### **\<query\>** | String (Auto-completion)
Search key word
<br>`class` | ~~field~~ | ~~method~~

### **\[version\]** | String (Auto-completion)
Select available version.
