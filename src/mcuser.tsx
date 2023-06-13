import {
  CommandHandler,
  useDescription,
  createElement,
  useString,
  Message,
  useBoolean,
  Choice,
  Embed,
  useNameLocalizations,
  useDescriptionLocalizations,
} from 'slshx'
import * as mcapi from './api'

// `Env` contains bindings and is declared in types/env.d.ts
export function mcuser(): CommandHandler<Env> {
  useDescription('Lookup a MoJang Account')
  useDescriptionLocalizations({
    'zh-CN': '查找一个MC正版用户',
  })

  const name = useString('mojang', 'The name of MoJang account', {
    required: true,
    localizations: {
      name: {
        'zh-CN': '搜索正版账号',
      },
      description: {
        'zh-CN': '用于搜索的词语',
        'pt-BR': 'A palavra para pesquisar',
      },
    },
    minLength: 2,
    maxLength: 20,
  })

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

  return async () => {
    const user = await mcapi.getUser(name)
    if (!user) return <Message ephemeral> No such user </Message>
    const view = mcapi.renderView(user)
    return (
      <Message>
        <Embed
          color={0x0094ff}
          thumbnail={view.skinView}
          author={{ name: `${user.name} - ${user.id}`, iconUrl: view.headFace }}
        >
          1.12: `{view.gethead.old}` {'\n'}
          1.13: `{view.gethead.new}`
        </Embed>
      </Message>
    )
  }
}
