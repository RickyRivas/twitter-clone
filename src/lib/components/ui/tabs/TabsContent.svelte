<script lang="ts">
	import { getTabsContext } from '$lib/ui/tabs/tabs-context.svelte';

	interface Props {
		value: string;
		children: import('svelte').Snippet;
	}

	let { value, children }: Props = $props();

	const ctx = getTabsContext();
	const isActive = $derived(ctx.active() === value);
</script>

<div
	role="tabpanel"
	tabindex="0"
	id="tabpanel-{value}"
	aria-labelledby="tab-{value}"
	class="tab-panel"
	class:hidden={!isActive}
>
	{@render children()}
</div>
