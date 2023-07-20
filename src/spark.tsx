import {
  CommandHandler,
  useDescription,
  createElement,
  useString,
  Message,
  useBoolean,
} from 'slshx'
import jexl from 'jexl'

// Inspired by https://github.com/birdflop/botflop
export function spark(): CommandHandler<Env> {
  useDescription('扫描 Spark 报告')
  const url = useString('spark', 'The url for the spark.', {
    required: true,
    localizations: {
      name: {
        'zh-CN': 'spark报告',
      },
      description: {
        'zh-CN': '提供 Spark 报告 URL',
        'pt-BR': 'Forneça o URL do Relatório Spark',
      },
    },
  })

  const locales = useString(
    'locales',
    'Use localization for Output(Default: Client Setting)',
    {
      choices: ['en-US', 'zh-CN', 'pt-BR'],
    }
  )

  const isPublic = useBoolean('public', 'Make anaylize result public.', {
    localizations: {
      name: {
        'zh-CN': '公开扫描结果',
      },
      description: {
        'zh-CN': '使扫描结果人人可见。',
        'pt-BR': 'Tornar o resultado da análise público.',
      },
    },
  })

  return async (interaction, env, ctx) => {
    if (!url.startsWith('https://spark'))
      return <Message ephemeral>Not a spark url.</Message>
    const response_raw = await fetch(url + '?raw=1')
    const sampler: any = await response_raw.json().catch(() => undefined)
    if (!sampler) return <Message ephemeral>Failed to get data</Message>
    const fields: { name: string; value: string; inline: boolean }[] = []

    const platform = sampler.metadata.platform.version
    const user = sampler.metadata.user.name
    const configs = sampler.metadata.serverConfigurations
    let isServer: boolean = true
    if (!configs) isServer = false
    const plugins: { name: string; version: string }[] = Object.values(
      sampler.metadata.sources
    )
    const flags = sampler.metadata.systemStatistics.java.vmArgs
    const versionString = sampler.metadata.systemStatistics.java.vendorVersion
    const majorVersion = parseInt(versionString.split('.')[0], 10)

    gcChecker(flags, isServer, majorVersion).then((field) =>
      fields.unshift(field)
    )

    let variablesMap = {
      ...(configs['server.properties']
        ? { server_properties: JSON.parse(configs['server.properties']) }
        : {}),
      ...(configs['bukkit.yml']
        ? { bukkit: JSON.parse(configs['bukkit.yml']) }
        : {}),
      ...(configs['spigot.yml']
        ? { spigot: JSON.parse(configs['spigot.yml']) }
        : {}),
      ...(configs['paper/'] ? { paper: JSON.parse(configs['paper/']) } : {}),
      ...(configs['purpur.yml']
        ? { purpur: JSON.parse(configs['purpur.yml']) }
        : {}),
    }

    for (const name in variablesMap) {
      const configName = `config.${name}`
      const configObj: any = await env.CHECK_CONF.get(configName, 'json')
      if (!configObj) continue
      for (const nodePath in configObj) {
        const checkArray: Checker[] = configObj[nodePath]
        for (let i = 0; i < checkArray.length; i++) {
          let expressions = checkArray[i].expressions
          // @ts-ignore
          const allExpressionsTrue = expressions.every(
            async (expressionStr) => {
              try {
                const result = await jexl.eval(expressionStr, variablesMap)
                return !!result
              } catch (error) {
                fields.push(errorField(nodePath, error))
                return false
              }
            }
          )
          if (allExpressionsTrue)
            fields.push(createField(nodePath, checkArray[i]))
        }
      }
    }

    for (const name in variablesMap) {
      const configName = `plugin.${name}`
      const configObj: {
        [key: string]: { prefix: string; value: string }
      } | null = await env.CHECK_CONF.get(configName, 'json')
      if (!configObj) continue
      Object.keys(configObj)
        .filter((key) => plugins.some((plugin) => plugin.name === key))
        .forEach((key) => {
          fields.push(createField(key, configObj[key]))
        })
    }

    if (fields.length == 0)
      return <Message ephemeral>We didn't find any problems</Message>
    return {
      ...(isPublic ? {} : { flags: 64 }), // ephemeral
      embeds: [
        {
          title: `Spark ${url.substring(url.lastIndexOf('/') + 1)}`,
          description: `${platform} - ${user}`,
          thumbnail: { url: '' },
          url: url,
          timestamp: new Date().toISOString(),
          fields: fields,
        },
      ],
    }
  }
}

interface Checker {
  expressions?: string[]
  prefix: string
  inline?: boolean
  value: string
  locales?: Record<string, string>
}

function createField(node: string, option: Checker) {
  const field = { name: node, value: option.value, inline: true }
  if (option.prefix) field.name = option.prefix + ' ' + field.name
  if (option.inline) field.inline = option.inline
  return field
}

function errorField(node: string, error: unknown) {
  return { name: ':warning:' + node, value: String(error), inline: true }
}

async function gcChecker(
  jvmFlagsString: string,
  isServer: boolean,
  jvmVersion: number
) {
  function extractMemoryAndGcType(
    jvmFlagString: string
  ): [number | null, string | null] {
    const regex = /-Xm[sx]([0-9]+[kmg])\b.*?(-XX:\+Use(\w+)GC)\b/gi
    const matches = regex.exec(jvmFlagString)
    if (matches && matches.length > 3) {
      const memorySizeStr = matches[1]
      const gcType = matches[3]

      const memorySize = parseMemorySize(memorySizeStr)

      return [memorySize, gcType]
    }

    return [null, null]
  }
  function parseMemorySize(memorySizeStr: string): number | null {
    const size = parseInt(memorySizeStr, 10)
    if (!isNaN(size)) {
      if (memorySizeStr.endsWith('g')) {
        return size * 1024 // GB 转换为 MB
      } else if (memorySizeStr.endsWith('k')) {
        return size / 1024 // KB 转换为 MB
      } else {
        return size // MB
      }
    }
    return null
  }
  const [memorySize, gcType] = extractMemoryAndGcType(jvmFlagsString)
  if (memorySize == null || gcType == null)
    return {
      name: ':warning: Flags',
      value: 'We can not analyse your flags.',
      inline: true,
    }
  if (gcType == 'Z' && memorySize <= 20480) {
    return {
      name: ':exclamation: ZGC',
      value: `ZGC is known to be usable when you allocated 20GB+ Memory
        , But you only allocated ${memorySize}MB so increase it or change GC (Use /mcflags to generate one).`,
      inline: true,
    }
  }
  if (gcType == 'Shenandoah' && isServer) {
    return {
      name: ':exclamation: Shenandoah',
      value: `ShenandoahGC is **Not** server friendly,
        It only works well on client side. Use our /mcflags to generate better one.`,
      inline: true,
    }
  }
  if (gcType == 'G1') {
    if (memorySize >= 20480 && jvmVersion >= 16) {
      return {
        name: ':exclamation: G1 to ZGC',
        value: `You are allocating 20GB+ in Java${jvmVersion}
            , I would like to recommend you hava a try with ZGC as It will greatly improve your GC stop time.`,
        inline: true,
      }
    }
    if (
      memorySize >= 12088 &&
      jvmFlagsString.includes('-XX:G1NewSizePercent=30')
    )
      return {
        name: ':exclamation: G1 Improvement',
        value: `When you allocated 12GB+ memory 
        in G1GC, Please consider changing some flags value. (Use /mcflags to generate)`,
        inline: true,
      }
  }
  return {
    name: `:white_check_mark: ${gcType}GC`,
    value: 'Good job. We can not find any problems in your flags.',
    inline: true,
  }
}
