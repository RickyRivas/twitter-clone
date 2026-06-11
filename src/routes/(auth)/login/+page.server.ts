import type { Provider } from "@supabase/supabase-js";
import { fail, redirect, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { login } from "$lib/actions/auth";

export const load: PageServerLoad = async ({ locals: { safeGetSession } }) => {
    const { session } = await safeGetSession();
    if (session) redirect(303, '/');
}

export const actions: Actions = {
    login,

    oauthSignin: async ({ url, request, locals: { supabase } }) => {
        const formData = await request.formData();
        const provider = formData.get('selected-provider') as Provider;

        const { data, error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: `${url.origin}/auth/confirm?next=/`
            }
        });

        if (error) return fail(400, { message: error.message });
        redirect(303, data.url);
    },

    logout: async ({ locals: { supabase } }) => {
        await supabase.auth.signOut();
    }
}