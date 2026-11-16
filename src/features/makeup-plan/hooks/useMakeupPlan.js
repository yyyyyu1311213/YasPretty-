import { useEffect, useState } from 'react'
import { requestMakeupPlan } from '../makeupPlanApi'
import { legacyToForm, toPlanPayload } from '../makeupPlanUtils'

export function useMakeupPlan(profile) {
  const [form, setForm] = useState(() => legacyToForm(profile))
  const [plan, setPlan] = useState(null)
  const [status, setStatus] = useState('ready')
  const [error, setError] = useState('')

  useEffect(() => {
    setForm((current) => ({ ...current, ...legacyToForm(profile) }))
  }, [profile?.skin, profile?.finish, profile?.budget])

  function update(name, value) {
    setForm((current) => ({ ...current, [name]: value }))
  }

  function togglePriority(value) {
    setForm((current) => ({
      ...current,
      priorities: current.priorities.includes(value)
        ? current.priorities.filter((item) => item !== value)
        : [...current.priorities, value].slice(0, 4),
    }))
  }

  async function createPlan(event) {
    event.preventDefault()
    setStatus('loading')
    setError('')
    try {
      const plan = await requestMakeupPlan(toPlanPayload(form))
      setPlan(plan)
      setStatus('success')
    } catch (requestError) {
      setStatus('error')
      setError(requestError.message || '方案服务暂时不可用。')
    }
  }

  return { form, plan, status, error, update, togglePriority, createPlan }
}
