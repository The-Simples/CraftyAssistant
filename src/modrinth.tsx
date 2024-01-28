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
import { ModrinthV2Client, SearchProjectOptions } from '@xmcl/modrinth'

export interface Version {
  version: string
  version_type: string
  date: string
  major: boolean
}

// `Env` contains bindings and is declared in types/env.d.ts
export function modrinth(): CommandHandler<Env> {
  useDescription('Search projects on Modrinth')
  useDescriptionLocalizations({
    'zh-CN': '搜索 Modrinth 项目',
    'pt-BR': 'Pesquise projetos no Modrinth',
  })

  const query = useString('query', 'Search key word', {
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
  const types = useString('types', 'Filter Type', {
    choices: [
      'mod',
      'plugin',
      'datapack',
      'shader',
      'resourcepack',
      'modpack',
    ] as const,
    localizations: {
      name: {
        'zh-CN': '搜索类型',
      },
      description: {
        'zh-CN': '指定搜索的类型',
        'pt-BR': 'Tipo de pesquisa',
      },
    },
  })
  const loaders = useString('loaders', 'Mod Loaders', {
    choices: [
      'fabric',
      'forge',
      'quilt',
      'liteloader',
      'modloader',
      'rift',
    ] as const,
    localizations: {
      name: {
        'zh-CN': '限定模组平台',
        'pt-BR': 'modloader',
      },
      description: {
        'zh-CN': '限定搜索返回的模组平台',
        'pt-BR': 'Limitar carregador de mod',
      },
    },
  })

  const category = useString<Env>(
    'category',
    'Use in plugin or shader filter.',
    {
      async autocomplete(interaction, env, ctx) {
        let choices: Choice<string>[] = [
          'Use this when search plugin or shader.',
        ]
        if (!types || types == 'mod' || types == 'modpack') return choices
        if (types == 'plugin')
          choices = [
            'bukkit',
            'folia',
            'paper',
            'purpur',
            'spigot',
            'sponge',
            'bungeecord',
            'waterfall',
            'velocity',
          ]
        if (types == 'shader')
          choices = ['canvas', 'iris', 'optifine', 'vanilla']
        return choices
      },
      localizations: {
        name: {
          'zh-CN': '筛选光影或插件类型',
          'pt-BR': 'tipo',
        },
        description: {
          'zh-CN': '只在指定搜索类型以后才允许使用',
          'pt-BR': 'Só permitir usar depois de especificar o tipo de pesquisa',
        },
      },
    }
  )
  const version: string | null = useString<Env>('version', 'Specify version', {
    async autocomplete(interaction, env, ctx) {
      if (!version || version.length <= 3)
        return ['Waiting more input...'] as Choice<string>[]
      const versions: string[] | null = await env.CHECK_CONF.get(
        'versions',
        'json'
      )
      if (!versions) return ['Failed to get all versions']
      return versions.filter((v) => {
        return v.startsWith(version)
      })
    },
  })
  const limit = useNumber('limit', 'Limit return number', {
    localizations: {
      name: {
        'zh-CN': '限制返回数',
      },
      description: {
        'zh-CN': '限制搜索的返回数',
        'pt-BR': 'Limitar o número de resultados da pesquisa',
      },
    },
  })
  const silent = useBoolean('silent', 'Message can(not) be viewed by others', {
    localizations: {
      name: {
        'zh-CN': '仅你可见',
      },
      description: {
        'zh-CN': 'True 代表消息仅对你可见，False 代表发送到频道，每人可见',
        'pt-BR': '"True" só você vê a mensagem. "False" todos no canal veem.',
      },
    },
  })

  return async (interaction, env, ctx) => {
    const modrinthV2Client = new ModrinthV2Client()
    const facets = []
    if (types) facets.push([`[\"project_type:${types}\"]`])
    if (loaders) facets.push([`[\"categories:${loaders}\"]`])
    if (types && category) facets.push([`[\"categories:${category}\"]`])
    if (version) facets.push([`[\"versions:${version}\"]`])

    const searchOptions: SearchProjectOptions = {
      query: query,
      limit: 5,
    }

    if (limit) searchOptions.limit = limit
    if (facets.length !== 0)
      searchOptions['facets'] = '[' + facets.toString() + ']'
    const result = await modrinthV2Client.searchProjects(searchOptions)
    if (result.hits.length == 0) {
      return <Message ephemeral>Didn't find any result</Message>
    }

    let message: { embeds: any[] } = {
      ...(silent ? { flags: 64 } : {}), // ephemeral
      embeds: [],
    }
    for (const project of result.hits) {
      message.embeds.push({
        // All these properties are optional
        title: project.title,
        description: project.description,
        url: `https://modrinth.com/project/${project.project_id}`,
        timestamp: project.date_modified,
        color: 0x0094ff,
        thumbnail: { url: project.icon_url },
        fields: [
            { name: 'Version', value: project.versions.toString(), inline: true },
            {
                name: 'Categories',
                value: project.categories.toString(),
                inline: true,
            },
            {
                name: 'Downloads',
                value: project.downloads,
                inline: true,
            },
        ],
      })
    }

    return message
  }
}
