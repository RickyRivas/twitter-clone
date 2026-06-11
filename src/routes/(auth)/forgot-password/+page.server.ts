import { fail, type Actions } from "@sveltejs/kit";
import { forgotPassword } from "$lib/actions/auth";

export const actions: Actions = {
    forgotPassword
}