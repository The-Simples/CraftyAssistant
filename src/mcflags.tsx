import {
  CommandHandler,
  useDescription,
  useNumber,
  createElement,
  useString,
  Message,
  useBoolean,
  useNameLocalizations,
} from 'slshx'

// `Env` contains bindings and is declared in types/env.d.ts
export function mcflags(): CommandHandler<Env> {
  useDescription('Generate server or client startup flags')
  useNameLocalizations({
    'zh-CN': '生成服务器或者客户端的启动参数',
    'pt-BR': 'Gere as bandeiras de inicialização do servidor ou do cliente',
  })

  const flag = useNumber('flag', 'Choose flag that you want to use', {
    required: true,
    choices: [
      { name: "Aikar's Flag(G1GC)", value: FlagType.Aikar },
      {
        name: "Hilltty's Flag(Shenandoah) - Good at Client",
        value: FlagType.Hilltty,
      },
      {
        name: "1ByteBit's Flag(ZGC) - 20GB+ Memory Recommended",
        value: FlagType['1ByteBit'],
      },
      { name: "etil's Flag(G1GC) - Improved Aikar's", value: FlagType.etil },
    ],
    localizations: {
      name: {
        'zh-CN': '参数类型',
        'pt-BR': 'Tipo de bandeira',
      },
      description: {
        'zh-CN': '选择想用的参数',
        'pt-BR': 'Escolha a bandeira que deseja usar',
      },
    },
  })
  const memory = useNumber('memory', 'Allocated Memory(GB)', {
    required: true,
    min: 1,
    max: 64,
    localizations: {
      name: {
        'zh-CN': '内存分配',
        'pt-BR': 'Memória alocada',
      },
      description: {
        'zh-CN': '要分配的内存大小(GB)',
        'pt-BR': 'O tamanho da memória a alocar(GB)',
      },
    },
  })

  const win = useBoolean(
    'windows',
    'Default: false, Use true if you are on Windows System',
    {
      localizations: {
        name: {
          'zh-CN': 'windows',
        },
        description: {
          'zh-CN': '是 Windows 系统吗？ 默认为否，如果 Win 请选是',
          'pt-BR':
            'Está no sistema Windows? Padrão: falso, use verdadeiro se estiver no sistema Windows',
        },
      },
    }
  )

  const jarTargetName = useString('jar', 'Jar file name, default: server.jar', {
    minLength: 2,
    maxLength: 20,
    localizations: {
      name: {
        'zh-CN': '要启动的目标名称',
        'pt-BR': 'Nome do arquivo Jar a ser iniciado',
      },
      description: {
        'zh-CN': 'Jar 文件名称，默认为 server.jar',
        'pt-BR': 'Nome do arquivo Jar, padrão: server.jar',
      },
    },
  })

  const autoRestart = useBoolean(
    'restart',
    'Auto restart or not (Default: true)',
    {
      localizations: {
        name: {
          'zh-CN': '是否自动重启',
          'pt-BR': 'Reiniciar automaticamente ou não (Padrão: verdadeiro)',
        },
      },
    }
  )

  const enableGUI = useBoolean('gui', 'Use console GUI (Default: false)', {
    localizations: {
      name: {
        'zh-CN': '是否使用gui',
        'pt-BR': 'Use a GUI do console (Padrão: falso)',
      },
    },
  })
  const silent = useBoolean('silent', 'Message can(not) be viewed by others', {
    localizations: {
      name: {
        'zh-CN': '仅你可见',
        'pt-BR': 'Apenas você pode ver',
      },
      description: {
        'zh-CN': 'True 代表消息仅对你可见，False 代表发送到频道，每人可见',
        'pt-BR': 'Apenas você pode ver',
      },
    },
  })

  return async (interaction, env, ctx) => {
    let flagContent = FlagContent[flag]
    let jar = 'server.jar'
    if (flag == FlagType.Aikar || flag == FlagType.etil) {
      if (memory >= 12) {
        flagContent +=
          ' -XX:G1NewSizePercent=40 -XX:G1MaxNewSizePercent=50 -XX:G1HeapRegionSize=16M -XX:G1ReservePercent=15 -XX:InitiatingHeapOccupancyPercent=20'
      } else
        flagContent +=
          ' -XX:G1NewSizePercent=30 -XX:G1MaxNewSizePercent=40 -XX:G1HeapRegionSize=8M -XX:G1ReservePercent=20 -XX:InitiatingHeapOccupancyPercent=15'
    }
    if (jarTargetName)
      jar = `${jarTargetName}${jarTargetName.endsWith('jar') ? '' : '.jar'}`
    let file: File
    const args = flagContent.split(' ')
    const formattedArgs = formatArgs(...args)
    if (!win) {
      let startShell = `#!/bin/bash\n\nJAVA="java"\nJAR=${jar}\nRAM=${
        memory * 1024
      }M\nFLAG=\'${formattedArgs}\'`
      startShell += `\n\n${
        !autoRestart ? 'while [ true ]; do\n' : ''
      }   echo Starting server...\n   $JAVA -Xmx$RAM -Xms$RAM $FLAG -Dfile.encoding=UTF-8 -jar $JAR ${
        enableGUI ? '' : '--nogui'
      }`
      if (!autoRestart)
        startShell += `\n\n   echo Restarting server in 8s, Ctrl+C cancel it. \n   sleep 8s \ndone`
      file = new File([startShell], 'start.sh', { type: 'text/plain' })
    } else {
      let startBat = `@echo off \ntitle MC ${memory}G ${jar} ${
        !autoRestart ? 'AutoRestart\n\n:start' : '\n'
      }`
      startBat += `\nset JAVA="java"\nset JAR=${jar}\nset RAM=${
        memory * 1024
      }M\nset FLAG=\'${formattedArgs}\'`
      startBat += `\n\necho Starting server...\n%JAVA% -Xmx%RAM% -Xms%RAM% %FLAG% -Dfile.encoding=UTF-8 -jar %JAR$ ${
        enableGUI ? '' : '--nogui'
      }`
      if (!autoRestart)
        startBat += `\n\necho Restarting server in 8s, Ctrl+C cancel it. \ntimeout 8 \ngoto :start`
      file = new File([startBat], 'start.bat', { type: 'text/plain' })
    }

    return (
      <Message attachments={[file]} ephemeral={!!silent}>
        Here's a file:
      </Message>
    )
  }
}

const FlagType = {
  Aikar: 0, // https://docs.papermc.io/paper/aikars-flags
  Hilltty: 1, // https://github.com/hilltty/hilltty-flags/blob/main/english-lang.md
  '1ByteBit': 2, // https://github.com/1ByteBit/ZGC-For-Minecraft
  etil: 3, //https://github.com/etil2jz/etil-minecraft-flags
}

const FlagContent = [
  // Aikar - basic
  '-XX:+UseG1GC -XX:+ParallelRefProcEnabled -XX:MaxGCPauseMillis=200 -XX:+UnlockExperimentalVMOptions -XX:+DisableExplicitGC -XX:+AlwaysPreTouch' +
    ' -XX:G1HeapWastePercent=5 -XX:G1MixedGCCountTarget=4 -XX:G1MixedGCLiveThresholdPercent=90 -XX:G1RSetUpdatingPauseTimePercent=5 -XX:SurvivorRatio=32' +
    ' -XX:+PerfDisableSharedMem -XX:MaxTenuringThreshold=1 -Dusing.aikars.flags=https://mcflags.emc.gs -Daikars.new.flags=true',
  // Hilltty - full
  '-XX:+UseLargePages -XX:LargePageSizeInBytes=2M -XX:+UnlockExperimentalVMOptions -XX:+UseShenandoahGC -XX:ShenandoahGCMode=iu -XX:+UseNUMA -XX:+AlwaysPreTouch' +
    ' -XX:-UseBiasedLocking -XX:+DisableExplicitGC',
  // 1ByteBit - full
  '-XX:+UnlockExperimentalVMOptions -XX:+UseZGC -XX:+DisableExplicitGC -XX:+AlwaysPreTouch -XX:+PerfDisableSharedMem -XX:-ZUncommit -XX:+ParallelRefProcEnabled',
  // etil - basic
  '-XX:+UseG1GC -XX:+ParallelRefProcEnabled -XX:MaxGCPauseMillis=200 -XX:+UnlockExperimentalVMOptions -XX:+UnlockDiagnosticVMOptions -XX:+DisableExplicitGC' +
    ' -XX:+AlwaysPreTouch -XX:G1HeapWastePercent=5 -XX:G1MixedGCCountTarget=4 -XX:G1MixedGCLiveThresholdPercent=90 -XX:G1RSetUpdatingPauseTimePercent=5 -XX:SurvivorRatio=32' +
    ' -XX:+PerfDisableSharedMem -XX:MaxTenuringThreshold=1 -XX:-UseBiasedLocking -XX:UseAVX=3 -XX:+UseStringDeduplication -XX:+UseFastUnorderedTimeStamps' +
    ' -XX:+UseAES -XX:+UseAESIntrinsics -XX:UseSSE=4 -XX:+UseFMA -XX:AllocatePrefetchStyle=1 -XX:+UseLoopPredicate -XX:+RangeCheckElimination -XX:+EliminateLocks' +
    ' -XX:+DoEscapeAnalysis -XX:+UseCodeCacheFlushing -XX:+SegmentedCodeCache -XX:+UseFastJNIAccessors -XX:+OptimizeStringConcat -XX:+UseCompressedOops' +
    ' -XX:+UseThreadPriorities -XX:+OmitStackTraceInFastThrow -XX:+TrustFinalNonStaticFields -XX:ThreadPriorityPolicy=1 -XX:+UseInlineCaches -XX:+RewriteBytecodes' +
    ' -XX:+RewriteFrequentPairs -XX:+UseNUMA -XX:-DontCompileHugeMethods -XX:+UseFPUForSpilling -XX:+UseFastStosb -XX:+UseNewLongLShift -XX:+UseVectorCmov' +
    ' -XX:+UseXMMForArrayCopy -XX:+UseXmmI2D -XX:+UseXmmI2F -XX:+UseXmmLoadAndClearUpper -XX:+UseXmmRegToRegMoveAll -Xlog:async' +
    ' -Djava.security.egd=file:/dev/urandom --add-modules jdk.incubator.vector',
]

function formatArgs(...args: string[]): string {
  const maxLength = 50 // max length of a line
  let result = ''
  let currentLineLength = 0

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]

    if (currentLineLength + arg.length > maxLength) {
      // if the current line is too long, start a new line
      result += '\n'
      currentLineLength = 0
    }

    if (currentLineLength > 0) {
      // if the current line is not empty, add a space
      result += ' '
      currentLineLength++
    }

    result += arg
    currentLineLength += arg.length
  }

  return result
}
