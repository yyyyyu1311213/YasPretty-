import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import SourceList from './SourceList'

describe('小Y来源列表', () => {
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
