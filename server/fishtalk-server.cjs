const { buildApp } = require('./app.cjs')
const { loadConfig } = require('./config.cjs')

async function start() {
  const config = loadConfig()
  const app = await buildApp({ config })

  try {
    const address = await app.listen({ host: config.host, port: config.port })
    app.log.info({ address }, 'YasPretty API gateway started')
    console.log(`YasPretty API 网关已启动：${address}`)
    console.log(`智谱服务：${config.zhipuApiKey ? '已由服务端配置' : '未配置（本地推荐与天气仍可用）'}`)
  } catch (error) {
    if (error.code === 'EADDRINUSE') {
      console.error(`端口 ${config.port} 已被占用。请关闭旧服务或设置 FISHTALK_PORT。`)
    } else {
      console.error('YasPretty API 网关启动失败。')
    }
    await app.close().catch(() => {})
    process.exitCode = 1
  }
}

if (require.main === module) start()

module.exports = { start }
