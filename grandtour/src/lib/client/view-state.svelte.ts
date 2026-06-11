import type { Event, TeamMemberStatus, TeamStatusView, User } from '$lib/types';

type AdminSnapshot = {
	user: User | null;
	activeEvent: Event | null;
	teams: TeamStatusView[];
	registrationOpen: boolean;
	pendingApprovals: TeamMemberStatus[];
};

type TeamLeadSnapshot = {
	user: User | null;
	activeEvent: Event | null;
	team: TeamStatusView | null;
};

class GrandTourViewState {
	user = $state<User | null>(null);
	activeEvent = $state<Event | null>(null);
	teams = $state<TeamStatusView[]>([]);
	registrationOpen = $state(false);
	pendingApprovals = $state<TeamMemberStatus[]>([]);
	team = $state<TeamStatusView | null>(null);

	setAdminSnapshot(snapshot: AdminSnapshot) {
		this.user = snapshot.user;
		this.activeEvent = snapshot.activeEvent;
		this.teams = snapshot.teams;
		this.registrationOpen = snapshot.registrationOpen;
		this.pendingApprovals = snapshot.pendingApprovals;
		this.team = null;
	}

	setTeamLeadSnapshot(snapshot: TeamLeadSnapshot) {
		this.user = snapshot.user;
		this.activeEvent = snapshot.activeEvent;
		this.team = snapshot.team;
		this.teams = snapshot.team ? [snapshot.team] : [];
		this.registrationOpen = snapshot.activeEvent?.registrationOpen ?? false;
		this.pendingApprovals = [];
	}
}

export const grandTourViewState = new GrandTourViewState();