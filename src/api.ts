const servers = 'https://sr-api.sfirew.com/server',
  render = 'https://visage.surgeplay.com',
  mojang = 'https://api.minecraftservices.com'

export interface MCUser {
  id: string
  name: string
}
export async function getUser(username: string): Promise<MCUser> {
  const data = await fetch(
    `${mojang}/minecraft/profile/lookup/name/${username}`
  )
  if (!data.ok) throw new TypeError('Getting user failed.')
  return await data.json()
}

export function renderView(user: MCUser) {
  return {
    skinBust: `${render}/bust/${user.id}`,
    skinView: `${render}/full/${user.id}`,
    download: `${render}/processedskin/${user.id}`,
    headView: `${render}/head/${user.id}`,
    headFace: `${render}/face/${user.id}`,
    gethead: {
      new: `/give @p minecraft:player_head{SkullOwner:"${user.name}"}`,
      old: `/give @p minecraft:skull 1 3 {SkullOwner:"${user.name}"}`,
    },
  }
}

export async function getServer(
  ip: string
): Promise<ServerInfo & { banner: string }> {
  const data = await fetch(`${servers}/${ip}`)
  const body = await data.json<ServerInfo>()
  return {
    banner: `${servers}/${ip}/banner/motd.png`,
    ...body,
  }
}

interface ServerInfo {
  ip: string
  port: number
  online: boolean
  isp: {
    name: string
    city: string
    location: string
    distance: string
  }
  hostname: string
  query_place: string
  query_host_id: string
  icon: string
  raw: string
  html: string
  info: {
    raw: any[]
    html: string
  }
  players: {
    max: number
    online: number
    sample: any[]
  }
  version: {
    name: string
    protocol: number
  }
  ping: number
}
