import { expect, it } from 'vitest'
import { describeThirds } from './faceThirds'

it('uses projected proportions for layout and separately checks chin length', () => {
  const labels = (shares, chinShare) => describeThirds({ status: 'estimated', shares, chinShare }).notes.map(n => n[0])
  expect(labels([.39,.38,.23],null)).toEqual(['额头占比偏高','中庭偏长','下庭偏短'])
  expect(labels([.33,.28,.39],.32)).toEqual(['中庭偏短','下庭偏长','下巴段偏短'])
  expect(labels([.33,.34,.33],null)).toEqual(['三庭占比接近'])
})
it('never interprets incomplete or malformed segmentation measurements', () => {
  for (const data of [null,{status:'not_visible',shares:[.3,.4,.3]}, {status:'estimated',shares:[.5,.4,.3]}]) expect(describeThirds(data)).toBeNull()
})
