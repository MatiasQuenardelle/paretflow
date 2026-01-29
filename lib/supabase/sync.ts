import { createClient } from './client'

function getSupabase() {
  return createClient()
}

export async function getCurrentUser() {
  const { data: { user } } = await getSupabase().auth.getUser()
  return user
}

export function onAuthStateChange(callback: (user: any) => void) {
  return getSupabase().auth.onAuthStateChange((event, session) => {
    callback(session?.user ?? null)
  })
}
