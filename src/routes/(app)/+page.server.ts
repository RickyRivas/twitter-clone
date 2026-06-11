import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase, safeGetSession } }) => {
    const { user } = await safeGetSession();

    const { data: forYouPosts, error: forYouError } = await supabase
        .rpc('get_posts', {
            p_user_id: user?.id ?? null,
            p_limit: 20,
            p_offset: 0
        });

    if (forYouError) console.error('For You feed error:', forYouError);

    let followingPosts = null;
    let followingError = false;

    if (user) {
        const { data, error } = await supabase
            .rpc('get_feed', {
                p_user_id: user.id,
                p_limit: 20,
                p_offset: 0
            });

        if (error) {
            console.error('Following feed error:', error);
            followingError = true;
        } else {
            followingPosts = data;
        }
    }

    return {
        forYouPosts: forYouPosts ?? [],
        followingPosts,
        forYouError: !!forYouError,
        followingError,
    };
};