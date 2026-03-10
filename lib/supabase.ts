import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Plain client for server components that don't need auth (public reads)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Browser client for client components (maintains session via cookies)
export function createSupabaseBrowserClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

export type Artist = {
  id: string
  name: string
  slug: string
  bio: string | null
  nationality: string | null
  birth_year: number | null
  death_year: number | null
  art_styles: string[]
  mediums: string[]
  concepts: string[]
  keywords: string[]
  website: string | null
  image_url: string | null
  artwork_images: string[]
  notable_works: string[]
  is_user_submitted: boolean
  created_at: string
}

export type Category = {
  id: string
  type: 'style' | 'medium' | 'concept'
  name: string
  created_at: string
}
