import { fail, redirect } from '@sveltejs/kit';

import { loginUser, setSessionCookie } from '$lib/server/auth';
import { getRoleRedirect, findUserByUsername } from '$lib/server/store';

export const load = async ({ locals }) => {
	if (locals.user) {
		throw redirect(303, getRoleRedirect(locals.user));
	}

	return {};
};

export const actions = {
	default: async ({ request, cookies }) => {
		const formData = await request.formData();
		const username = String(formData.get('username') ?? '').trim();
		const password = String(formData.get('password') ?? '');

		if (!username || !password) {
			return fail(400, { message: 'Enter both username and password.' });
		}

		const authenticatedUsername = await loginUser(username, password);

		if (!authenticatedUsername) {
			return fail(400, { message: 'Invalid username or password.' });
		}

		setSessionCookie(cookies, authenticatedUsername);
		const user = await findUserByUsername(authenticatedUsername);

		if (!user) {
			return fail(500, { message: 'Unable to load user profile.' });
		}

		throw redirect(303, getRoleRedirect(user));
	}
};