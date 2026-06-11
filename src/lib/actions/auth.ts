import { fail, redirect } from "@sveltejs/kit";
import type { RequestEvent } from "@sveltejs/kit";
import { validateForm, registerNewUserSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from "$lib/utils/zod-helper";

export async function register({ request, locals: { supabase }, url }: RequestEvent) {
    try {
        const formData = await request.formData();
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        const passwordConfirmed = formData.get('passwordConfirmed') as string;
        const username = formData.get('username') as string;

        const validateFormResult = await validateForm(registerNewUserSchema, {
            username,
            email,
            password,
            passwordConfirmed,
        });

        if (validateFormResult.errors) return fail(400, { errors: validateFormResult.errors });

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { username },
                emailRedirectTo: `${url.origin}/auth/confirm`
            }
        });

        if (error) return fail(error.status as number, { message: error.message });

        // existing user attempting to re-register
        if (
            data?.user?.role === '' ||
            !data?.user?.user_metadata?.sub ||
            data?.user?.identities?.length === 0
        ) {
            return { success: true, redirectTo: `/verify-email?email=${data.user?.email}&existing=true` };
        }

        return { success: true, redirectTo: `/verify-email?email=${data.user?.user_metadata.email}&username=${data.user?.user_metadata.username}` };

    } catch (e) {
        return fail(500, { message: 'An unexpected error occurred. Please try again later.' });
    }
}

export async function login({ request, locals: { supabase } }: RequestEvent) {
    try {
        const formData = await request.formData();
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        const validateFormResult = await validateForm(loginSchema, { email, password });
        if (validateFormResult.errors) return fail(400, { errors: validateFormResult.errors });

        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return fail(error.status as number, { message: error.message });

        return { success: true, redirectTo: '/' };
    } catch (e) {
        return fail(500, { message: 'An unexpected error occurred. Please try again later.' });
    }
}

export async function forgotPassword({ request, locals: { supabase }, url }: RequestEvent) {
    try {
        const formData = await request.formData();
        const email = formData.get('email') as string;

        const validateFormResult = await validateForm(forgotPasswordSchema, { email });
        if (validateFormResult.errors) return fail(400, { errors: validateFormResult.errors });

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${url.origin}/auth/confirm?next=/reset-password`
        });

        if (error) return fail(400, { message: error.message });
        return { success: true, redirectTo: `/verify-email?email=${email}&type=reset` };
    } catch (e) {
        return fail(500, { message: 'An unexpected error occurred. Please try again later.' });
    }
}

export async function resetPassword({ request, locals: { supabase } }: RequestEvent) {
    try {
        const formData = await request.formData();
        const password = formData.get('password') as string;
        const passwordConfirmed = formData.get('passwordConfirmed') as string;

        const validateFormResult = await validateForm(resetPasswordSchema, { password, passwordConfirmed });
        if (validateFormResult.errors) return fail(400, { errors: validateFormResult.errors });

        const { error } = await supabase.auth.updateUser({ password });
        if (error) return fail(error.status as number, { message: error.message });

        return { success: true, redirectTo: '/' };
    } catch (e) {
        return fail(500, { message: 'An unexpected error occurred. Please try again later.' });
    }
}