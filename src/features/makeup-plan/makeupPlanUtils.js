import { finishOptions, skinOptions } from '../../data/products'

/** @type {import('../../contracts/index.js').MakeupWorkbenchForm} */
export const DEFAULT_FORM = {
  skinType: 'unknown',
  undertone: 'unknown',
  finish: '自然光泽',
  budgetTotal: '',
  skillLevel: '新手',
  scene: '日常',
  style: '自然',
  wearHours: 8,
  timeOfDay: '白天',
  priorities: ['轻薄'],
}

/**
 * @param {import('../../contracts/index.js').AssistantProfile} [profile]
 * @returns {import('../../contracts/index.js').MakeupWorkbenchForm}
 */
export function legacyToForm(profile = {}) {
  return {
    ...DEFAULT_FORM,
    skinType: skinOptions.includes(profile.skin) ? profile.skin : DEFAULT_FORM.skinType,
    finish: finishOptions.includes(profile.finish) ? profile.finish : DEFAULT_FORM.finish,
    budgetTotal: profile.budget ? String(profile.budget) : '',
  }
}

/**
 * @param {import('../../contracts/index.js').MakeupWorkbenchForm} form
 * @returns {import('../../contracts/index.js').MakeupPlanRequest}
 */
export function toPlanPayload(form) {
  return {
    userProfile: {
      skinType: form.skinType || 'unknown',
      skinTypeSource: form.skinType && form.skinType !== 'unknown' ? 'self_reported' : 'unknown',
      undertone: form.undertone || 'unknown',
      finishPreferences: form.finish ? [form.finish] : [],
      concerns: [],
      budgetTotal: form.budgetTotal ? Number(form.budgetTotal) : 0,
      skillLevel: form.skillLevel || 'unknown',
      excludedBrands: [],
      sensitivities: [],
      city: '',
    },
    makeupRequest: {
      scene: form.scene,
      style: form.style,
      wearHours: Number(form.wearHours),
      timeOfDay: form.timeOfDay,
      photoEnabled: false,
      priorities: form.priorities,
    },
  }
}
