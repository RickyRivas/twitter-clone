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
		{configuration.labelConfig.text}
		<select
			name={configuration.inputAttributes.name}
			class:success={fieldState.showSuccess}
			class:error={fieldState.hasError}
			disabled={configuration.inputAttributes.disabled}
		>
			<option value="">Please select an option</option>
			{#if configuration.inputAttributes.options?.length}
				{#each configuration.inputAttributes.options as { label, value } (value)}
					<option {value}>{label}</option>
				{/each}
			{/if}
		</select>
	</label>

	{#if fieldState.hasError && fieldState.statusMessage}
		<ErrorMessage errorMessage={fieldState.statusMessage} />
	{/if}
</div>
