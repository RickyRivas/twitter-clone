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
		<textarea
			name={configuration.inputAttributes.name}
			placeholder={configuration.inputAttributes.placeholder}
			required={configuration.inputAttributes.required}
			disabled={configuration.inputAttributes.disabled}
			class:error={fieldState.hasError}
			class:success={fieldState.showSuccess}>{configuration.inputAttributes.value}</textarea
		>
	</label>
	{#if fieldState.hasError && fieldState.statusMessage}
		<ErrorMessage errorMessage={fieldState.statusMessage} />
	{/if}
</div>
