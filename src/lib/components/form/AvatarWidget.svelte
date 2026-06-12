<script lang="ts">
	import { onMount } from 'svelte';
	import {
		PUBLIC_CLOUDINARY_CLOUD_NAME,
		PUBLIC_CLOUDINARY_UPLOAD_PRESET
	} from '$env/static/public';
	import type { InputAttributes, LabelConfig, FieldState } from '$lib/form/utils/form-types';
	import ErrorMessage from '$lib/components/form/ErrorMessage.svelte';
	import Avatar from '$lib/components/ui/Avatar.svelte';

	const {
		configuration,
		fieldState
	}: {
		configuration: {
			inputAttributes: InputAttributes & { previewShape?: 'circle' | 'banner' };
			labelConfig: LabelConfig;
		};
		fieldState: FieldState;
	} = $props();

	// local state — driven by widget callback, not tied to config props
	let publicId = $state(configuration.inputAttributes.value?.toString() || null);
	let uploadWidget: any;

	const isBanner = $derived(configuration.inputAttributes.previewShape === 'banner');

	const previewSrc = $derived(
		publicId
			? isBanner
				? `https://res.cloudinary.com/${PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/w_1500,h_500,c_fill,f_auto,q_auto/${publicId}`
				: `https://res.cloudinary.com/${PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/w_160,h_160,c_fill,f_auto,q_auto/${publicId}`
			: null
	);

	function openWidget() {
		uploadWidget?.open();
	}

	function remove() {
		publicId = null;
	}

	onMount(() => {
		function onIdle() {
			if (!uploadWidget) {
				uploadWidget = window.cloudinary.createUploadWidget(
					{
						cloudName: PUBLIC_CLOUDINARY_CLOUD_NAME,
						uploadPreset: PUBLIC_CLOUDINARY_UPLOAD_PRESET,
						multiple: false,
						cropping: true,
						croppingAspectRatio: isBanner ? 3 : 1,
						resourceType: 'image'
					},
					(error: any, result: any) => {
						if (error) return;
						if (result.event === 'success') {
							publicId = result.info.public_id;
						}
					}
				);
			}
		}

		'requestIdleCallback' in window ? requestIdleCallback(onIdle) : setTimeout(onIdle, 1);
	});
</script>

<div class="form-control avatar-widget" class:is-banner={isBanner}>
	<span class="avatar-widget-label">{configuration.labelConfig.text}</span>

	<div class="avatar-widget-preview">
		{#if previewSrc}
			<img src={previewSrc} alt={configuration.labelConfig.text} />
		{:else if !isBanner}
			<Avatar publicId={null} alt="Avatar preview" size={80} />
		{:else}
			<div class="avatar-widget-banner-placeholder"></div>
		{/if}
	</div>

	<div class="avatar-widget-actions">
		<button type="button" class="btn" onclick={openWidget}>
			Upload {configuration.labelConfig.text}
		</button>
		{#if publicId}
			<button type="button" class="btn btn-ghost" onclick={remove}>Remove</button>
		{/if}
	</div>

	<!-- hidden input carries public_id into form submission — driven by local $state -->
	<input
		type="hidden"
		name={configuration.inputAttributes.name}
		value={publicId ?? ''}
		required={configuration.inputAttributes.required}
	/>

	{#if fieldState.hasError && fieldState.statusMessage}
		<ErrorMessage errorMessage={fieldState.statusMessage} />
	{/if}
</div>
