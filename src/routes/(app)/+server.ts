import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals }) => {
    const tab = url.searchParams.get('tab') ?? 'for-you';
    const supabase = locals.supabase;
    const session = locals.session;

    if (tab === 'following') {
        if (!session) return json({ posts: [], error: 'Not authenticated' });

        const { data, error } = await supabase
            .from('posts') // replace with your actual query
            .select('*, profiles(*)')
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) return json({ posts: [], error: error.message });
        return json({ posts: data ?? [] });
    }

    const { data, error } = await supabase
        .from('posts') // replace with your actual for-you query
        .select('*, profiles(*)')
        .order('created_at', { ascending: false })
        .limit(50);

    if (error) return json({ posts: [], error: error.message });
    return json({ posts: data ?? [] });
};