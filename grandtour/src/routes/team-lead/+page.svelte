<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import Icon from '$lib/components/Icon.svelte';
	import { broadcastStateChange } from '$lib/client/state-sync';
	import { grandTourViewState } from '$lib/client/view-state.svelte';

	let { data } = $props();

	const view = grandTourViewState;

	const syncEnhance = () => {
		return async ({ result, update }: any) => {
			await update();

			if (result.type === 'success') {
				broadcastStateChange();
			}

			await invalidateAll();
		};
	};

	$effect(() => {
		view.setTeamLeadSnapshot(data);
	});

	function getStatusLabel(status: string) {
		switch (status) {
			case 'seen':
				return 'Validated';
			case 'skip-pending':
				return 'Skip pending';
			case 'skip-approved':
				return 'Skip approved';
			case 'skip-rejected':
				return 'Skip rejected';
			default:
				return 'Unseen';
		}
	}
</script>

<svelte:head>
	<title>Grand Tour Team Lead</title>
</svelte:head>

<section class="dashboard-shell">
	<header class="topbar">
		<div>
			<p class="eyebrow">Team Lead view</p>
			<h1>{view.team?.team.name ?? 'Team'}</h1>
			<p class="muted">Mark students present or flag them for admin review.</p>
		</div>
		<a class="secondary-button" href="/logout">Logout</a>
	</header>

	<section class="panel">
		<div class="panel-header">
			<h2>{view.activeEvent?.name ?? 'Active event'}</h2>
			<p class="muted">{view.team?.checkedCount ?? 0}/{view.team?.totalCount ?? 0} accounted for</p>
		</div>

		{#if !view.activeEvent}
			<p class="session-banner">No Active roll call at this time</p>
		{:else}
			<div class="member-grid lead-grid">
				{#each view.team?.members ?? [] as member}
					<div class="member-row lead-row">
						<div><strong>{member.member.name}</strong></div>
						<div class="muted">{member.member.phoneNumber}</div>
						<div class="status-chip {member.status}">{getStatusLabel(member.status)}</div>
						<div class="row-actions">
							<form method="POST" action="?/seen" use:enhance={syncEnhance}>
								<input type="hidden" name="memberId" value={member.member.id} />
								<button class="icon-button success" type="submit" aria-label={`Mark ${member.member.name} as seen`} title="I have seen this member" disabled={view.activeEvent ? !view.activeEvent.registrationOpen : true}><Icon name="eye" /></button>
							</form>
							<form method="POST" action="?/skipping" use:enhance={syncEnhance}>
								<input type="hidden" name="memberId" value={member.member.id} />
								<button class="icon-button warning" type="submit" aria-label={`Mark ${member.member.name} as skipping`} title="Member intends to skip the event" disabled={view.activeEvent ? !view.activeEvent.registrationOpen : true}><Icon name="skip" /></button>
							</form>
						</div>
					</div>
				{/each}
			</div>
		{/if}

	</section>
</section>