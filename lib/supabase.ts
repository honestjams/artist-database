import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
  keywords: string[]
  website: string | null
  image_url: string | null
  artwork_images: string[]
  notable_works: string[]
  is_user_submitted: boolean
  created_at: string
}
