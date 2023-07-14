import { env } from './env.js'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const username = 'ahdg6' // 替换为你的 GitHub 用户名
const repo = 'MC-Mapping' // 替换为你的仓库名
const accountId = env.kv.accountId
const objectNamespaceId = env.kv.objectNamespaceId
const apiToken = env.kv.apiToken
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const headers = {
  Authorization: `token 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`,
  Accept: 'application/vnd.github.v3+json',
}

createIndex().catch((e) => console.log(e))
let mappings = {}
async function createIndex() {
  // 使用 GitHub API 获取目录下的所有文件
  const dirResponse = await fetch(
    `https://api.github.com/repos/${username}/${repo}/contents/nms-mappings`,
    { headers: headers }
  )
  const dirData = await dirResponse.json()

  console.log(dirData)

  for (let i = 0; i < dirData.length; i++) {
    const file = dirData[i]

    if (file.name.endsWith('.json') && !file.name.includes('joined')) {
      const version = file.name.slice(0, -5)
      const response = await fetch(file.download_url)
      const mappingData = await response.text()
      processMappings(JSON.parse(mappingData), version)
    }
  }

  writeMappingsToFiles()

  console.log('All SQL files written successfully')
}

function processMappings(data, version) {
  for (const objectKey in data) {
    const object = data[objectKey]
    for (const mappingKey in object.mapping) {
      if (mappingKey === 'OBFUSCATED') {
        continue
      }

      let mappingValue = object.mapping[mappingKey]

      addMapping(mappingKey, mappingValue, `${version}-${objectKey}`, 'class')

      if (object.methods) {
        for (const methodKey in object.methods) {
          const method = object.methods[methodKey]
          for (const methodMappingKey in method.mapping) {
            if (methodMappingKey === 'OBFUSCATED') {
              continue
            }

            let methodMappingValue = method.mapping[methodMappingKey]

            addMapping(
              methodMappingKey,
              `${mappingValue}.${methodMappingValue}`,
              `${version}-${objectKey}.${methodKey}`,
              'method'
            )
          }
        }
      }

      if (object.fields) {
        for (const fieldKey in object.fields) {
          const field = object.fields[fieldKey]
          for (const fieldMappingKey in field.mapping) {
            if (fieldMappingKey === 'OBFUSCATED') {
              continue
            }

            let fieldMappingValue = field.mapping[fieldMappingKey]

            addMapping(
              fieldMappingKey,
              `${mappingValue}.${fieldMappingValue}`,
              `${version}-${objectKey}.${fieldKey}`,
              'field'
            )
          }
        }
      }
    }
  }
}

function addMapping(mappingKey, mappingValue, objectKey, type) {
  const key = `${mappingKey}-${type}-${mappingValue}`
  if (!mappings[key]) {
    mappings[key] = []
  }
  mappings[key].push(objectKey)
}

function writeMappingsToFiles() {
  for (const key in mappings) {
    const [mappingKey, type, mappingValue] = key.split('-')
    const objectKeys = mappings[key].join(',')
    writeMappingToFile(mappingKey, mappingValue, objectKeys, type)
  }
}

function writeMappingToFile(mappingKey, mappingValue, objectKeys, type) {
  const fileName = path.join(
    __dirname,
    '..',
    'sql',
    `${mappingKey}_${type}.sql`
  )
  const createTableStmt = `CREATE TABLE IF NOT EXISTS ${mappingKey}_${type} (mapping_value TEXT, object_key TEXT);\n`
  if (!fs.existsSync(fileName)) {
    fs.writeFileSync(fileName, createTableStmt)
  }
  const content = `INSERT OR IGNORE INTO ${mappingKey}_${type} (mapping_value, object_key) VALUES ('${mappingValue}', '${objectKeys}');\n`
  fs.appendFileSync(fileName, content)
}
