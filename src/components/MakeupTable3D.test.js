import { describe, expect, it } from 'vitest'
import { COSMETIC_ITEMS, categoryForCosmetic } from './makeup-table-3d/cosmetics'
import { getScenePerformanceProfile } from './makeup-table-3d/performance-profile'

describe('3D 化妆桌受控数据', () => {
  it('只包含八件具有唯一 ID 的品类符号', () => {
    expect(COSMETIC_ITEMS).toHaveLength(8)
    expect(new Set(COSMETIC_ITEMS.map((item) => item.id)).size).toBe(8)
    expect(COSMETIC_ITEMS.map((item) => item.category)).toEqual(['粉底液', '眼影', '气垫', '睫毛膏', '遮瑕', '腮红', '散粉', '唇妆'])
  })

  it('每件妆具均有确定的桌面与炸开坐标并预留贴图接口', () => {
    COSMETIC_ITEMS.forEach((item) => {
      expect(item.initialPosition).toHaveLength(3)
      expect(item.explodedPosition).toHaveLength(3)
      expect(item.textureMap).toBeNull()
      expect(categoryForCosmetic(item.id)).toBe(item.category)
    })
  })

  it('移动端和资源受限设备使用单画布低负载档位', () => {
    expect(getScenePerformanceProfile({ width: 360, devicePixelRatio: 3, hardwareConcurrency: 8, deviceMemory: 8 })).toMatchObject({
      constrained: true,
      dpr: 1,
      antialias: false,
      contactShadowResolution: 128,
      showGhostCursor: false,
    })
    expect(getScenePerformanceProfile({ width: 1440, devicePixelRatio: 2, hardwareConcurrency: 4, deviceMemory: 4 })).toMatchObject({
      constrained: true,
      dpr: 1,
      showGhostCursor: false,
    })
  })

  it('桌面高性能档限制像素倍率并保留短时引导效果', () => {
    expect(getScenePerformanceProfile({ width: 1440, devicePixelRatio: 2, hardwareConcurrency: 12, deviceMemory: 16 })).toEqual({
      constrained: false,
      dpr: 1.25,
      antialias: true,
      contactShadowResolution: 256,
      showGhostCursor: true,
    })
  })
})
