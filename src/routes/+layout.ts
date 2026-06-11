import { createBrowserClient, createServerClient, isBrowser } from '@supabase/ssr';
import { PUBLIC_SUPABASE_PUBLISHABLE_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';
import { redirect } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';
import { getRouteGroup } from '$lib/navigation';

export const load: LayoutLoad = async ({ url, data, depends, fetch }) => {
    depends('supabase:auth');

    const supabase = isBrowser()
        ? createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
            global: { fetch }
        })
        : createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
            global: { fetch },
            cookies: {
                getAll() {
                    return data.cookies;
                }
            }
        });

    const { data: { session } } = await supabase.auth.getSession();
    const { data: { user } } = await supabase.auth.getUser();

    const routeGroup = getRouteGroup(url.pathname);

    // Ghost session: has session cookie but user JWT is invalid — force signout
    if (session && !user) {
        redirect(303, `/auth/confirm?signout=true&access_token=${session.access_token}`);
    }

    // Fetch profile whenever a user is present — needed everywhere for nav,
    // avatar, follow buttons, role checks etc.
    let profile = null;
    if (user) {
        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profileError && profileError.code === 'PGRST116') {
            // Profile row missing — recreate from auth data as a safety net.
            // This shouldn't happen in normal flow but guards against DB issues.
            // todo: notify admin
            console.warn(`User ${user.id} missing profile row — recreating`);

            const provider = user.app_metadata?.provider ?? 'email';
            const username = user.user_metadata?.user_name
                ?? user.email?.split('@')[0]
                ?? user.id;

            await supabase.from('profiles').insert({
                id: user.id,
                username,
                provider,
                role: 'user',
            });

            profile = {
                id: user.id,
                username,
                provider,
                role: 'user',
                display_name: null,
                bio: null,
                avatar_public_id: null,
                banner_public_id: null,
                website: null,
                location: null,
                badge: null,
                pinned_post_id: null,
                followers_count: 0,
                following_count: 0,
                posts_count: 0,
                total_likes_count: 0,
                created_at: new Date().toISOString(),
            };
        } else {
            profile = profileData;
        }
    }

    // Route group guards — server-side redirects for hard-gated routes
    if (routeGroup === 'protected' && (!session || !user)) {
        redirect(303, '/login');
    }

    if (routeGroup === 'admin') {
        if (!session || !user) redirect(303, '/login');
        if (!profile || !['moderator', 'admin'].includes(profile.role)) {
            redirect(303, '/');
        }
    }

    return {
        supabase,
        session,
        user,
        profile,
        theme: data.theme,
    };
};