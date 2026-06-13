<script lang="ts">
	import { setTabsContext } from '$lib/components/ui/tabs/tabs-context.svelte';

	interface Props {
		value: string;
		id?: string;
		children: import('svelte').Snippet;
	}

	let { value = $bindable(), id, children }: Props = $props();

	setTabsContext({
		id,
		active: () => value,
		setActive: (v) => (value = v)
	});
</script>

<div {id} data-title={value} data-custom-component="tabs">
	{@render children()}
</div>
