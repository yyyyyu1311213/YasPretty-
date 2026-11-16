import { beforeEach, describe, expect, it, vi } from 'vitest'
import { requestMakeupPlan } from '../makeupPlanApi'
import { legacyToForm, toPlanPayload } from '../makeupPlanUtils'
import { useMakeupPlan } from './useMakeupPlan'

// Isolate React state/effect boundaries; real DOM and interaction coverage lives in the browser suite.
const lifecycle = vi.hoisted(() => ({ states: [], deps: [], effects: [], cursor: 0, dirty: false }))
vi.mock('react', async (importOriginal) => ({
  ...await importOriginal(),
  useState(initial) {
    const index = lifecycle.cursor++
    if (!(index in lifecycle.states)) lifecycle.states[index] = typeof initial === 'function' ? initial() : initial
    return [lifecycle.states[index], (value) => {
      const next = typeof value === 'function' ? value(lifecycle.states[index]) : value
      if (!Object.is(next, lifecycle.states[index])) lifecycle.dirty = true
      lifecycle.states[index] = next
    }]
  },
  useEffect(effect, deps) {
    const index = lifecycle.cursor++
    const previous = lifecycle.deps[index]
    if (!previous || deps.some((value, i) => !Object.is(value, previous[i]))) lifecycle.effects.push(effect)
    lifecycle.deps[index] = deps
  },
}))
vi.mock('../makeupPlanApi', () => ({ requestMakeupPlan: vi.fn() }))

function render(profile) {
  let value
  for (let count = 0; count < 10; count++) {
    lifecycle.cursor = 0
    lifecycle.effects = []
    lifecycle.dirty = false
    value = useMakeupPlan(profile)
    lifecycle.effects.forEach((effect) => effect())
    if (!lifecycle.dirty) return value
  }
  throw new Error('Unexpected render loop')
}

beforeEach(() => {
  Object.assign(lifecycle, { states: [], deps: [], effects: [], cursor: 0, dirty: false })
  vi.mocked(requestMakeupPlan).mockReset()
})

describe('工作台状态与生成流程', () => {
  it('initializes the same legacy form, empty plan and ready/error defaults', () => {
    const profile = { skin: '干皮', finish: '奶油肌', budget: 300 }
    expect(render(profile)).toMatchObject({ form: legacyToForm(profile), plan: null, status: 'ready', error: '' })
  })

  it('updates one condition and caps priorities at four while retaining order and allowing removal', () => {
    render().update('scene', '通勤')
    for (const priority of ['持妆', '遮瑕', '控油', '保湿']) render().togglePriority(priority)
    expect(render().form).toMatchObject({ scene: '通勤', priorities: ['轻薄', '持妆', '遮瑕', '控油'] })
    render().togglePriority('持妆')
    render().togglePriority('保湿')
    expect(render().form.priorities).toEqual(['轻薄', '遮瑕', '控油', '保湿'])
  })

  it('preserves edits for equal profile fields but reapplies all legacy defaults when a tracked field changes', () => {
    const profile = { skin: '油皮', budget: 300, city: '上海' }
    render(profile).update('scene', '拍照')
    render(profile).update('style', '精致')
    expect(render({ ...profile, city: '北京' }).form).toMatchObject({ scene: '拍照', style: '精致' })
    expect(render({ ...profile, budget: 200 }).form).toEqual(legacyToForm({ ...profile, budget: 200 }))
  })

  it('prevents form navigation, captures the payload and stays loading until the request settles', async () => {
    let release
    vi.mocked(requestMakeupPlan).mockReturnValue(new Promise((resolve) => { release = resolve }))
    render().update('budgetTotal', '200')
    render().update('wearHours', '10')
    const form = render().form
    const event = { preventDefault: vi.fn() }
    const pending = render().createPlan(event)
    expect(event.preventDefault).toHaveBeenCalledOnce()
    expect(requestMakeupPlan).toHaveBeenCalledExactlyOnceWith(toPlanPayload(form))
    expect(render()).toMatchObject({ status: 'loading', error: '', plan: null })
    const plan = { id: 'local-plan', sourceMode: 'local' }
    release(plan)
    await pending
    expect(render()).toMatchObject({ status: 'success', error: '', plan })
  })

  it('retains the previous plan on failure, clears the error at retry and replaces the plan only on success', async () => {
    const first = { id: 'first-plan' }
    vi.mocked(requestMakeupPlan).mockResolvedValueOnce(first).mockRejectedValueOnce(new Error('上游请求超时。'))
    await render().createPlan({ preventDefault() {} })
    await render().createPlan({ preventDefault() {} })
    expect(render()).toMatchObject({ status: 'error', error: '上游请求超时。', plan: first })
    let release
    vi.mocked(requestMakeupPlan).mockReturnValueOnce(new Promise((resolve) => { release = resolve }))
    const pending = render().createPlan({ preventDefault() {} })
    expect(render()).toMatchObject({ status: 'loading', error: '', plan: first })
    const second = { id: 'second-plan' }
    release(second)
    await pending
    expect(render()).toMatchObject({ status: 'success', error: '', plan: second })
  })

  it('keeps the original empty-message fallback without inventing a successful plan', async () => {
    vi.mocked(requestMakeupPlan).mockRejectedValueOnce(new Error(''))
    await render().createPlan({ preventDefault() {} })
    expect(render()).toMatchObject({ status: 'error', error: '方案服务暂时不可用。', plan: null })
  })
})
