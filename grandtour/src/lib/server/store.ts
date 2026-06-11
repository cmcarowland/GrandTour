import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';

import type {
	AppState,
	AttendanceRecord,
	AttendanceStatus,
	Event,
	Role,
	Team,
	TeamMemberStatus,
	TeamStatusView,
	User
} from '$lib/types';

const stateFile = resolve('data/grandtour.state.json');

const defaultUsers: User[] = [
	{ id: 'user-admin', username: 'admin', password: 'admin123', name: 'Trip Administrator', phoneNumber: '555-0100', roles: ['Administrator'], teamId: null },
	{ id: 'user-lead-1', username: 'lead1', password: 'lead123', name: 'Morgan Lee', phoneNumber: '555-0101', roles: ['Team Lead'], teamId: 'team-aurora' },
	{ id: 'user-lead-2', username: 'lead2', password: 'lead123', name: 'Avery Chen', phoneNumber: '555-0102', roles: ['Team Lead'], teamId: 'team-ember' },
	{ id: 'user-1', username: 'student1', password: 'student123', name: 'Jordan Park', phoneNumber: '555-0110', roles: ['Member'], teamId: 'team-aurora' },
	{ id: 'user-2', username: 'student2', password: 'student123', name: 'Sam Rivera', phoneNumber: '555-0111', roles: ['Member'], teamId: 'team-aurora' },
	{ id: 'user-3', username: 'student3', password: 'student123', name: 'Taylor Brooks', phoneNumber: '555-0112', roles: ['Member'], teamId: 'team-ember' },
	{ id: 'user-4', username: 'student4', password: 'student123', name: 'Riley Moore', phoneNumber: '555-0113', roles: ['Member'], teamId: 'team-ember' }
];

const defaultTeams: Team[] = [
	{ id: 'team-aurora', name: 'Aurora Team', memberIds: ['user-1', 'user-2'] },
	{ id: 'team-ember', name: 'Ember Team', memberIds: ['user-3', 'user-4'] }
];

let memoryState: AppState | null = null;
const stateChangeListeners = new Set<() => void>();

function notifyStateChange(): void {
	for (const listener of stateChangeListeners) {
		listener();
	}
}

export function subscribeToStateChanges(listener: () => void): () => void {
	stateChangeListeners.add(listener);

	return () => {
		stateChangeListeners.delete(listener);
	};
}

function normalizeEvent(event: Event): Event {
	return {
		...event,
		registrationOpen: event.registrationOpen ?? true,
		closedAt: event.closedAt ?? null,
		closedBy: event.closedBy ?? null
	};
}

function normalizeState(state: AppState): AppState {
	return {
		...state,
		activeEventId: state.activeEventId || null,
		events: state.events.map(normalizeEvent)
	};
}

function createEmptyAttendance(users: User[]): Record<string, AttendanceRecord> {
	const attendance: Record<string, AttendanceRecord> = {};

	for (const member of users.filter((user) => user.roles.includes('Member'))) {
		attendance[member.id] = { memberId: member.id, status: 'unseen', updatedAt: new Date().toISOString(), updatedBy: 'system' };
	}

	return attendance;
}

function createDefaultState(): AppState {
	const currentEventId = `event-${randomUUID()}`;

	return {
		users: defaultUsers,
		teams: defaultTeams,
		events: [
			{
				id: currentEventId,
				name: 'Grand Tour Check-in',
				createdAt: new Date().toISOString(),
				registrationOpen: true,
				closedAt: null,
				closedBy: null,
				attendance: createEmptyAttendance(defaultUsers)
			}
		],
		activeEventId: currentEventId
	};
}

async function readStateFile(): Promise<AppState> {
	try {
		const raw = await readFile(stateFile, 'utf8');
		return normalizeState(JSON.parse(raw) as AppState);
	} catch {
		const fallback = createDefaultState();
		await saveState(fallback);
		return fallback;
	}
}

let writeQueue = Promise.resolve();

async function saveState(state: AppState): Promise<void> {
	writeQueue = writeQueue.then(async () => {
		await mkdir(dirname(stateFile), { recursive: true });
		await writeFile(stateFile, JSON.stringify(state, null, 2), 'utf8');
	});

	return writeQueue;
}

export async function getState(): Promise<AppState> {
	if (memoryState) {
		return memoryState;
	}

	memoryState = await readStateFile();
	return memoryState;
}

export async function updateState(mutator: (state: AppState) => AppState | void): Promise<AppState> {
	const state = await getState();
	const nextState = normalizeState(mutator(state) ?? state);
	memoryState = nextState;
	await saveState(nextState);
	notifyStateChange();
	return nextState;
}

export async function findUserByCredentials(username: string, password: string): Promise<User | null> {
	const state = await readStateFile();
	return state.users.find((user) => user.username === username && user.password === password) ?? null;
}

export async function findUserByUsername(username: string): Promise<User | null> {
	const state = await readStateFile();
	return state.users.find((user) => user.username === username) ?? null;
}

export async function getActiveEvent(state?: AppState): Promise<Event | null> {
	const data = normalizeState(state ?? (await readStateFile()));
	return data.events.find((event) => event.id === data.activeEventId) ?? null;
}

export function hasRole(user: User, role: Role): boolean {
	return user.roles.includes(role);
}

export function getRoleRedirect(user: User): '/admin' | '/team-lead' {
	return hasRole(user, 'Administrator') ? '/admin' : '/team-lead';
}

export async function createEvent(name: string): Promise<AppState> {
	return updateState((state) => {
		const attendance = createEmptyAttendance(state.users);
		const event: Event = {
			id: `event-${randomUUID()}`,
			name,
			createdAt: new Date().toISOString(),
			registrationOpen: true,
			closedAt: null,
			closedBy: null,
			attendance
		};
		state.events.unshift(event);
		state.activeEventId = event.id;
	});
}

export async function closeActiveEvent(updatedBy: string): Promise<AppState> {
	return updateState((state) => {
		const event = state.events.find((entry) => entry.id === state.activeEventId);

		if (!event || !event.registrationOpen) {
			return state;
		}

		event.registrationOpen = false;
		event.closedAt = new Date().toISOString();
		event.closedBy = updatedBy;
		state.activeEventId = null;
		return state;
	});
}

function updateAttendanceStatus(state: AppState, memberId: string, status: AttendanceStatus, updatedBy: string): AppState {
	const event = state.events.find((entry) => entry.id === state.activeEventId);

	if (!event || !event.registrationOpen) {
		return state;
	}

	event.attendance[memberId] = { memberId, status, updatedAt: new Date().toISOString(), updatedBy };
	return state;
}

function toggleAttendanceStatus(
	state: AppState,
	memberId: string,
	activeStatus: AttendanceStatus,
	toggledStatus: AttendanceStatus,
	updatedBy: string
): AppState {
	const event = state.events.find((entry) => entry.id === state.activeEventId);

	if (!event || !event.registrationOpen) {
		return state;
	}

	const currentStatus = event.attendance[memberId]?.status ?? 'unseen';
	const nextStatus = currentStatus === activeStatus ? 'unseen' : toggledStatus;
	event.attendance[memberId] = { memberId, status: nextStatus, updatedAt: new Date().toISOString(), updatedBy };
	return state;
}

export async function markMemberSeen(memberId: string, updatedBy: string): Promise<AppState> {
	return updateState((state) => toggleAttendanceStatus(state, memberId, 'seen', 'seen', updatedBy));
}

export async function markMemberSkipping(memberId: string, updatedBy: string): Promise<AppState> {
	return updateState((state) => toggleAttendanceStatus(state, memberId, 'skip-pending', 'skip-pending', updatedBy));
}

export async function approveSkip(memberId: string, updatedBy: string): Promise<AppState> {
	return updateState((state) => updateAttendanceStatus(state, memberId, 'skip-approved', updatedBy));
}

export async function rejectSkip(memberId: string, updatedBy: string): Promise<AppState> {
	return updateState((state) => updateAttendanceStatus(state, memberId, 'skip-rejected', updatedBy));
}

export function buildTeamStatusViews(state: AppState): TeamStatusView[] {
	const activeEvent = state.events.find((event) => event.id === state.activeEventId) ?? null;

	return state.teams.map((team) => {
		const members = team.memberIds
			.map((memberId): TeamMemberStatus | null => {
				const member = state.users.find((user) => user.id === memberId) ?? null;
				if (!member) {
					return null;
				}

				const record = activeEvent?.attendance[member.id] ?? null;
				return { member, status: record?.status ?? 'unseen', record };
			})
			.filter((member): member is TeamMemberStatus => member !== null);

		const checkedCount = members.filter((member) => member.status === 'seen' || member.status === 'skip-approved').length;

		return { team, members, checkedCount, totalCount: members.length, allAccountedFor: members.length > 0 && checkedCount === members.length };
	});
}

export function getUserTeam(state: AppState, user: User): Team | null {
	if (!user.teamId) {
		return null;
	}

	return state.teams.find((team) => team.id === user.teamId) ?? null;
}