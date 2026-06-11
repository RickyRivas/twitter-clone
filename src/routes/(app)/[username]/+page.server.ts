import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals: { supabase, safeGetSession } }) => {
    const { user } = await safeGetSession();

    // load profile by username
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', params.username)
        .single();

    if (profileError || !profile) error(404, 'User not found');

    // load posts — pinned first, then rest chronologically
    const { data: posts } = await supabase
        .rpc('get_posts', {
            p_user_id: user?.id ?? null,
            p_author_id: profile.id,
            p_include_reposts: true,
            p_limit: 20,
            p_offset: 0
        });

    // sort: pinned post floats to top
    const sortedPosts = posts ? [...posts].sort((a, b) => {
        if (a.id === profile.pinned_post_id) return -1;
        if (b.id === profile.pinned_post_id) return 1;
        return 0;
    }) : [];

    // check if visiting user follows this profile
    let isFollowing = false;
    if (user && user.id !== profile.id) {
        const { data: follow } = await supabase
            .from('follows')
            .select('follower_id')
            .eq('follower_id', user.id)
            .eq('following_id', profile.id)
            .single();

        isFollowing = !!follow;
    }

    const isOwner = user?.id === profile.id;

    return {
        visitedProfile: profile,
        posts: sortedPosts,
        isFollowing,
        isOwner,
    };
};