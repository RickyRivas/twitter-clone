import { isAuthApiError } from '@supabase/supabase-js';
import { redirect } from '@sveltejs/kit';

export const GET = async ({ url, locals: { supabase } }) => {
    // if session but no user, layout will detect and redirect here.
    // signs out and redirects back to a 'signed out' UI state.
    const signout = url.searchParams.get('signout') as string;
    const access_token = url.searchParams.get('access_token') as string;

    if (signout && access_token) {
        await supabase.auth.signOut()
        throw redirect(303, '/')
    }

    // email signup/change confirm redirects here with code param
    const code = url.searchParams.get('code') as string;
    if (code) {
        try {
            await supabase.auth.exchangeCodeForSession(code)
        } catch (error) {
            // If you open in another browser, need to redirect to login.
            // Should not display error
            if (isAuthApiError(error)) {
                redirect(303, "/login?verified=error")
            } else {
                throw error
            }
        }
    }

    const next = url.searchParams.get("next")
    if (next?.startsWith('/')) redirect(303, next)

    redirect(303, "/")
};