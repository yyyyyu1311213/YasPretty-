import { describe, expect, it } from 'vitest'
import { analyzeFaceFeatures, describeFaceFeatures, describeFaceContour } from './faceFeatures'
import { buildFaceMakeupReport } from './faceMakeupReport'

// Explicit geometric fixtures, not accuracy claims about real faces.
function face({ aperture = .28, jawHeight = 120 } = {}) {
  const p = Array.from({ length: 68 }, () => [100, 100, 0])
  for (let i = 0; i < 17; i++) p[i] = [100 - 100 * Math.cos(i * Math.PI / 16), 80 + jawHeight * Math.sin(i * Math.PI / 16), 0]
  for (let i = 17; i <= 21; i++) p[i] = [30 + (i - 17) * 13.75, -6, 0]
  for (let i = 22; i <= 26; i++) p[i] = [115 + (i - 22) * 13.75, -6, 0]
  p[27] = [100, 30, 0]; p[30] = [100, 115, 0]
  p[31] = [80, 115, 0]; p[35] = [120, 115, 0]
  for (const [start, x] of [[36, 40], [42, 120]]) {
    const h = 40 * aperture / 2
    ;[[x,60],[x+12,60-h],[x+28,60-h],[x+40,60],[x+28,60+h],[x+12,60+h]].forEach((q,i) => { p[start+i]=[...q,0] })
  }
  p[48]=[70,150,0]; p[54]=[130,150,0]
  for (const [top, inside, bottom, innerBottom, x] of [[50,61,58,67,88],[51,62,57,66,100],[52,63,56,65,112]]) {
    p[top]=[x,144,0];p[inside]=[x,150,0];p[bottom]=[x,162,0];p[innerBottom]=[x,152,0]
  }
  return {landmarks:p,yaw:0,qualityIssues:[]}
}
const codes = (result) => Object.fromEntries(Object.entries(analyzeFaceFeatures(result)).map(([k,v])=>[k,v.code]))

describe('conservative face shape interpretation', () => {
  it('only classifies brows, eyes and nose; face shape stays self-selected', () => {
    expect(codes(face())).toEqual({brow:'straight',eyes:'almond',nose:'balanced'})
    expect(codes(face({aperture:.38})).eyes).toBe('round')
    expect(codes(face({aperture:.20})).eyes).toBe('elongated')
    expect(describeFaceContour()).toMatchObject({code:'unknown',source:'unknown',value:'选择你的脸型'})
    expect(describeFaceContour('square')).toMatchObject({code:'square',source:'user',value:'方脸（自选）'})
    expect(describeFaceContour('invented').code).toBe('unknown')
  })
  it('keeps names and references stable under translation, scaling and head roll', () => {
    const original=face(), angle=170*Math.PI/180
    const transformed={...original,landmarks:original.landmarks.map(([x,y,z])=>[3*(x*Math.cos(angle)-y*Math.sin(angle))+290,3*(x*Math.sin(angle)+y*Math.cos(angle))-85,z])}
    expect(analyzeFaceFeatures(transformed)).toEqual(analyzeFaceFeatures(original))
  })
  it('withholds unreliable eye types instead of forcing a name', () => {
    expect(codes(face({aperture:.32})).eyes).toBe('unknown')
    expect(codes(face({aperture:.05})).eyes).toBe('unknown')
    const wink=face();wink.landmarks[41][1]=wink.landmarks[37][1];wink.landmarks[40][1]=wink.landmarks[38][1]
    expect(codes(wink).eyes).toBe('unknown')
  })
  it('distinguishes curved brows without changing other features', () => {
    const changed=face()
    for(const i of [18,20,23,25]) changed.landmarks[i][1]-=8
    for(const i of [19,24]) changed.landmarks[i][1]-=13
    for(const i of [50,51,52]) changed.landmarks[i][1]=135
    expect(codes(changed)).toMatchObject({brow:'curved',eyes:'almond',nose:'balanced'})
  })
  it('rejects quality problems, side views and invalid geometry', () => {
    for(const input of [{...face(),yaw:30},{...face(),qualityIssues:['照片可能模糊']},{...face(),landmarks:[]},{...face(),landmarks:Array.from({length:68},()=>[0,0,0])}]) {
      expect(Object.values(codes(input)).every(x=>x==='unknown')).toBe(true)
    }
  })
  it('shows results immediately and marks corrections as user choices', () => {
    expect(describeFaceFeatures(face()).find(x=>x.id==='eyes').code).toBe('almond')
    const corrected=describeFaceFeatures({...face(),yaw:40},{overrides:{eyes:'round',nose:'occluded',contour:'square',lips:'upperThin'}})
    expect(corrected.map(x=>x.id)).toEqual(['brow','eyes','nose'])
    expect(corrected.find(x=>x.id==='eyes')).toMatchObject({code:'round',source:'user',value:'偏圆眼型（自选）'})
    expect(corrected.find(x=>x.id==='nose')).toMatchObject({code:'occluded',limited:true,reference:''})
    expect(describeFaceFeatures(face(),{overrides:{eyes:'invented'}}).find(x=>x.id==='eyes').code).toBe('almond')
  })
})

describe('local makeup report', () => {
  it('updates only relevant steps from corrections, including both face-layout steps', () => {
    const initial=buildFaceMakeupReport([...describeFaceFeatures(face()), describeFaceContour()])
    const changed=buildFaceMakeupReport([...describeFaceFeatures(face(),{overrides:{eyes:'round'}}), describeFaceContour('square')])
    expect(changed.filter((x,i)=>x.technique!==initial[i].technique).map(x=>x.id)).toEqual(['eyes','cheeks','contour'])
    expect(changed.find(x=>x.id==='eyes').source).toBe('依据你的选择')
    expect(changed.every(x=>x.technique && x.reason && x.basis)).toBe(true)
  })
  it('uses general advice for unknown/occluded features without resurrecting the estimate', () => {
    for(const choice of ['unknown','occluded']) {
      const entries=describeFaceFeatures(face(),{reviewed:true,overrides:{eyes:choice,contour:choice}})
      const report=buildFaceMakeupReport(entries)
      for(const id of ['eyes','cheeks','contour']) expect(report.find(x=>x.id===id).source).toBe('通用建议')
      expect(report.find(x=>x.id==='brow').source).toBe('依据照片估算')
    }
    expect(buildFaceMakeupReport(describeFaceFeatures(face())).some(x=>x.id==='lips')).toBe(false)
  })
})
