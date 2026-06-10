<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Grand Tour Team Lead</title>
</svelte:head>

<section class="dashboard-shell">
	<header class="topbar">
		<div>
			<p class="eyebrow">Team Lead view</p>
			<h1>{data.team?.team.name ?? 'Team'}</h1>
			<p class="muted">Mark students present or flag them for admin review.</p>
		</div>
		<a class="secondary-button" href="/logout">Logout</a>
	</header>

	<section class="panel">
		<div class="panel-header">
			<h2>{data.activeEvent?.name ?? 'Active event'}</h2>
			<p class="muted">{data.team?.checkedCount ?? 0}/{data.team?.totalCount ?? 0} accounted for</p>
		</div>

		<div class="member-grid lead-grid">
			{#each data.team?.members ?? [] as member}
				<div class="member-row lead-row">
					<div><strong>{member.member.name}</strong></div>
					<div class="muted">{member.member.phoneNumber}</div>
					<div class="row-actions">
						<form method="POST" action="?/seen">
							<input type="hidden" name="memberId" value={member.member.id} />
							<button class="icon-button success" type="submit" aria-label={`Mark ${member.member.name} as seen`}><Icon name="eye" /></button>
						</form>
						<form method="POST" action="?/skipping">
							<input type="hidden" name="memberId" value={member.member.id} />
							<button class="icon-button warning" type="submit" aria-label={`Mark ${member.member.name} as skipping`}><Icon name="skip" /></button>
						</form>
					</div>
				</div>
			{/each}
		</div>
	</section>
</section>