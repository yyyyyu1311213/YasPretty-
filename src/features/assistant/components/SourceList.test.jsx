import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import SourceList from './SourceList'

describe('小Y来源列表', () => {
  it('omits product evidence and its source section from the visible answer', () => {
    expect(SourceList({ sources: [{ kind: 'product', id: 'sample:manual', title: '合成规格证据', url: null,
      accessedAt: '2026-11-01', status: 'recorded', version: '哑光版', sku: null, evidenceLabel: '内部归档：核验表第2行', supports: ['净含量'], limitations: ['不证明包含替换芯。'] }] })).toBeNull()
  })
  it('omits the entire source section for absent or empty sources', () => {
    expect(SourceList({})).toBeNull()
    expect(SourceList({ sources: [] })).toBeNull()
  })

  it('preserves source order, original URLs, numbering and safe new-tab attributes', () => {
    const sources = [
      { title: '合成来源一', url: 'https://example.test/one', kind: 'web' },
      { title: '合成来源二', url: 'https://example.test/two', kind: 'knowledge' },
    ]
    const tree = SourceList({ sources })
    expect(tree.props.className).toBe('xiaoy-sources')
    const links = tree.props.children[1]
    expect(links.map((link) => link.props.href)).toEqual(sources.map(({ url }) => url))
    for (const [index, link] of links.entries()) {
      expect(link.type).toBe('a')
      expect(link.props).toMatchObject({ target: '_blank', rel: 'noreferrer' })
      expect(link.props.children[0].props.children).toEqual(['[', index + 1, ']'])
      expect(link.props.children[1]).toBe(sources[index].title)
    }
    expect(renderToStaticMarkup(tree)).toContain('参考来源')
  })
})
