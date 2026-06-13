<script lang="ts">
	import { getTabsContext } from '$lib/ui/tabs/tabs-context.svelte';

	interface Props {
		value: string;
		disabled?: boolean;
		children: import('svelte').Snippet;
		iconBtn?: boolean;
	}

	let { value, disabled = false, children, iconBtn = false }: Props = $props();

	const ctx = getTabsContext();
	const isActive = $derived(ctx.active() === value);

	function onclick() {
		if (disabled) return;
		ctx.setActive(value);
	}
</script>

<button
	data-value={value}
	id="tab-{value}"
	type="button"
	class="btn {iconBtn ? 'icon-btn' : ''}"
	role="tab"
	aria-selected={isActive}
	aria-controls="tabpanel-{value}"
	tabindex={isActive ? 0 : -1}
	{disabled}
	{onclick}
>
	<span class="cta">
		{@render children()}
	</span>
</button>
