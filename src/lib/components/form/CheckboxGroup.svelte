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

	const selectedValues = $derived(
		typeof configuration.inputAttributes.value === 'string'
			? configuration.inputAttributes.value
					.split(',')
					.map((v) => v.trim())
					.filter(Boolean)
			: []
	);
</script>

<div class="form-control">
	<fieldset>
		<legend>
			{configuration.labelConfig.text}
		</legend>
		{#if configuration.inputAttributes.options?.length}
			<div class="form-checkbox-group">
				{#each configuration.inputAttributes.options as { label, value, disabled } (value)}
					<label>
						<input
							type="checkbox"
							name={configuration.inputAttributes.name}
							{value}
							{disabled}
							checked={selectedValues.includes(value)}
						/>
						{label}
					</label>
				{/each}
			</div>
		{:else}
			<p>No options.</p>
		{/if}
	</fieldset>
	{#if fieldState.hasError && fieldState.statusMessage}
		<ErrorMessage errorMessage={fieldState.statusMessage} />
	{/if}
</div>
