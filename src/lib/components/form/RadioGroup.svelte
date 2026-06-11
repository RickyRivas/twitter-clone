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

<div class="form-control">
	<fieldset>
		<legend>
			{configuration.labelConfig.text}
		</legend>
		<div class="form-radio-group">
			{#if configuration.inputAttributes.options?.length}
				{#each configuration.inputAttributes.options as { label, value } (value)}
					<label>
						<input
							type="radio"
							name={configuration.inputAttributes.name}
							{value}
							checked={configuration.inputAttributes.value === value}
						/>
						{label}
					</label>
				{/each}
			{:else}
				<p>No options.</p>
			{/if}
		</div>
	</fieldset>
	{#if fieldState.hasError && fieldState.statusMessage}
		<ErrorMessage errorMessage={fieldState.statusMessage} />
	{/if}
</div>
