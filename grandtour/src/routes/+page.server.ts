import { redirect } from '@sveltejs/kit';

import { getRoleRedirect } from '$lib/server/store';

export const load = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(303, '/login');
	}

	throw redirect(303, getRoleRedirect(locals.user));
};