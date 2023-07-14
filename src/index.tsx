import { createHandler } from 'slshx'
import { add } from './add'
import { modrinth } from './modrinth'
import { curseforge } from './curseforge'
import { mcuser } from './mcuser'
import { mcflags } from './mcflags'
import { spark } from './spark'
import { mcserver } from './mcserver'
import { mappings } from './mappings'

const handler = createHandler({
  // Replaced by esbuild when bundling, see scripts/build.js (do not edit)
  applicationId: SLSHX_APPLICATION_ID,
  applicationPublicKey: SLSHX_APPLICATION_PUBLIC_KEY,
  applicationSecret: SLSHX_APPLICATION_SECRET,
  testServerId: SLSHX_TEST_SERVER_ID,
  // Add your commands here
  commands: {
    add,
    modrinth,
    curseforge,
    mcuser,
    mcflags,
    mcserver,
    spark,
    mappings,
  },
})

export default { fetch: handler }
