<script lang="ts">
	let { form } = $props();
</script>

<svelte:head>
	<title>Grand Tour Login</title>
</svelte:head>

<section class="auth-shell">
	<div class="auth-card">
		<p class="eyebrow">Grand Tour</p>
		<h1>Class of 2028</h1>
		<p class="auth-copy">Log in to manage student accountability, team check-ins, and event approvals.</p>

		<form method="POST" class="auth-form">
			<label>
				<span>User name</span>
				<input name="username" autocomplete="username" />
			</label>

			<label>
				<span>Password</span>
				<input name="password" type="password" autocomplete="current-password" />
			</label>

			{#if form?.message}
				<p class="form-error">{form.message}</p>
			{/if}

			<button class="primary-button" type="submit">Sign in</button>
		</form>

		<div class="auth-hint">
			<p>Prototype accounts:</p>
			<p><strong>admin / admin123</strong> or <strong>lead1 / lead123</strong></p>
		</div>
	</div>
</section>