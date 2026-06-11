<script lang="ts">
	import type { InputAttributes, LabelConfig, FieldState } from '$lib/utils/form-types';
	import ErrorMessage from '$lib/components/form/ErrorMessage.svelte';

	const {
		configuration,
		fieldState
	}: {
		configuration: { inputAttributes: InputAttributes; labelConfig: LabelConfig };
		fieldState: FieldState;
	} = $props();
</script>

<div class="form-control">
	<label>
		<input
			type="checkbox"
			name={configuration.inputAttributes.name}
			disabled={configuration.inputAttributes.disabled}
			checked={Boolean(configuration.inputAttributes.value)}
		/>
		{configuration.labelConfig.text}
	</label>
	{#if fieldState.hasError && fieldState.statusMessage}
		<ErrorMessage errorMessage={fieldState.statusMessage} />
	{/if}
</div>
