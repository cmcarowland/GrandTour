import { fail, redirect } from '@sveltejs/kit';

import { buildTeamStatusViews, getActiveEvent, getState, hasRole, markMemberSeen, markMemberSkipping } from '$lib/server/store';

export const load = async ({ locals }) => {
	if (!locals.user || !hasRole(locals.user, 'Team Lead')) {
		throw redirect(303, '/login');
	}

	const state = await getState();
	const activeEvent = await getActiveEvent(state);
	const team = buildTeamStatusViews(state).find((entry) => entry.team.id === locals.user?.teamId) ?? null;

	return { user: locals.user, activeEvent, team };
};

export const actions = {
	seen: async ({ request, locals }) => {
		if (!locals.user || !hasRole(locals.user, 'Team Lead')) {
			throw redirect(303, '/login');
		}

		const formData = await request.formData();
		const memberId = String(formData.get('memberId') ?? '');

		if (!memberId) {
			return fail(400, { message: 'Missing member.' });
		}

		await markMemberSeen(memberId, locals.user.username);
		return { success: true };
	},
	skipping: async ({ request, locals }) => {
		if (!locals.user || !hasRole(locals.user, 'Team Lead')) {
			throw redirect(303, '/login');
		}

		const formData = await request.formData();
		const memberId = String(formData.get('memberId') ?? '');

		if (!memberId) {
			return fail(400, { message: 'Missing member.' });
		}

		await markMemberSkipping(memberId, locals.user.username);
		return { success: true };
	}
};