export type Role = 'Administrator' | 'Team Lead' | 'Member';

export type AttendanceStatus = 'unseen' | 'seen' | 'skip-pending' | 'skip-approved' | 'skip-rejected';

export interface User {
	id: string;
	username: string;
	password: string;
	name: string;
	phoneNumber: string;
	roles: Role[];
	teamId: string | null;
}

export interface Team {
	id: string;
	name: string;
	memberIds: string[];
}

export interface AttendanceRecord {
	memberId: string;
	status: AttendanceStatus;
	updatedAt: string;
	updatedBy: string;
}

export interface Event {
	id: string;
	name: string;
	createdAt: string;
	registrationOpen: boolean;
	closedAt: string | null;
	closedBy: string | null;
	attendance: Record<string, AttendanceRecord>;
}

export interface AppState {
	users: User[];
	teams: Team[];
	events: Event[];
	activeEventId: string | null;
}

export interface TeamMemberStatus {
	member: User;
	status: AttendanceStatus;
	record: AttendanceRecord | null;
}

export interface TeamStatusView {
	team: Team;
	members: TeamMemberStatus[];
	checkedCount: number;
	totalCount: number;
	allAccountedFor: boolean;
}