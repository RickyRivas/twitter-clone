<script lang="ts">
	import { page } from '$app/state';
	import { invalidateAll } from '$app/navigation';
	import {
		PUBLIC_CLOUDINARY_CLOUD_NAME,
		PUBLIC_CLOUDINARY_UPLOAD_PRESET
	} from '$env/static/public';
	import Avatar from '$lib/components/ui/Avatar.svelte';
	import SquareIcon from '$lib/components/ui/SquareIcon.svelte';
	import LoadingSpinner from '../ui/LoadingSpinner.svelte';
	import { toast } from 'svelte-sonner';

	const { replyToId = null, onclose }: { replyToId?: string | null; onclose?: () => void } =
		$props();

	const profile = $derived(page.data.profile);

	const MAX_CHARS = 280;
	const CIRCLE_RADIUS = 14;
	const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;
	const SHOW_COUNT_THRESHOLD = 20; // show number when this many chars remaining

	let text = $state('');
	let media = $state<any[]>([]);
	let isSubmitting = $state(false);
	let uploadWidget: any;
	let textarea: HTMLTextAreaElement;

	const charCount = $derived(text.length);
	const charsLeft = $derived(MAX_CHARS - charCount);
	const isOverLimit = $derived(charCount > MAX_CHARS);
	const canSubmit = $derived(
		(text.trim().length > 0 || media.length > 0) && !isSubmitting && !isOverLimit
	);

	// circle progress: 0 = empty, 1 = full
	const circleProgress = $derived(Math.min(charCount / MAX_CHARS, 1));
	const strokeDashoffset = $derived(CIRCLE_CIRCUMFERENCE * (1 - circleProgress));
	const showCircle = $derived(charCount > 0);
	const showCount = $derived(charsLeft <= SHOW_COUNT_THRESHOLD);

	// circle color
	const circleColor = $derived(
		isOverLimit
			? 'var(--error)'
			: charsLeft <= SHOW_COUNT_THRESHOLD
				? 'var(--warning)'
				: 'var(--text)'
	);

	function autoResize() {
		if (!textarea) return;
		textarea.style.height = 'auto';
		textarea.style.height = `${textarea.scrollHeight}px`;
	}

	function openMediaUpload() {
		if (!uploadWidget) {
			uploadWidget = window.cloudinary.createUploadWidget(
				{
					cloudName: PUBLIC_CLOUDINARY_CLOUD_NAME,
					uploadPreset: PUBLIC_CLOUDINARY_UPLOAD_PRESET,
					multiple: true,
					maxFiles: 4,
					resourceType: 'auto'
				},
				(error: any, result: any) => {
					if (error) return;
					if (result.event === 'success') {
						const { public_id, resource_type, format, width, height, duration } = result.info;
						media = [
							...media,
							{
								cloudinary_public_id: public_id,
								resource_type,
								format,
								width: width ?? null,
								height: height ?? null,
								duration_seconds: duration ?? null,
								position: media.length
							}
						];
					}
				}
			);
		}
		uploadWidget.open();
	}

	function removeMedia(index: number) {
		media = media.filter((_, i) => i !== index).map((m, i) => ({ ...m, position: i }));
	}

	async function handleSubmit() {
		if (!canSubmit) return;
		isSubmitting = true;

		// insert post
		const { data: post, error: postError } = await page.data.supabase
			.from('posts')
			.insert({
				author_id: profile.id,
				content: text.trim() || null,
				reply_to_id: replyToId
			})
			.select('id')
			.single();

		if (postError || !post) {
			console.error('Post error:', postError);
			toast.error('There was an error while posting.');
			isSubmitting = false;
			return;
		}

		// insert media rows
		if (media.length > 0) {
			const mediaRows = media.map((m) => ({
				post_id: post.id,
				...m
			}));
			await page.data.supabase.from('post_media').insert(mediaRows);
		}

		// reset
		text = '';
		media = [];
		isSubmitting = false;
		toast.success('Posted!');

		if (textarea) {
			textarea.style.height = 'auto';
		}

		await invalidateAll();
		await invalidateAll();
		if (onclose) onclose();
	}
</script>

<div class="post-composer">
	<div class="post-composer-avatar">
		<Avatar
			publicId={profile?.avatar_public_id ?? null}
			alt={profile?.display_name ?? profile?.username ?? ''}
			size={40}
		/>
	</div>

	<div class="post-composer-body">
		<textarea
			bind:this={textarea}
			bind:value={text}
			oninput={autoResize}
			placeholder="What's happening?"
			rows="1"
			class="post-composer-textarea"
			class:error={isOverLimit}
			disabled={isSubmitting}
		></textarea>

		<!-- media preview -->
		{#if media.length > 0}
			<div class="post-composer-media count-{media.length}">
				{#each media as item, i (item.cloudinary_public_id)}
					<div class="post-composer-media-item">
						{#if item.resource_type === 'image'}
							<img
								src="https://res.cloudinary.com/{PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/w_150,h_150,c_fill,f_auto,q_auto/{item.cloudinary_public_id}"
								alt="Upload preview"
							/>
						{:else if item.resource_type === 'video'}
							<div class="post-composer-media-video">
								<SquareIcon name="video" />
								<span>{item.format}</span>
							</div>
						{:else}
							<div class="post-composer-media-audio">
								<SquareIcon name="audio" />
								<span>{item.format}</span>
							</div>
						{/if}
						<button
							class="btn btn-icon post-composer-media-remove"
							onclick={() => removeMedia(i)}
							aria-label="Remove media"
							type="button"
						>
							<SquareIcon name="close" />
						</button>
					</div>
				{/each}
			</div>
		{/if}

		<div class="post-composer-footer">
			<div class="post-composer-tools">
				<!-- media upload -->
				<button
					class="btn btn-icon post-composer-tool"
					onclick={openMediaUpload}
					disabled={media.length >= 4}
					aria-label="Add media"
					type="button"
				>
					<SquareIcon name="image" />
				</button>
			</div>

			<div class="post-composer-submit">
				<!-- char limit indicator -->
				{#if showCircle}
					<div class="post-composer-char-indicator" aria-label="{charsLeft} characters remaining">
						<svg
							width="30"
							height="30"
							viewBox="0 0 30 30"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<!-- track -->
							<circle
								cx="15"
								cy="15"
								r={CIRCLE_RADIUS}
								stroke="var(--border-color)"
								stroke-width="2"
								fill="none"
							/>
							<!-- progress -->
							<circle
								cx="15"
								cy="15"
								r={CIRCLE_RADIUS}
								stroke={circleColor}
								stroke-width="2"
								fill="none"
								stroke-dasharray={CIRCLE_CIRCUMFERENCE}
								stroke-dashoffset={strokeDashoffset}
								stroke-linecap="round"
								transform="rotate(-90 15 15)"
							/>
						</svg>
						{#if showCount}
							<span class="post-composer-char-count" class:error={isOverLimit}>
								{charsLeft}
							</span>
						{/if}
					</div>
				{/if}

				{#if showCircle}
					<span class="divider"></span>
				{/if}
				<button
					class="btn post-composer-submit-btn"
					onclick={handleSubmit}
					disabled={!canSubmit || isSubmitting}
				>
					{#if isSubmitting}
						<LoadingSpinner loading={true} dim={18} /> Posting
					{:else}
						Post
					{/if}
				</button>
			</div>
		</div>
	</div>
</div>
