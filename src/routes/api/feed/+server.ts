import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals: { supabase, safeGetSession } }) => {
    const tab = url.searchParams.get('tab') ?? 'for-you';
    const { user } = await safeGetSession();

    if (tab === 'following') {
        if (!user) return json({ posts: [], error: 'Not authenticated' }, { status: 401 });

        const { data, error } = await supabase
            .rpc('get_feed', {
                p_user_id: user.id,
                p_limit: 20,
                p_offset: 0
            });

        if (error) {
            console.error('Following feed error:', error);
            return json({ posts: [], error: error.message }, { status: 500 });
        }

        return json({ posts: data ?? [] });
    }

    const { data, error } = await supabase
        .rpc('get_posts', {
            p_user_id: user?.id ?? null,
            p_limit: 20,
            p_offset: 0
        });

    if (error) {
        console.error('For You feed error:', error);
        return json({ posts: [], error: error.message }, { status: 500 });
    }

    return json({ posts: data ?? [] });
};