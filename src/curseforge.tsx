import { CurseforgeV1Client, Mod, SearchOptions } from '@xmcl/curseforge'
import {
  Choice,
  CommandHandler,
  createElement,
  Message,
  useBoolean,
  useDescription,
  useDescriptionLocalizations,
  useNumber,
  useString,
} from 'slshx'
import { Version } from './modrinth'

export function curseforge(): CommandHandler<Env> {
  useDescription('Search Minecraft projects on CurseForge')
  useDescriptionLocalizations({
    'zh-CN': '搜索 CurseForge 项目',
    'pt-BR': 'Pesquise projetos Minecraft no CurseForge',
  })

  const query = useString('query', 'The word used for searching', {
    required: true,
    localizations: {
      name: {
        'zh-CN': '搜索关键词',
        'pt-BR': 'palavra',
      },
      description: {
        'zh-CN': '用于搜索的词语',
        'pt-BR': 'A palavra usada para pesquisar',
      },
    },
  })
  const types = useNumber('types', 'Specify the type of search', {
    choices: [
      { name: 'mod', value: 6 },
      { name: 'texture-packs', value: 12 },
      { name: 'customization', value: 4546 },
      { name: 'world', value: 17 },
      { name: 'modpacks', value: 4471 },
    ] as const,
    localizations: {
      name: {
        'zh-CN': '搜索类型',
        'pt-BR': 'tipo',
      },
      description: {
        'zh-CN': '指定搜索的类型',
        'pt-BR': 'Especifique o tipo de pesquisa',
      },
    },
  })

  const loaders = useNumber('loaders', 'Mod Loaders', {
    choices: [
      { name: 'Fabric', value: 4 },
      { name: 'Forge', value: 1 },
      { name: 'Quilt', value: 5 },
      { name: 'Cauldron', value: 2 },
      { name: 'LiteLoaders', value: 3 },
    ] as const,
    localizations: {
      name: {
        'zh-CN': '限定模组平台',
        'pt-BR': 'modloader',
      },
    },
  })

  const version = useString<Env>('version', 'Specify version', {
    async autocomplete(interaction, env, ctx) {
      const response = await fetch(
        'https://api.modrinth.com/v2/tag/game_version'
      )
      const choices: Choice<string>[] = []
      if (!response.ok || !version) return choices
      const versions: Version[] = await response.json()
      const matching = versions.filter((v) => {
        if (!v.version.startsWith(version)) return false
        if (v.version_type !== 'release') return false
        return true
      })
      for (const v of matching) {
        if (v.major)
          choices.push({ name: v.version + ' (Major)', value: v.version })
        else choices.push(v.version)
      }
      return choices
    },
  })
  const limit = useNumber(
    'limit',
    'Limit the number of returns for the search',
    {
      localizations: {
        name: {
          'zh-CN': '限制返回数',
        },
        description: {
          'zh-CN': '限制搜索的返回数',
          'pt-BR': 'Limite o número de retornos para a pesquisa',
        },
      }
    }
  )
  const silent = useBoolean('silent', 'Message can(not) be viewed by others', {
    localizations: {
      name: {
        'zh-CN': '仅你可见',
      },
      description: {
        'zh-CN': 'True 代表消息仅对你可见，False 代表发送到频道，每人可见',
        'pt-BR': 'Apenas você pode ver',
      },
    },
  })

  return async (interaction, env, ctx) => {
    const api = new CurseforgeV1Client(env.CURSEFORGE)
    const searchOptions: SearchOptions = {
      classId: 6,
      searchFilter: query,
      pageSize: limit || 5,
    }
    if (types) searchOptions['classId'] = types
    if (version) searchOptions.gameVersion = version
    if (loaders) searchOptions.modLoaderType = loaders
    const result = await api.searchMods(searchOptions)
    const mods: Mod[] = result.data // mod details
    if (mods.length == 0)
      return <Message ephemeral>Can not find any results.</Message>

      let message: { embeds: any[] } = {
          ...(silent ? { flags: 64 } : {}), // ephemeral
          embeds: [],
      }
      for (const project of mods) {
          message.embeds.push({
              // All these properties are optional
              title: project.name,
              description: project.summary,
              url: `https://legacy.curseforge.com/projects/${project.id}`,
              timestamp: project.dateReleased,
              color: 0x0094ff,
              thumbnail: { url: project.logo.url },
              fields: [
                  {
                      name: 'Categories',
                      value: project.categories.map(e =>e.name).join(', '),
                      inline: true,
                  },
                  {
                      name: 'Downloads',
                      value: project.downloadCount,
                      inline: true,
                  }
              ],
          })
      }

      return message
  }
}
