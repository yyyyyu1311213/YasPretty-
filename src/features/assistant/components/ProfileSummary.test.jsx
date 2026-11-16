import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import ProfileSummary from './ProfileSummary'

describe('小Y画像摘要', () => {
  it('shows the original empty state and omits missing values and a zero budget', () => {
    const markup = renderToStaticMarkup(<ProfileSummary profile={{ budget: 0, city: '' }} />)
    expect(markup).toContain('当前偏好')
    expect(markup).toContain('对话中提到的肤质、妆效、场景和预算会显示在这里。')
    expect(markup).not.toContain('<dl>')
  })

  it('retains the five displayed fields, order and budget formatting', () => {
    const profile = { skin: '干皮', finish: '奶油肌', scene: '拍照', budget: 300, city: '杭州', tone: '暖调' }
    const tree = ProfileSummary({ profile })
    const rows = tree.props.children[1].props.children
    expect(rows.map((row) => row.props.children.map((item) => item.props.children))).toEqual([
      ['肤质', '干皮'], ['妆效', '奶油肌'], ['场景', '拍照'], ['预算', '300 元内'], ['常用城市', '杭州'],
    ])
    expect(renderToStaticMarkup(tree)).not.toContain('暖调')
  })
})
