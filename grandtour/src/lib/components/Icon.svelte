<script lang="ts">
	let { name } = $props<{ name: 'eye' | 'skip' | 'check' | 'warning' }>();
</script>

{#if name === 'eye'}
	<svg viewBox="0 0 24 24" aria-hidden="true" class="icon-svg"><path d="M2 12c2.5-5 6.2-7.5 10-7.5S19.5 7 22 12c-2.5 5-6.2 7.5-10 7.5S4.5 17 2 12Zm10 4.2A4.2 4.2 0 1 0 7.8 12 4.2 4.2 0 0 0 12 16.2Zm0-2.2A2 2 0 1 1 14 12a2 2 0 0 1-2 2Z" /></svg>
{:else if name === 'skip'}
	<svg viewBox="0 0 24 24" aria-hidden="true" class="icon-svg"><path d="M5 12h10l-4-4 1.4-1.4L20 12l-7.6 5.4L11 16l4-4H5z" /></svg>
{:else if name === 'check'}
	<svg viewBox="0 0 24 24" aria-hidden="true" class="icon-svg"><path d="M9.2 16.2 4.8 11.8l1.4-1.4 3 3 8-8 1.4 1.4z" /></svg>
{:else}
	<svg viewBox="0 0 24 24" aria-hidden="true" class="icon-svg"><path d="M12 2 1.8 20h20.4L12 2Zm1 6v6h-2V8h2Zm0 8v2h-2v-2h2Z" /></svg>
{/if}