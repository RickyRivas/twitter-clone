import { fail, redirect, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ url, locals: { safeGetSession } }) => {
    const { session } = await safeGetSession();
    if (session) redirect(303, '/');

    const email = url.searchParams.get('email') || '';
    const username = url.searchParams.get('username') || '';
    const existing = url.searchParams.get('existing');

    if (!email) redirect(303, '/login');

    return { email, username, existing };
}

export const actions: Actions = {
    resendVerificationEmail: async ({ request, url, locals: { supabase } }) => {
        try {
            const formData = await request.formData();
            const email = formData.get('email') as string;

            const { error } = await supabase.auth.resend({
                type: 'signup',
                email,
                options: {
                    emailRedirectTo: `${url.origin}/auth/confirm`
                }
            });

            if (error) return fail(error.status as number, { message: 'Something went wrong.' });
            return { success: true };
        } catch (e) {
            return fail(500, { message: 'An unexpected error occurred. Please try again later.' });
        }
    }
}