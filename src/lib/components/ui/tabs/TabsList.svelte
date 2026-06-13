<script lang="ts">
	import { getTabsContext } from '$lib/ui/tabs/tabs-context.svelte';

	interface Props {
		children: import('svelte').Snippet;
	}
	let { children }: Props = $props();

	const ctx = getTabsContext();
	const uid = $derived(ctx.id);
</script>

<h3 id="tablist-{uid}" class="screenreader">tabs</h3>
<div class="tabs-list" role="tablist" aria-labelledby="tablist-{uid}" data-custom-component="tabs">
	{@render children()}
</div>
