<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import Icon from '$lib/components/Icon.svelte';
	import { broadcastStateChange } from '$lib/client/state-sync';
	import { grandTourViewState } from '$lib/client/view-state.svelte';

	let { data, form } = $props();

	const view = grandTourViewState;

	const expandedTeams = $state<Record<string, boolean>>({});

	const syncEnhance = () => {
		return async ({ result, update }: any) => {
			await update();

			if (result.type === 'success') {
				broadcastStateChange();
			}

			await invalidateAll();
		};
	};

	function allTeamsReady() {
		return view.teams.length > 0 && view.teams.every((team) => team.allAccountedFor);
	}

	function hasActiveEvent() {
		return view.activeEvent !== null;
	}

	$effect(() => {
		view.setAdminSnapshot(data);
	});

	function toggleTeam(teamId: string) {
		expandedTeams[teamId] = !expandedTeams[teamId];
	}

	function isExpanded(teamId: string) {
		return expandedTeams[teamId] ?? false;
	}
</script>

<svelte:head>
	<title>Grand Tour Admin</title>
</svelte:head>

<section class="dashboard-shell">
	<header class="topbar">
		<div>
			<p class="eyebrow">Administrator view</p>
			<h1>{view.activeEvent?.name ?? 'Active event'}</h1>
			<p class="muted">Track team progress, review skip approvals, and open new events.</p>
		</div>
		<div class="topbar-actions">
			<a class="secondary-button" href="/logout">Logout</a>
		</div>
	</header>

	<div class="summary-grid">
		<div class="summary-card">
			<span class="summary-label">Active event</span>
			<strong>{view.activeEvent?.name ?? 'None'}</strong>
		</div>
		<div class="summary-card">
			<span class="summary-label">Registration</span>
			<strong>{view.registrationOpen ? 'Open' : 'Closed'}</strong>
		</div>
		<div class="summary-card">
			<span class="summary-label">Pending approvals</span>
			<strong>{view.pendingApprovals.length}</strong>
		</div>
	</div>

	{#if !hasActiveEvent()}
		<section class="panel panel--full-width">
			<div class="panel-header">
				<div>
					<p class="eyebrow">No active event</p>
					<h2>Create event</h2>
					<p class="muted">Start a new registration session to begin tracking teams.</p>
				</div>
			</div>
			<form method="POST" action="?/createEvent" class="event-form" use:enhance={syncEnhance}>
				<label>
					<span>Event name</span>
					<input name="name" placeholder="Grand Tour Stop 2" />
				</label>
				{#if form?.message}
					<p class="form-error">{form.message}</p>
				{/if}
				<button class="primary-button" type="submit">Create event</button>
			</form>
		</section>
	{:else if view.registrationOpen}
		<div class="content-grid">
			<section class="panel approvals-panel">
				<div class="panel-header">
					<h2>Skip approvals</h2>
				</div>
				{#if view.pendingApprovals.length}
					<div class="approval-list">
						{#each view.pendingApprovals as member}
							<div class="approval-row">
								<div>
									<strong>{member.member.name}</strong>
									<p class="muted">{member.member.phoneNumber}</p>
								</div>
								<div class="row-actions">
									<form method="POST" action="?/approveSkip" use:enhance={syncEnhance}>
										<input type="hidden" name="memberId" value={member.member.id} />
										<button class="icon-button success" type="submit"><Icon name="check" /></button>
									</form>
									<form method="POST" action="?/rejectSkip" use:enhance={syncEnhance}>
										<input type="hidden" name="memberId" value={member.member.id} />
										<button class="icon-button warning" type="submit"><Icon name="warning" /></button>
									</form>
								</div>
							</div>
						{/each}
					</div>
				{:else}
					<p class="muted">No pending skip approvals.</p>
				{/if}
			</section>
		</div>

		{#if allTeamsReady()}
			<section class="panel ready-panel">
				<div class="ready-icon" aria-hidden="true">
					<Icon name="check" />
				</div>
				<div class="ready-copy">
					<p class="eyebrow">Teams ready</p>
					<h2>All teams are ready to go</h2>
					<p class="muted">Every member has been accounted for.</p>
				</div>
				<div class="ready-actions">
					<form method="POST" action="?/closeRegistration" use:enhance={syncEnhance}>
						<button class="secondary-button ready-button" type="submit">End registration session</button>
					</form>
				</div>
			</section>
		{/if}
	{/if}

	<section class="team-list">
		{#each view.teams as team}
			<article class="panel team-panel">
				<button class="team-toggle" type="button" onclick={() => toggleTeam(team.team.id)}>
					<div>
						<h2>{team.team.name}</h2>
						<p class="muted">{team.checkedCount}/{team.totalCount} accounted for</p>
					</div>
					<div class="team-status">
						{#if team.allAccountedFor}
							<Icon name="check" />
						{/if}
						<span>{isExpanded(team.team.id) ? 'Collapse' : 'Expand'}</span>
					</div>
				</button>

				{#if isExpanded(team.team.id)}
					<div class="member-grid">
						{#each team.members as member}
							<div class="member-row">
								<div><strong>{member.member.name}</strong></div>
								<div class="muted">{member.member.phoneNumber}</div>
								<div class="status-chip {member.status}">{member.status}</div>
							</div>
						{/each}
					</div>
				{/if}
			</article>
		{/each}
	</section>
</section>