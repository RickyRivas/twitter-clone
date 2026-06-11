import type { LayoutServerLoad } from "./$types"

export const load: LayoutServerLoad = async ({ locals, cookies, depends }) => {
    depends('supabase:auth')

    const { session, user } = await locals.safeGetSession()

    let profile = null
    if (user) {
        const { data } = await locals.supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()
        profile = data
    }

    return { session, user, profile, cookies: cookies.getAll() }
}