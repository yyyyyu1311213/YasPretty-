import { describe, expect, it } from 'vitest'
import { statusOptions, setCollectionStatus, removeCollectionProduct, getCollectionCount, getCollectionProducts } from './collectionUtils'

describe('collection state transformations', () => {
  it('retains the three original status values and their order', () => {
    expect(statusOptions).toEqual(['想买', '正在用', '会回购'])
    expect(getCollectionCount({})).toBe(0)
    expect(getCollectionProducts([], {})).toEqual([])
  })

  it('adds by stable ID without changing the original object or existing insertion order', () => {
    const original = Object.freeze({ second: '正在用' })
    const next = setCollectionStatus(original, 'first', '想买')
    expect(next).toEqual({ second: '正在用', first: '想买' })
    expect(Object.keys(next)).toEqual(['second', 'first'])
    expect(original).toEqual({ second: '正在用' })
  })

  it.each(['想买', '正在用', '会回购'].flatMap((from) => ['想买', '正在用', '会回购'].map((to) => [from, to])))('switches %s to %s and retains other products', (from, to) => {
    const original = Object.freeze({ first: from, second: '会回购' })
    const next = setCollectionStatus(original, 'first', to)
    expect(next).toEqual({ first: to, second: '会回购' })
    expect(next).not.toBe(original)
    expect(Object.keys(next)).toEqual(['first', 'second'])
    expect(original.first).toBe(from)
  })

  it('removes only the requested ID, including an absent ID, without changing the old state', () => {
    const original = Object.freeze({ first: '正在用', second: '想买' })
    expect(removeCollectionProduct(original, 'first')).toEqual({ second: '想买' })
    expect(removeCollectionProduct(original, 'missing')).toEqual(original)
    expect(removeCollectionProduct(original, 'missing')).not.toBe(original)
    expect(original).toEqual({ first: '正在用', second: '想买' })
  })

  it('keeps the count/list distinction and catalog order for unknown and falsy records', () => {
    const first = { id: 'first' }, second = { id: 'second' }, third = { id: 'third' }
    const catalog = Object.freeze([first, second, third])
    const collection = { third: '会回购', first: '正在用', unknown: '想买', second: '' }
    expect(getCollectionCount(collection)).toBe(4)
    const favorites = getCollectionProducts(catalog, collection)
    expect(favorites).toEqual([first, third])
    expect(favorites[0]).toBe(first)
    expect(favorites[1]).toBe(third)
    expect(catalog).toEqual([first, second, third])
  })

  it('does not silently validate or normalize previously accepted states', () => {
    expect(setCollectionStatus({}, 'id', '旧自定义值')).toEqual({ id: '旧自定义值' })
    expect(getCollectionCount([])).toBe(0)
    expect(() => getCollectionCount(null)).toThrow(TypeError)
  })
})
