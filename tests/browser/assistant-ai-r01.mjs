// Real page -> fetch -> Fastify -> assistant modules. Synthetic providers and fresh storage only.
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
require('dotenv').config = () => ({ parsed: {} })
const { buildApp } = require('../../server/app.cjs')
const { loadConfig } = require('../../server/config.cjs')
const { AppError } = require('../../server/errors.cjs')
const { chromium } = await import(process.env.YAS_QA_PLAYWRIGHT_MODULE || 'playwright')
const output = path.resolve(process.env.YAS_QA_OUTPUT_DIR || '.qa/ai-r01/browser')
await fs.mkdir(output, { recursive: true })
const laneige = '这个兰芝NEO小方块哑光气垫，15g是正装还是带替换芯？一个大概能用多久？平时放包里补妆方便吗？'
let scenario = 'success'
const calls = []
const provider = {
  configured: true, modelName: 'synthetic-ai-r01',
  async search(query) {
    calls.push({ tool: 'search', query })
    if (scenario === 'empty-search') return []
    if (scenario === 'search-timeout') throw new AppError('UPSTREAM_TIMEOUT', '合成检索超时', 504)
    return [{ title: 'AI-R01 合成检索来源', url: 'https://example.test/ai-r01', publisher: '测试', accessedAt: '2026-11-21T00:00:00.000Z', content: '合成数据仅验证来源链路，不代表商品核验结论。' }]
  },
  async chat(messages) {
    const prompt = messages[0].content
    calls.push({ tool: 'chat', type: prompt.includes('仅分类') ? 'classification' : prompt.includes('结构化妆容方案编排器') ? 'plan' : 'answer' })
    if (prompt.includes('仅分类')) return scenario === 'classification-valid' ? '{"intent":"external_question","confidence":0.95}' : '{"intent":"invented","confidence":1}'
    if (prompt.includes('结构化妆容方案编排器')) return '{}'
    if (scenario === 'model-timeout') throw new AppError('UPSTREAM_TIMEOUT', '合成回答超时', 504)
    if (scenario === 'model-invalid') return '[[PRODUCT:unknown-product]]'
    if (prompt.includes('已校验的事实与选择依据：')) return `合成模型表达：\n${prompt.split('已校验的事实与选择依据：\n')[1].split('\n\n本次请求条件')[0]}`
    if (prompt.includes('归类为：beauty_knowledge') && /区别|差别|不同/.test(messages.at(-1).content)) return '合成品类知识回答：这里解释两种底妆概念，不推荐具体商品。'
    if (prompt.includes('归类为：beauty_knowledge')) return messages.at(-1).content.includes('出油')
      ? '合成知识回答：底妆从薄层开始，把定妆集中在容易出油的位置。' : '合成教程：完成基础保湿，少量分区铺开粉底，边缘轻拍。'
    if (prompt.includes('归类为：product_fact')) {
      assert(prompt.includes('laneige-neo-matte'))
      assert(!prompt.includes('nars-light-reflecting'), 'Fact prompt contains only the resolved product')
      return '合成产品事实回答：仅凭15g无法确认正装与替换芯组合；使用时长取决于用量与频率。补妆携带还应确认包装密封。[1]\n[[PRODUCT:laneige-neo-matte]]'
    }
    return '合成通用回答：这是不依赖实时信息的说明。'
  },
}
const app = await buildApp({
  config: loadConfig({ NODE_ENV: 'production', ZHIPU_API_KEY: '', API_RATE_LIMIT_MAX: 10000, AI_RATE_LIMIT_MAX: 1000, AI_DAILY_LIMIT: 100000 }),
  logger: false, providers: { zhipu: provider, weather: { configured: false } },
})
const base = await app.listen({ host: '127.0.0.1', port: 0 })
const browser = await chromium.launch({ headless: true, ...(process.env.YAS_QA_BROWSER_EXECUTABLE ? { executablePath: process.env.YAS_QA_BROWSER_EXECUTABLE } : {}) })
const results = []
try {
  for (const width of [1440, 360]) {
    provider.configured = true
    scenario = 'success'
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' })
    await context.route(/^https:\/\//, (route) => route.fulfill({ status: 200, contentType: 'text/css', body: '' }))
    const page = await context.newPage()
    const errors = []
    const requests = []
    page.on('pageerror', (error) => errors.push(error.message))
    page.on('request', (request) => {
      const pathname = new URL(request.url()).pathname
      if (pathname.startsWith('/api/')) requests.push({ pathname, body: request.postDataJSON() })
    })
    await page.goto(base)
    await page.locator('.brand-opening').waitFor({ state: 'hidden' })
    const menu = page.getByRole('button', { name: '打开导航', exact: true })
    if (await menu.isVisible()) await menu.click()
    await page.getByRole('button', { name: '小Y智能选妆', exact: true }).filter({ visible: true }).click()
    const input = page.getByLabel('向小Y描述你的需求')
    const last = page.locator('.xiaoy-message.assistant:not(.loading)').last()
    const profile = () => page.evaluate(() => JSON.parse(localStorage.getItem('yaspretty-xiaoy-profile-v1')).value)
    const ids = () => page.evaluate(() => JSON.parse(localStorage.getItem('yaspretty-xiaoy-messages-v1')).value.at(-1).productIds)
    async function send(text, offline = false) {
      const count = await page.locator('.xiaoy-message:not(.loading)').count()
      const before = requests.length
      await input.fill(text)
      await input.press('Enter')
      await page.waitForFunction((count) => document.querySelectorAll('.xiaoy-message:not(.loading)').length === count + 2, count)
      if (!offline) {
        assert.equal(requests.length, before + 1, 'Every online chat sends exactly one application request')
        assert.equal(requests.at(-1).pathname, '/api/assistant')
        assert.equal(requests.at(-1).body.query, text)
      }
      return last.innerText()
    }
    async function check(name, action, screenshot = false) {
      await action()
      const geometry = await page.evaluate(() => {
        const chat = document.querySelector('.xiaoy-messages')
        const input = document.querySelector('.xiaoy-composer input').getBoundingClientRect()
        const button = document.querySelector('.xiaoy-composer button').getBoundingClientRect()
        return { document: document.documentElement.scrollWidth, chat: chat.clientWidth, chatScroll: chat.scrollWidth, inputRight: input.right, buttonLeft: button.left }
      })
      assert(geometry.document <= width + 1 && geometry.chatScroll <= geometry.chat + 1, `${name}: horizontal overflow`)
      assert(geometry.inputRight <= geometry.buttonLeft + 1, `${name}: composer overlaps`)
      if (screenshot) {
        await page.locator('.xiaoy-chat').scrollIntoViewIfNeeded()
        await page.locator('.xiaoy-messages').evaluate((element) => element.scrollTo({ top: element.scrollHeight, behavior: 'instant' }))
        await page.screenshot({ path: path.join(output, `${width}-${name}.png`) })
      }
      results.push({ width, name, passed: true, geometry })
    }
    await check('brand-category-followup', async () => {
      provider.configured = false
      calls.length = 0
      const reply = await send('ysl粉底液怎么样')
      await page.screenshot({ path: path.join(output, `${width}-ysl-observed.png`) })
      assert(!reply.includes('还不能唯一确定'))
      assert.deepEqual(await ids(), ['ysl-all-hours'])
      assert(!reply.includes('替换芯'))
      const followup = await send('都可以')
      assert(!followup.includes('请补充具体需求'))
      assert.deepEqual(await ids(), ['ysl-all-hours'])
      assert.deepEqual(await profile(), {})
      assert.deepEqual(calls, [])
      provider.configured = true
    }, true)
    await check('clarification-choice-followup', async () => {
      provider.configured = false
      assert((await send('ysl怎么样')).includes('完整名称或版本'))
      assert.deepEqual(await ids(), ['ysl-touche-eclat', 'ysl-all-hours'])
      assert(!(await send('都可以')).includes('请补充具体需求'))
      assert.deepEqual(await ids(), ['ysl-touche-eclat', 'ysl-all-hours'])
      await send('ysl怎么样')
      await send('粉底液那款')
      assert.deepEqual(await ids(), ['ysl-all-hours'])
      assert.deepEqual(await profile(), {})
      provider.configured = true
    }, true)
    await check('implicit-product-followup', async () => {
      provider.configured = false
      await send('ysl粉底液怎么样')
      const reply = await send('多少钱')
      await page.screenshot({ path: path.join(output, `${width}-implicit-price-observed.png`) })
      assert.deepEqual(await ids(), ['ysl-all-hours'])
      assert(reply.includes('无法联网确认'))
      assert((await send('有几个色号')).includes('色号'))
      assert.deepEqual(await ids(), ['ysl-all-hours'])
      assert((await send('持妆多久')).includes('持妆'))
      assert.deepEqual(await ids(), ['ysl-all-hours'])
      assert.deepEqual(await profile(), {})
      provider.configured = true
    }, true)
    await check('clarification-retains-question', async () => {
      provider.configured = false
      await send('ysl多少钱')
      assert((await send('第二款')).includes('无法联网确认'))
      assert.deepEqual(await ids(), ['ysl-all-hours'])
      provider.configured = true
    })
    await check('third-person-profile', async () => {
      const before = await profile()
      await send('我朋友说，预算200元，想要哑光气垫')
      assert.deepEqual(await profile(), before)
      await send('YSL售价300元左右')
      assert.deepEqual(await profile(), before)
    })
    await check('request-conditions', async () => {
      await send('我是油皮，预算1000元')
      const before = await profile()
      const reply = await send('推荐适合干皮、不超过600元的粉底液')
      assert(reply.includes('适用肤质包含干皮'))
      assert(!reply.includes('适用肤质包含油皮'))
      assert((await ids()).length > 0)
      assert.deepEqual(await profile(), before)
      assert((await send('推荐一款不超过300元的YSL粉底液')).includes('没有同时满足'))
      assert.deepEqual(await ids(), [])
    }, true)
    await check('category-technique-routing', async () => {
      assert((await send('气垫怎么用')).includes('合成教程'))
      assert.deepEqual(await ids(), [])
      assert((await send('我用粉底总起皮')).includes('合成教程'))
      assert.deepEqual(await ids(), [])
    })
    await check('external-shopping', async () => {
      assert((await send('给我推荐电脑')).includes('合成通用回答'))
      assert.deepEqual(await ids(), [])
    })
    await page.getByRole('button', { name: '重新开始', exact: true }).click()
    await check('no-key-category-knowledge', async () => {
      provider.configured = false
      calls.length = 0
      const reply = await send('粉底和气垫有什么区别')
      await page.screenshot({ path: path.join(output, `${width}-category-knowledge-observed.png`) })
      assert(reply.includes('知识问题') && reply.includes('暂时无法'))
      assert(!reply.includes('先确认你的肤质'))
      assert.deepEqual(await ids(), [])
      assert.deepEqual(await profile(), {})
      assert.deepEqual(calls, [])
      provider.configured = true
    }, true)
    await check('recommendation', async () => {
      calls.length = 0
      assert((await send('我是油皮，预算400元，推荐气垫')).includes('在预算内'))
      assert((await ids()).length > 0)
      assert.deepEqual(calls, [{ tool: 'chat', type: 'answer' }], 'Clear recommendation skips classification but still permits grounded expression')
    })
    await check('category-knowledge', async () => {
      const before = await profile()
      const reply = await send('粉底和气垫有什么区别')
      assert(reply.includes('合成品类知识回答'))
      assert.deepEqual(await ids(), [])
      assert.deepEqual(await profile(), before)
    })
    await check('tutorial', async () => {
      assert((await send('粉底怎么涂')).includes('合成教程'))
      assert.deepEqual(await ids(), [])
    }, true)
    await check('oily-base-knowledge', async () => {
      assert((await send('底妆出油怎么办')).includes('合成知识回答'))
      assert.deepEqual(await ids(), [])
    })
    await check('laneige-fact', async () => {
      calls.length = 0
      const before = await profile()
      assert((await send(laneige)).includes('合成产品事实回答'))
      assert.deepEqual(await profile(), before)
      assert.equal((await profile()).budget, 400)
      assert.deepEqual(calls.map((call) => call.tool), ['search', 'chat'])
      assert.deepEqual(await ids(), ['laneige-neo-matte'])
      assert.equal(await last.getByRole('link', { name: /合成检索来源/ }).count(), 1)
    }, true)
    await check('profile-self-report', async () => {
      await send('我是干皮')
      assert.equal((await profile()).skin, '干皮')
      await send(laneige)
      await send('这款适合油皮吗')
      assert.equal((await profile()).skin, '干皮')
      assert(!(await profile()).finish)
      const beforeUncertain = await profile()
      await send('我是干皮还是油皮')
      await send('我想要不哑光的气垫')
      assert.deepEqual(await profile(), beforeUncertain)
    })
    await check('comparison-and-latter', async () => {
      await send('比较超方瓶粉底液和NEO小方块哑光气垫')
      assert.deepEqual(await ids(), ['nars-light-reflecting', 'laneige-neo-matte'])
      await send('后一款适合干皮吗')
      assert.deepEqual(await ids(), ['laneige-neo-matte'])
      assert.deepEqual(requests.at(-1).body.messages.at(-1).productIds, ['nars-light-reflecting', 'laneige-neo-matte'])
    }, true)
    await check('ambiguous-brand', async () => {
      assert((await send('NARS适合干皮吗')).includes('完整名称或版本'))
      assert.deepEqual(await ids(), [])
    })
    await check('ambiguous-reference', async () => {
      assert((await send('这个适合干皮吗')).includes('产品名称和版本'))
      assert.deepEqual(await ids(), [])
    }, true)
    await check('plan-via-assistant', async () => {
      const reply = await send('给我完整妆容')
      assert(reply.includes('1. 妆前') && reply.includes('7. 唇妆') && reply.includes('已降级'))
    })
    await check('external', async () => assert((await send('解释一下光的折射')).includes('合成通用回答')))
    await check('classification-invalid', async () => {
      scenario = 'classification-invalid'
      assert((await send('帮我看看那个情况')).includes('请补充具体需求'))
      assert.deepEqual(await ids(), [])
    })
    await check('classification-valid', async () => {
      scenario = 'classification-valid'
      assert((await send('想聊聊那个原由')).includes('合成通用回答'))
    })
    await check('sensitive', async () => {
      calls.length = 0
      assert((await send('新产品用了以后红肿刺痛怎么办')).includes('停止使用'))
      assert.deepEqual(calls, [])
      assert.deepEqual(await ids(), [])
    })
    for (scenario of ['empty-search', 'search-timeout']) await check(scenario, async () => {
      assert((await send(laneige)).includes('联网检索当前不可用'))
      assert.deepEqual(await ids(), [])
    })
    for (scenario of ['model-timeout', 'model-invalid']) await check(scenario, async () => {
      assert((await send('粉底怎么涂')).includes('已降级为受控知识库'))
      assert.deepEqual(await ids(), [])
      const reply = await send('粉底和气垫有什么区别')
      assert(reply.includes('知识问题') && reply.includes('暂时无法'))
      assert(!reply.includes('先确认你的肤质'))
      assert.deepEqual(await ids(), [])
    })
    await check('search-model-failure', async () => assert((await send(laneige)).includes('已降级为搜索结果摘要')))
    await check('catalog-expression-failure', async () => {
      assert((await send('ysl粉底液怎么样')).includes('已降级为站内资料回答'))
      assert.deepEqual(await ids(), ['ysl-all-hours'])
    })
    scenario = 'success'
    provider.configured = false
    await check('no-key-recommendation', async () => assert((await send('我是油皮，预算400元，推荐气垫')).includes('智能服务未配置')))
    await check('no-key-fact', async () => assert((await send(laneige)).includes('无法联网确认')))
    await check('no-key-knowledge', async () => assert((await send('粉底怎么涂')).includes('受控知识库')))
    await check('no-key-plan', async () => assert((await send('给我完整妆容')).includes('7. 唇妆')))
    await check('no-key-external', async () => {
      assert((await send('解释一下光的折射')).includes('智能服务当前不可用'))
      assert.deepEqual(await ids(), [])
    })
    await check('workbench-original-api', async () => {
      const before = requests.length
      await page.getByRole('button', { name: '创建我的妆容方案', exact: true }).click()
      await page.locator('.makeup-workbench-state').filter({ hasText: '已生成' }).waitFor()
      assert.equal(requests.length, before + 1)
      assert.equal(requests.at(-1).pathname, '/api/makeup-plans')
    })
    await context.setOffline(true)
    await check('offline-recommendation', async () => {
      assert((await send('我是油皮，预算400元，推荐气垫', true)).includes('网络不可用，已降级'))
      assert((await ids()).length > 0)
    }, true)
    await check('offline-tutorial', async () => {
      assert((await send('粉底怎么涂', true)).includes('智能服务当前不可用'))
      assert.deepEqual(await ids(), [])
    })
    await check('offline-category-knowledge', async () => {
      const reply = await send('粉底和气垫有什么区别', true)
      assert(reply.includes('智能服务当前不可用'))
      assert(!reply.includes('先确认你的肤质'))
      assert.deepEqual(await ids(), [])
    })
    await check('offline-external-shopping', async () => {
      assert((await send('给我推荐电脑', true)).includes('智能服务当前不可用'))
      assert.deepEqual(await ids(), [])
    })
    await check('offline-request-conditions', async () => {
      const before = await profile()
      const reply = await send('推荐适合干皮、不超过600元的粉底液', true)
      assert(reply.includes('已降级') && reply.includes('适合干皮'))
      assert(!reply.includes('需求（油皮）'))
      assert.deepEqual(await profile(), before)
    }, true)
    await check('offline-plan', async () => assert((await send('给我完整妆容', true)).includes('7. 唇妆')))
    await context.setOffline(false)
    await page.reload()
    assert.equal((await profile()).budget, 400)
    assert.equal((await profile()).skin, '油皮')
    assert.deepEqual(errors, [])
    await context.close()
  }
  await fs.writeFile(path.join(output, 'results.json'), JSON.stringify({ finishedAt: new Date().toISOString(), browser: browser.version(), results }, null, 2))
  console.log(`${results.length}/${results.length} AI-R01 real page scenarios passed`)
} catch (error) {
  await fs.writeFile(path.join(output, 'failed-run.json'), JSON.stringify({ finishedAt: new Date().toISOString(), results, error: error.message }, null, 2))
  throw error
} finally {
  await browser.close()
  await app.close()
}
