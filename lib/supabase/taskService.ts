import { createClient } from './client'
import { Task } from '@/stores/taskStore'

function getSupabase() {
  return createClient()
}

class TaskService {
  async fetchTasks(): Promise<Task[]> {
    const { data: { user }, error: userError } = await getSupabase().auth.getUser()

    if (userError || !user) {
      throw new Error('Not authenticated')
    }

    const { data, error } = await getSupabase()
      .from('tasks')
      .select('data')
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned - user has no saved tasks yet
        return []
      }
      throw new Error(`Failed to fetch tasks: ${error.message}`)
    }

    return (data?.data as Task[]) || []
  }

  async saveTasks(tasks: Task[]): Promise<void> {
    const { data: { user }, error: userError } = await getSupabase().auth.getUser()

    if (userError || !user) {
      throw new Error('Not authenticated')
    }

    const { error } = await getSupabase()
      .from('tasks')
      .upsert({
        user_id: user.id,
        data: tasks,
      }, {
        onConflict: 'user_id'
      })

    if (error) {
      throw new Error(`Failed to save tasks: ${error.message}`)
    }
  }
}

export const taskService = new TaskService()
