import {
  CommandHandler,
  useDescription,
  createElement,
  useString,
  Message,
  useBoolean,
  Embed,
  useDescriptionLocalizations,
} from 'slshx'
import * as mcapi from './api'

// `Env` contains bindings and is declared in types/env.d.ts
export function mcuser(): CommandHandler<Env> {
  useDescription('Lookup a Minecraft Account')
  useDescriptionLocalizations({
    'zh-CN': '查找一个MC正版用户',
    'pt-BR': 'Pesquise uma conta Minecraft',
  })

  const name = useString('username', 'The name of Minecraft account', {
    required: true,
    localizations: {
      name: {
        'zh-CN': '搜索正版账号',
        'pt-BR': 'conta',
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
        'pt-BR': '"True" só você vê a mensagem. "False" todos no canal veem.',
      },
    },
  })

  return async () => {
    let user
    try {
      user = await mcapi.getUser(name)
    } catch (e) {
      return <Message ephemeral> {e} </Message>
    }
    const view = mcapi.renderView(user)
    return (
      <Message ephemeral={!!silent}>
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
