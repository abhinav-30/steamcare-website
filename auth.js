// auth.js — include on every page
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = 'https://pxciigloanhyhspnducj.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4Y2lpZ2xvYW5oeWhzcG5kdWNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxMjg3NDcsImV4cCI6MjA5MjcwNDc0N30.xBw5xGNwrQo7OV2ZorfjBbJag6yBUuxH-xHe2BtwENw'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Returns current logged-in user or null
export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Returns the profile (name, phone) of the current user
export async function getUserProfile() {
  const user = await getUser()
  if (!user) return null
  const { data, error } = await supabase
    .from('profiles')
    .select('full_name, phone')
    .eq('id', user.id)
    .single()
  if (error) return null
  return data
}

// Sign up with email + password, then save name & phone to profiles table
export async function signUp(email, password, fullName, phone) {
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) return { data, error }

  // Save name and phone to profiles table
  if (data.user) {
    await supabase.from('profiles').insert({
      id: data.user.id,
      full_name: fullName,
      phone: phone
    })
  }

  return { data, error }
}

// Log in with email + password
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email, password
  })
  return { data, error }
}

// Log out
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

// Listen for auth state changes
export function onAuthChange(callback) {
  supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null)
  })
}
