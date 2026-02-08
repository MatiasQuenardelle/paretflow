import { createClient } from './client'
import { Plan } from '@/stores/planStore'

function getSupabase() {
  return createClient()
}

class PlanService {
  async fetchPlan(): Promise<Plan | null> {
    const { data: { user }, error: userError } = await getSupabase().auth.getUser()

    if (userError || !user) {
      throw new Error('Not authenticated')
    }

    const { data, error } = await getSupabase()
      .from('plans')
      .select('data')
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned - user has no saved plan yet
        return null
      }
      throw new Error(`Failed to fetch plan: ${error.message}`)
    }

    return (data?.data as Plan) || null
  }

  async savePlan(plan: Plan): Promise<void> {
    const { data: { user }, error: userError } = await getSupabase().auth.getUser()

    if (userError || !user) {
      throw new Error('Not authenticated')
    }

    const { error } = await getSupabase()
      .from('plans')
      .upsert({
        user_id: user.id,
        data: plan,
      }, {
        onConflict: 'user_id'
      })

    if (error) {
      throw new Error(`Failed to save plan: ${error.message}`)
    }
  }

  async deletePlan(): Promise<void> {
    const { data: { user }, error: userError } = await getSupabase().auth.getUser()

    if (userError || !user) {
      throw new Error('Not authenticated')
    }

    const { error } = await getSupabase()
      .from('plans')
      .delete()
      .eq('user_id', user.id)

    if (error) {
      throw new Error(`Failed to delete plan: ${error.message}`)
    }
  }
}

export const planService = new PlanService()
