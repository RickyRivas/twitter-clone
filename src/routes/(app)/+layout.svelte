<script lang="ts">
	import Navigation from '$lib/components/layout/Navigation.svelte';
	import type { LayoutProps } from './$types';
	const { children }: LayoutProps = $props();
</script>

<Navigation />

<main class="app-main">
	<div class="container">
		{@render children()}
	</div>
</main>
