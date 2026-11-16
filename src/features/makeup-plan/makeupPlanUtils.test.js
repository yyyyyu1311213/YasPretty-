import { describe, expect, it } from 'vitest'
import { DEFAULT_FORM, legacyToForm, toPlanPayload } from './makeupPlanUtils'

describe('妆容表单与请求转换', () => {
  it('maps structured workbench inputs to the stage 2 API contract', () => {
    const payload = toPlanPayload(legacyToForm({ skin: '混油皮', finish: '柔雾', budget: 500 }))
    expect(payload.userProfile).toMatchObject({
      skinType: '混油皮',
      skinTypeSource: 'self_reported',
      budgetTotal: 500,
      finishPreferences: ['柔雾'],
    })
    expect(payload.makeupRequest).toMatchObject({ photoEnabled: false, scene: '日常', style: '自然' })
  })

  it('keeps the complete no-profile form defaults', () => {
    expect(legacyToForm()).toEqual({
      skinType: 'unknown', undertone: 'unknown', finish: '自然光泽', budgetTotal: '',
      skillLevel: '新手', scene: '日常', style: '自然', wearHours: 8,
      timeOfDay: '白天', priorities: ['轻薄'],
    })
  })

  it('uses only supported legacy skin and finish values, without extending profile mapping', () => {
    const profile = Object.freeze({ skin: '未支持肤质', finish: '水光', budget: 300, scene: '通勤', tone: '冷调' })
    expect(legacyToForm(profile)).toEqual({ ...DEFAULT_FORM, budgetTotal: '300' })
  })

  it('keeps legacy budget truthiness and string conversion', () => {
    for (const budget of [undefined, null, 0, '']) expect(legacyToForm({ budget }).budgetTotal).toBe('')
    for (const budget of [200, '0', '500']) expect(legacyToForm({ budget }).budgetTotal).toBe(String(budget))
  })

  it('keeps all default request fields and disables photos', () => {
    expect(toPlanPayload(legacyToForm())).toEqual({
      userProfile: {
        skinType: 'unknown', skinTypeSource: 'unknown', undertone: 'unknown',
        finishPreferences: ['自然光泽'], concerns: [], budgetTotal: 0, skillLevel: '新手',
        excludedBrands: [], sensitivities: [], city: '',
      },
      makeupRequest: {
        scene: '日常', style: '自然', wearHours: 8, timeOfDay: '白天',
        photoEnabled: false, priorities: ['轻薄'],
      },
    })
  })

  it('converts numeric form controls while retaining the other selected conditions', () => {
    const priorities = Object.freeze(['持妆', '控油'])
    const form = Object.freeze({
      ...legacyToForm({ skin: '油皮', finish: '哑光', budget: 500 }),
      undertone: '暖调', scene: '拍照', style: '精致', wearHours: '10',
      budgetTotal: '200', skillLevel: '进阶', timeOfDay: '夜晚', priorities,
    })
    const payload = toPlanPayload(form)
    expect(payload.userProfile).toMatchObject({
      skinType: '油皮', skinTypeSource: 'self_reported', undertone: '暖调',
      budgetTotal: 200, skillLevel: '进阶', finishPreferences: ['哑光'],
    })
    expect(payload.makeupRequest).toEqual({
      scene: '拍照', style: '精致', wearHours: 10, timeOfDay: '夜晚', photoEnabled: false, priorities,
    })
    expect(form.budgetTotal).toBe('200')
    expect(form.wearHours).toBe('10')
    expect(priorities).toEqual(['持妆', '控油'])
  })

  it('keeps empty-value fallbacks without adding client validation or omitted fields', () => {
    const payload = toPlanPayload({
      ...legacyToForm(), skinType: '', undertone: '', finish: '', skillLevel: '',
      wearHours: '', scene: '', style: '', timeOfDay: '', priorities: [],
    })
    expect(payload.userProfile).toMatchObject({
      skinType: 'unknown', skinTypeSource: 'unknown', undertone: 'unknown',
      finishPreferences: [], budgetTotal: 0, skillLevel: 'unknown',
    })
    expect(payload.makeupRequest).toEqual({
      scene: '', style: '', wearHours: 0, timeOfDay: '', photoEnabled: false, priorities: [],
    })
  })

  it('leaves invalid numeric values for the existing request validation boundary', () => {
    const payload = toPlanPayload({ ...legacyToForm(), budgetTotal: 'invalid', wearHours: 'invalid' })
    expect(payload.userProfile.budgetTotal).toBeNaN()
    expect(payload.makeupRequest.wearHours).toBeNaN()
    expect(JSON.parse(JSON.stringify(payload)).userProfile.budgetTotal).toBeNull()
  })
})
