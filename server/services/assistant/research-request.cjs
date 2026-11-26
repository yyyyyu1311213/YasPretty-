// Keep search instructions out of keywords; preserve the requested topic and date.
function requestsWebSearch(query) {
  const text = String(query || '')
  if (/(?:不用|不要|无需|不必|别)(?:再)?(?:联网|上网|搜索|检索)/.test(text)) return false
  return /(?:联网|上网|网上|网络)(?:搜索|检索|查询|查|搜)|(?:搜索|检索|搜一下|搜一搜)/.test(text)
}

function buildResearchRequest(query, now = new Date()) {
  let keywords = String(query || '').trim()
    .replace(/^(?:(?:请|麻烦|帮我|帮忙|给我|替我)\s*)+/, '')
    .replace(/^(?:(?:联网|上网|网上|网络)?(?:搜索|检索|查询|查一下|查一查|搜一下|搜一搜|查|搜)(?:一下|一下子)?\s*[：:]?\s*)+/, '')
    .replace(/[，,；;。\s]*(?:(?:并|并且|同时|请|帮我)\s*)*(?:给出|提供|附上|列出|注明)(?:参考)?(?:来源|链接|出处)(?:和(?:来源|链接|出处))?[。！!？?\s]*$/, '')
    .replace(/[。！!？?]+$/, '').trim()
  const options = {}
  let date = null
  if (/今天|今日/.test(keywords)) {
    const parts = Object.fromEntries(new Intl.DateTimeFormat('zh-CN', {
      timeZone: 'Asia/Shanghai', year: 'numeric', month: 'numeric', day: 'numeric',
    }).formatToParts(now).map(({ type, value }) => [type, value]))
    const { year, month, day } = parts
    date = { iso: `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`, label: `${year}年${month}月${day}日` }
    keywords = keywords.replace(/(?:今天|今日)(?:的)?/g, `${date.label} `)
    options.recency = 'oneDay'
  } else if (/最近|近期|本周/.test(keywords)) options.recency = 'oneWeek'
  else if (/最新|本月/.test(keywords) && !/20\d{2}/.test(keywords)) options.recency = 'oneMonth'
  return { query: keywords.replace(/\s+/g, ' ').trim(), options, date }
}

function filterResearchResults(results, request) {
  if (!request.date) return results
  // A successful search alone does not prove that an article is from today.
  return results.filter((result) => {
    const published = String(result.publishDate || '').match(/^\d{4}-\d{2}-\d{2}/)?.[0]
    if (published) return published === request.date.iso
    const title = String(result.title || '')
    const [year, month, day] = request.date.iso.split('-').map(Number)
    return new RegExp(`${year}(?:年|[-/.])0?${month}(?:月|[-/.])0?${day}(?:日|\\b|\\s|$)`).test(title)
  })
}

module.exports = { requestsWebSearch, buildResearchRequest, filterResearchResults }
