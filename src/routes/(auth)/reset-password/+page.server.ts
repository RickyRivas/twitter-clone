import { fail, redirect, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { resetPassword } from "$lib/actions/auth";

// by the time the user lands here, /auth/confirm has already exchanged
// the reset token for a valid session — just verify one exists
export const load: PageServerLoad = async ({ locals: { safeGetSession } }) => {
    const { session } = await safeGetSession();
    if (!session) redirect(303, '/forgot-password');
};

export const actions: Actions = {
    resetPassword
}