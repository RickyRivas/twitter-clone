<script lang="ts">
	import { enhance } from '$app/forms';
	import { formHandler } from '$lib/form/utils/form-helpers';
	import type { FormConfig, TriggerUpdate } from '$lib/form/utils/form-types';
	import LoadingSpinner from '$lib/components/ui/LoadingSpinner.svelte';
	import AvatarWidget from './AvatarWidget.svelte';
	import Checkbox from '$lib/components/form/Checkbox.svelte';
	import CheckboxGroup from '$lib/components/form/CheckboxGroup.svelte';
	import TextInput from '$lib/components/form/TextInput.svelte';
	import FormSelect from '$lib/components/form/SelectInput.svelte';
	import FormTextarea from '$lib/components/form/FormTextArea.svelte';
	import HiddenInput from '$lib/components/form/HiddenInput.svelte';
	import RadioGroup from '$lib/components/form/RadioGroup.svelte';
	import ErrorMessage from '$lib/components/form/ErrorMessage.svelte';
	import ImageUpload from './ImageUpload.svelte';
	import UsernameCheck from './UsernameCheck.svelte';

	const {
		config,
		name,
		clearOnSuccess = false,
		triggerUpdate,
		onSuccess,
		classes = ['default-styling']
	}: {
		config: FormConfig;
		name: string;
		clearOnSuccess?: boolean;
		triggerUpdate: TriggerUpdate;
		onSuccess?: (result: any) => void | Promise<void>;
		classes?: string[];
	} = $props();

	const { formState, fieldDefinitions, formAttributes } = config;

	const fieldComponents: Record<string, any> = {
		text: TextInput,
		email: TextInput,
		password: TextInput,
		tel: TextInput,
		phone: TextInput,
		date: TextInput,
		number: TextInput,
		time: TextInput,
		url: TextInput,
		textarea: FormTextarea,
		'radio-group': RadioGroup,
		checkbox: Checkbox,
		'checkbox-group': CheckboxGroup,
		select: FormSelect,
		hidden: HiddenInput,
		'avatar-widget': AvatarWidget,
		'image-upload': ImageUpload,
		'username-check': UsernameCheck
	};
</script>

<form
	{...formAttributes}
	use:enhance={formHandler(config, onSuccess, clearOnSuccess)}
	class={classes.join(' ')}
	data-form-name={name}
>
	{#each fieldDefinitions as { fieldState, configuration }, index (configuration.inputAttributes.name)}
		{@const Component = fieldComponents[configuration.inputAttributes.type]}
		{#if Component}
			{#if configuration.inputAttributes.type === 'image-upload'}
				<Component
					{configuration}
					{fieldState}
					{index}
					{triggerUpdate}
					onchange={(file, publicId, folder) => {
						(configuration.inputAttributes as any)._file = file;
						(configuration.inputAttributes as any)._folder = folder;
						(configuration.inputAttributes as any).value = publicId ?? '';
					}}
				/>
			{:else}
				<Component {configuration} {fieldState} {index} {triggerUpdate} />
			{/if}
		{/if}
	{/each}

	{#if formState.statusMessage && formState.hasError}
		<ErrorMessage errorMessage={formState.statusMessage} />
	{/if}

	<button
		class="btn"
		disabled={formState.isDisabled}
		class:error={formState.hasError}
		class:success={formState.showSuccess}
	>
		{#if formState.isLoading}
			<LoadingSpinner
				dim={44}
				loading={formState.isLoading}
				success={formState.showSuccess}
				error={formState.hasError}
			/>
		{:else}
			<span>{formState.submitButtonText}</span>
		{/if}
	</button>
</form>
