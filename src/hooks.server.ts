import { PRIVATE_SUPABASE_SECRET_KEY } from "$env/static/private";
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY } from "$env/static/public";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import type { Handle } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";

const auth: Handle = async ({ event, resolve }) => {
    event.locals.supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
        cookies: {
            getAll: () => event.cookies.getAll(),
            setAll: (cookiesToSet) => {
                cookiesToSet.forEach(({ name, value, options }) => {
                    event.cookies.set(name, value, { ...options, path: "/" });
                });
            },
        },
    });

    event.locals.supabaseServiceRole = createClient(
        PUBLIC_SUPABASE_URL,
        PRIVATE_SUPABASE_SECRET_KEY,
        { auth: { persistSession: false } }
    );

    event.locals.safeGetSession = async () => {
        const { data: { session } } = await event.locals.supabase.auth.getSession();
        if (!session) return { session: null, user: null };

        const { data: { user }, error } = await event.locals.supabase.auth.getUser();
        if (error) return { session: null, user: null };

        return { session, user };
    };

    // Eagerly call getUser() before resolve() to force any pending token
    // refresh to complete and flush cookie writes while the response is still open.
    await event.locals.supabase.auth.getUser();

    return resolve(event, {
        filterSerializedResponseHeaders(name) {
            return name === "content-range" || name === "x-supabase-api-version";
        },
    });
};

export const handle: Handle = sequence(auth);