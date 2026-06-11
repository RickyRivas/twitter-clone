<script lang="ts">
	import { onMount } from 'svelte';
	import {
		PUBLIC_CLOUDINARY_CLOUD_NAME,
		PUBLIC_CLOUDINARY_UPLOAD_PRESET
	} from '$env/static/public';
	import type { InputAttributes, LabelConfig, FieldState } from '$lib/utils/form-types';
	import ErrorMessage from '$lib/components/form/ErrorMessage.svelte';
	import Avatar from '$lib/components/ui/Avatar.svelte';

	const {
		configuration,
		fieldState
	}: {
		configuration: { inputAttributes: InputAttributes; labelConfig: LabelConfig };
		fieldState: FieldState;
	} = $props();

	// public_id of the uploaded avatar — drives the hidden input and preview
	let publicId = $state(configuration.inputAttributes.value?.toString() ?? null);

	let uploadWidget: any;

	function cldCallback(error: any, result: any) {
		if (error) return;
		if (result.event === 'success') {
			publicId = result.info.public_id;
		}
	}

	function uploadAvatar() {
		uploadWidget?.open();
	}

	function removeAvatar() {
		publicId = null;
	}

	onMount(() => {
		function onIdle() {
			if (!uploadWidget) {
				uploadWidget = window.cloudinary.createUploadWidget(
					{
						cloudName: PUBLIC_CLOUDINARY_CLOUD_NAME,
						uploadPreset: PUBLIC_CLOUDINARY_UPLOAD_PRESET
					},
					cldCallback
				);
			}
		}

		'requestIdleCallback' in window ? requestIdleCallback(onIdle) : setTimeout(onIdle, 1);
	});
</script>

<div class="form-control">
	<label>
		{configuration.labelConfig.text}
		<!-- hidden input carries public_id into the form submission -->
		<input
			type="hidden"
			name={configuration.inputAttributes.name}
			value={publicId ?? ''}
			required={configuration.inputAttributes.required}
		/>
	</label>

	<div class="avatar-preview">
		<Avatar {publicId} alt="Avatar preview" size={40} />
	</div>

	<button onclick={uploadAvatar} type="button" class="btn">Upload Image</button>
	<button onclick={removeAvatar} type="button" class="btn" disabled={!publicId}>
		Remove Image
	</button>

	{#if fieldState.hasError && fieldState.statusMessage}
		<ErrorMessage errorMessage={fieldState.statusMessage} />
	{/if}
</div>
