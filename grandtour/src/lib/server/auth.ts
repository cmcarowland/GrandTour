import { redirect, type Cookies } from '@sveltejs/kit';

import { findUserByUsername, getRoleRedirect } from './store';

const sessionCookie = 'grandtour-session';

export async function loginUser(username: string, password: string): Promise<string | null> {
	const user = await findUserByUsername(username);

	if (!user || user.password !== password) {
		return null;
	}

	return user.username;
}

export function setSessionCookie(cookies: Cookies, username: string): void {
	cookies.set(sessionCookie, username, { path: '/', httpOnly: true, sameSite: 'lax', secure: false, maxAge: 60 * 60 * 24 * 7 });
}

export function clearSessionCookie(cookies: Cookies): void {
	cookies.delete(sessionCookie, { path: '/' });
}

export function getSessionCookie(cookies: Cookies): string | null {
	return cookies.get(sessionCookie) ?? null;
}

export async function redirectToRole(username: string): Promise<never> {
	const user = await findUserByUsername(username);

	if (!user) {
		throw redirect(303, '/login');
	}

	throw redirect(303, getRoleRedirect(user));
}