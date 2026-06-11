import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals: { supabase, safeGetSession } }) => {
    const { user } = await safeGetSession();

    // load the post
    const { data: posts, error: postError } = await supabase
        .rpc('get_posts', {
            p_user_id: user?.id ?? null,
            p_post_id: params.postid,
            p_limit: 1,
            p_offset: 0
        });

    if (postError || !posts?.length) error(404, 'Post not found');

    const post = posts[0];

    // load direct replies
    const { data: replies } = await supabase
        .rpc('get_replies', {
            p_user_id: user?.id ?? null,
            p_post_id: params.postid,
            p_limit: 20,
            p_offset: 0
        });

    return {
        post,
        replies: replies ?? [],
    };
};