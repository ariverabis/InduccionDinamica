import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rreqcrmdyrgevdugzurx.supabase.co'
const supabaseAnonKey = 'sb_publishable_xJidLXDtiL2N9eUniwq5wg_ewAAZUPD'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
