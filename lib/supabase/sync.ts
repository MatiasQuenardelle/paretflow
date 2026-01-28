import { createClient } from './client'
import { Task } from '@/stores/taskStore'

const supabase = createClient()

export async function fetchUserTasks(): Promise<Task[] | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('tasks')
    .select('data')
    .eq('user_id', user.id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned - user has no saved tasks yet
      return []
    }
    console.error('Error fetching tasks:', error)
    return null
  }

  return data?.data as Task[] || []
}

export async function saveUserTasks(tasks: Task[]): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { error } = await supabase
    .from('tasks')
    .upsert({
      user_id: user.id,
      data: tasks,
    }, {
      onConflict: 'user_id'
    })

  if (error) {
    console.error('Error saving tasks:', error)
    return false
  }

  return true
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export function onAuthStateChange(callback: (user: any) => void) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null)
  })
}
