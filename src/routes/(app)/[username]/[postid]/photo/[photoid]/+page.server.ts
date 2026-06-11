import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals: { supabase, safeGetSession } }) => {
    const { user } = await safeGetSession();

    // load the post with all its media
    const { data: posts, error: postError } = await supabase
        .rpc('get_posts', {
            p_user_id: user?.id ?? null,
            p_post_id: params.postid,
            p_limit: 1,
            p_offset: 0
        });

    if (postError || !posts?.length) error(404, 'Post not found');

    const post = posts[0];

    // find the specific photo being viewed
    const currentMedia = post.post_media?.find((m: any) => m.id === params.photoid);
    if (!currentMedia) error(404, 'Photo not found');

    // only images in the slideshow
    const images = post.post_media?.filter((m: any) => m.resource_type === 'image')
        .sort((a: any, b: any) => a.position - b.position) ?? [];

    const currentIndex = images.findIndex((m: any) => m.id === params.photoid);

    // load replies
    const { data: replies } = await supabase
        .rpc('get_replies', {
            p_user_id: user?.id ?? null,
            p_post_id: params.postid,
            p_limit: 20,
            p_offset: 0
        });

    return {
        post,
        images,
        currentMedia,
        currentIndex,
        replies: replies ?? [],
    };
};