import { fail, redirect } from '@sveltejs/kit';

import { approveSkip, buildTeamStatusViews, createEvent, getActiveEvent, getState, hasRole, rejectSkip } from '$lib/server/store';

export const load = async ({ locals }) => {
	if (!locals.user || !hasRole(locals.user, 'Administrator')) {
		throw redirect(303, '/login');
	}

	const state = await getState();
	const activeEvent = await getActiveEvent(state);
	const teams = buildTeamStatusViews(state);

	return {
		user: locals.user,
		activeEvent,
		teams,
		pendingApprovals: teams.flatMap((team) => team.members).filter((member) => member.status === 'skip-pending')
	};
};

export const actions = {
	createEvent: async ({ request, locals }) => {
		if (!locals.user || !hasRole(locals.user, 'Administrator')) {
			throw redirect(303, '/login');
		}

		const formData = await request.formData();
		const name = String(formData.get('name') ?? '').trim();

		if (!name) {
			return fail(400, { message: 'Enter an event name.' });
		}

		await createEvent(name);
		return { success: true };
	},
	approveSkip: async ({ request, locals }) => {
		if (!locals.user || !hasRole(locals.user, 'Administrator')) {
			throw redirect(303, '/login');
		}

		const formData = await request.formData();
		const memberId = String(formData.get('memberId') ?? '');
		await approveSkip(memberId, locals.user.username);
		return { success: true };
	},
	rejectSkip: async ({ request, locals }) => {
		if (!locals.user || !hasRole(locals.user, 'Administrator')) {
			throw redirect(303, '/login');
		}

		const formData = await request.formData();
		const memberId = String(formData.get('memberId') ?? '');
		await rejectSkip(memberId, locals.user.username);
		return { success: true };
	}
};