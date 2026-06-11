import type { SupabaseClient, Session, User } from '@supabase/supabase-js'

declare global {
	namespace App {
		interface Locals {
			supabase: SupabaseClient
			supabaseServiceRole: SupabaseClient
			safeGetSession: () => Promise<{ session: Session | null; user: User | null }>
			profile: Profile | null  // populated in root +layout.server.ts after session check
		}
	}
}