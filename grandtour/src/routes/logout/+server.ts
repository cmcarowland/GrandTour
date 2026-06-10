import { redirect } from '@sveltejs/kit';

import { clearSessionCookie } from '$lib/server/auth';

export const GET = ({ cookies }) => {
	clearSessionCookie(cookies);
	throw redirect(303, '/login');
};