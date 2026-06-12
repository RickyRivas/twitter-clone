<script lang="ts">
	import { PUBLIC_CLOUDINARY_CLOUD_NAME } from '$env/static/public';
	import type { InputAttributes, LabelConfig, FieldState } from '$lib/form/utils/form-types';
	import ErrorMessage from '$lib/components/form/ErrorMessage.svelte';

	const {
		configuration,
		fieldState,
		onchange
	}: {
		configuration: {
			inputAttributes: InputAttributes & {
				previewShape?: 'circle' | 'banner';
			};
			labelConfig: LabelConfig;
		};
		fieldState: FieldState;
		onchange?: (file: File | null, publicId: string | null, folder: string) => void;
	} = $props();

	let preview = $state<string | null>(null);
	const publicId = $derived(configuration.inputAttributes.value?.toString() ?? null);
	let file = $state<File | null>(null);

	const isBanner = $derived(configuration.inputAttributes.previewShape === 'banner');

	function handlePick(e: Event) {
		const picked = (e.target as HTMLInputElement).files?.[0];
		if (!picked) return;
		file = picked;
		preview = URL.createObjectURL(picked);
		onchange?.(file, null, configuration.inputAttributes.folder ?? 'uploads');
	}

	function handleRemove() {
		file = null;
		preview = null;
		onchange?.(null, null, configuration.inputAttributes.folder ?? 'uploads');
	}

	const currentSrc = $derived(() => {
		if (preview) return preview;
		if (!publicId) return null;
		if (isBanner) {
			return `https://res.cloudinary.com/${PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/w_1500,h_500,c_fill,f_auto,q_auto/${publicId}`;
		}
		return `https://res.cloudinary.com/${PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/w_160,h_160,c_fill,f_auto,q_auto/${publicId}`;
	});
</script>

<div class="form-control image-upload" class:is-banner={isBanner} class:is-circle={!isBanner}>
	<div class="image-upload-preview">
		<img
			src={currentSrc() ?? '/images/avatar-placeholder.png'}
			alt={configuration.labelConfig.text}
			width="50"
			height="50"
			class="form-control-display"
		/>

		<label
			class="image-upload-trigger btn-ghost"
			aria-label="Upload {configuration.labelConfig.text}"
		>
			<span class="image-upload-label">{configuration.labelConfig.text}</span>
			<input
				type="file"
				accept="image/*"
				onchange={handlePick}
				disabled={configuration.inputAttributes.disabled}
				class="sr-only"
			/>
		</label>
	</div>

	{#if publicId || preview}
		<button type="button" class="btn-ghost image-upload-remove" onclick={handleRemove}>
			Remove
		</button>
	{/if}

	<input
		type="hidden"
		name={configuration.inputAttributes.name}
		value={configuration.inputAttributes.value?.toString() ?? ''}
	/>

	{#if fieldState.hasError && fieldState.statusMessage}
		<ErrorMessage errorMessage={fieldState.statusMessage} />
	{/if}
</div>
