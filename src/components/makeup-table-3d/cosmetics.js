/**
 * Geometry-only display props. These are category symbols, not replicas of
 * catalog products. textureMap is reserved for a future locally hosted asset.
 */
export const COSMETIC_ITEMS = [
  { id: 'foundation', name: '粉底液', category: '粉底液', geometryType: 'foundation', color: '#e7a49f', accent: '#e2bd7e', initialPosition: [-3.05, .25, -.28], explodedPosition: [-3.45, 3.45, .25], rotation: [0, -.15, 0], explodedRotation: [.18, -.85, -.18], textureMap: null },
  { id: 'eyeshadow', name: '眼影盘', category: '眼影', geometryType: 'eyeshadow', color: '#ca8b91', accent: '#f0d4bc', initialPosition: [-1.95, .25, -.18], explodedPosition: [-2.25, 4.45, .05], rotation: [0, .08, 0], explodedRotation: [-.18, .75, .18], textureMap: null },
  { id: 'cushion', name: '气垫', category: '气垫', geometryType: 'cushion', color: '#efc7c2', accent: '#d9ad71', initialPosition: [-2.25, .25, 1.05], explodedPosition: [-.7, 4.8, -.1], rotation: [0, 0, 0], explodedRotation: [.28, 1.2, -.12], textureMap: null },
  { id: 'mascara', name: '睫毛膏', category: '睫毛膏', geometryType: 'mascara', color: '#82545a', accent: '#e1b575', initialPosition: [.8, .25, -.18], explodedPosition: [2.2, 4.45, .05], rotation: [0, .1, -.08], explodedRotation: [-.12, 1.8, .25], textureMap: null },
  { id: 'concealer', name: '遮瑕', category: '遮瑕', geometryType: 'concealer', color: '#e2b09f', accent: '#f3dfcb', initialPosition: [2.75, .25, -.28], explodedPosition: [3.45, 3.45, .25], rotation: [0, -.08, 0], explodedRotation: [.2, 2.2, -.22], textureMap: null },
  { id: 'blush', name: '腮红', category: '腮红', geometryType: 'blush', color: '#e6939d', accent: '#efd2b6', initialPosition: [-.35, .25, -.45], explodedPosition: [2.45, 1.9, 1.05], rotation: [0, .12, 0], explodedRotation: [-.25, 2.55, .16], textureMap: null },
  { id: 'powder', name: '散粉', category: '散粉', geometryType: 'powder', color: '#f4d5ca', accent: '#c99a6b', initialPosition: [.85, .25, 1.12], explodedPosition: [-.05, 1.9, 1.55], rotation: [0, -.08, 0], explodedRotation: [.2, 3.05, -.2], textureMap: null },
  { id: 'lip', name: '唇釉', category: '唇妆', geometryType: 'lip', color: '#bd6672', accent: '#e2b477', initialPosition: [2.25, .25, 1.02], explodedPosition: [-2.5, 1.95, 1.05], rotation: [0, .14, 0], explodedRotation: [-.18, 3.5, .22], textureMap: null },
]

export function categoryForCosmetic(id) {
  return COSMETIC_ITEMS.find((item) => item.id === id)?.category || null
}
