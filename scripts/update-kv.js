import fs from 'fs'
import YAML from 'yaml'
import { env } from './env.js'
import path from 'path'
import { fileURLToPath } from 'url'

const accountId = env.kv.accountId
const namespaceId = env.kv.namespaceId
const apiToken = env.kv.apiToken
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

writeConf().catch((e) => console.log(e))
async function writeConf() {
  const files = {
    plugins: {
      paper: './analysis_config/plugins/paper.yml',
      purpur: './analysis_config/plugins/purpur.yml',
    },
    config: {
      server_properties: './analysis_config/server.properties.yml',
      bukkit: './analysis_config/bukkit.yml',
      spigot: './analysis_config/spigot.yml',
      paper: './analysis_config/paper.yml',
      purpur: './analysis_config/purpur.yml',
    },
  }
  fetch('https://api.modrinth.com/v2/tag/game_version').then(async (res) => {
    const kvKey = 'versions'
    const generatePath = path.resolve(
      __dirname,
      '..',
      'data',
      'CHECK_CONF',
      kvKey
    )
    const versions = await res.json()
    let choices = []
    const matching = versions.filter((v) => v.version_type === 'release')
    for (const v of matching) {
      choices.push(v.version)
    }
    choices = JSON.stringify(choices)
    fs.writeFile(generatePath, choices, (err) => {
      if (err) {
        console.error('Failed to write file:', err)
      } else {
        console.log(`File written successfully at ${generatePath}`)
      }
    })
    await putToKV(kvKey, choices)
  })

  for (const category in files) {
    for (const key in files[category]) {
      const filePath = files[category][key]
      const fileContent = await fs.promises
        .readFile(filePath)
        .then((data) => data.toString())
      const yamlData = JSON.stringify(YAML.parse(fileContent))
      const kvKey = `${category}.${key}`

      const generatePath = path.resolve(
        __dirname,
        '..',
        'data',
        'CHECK_CONF',
        kvKey
      )
      fs.writeFile(generatePath, yamlData, (err) => {
        if (err) {
          console.error('Failed to write file:', err)
        } else {
          console.log(`File written successfully at ${generatePath}`)
        }
      })
      await putToKV(kvKey, yamlData)
    }
  }
}

async function putToKV(kvKey, kvValue) {
  if (!apiToken) {
    console.log('Needed API')
    return
  }
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/values/${kvKey}`

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
    body: kvValue,
  })

  console.log(await response.json())
}
