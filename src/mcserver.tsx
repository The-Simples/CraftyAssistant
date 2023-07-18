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
export function mcserver(): CommandHandler<Env> {
  useDescription('Search a Minecraft Server')
  useDescriptionLocalizations({
    'zh-CN': '检索一个MC服务器的信息',
    'pt-BR': 'Pesquise um servidor Minecraft',
  })

  const ip = useString(
    'ip',
    'Server IP with port, default port is 25565, you can assign port with :',
    {
      required: true,
      localizations: {
        name: {
          'zh-CN': '服务器地址',
        },
        description: {
          'zh-CN': '用于搜索的服务器地址，默认端口25565，可 : 指派端口',
          'pt-BR':
            'IP do servidor com porta, a porta padrão é 25565, você pode atribuir a porta com :',
        },
      },
      minLength: 2,
      maxLength: 20,
    }
  )

  const silent = useBoolean('silent', 'Message can(not) be viewed by others', {
    localizations: {
      name: {
        'zh-CN': '仅你可见',
        'pt-BR': 'Apenas você pode ver',
      },
      description: {
        'zh-CN': 'True 代表消息仅对你可见，False 代表发送到频道，每人可见',
        'pt-BR': 'Verdadeiro significa que a mensagem só pode ser vista por você, Falso significa que ela será enviada para o canal e todos podem vê-la',
      },
    },
  })

  return async () => {
    const domainRegex = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}(:[0-9]{1,5})?$/
    if (!domainRegex.test(ip)) return <Message ephemeral> Oh! </Message>
    const server = await mcapi.getServer(ip)

    if (!server) return <Message ephemeral> Query Failed </Message>
    return (
      <Message ephemeral={!!silent}>
        <Embed color={0x0094ff} image={server.banner}>
          Online Mode:{String(server.online)} Version: {server.version.name}{' '}
          {'\n'}
          ISP: {server.isp.name} City: {server.isp.city}
        </Embed>
      </Message>
    )
  }
}
