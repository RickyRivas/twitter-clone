import { json } from '@sveltejs/kit';
import { PRIVATE_CLOUDINARY_API_SECRET, PRIVATE_CLOUDINARY_API_KEY } from '$env/static/private';
import { PUBLIC_CLOUDINARY_CLOUD_NAME } from '$env/static/public';
import type { RequestHandler } from './$types';
import crypto from 'crypto';

export const POST: RequestHandler = async ({ request, locals: { safeGetSession } }) => {
    const { session } = await safeGetSession();
    if (!session) return json({ error: 'Unauthorized' }, { status: 401 });

    const { folder } = await request.json();

    const timestamp = Math.round(Date.now() / 1000);
    const params = { timestamp, folder };

    const signatureString = Object.entries(params)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}=${v}`)
        .join('&') + PRIVATE_CLOUDINARY_API_SECRET;

    const signature = crypto.createHash('sha256').update(signatureString).digest('hex');

    return json({
        signature,
        timestamp,
        api_key: PRIVATE_CLOUDINARY_API_KEY,
        cloud_name: PUBLIC_CLOUDINARY_CLOUD_NAME,
        folder,
    });
};