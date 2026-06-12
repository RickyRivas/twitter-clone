import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { validateForm, updateProfileSchema } from '$lib/utils/zod-helper';

export const load: PageServerLoad = async ({ locals: { safeGetSession } }) => {
    const { session } = await safeGetSession();
    if (!session) redirect(303, '/login');
};

export const actions: Actions = {
    updateProfile: async ({ request, locals: { supabase, safeGetSession } }) => {
        const { user } = await safeGetSession();
        if (!user) return fail(401, { message: 'Unauthorized' });

        try {
            const formData = await request.formData();

            const username = formData.get('username') as string;
            const display_name = formData.get('display_name') as string || null;
            const bio = formData.get('bio') as string || null;
            const location = formData.get('location') as string || null;
            const website = formData.get('website') as string || null;
            const avatar_public_id = formData.get('avatar_public_id');
            const banner_public_id = formData.get('banner_public_id') as string || null;

            const validateFormResult = await validateForm(updateProfileSchema, {
                username,
                display_name: display_name ?? undefined,
                bio: bio ?? undefined,
                location: location ?? undefined,
                website: website ?? undefined,
            });

            if (validateFormResult.errors) return fail(400, { errors: validateFormResult.errors });

            // check username availability if changed
            const { data: existing } = await supabase
                .from('profiles')
                .select('id')
                .eq('username', username)
                .neq('id', user.id)
                .single();

            if (existing) return fail(400, {
                errors: [{ field: 'username', message: 'Username is already taken' }]
            });

            const { error } = await supabase
                .from('profiles')
                .update({
                    username,
                    display_name,
                    bio,
                    location,
                    website,
                    avatar_public_id: avatar_public_id || null,
                    banner_public_id: banner_public_id || null,
                })
                .eq('id', user.id);

            if (error) return fail(500, { message: error.message });

            return { success: true };

        } catch (e) {
            return fail(500, { message: 'An unexpected error occurred.' });
        }
    }
};