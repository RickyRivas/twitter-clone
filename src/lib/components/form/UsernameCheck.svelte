<script lang="ts">
	import { page } from '$app/state';
	import type { InputAttributes, LabelConfig, FieldState } from '$lib/form/utils/form-types';
	import ErrorMessage from '$lib/components/form/ErrorMessage.svelte';

	const {
		configuration,
		fieldState
	}: {
		configuration: {
			inputAttributes: InputAttributes & { currentUsername?: string; profileId?: string };
			labelConfig: LabelConfig;
		};
		fieldState: FieldState;
	} = $props();

	let available: boolean | null = $state(null);
	let checking = $state(false);
	let timeout: ReturnType<typeof setTimeout>;

	function handleInput(e: Event) {
		const val = (e.target as HTMLInputElement).value;
		clearTimeout(timeout);
		available = null;

		// no check needed if unchanged or too short
		if (val === configuration.inputAttributes.currentUsername || val.length < 3) return;

		checking = true;
		timeout = setTimeout(async () => {
			const { data } = await page.data.supabase
				.from('profiles')
				.select('id')
				.eq('username', val)
				.neq('id', configuration.inputAttributes.profileId ?? '')
				.single();

			available = !data;
			checking = false;
		}, 400);
	}
</script>

<div class="form-control">
	<label>
		{configuration.labelConfig.text}
		<input
			{...configuration.inputAttributes}
			type="text"
			class:error={fieldState.hasError || available === false}
			class:success={available === true}
			oninput={handleInput}
		/>
	</label>

	{#if checking}
		<span class="username-status checking">Checking...</span>
	{:else if available === true}
		<span class="username-status available">Username available</span>
	{:else if available === false}
		<span class="username-status taken">Username taken</span>
	{/if}

	{#if fieldState.hasError && fieldState.statusMessage}
		<ErrorMessage errorMessage={fieldState.statusMessage} />
	{/if}
</div>
