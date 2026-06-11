<script lang="ts">
	import type { InputAttributes, LabelConfig, FieldState } from '$lib/form/utils/form-types';
	import ErrorMessage from '$lib/components/form/ErrorMessage.svelte';

	const {
		configuration,
		fieldState
	}: {
		configuration: { inputAttributes: InputAttributes; labelConfig: LabelConfig };
		fieldState: FieldState;
	} = $props();
</script>

<div class="form-control screenreader" style:position="absolute">
	<label>
		<span class="screenreader">
			{configuration.labelConfig.text}
		</span>
		<input
			{...configuration.inputAttributes}
			class:error={fieldState.hasError}
			class:success={fieldState.showSuccess}
		/>
	</label>
	{#if fieldState.hasError && fieldState.statusMessage}
		<ErrorMessage errorMessage={fieldState.statusMessage} />
	{/if}
</div>
