import type { Handle } from '@sveltejs/kit';

import { getSessionCookie } from '$lib/server/auth';
import { findUserByUsername } from '$lib/server/store';

export const handle: Handle = async ({ event, resolve }) => {
	const session = getSessionCookie(event.cookies);
	event.locals.user = session ? await findUserByUsername(session) : null;
	return resolve(event);
};