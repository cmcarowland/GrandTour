<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import { onMount } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import { listenForStateChanges } from '$lib/client/state-sync';
	import '../app.css';

	let { children } = $props();

	onMount(() => listenForStateChanges(() => {
		void invalidateAll();
	}));
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
