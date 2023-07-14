import {
  $update,
  Choice,
  CommandHandler,
  ComponentType,
  createElement,
  Message,
  useDescription,
  useSelectMenu,
  useString,
} from 'slshx'

// `Env` contains bindings and is declared in types/env.d.ts
export function mappings(): CommandHandler<Env> {
  useDescription(
    'Test only, not usable as CF free plan can not support these func and D1 limit 100MB stroage for now.'
  )

  const mappingType = useString(
    'mapping',
    'Choose mapping, used to search index.',
    {
      required: true,
      choices: [
        'MOJANG',
        'YARN',
        'QUILTMC',
        'SPIGOT',
        { name: 'INTERMEDIARY(fabric)', value: 'INTERMEDIARY' },
        { name: 'HASHED(quiltmc)', value: 'HASHED' },
        { name: 'SEARGE(forge)', value: 'SEARGE' },
      ] as const,
    }
  )

  const type = useString('type', 'Search type', {
    required: true,
    choices: [
      'class',
      '~~method~~',
      '~~field~~',
      'Only class usable because I need to pay storage fee for method/field data.',
    ] as const,
  })

  const query: string | null = useString<Env>(
    'query',
    'Key word used to search',
    {
      async autocomplete(interaction, env, ctx) {
        let choices: Choice<string>[] = []
        if (!query || query.length <= 3) return choices
        const { results } = await env.NMS_INDEX.prepare(
          `SELECT mapping_value FROM ${mappingType}_${type} WHERE mapping_value LIKE ? COLLATE NOCASE LIMIT 10`
        )
          .bind(`%${query}%`)
          .all()
        if (!results) return ['Not found']
        // @ts-ignore
        results.forEach((e) => choices.push(String(e.mapping_value)))
        return choices
      },
      required: true,
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

  const selectId = useSelectMenu((interaction, env, ctx) => {
    // Array of selected values, e.g. ["1.12.2-a", "1.13.2-a"]
    const selected = interaction.data.values

    return {
      [$update]: true,
      content: `Selected: ${selected.join(', ')}`,
      // Using JSX will implicitly remove all components from the message unless
      // they're redefined as children. If you'd like to keep them, you can
      // remove this next line.
      components: [],
    }
  })

  return async (interaction, env, ctx) => {
    let data: D1Result<string> = await env.NMS_INDEX.prepare(
      `SELECT object_key FROM ${mappingType}_${type} WHERE mapping_value = ?`
    )
      .bind(query)
      .run()
    if (!data.results) return <Message ephemeral> No Result Found! </Message>
    const target: any = data.results[0]
    const targets = target.object_key.split(',')
    let option: { value: string; label: string }[] = []
    targets.forEach((t: string) => option.push({ value: t, label: t }))
    return {
      content: 'Select some options!',
      components: [
        {
          type: ComponentType.ACTION_ROW,
          components: [
            {
              type: ComponentType.SELECT_MENU,
              custom_id: selectId,
              placeholder: 'Choose version you want to look up.',
              min_values: 1,
              options: option,
            },
          ],
        },
      ],
    }
  }
}
