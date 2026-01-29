import { createClient } from './client'
import { Task } from '@/stores/taskStore'

// Lazy initialization to avoid SSR issues
function getSupabase() {
  return createClient()
}

export async function fetchUserTasks(): Promise<Task[] | null> {
  const { data: { user }, error: userError } = await getSupabase().auth.getUser()
  console.log('[Sync] fetchUserTasks - getUser result:', { userId: user?.id, error: userError?.message })

  if (!user) return null

  const { data, error } = await getSupabase()
    .from('tasks')
    .select('data')
    .eq('user_id', user.id)
    .single()

  console.log('[Sync] fetchUserTasks - query result:', { hasData: !!data, error: error?.message, code: error?.code })

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
  const { data: { user } } = await getSupabase().auth.getUser()
  if (!user) return false

  const { error } = await getSupabase()
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
  const { data: { user } } = await getSupabase().auth.getUser()
  return user
}

export function onAuthStateChange(callback: (user: any) => void) {
  return getSupabase().auth.onAuthStateChange((event, session) => {
    console.log('[Sync] onAuthStateChange event:', event, 'user:', session?.user?.email)
    callback(session?.user ?? null)
  })
}
