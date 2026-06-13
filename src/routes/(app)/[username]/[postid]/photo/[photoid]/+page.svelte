<script lang="ts">
	import { PUBLIC_CLOUDINARY_CLOUD_NAME } from '$env/static/public';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import type { PageProps } from './$types';
	import PostCard from '$lib/components/post/PostCard.svelte';
	import PostComposer from '$lib/components/post/PostComposer.svelte';
	import SquareIcon from '$lib/components/ui/SquareIcon.svelte';

	let { data }: PageProps = $props();

	const post = $derived(data.post);
	const images = $derived(data.images);
	const currentMedia = $derived(data.currentMedia);
	const currentIndex = $derived(data.currentIndex);
	const replies = $derived(data.replies);
	const session = $derived(data.session);

	const username = $derived(page.params.username);
	const postId = $derived(page.params.postid);

	const hasPrev = $derived(currentIndex > 0);
	const hasNext = $derived(currentIndex < images.length - 1);

	function navigateTo(index: number) {
		const target = images[index];
		if (target) goto(`/${username}/${postId}/photo/${target.id}`);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'ArrowLeft' && hasPrev) navigateTo(currentIndex - 1);
		if (e.key === 'ArrowRight' && hasNext) navigateTo(currentIndex + 1);
		if (e.key === 'Escape') goto(`/${username}/${postId}`);
	}

	function cloudinaryUrl(publicId: string) {
		return `https://res.cloudinary.com/${PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/f_auto,q_auto/${publicId}`;
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<svelte:head>
	<title>Photo by {post.profiles?.display_name ?? post.profiles?.username}</title>
</svelte:head>

<div class="photo-page">
	<!-- left: image viewer -->
	<div class="photo-page-viewer">
		<div class="photo-page-viewer-top-controls">
			<button
				class="btn btn-icon btn-ghost photo-page-close"
				onclick={() => goto(`/${username}/${postId}`)}
			>
				<SquareIcon name="close" />
			</button>

			<div class="wrap">
				<!-- prev / next -->
				{#if hasPrev}
					<button
						class="btn btn-icon photo-page-nav prev"
						onclick={() => navigateTo(currentIndex - 1)}
						aria-label="Previous image"
					>
						<SquareIcon name="arrow-left" />
					</button>
				{/if}

				{#if hasNext}
					<button
						class="btn btn-icon photo-page-nav next"
						onclick={() => navigateTo(currentIndex + 1)}
						aria-label="Next image"
					>
						<SquareIcon name="arrow-right" />
					</button>
				{/if}
			</div>
		</div>

		<div class="photo-page-image-wrap">
			<img
				src={cloudinaryUrl(currentMedia.cloudinary_public_id)}
				alt={currentMedia.alt_text ?? ''}
				class="photo-page-image"
			/>
		</div>

		<!-- dot indicators -->
		<!-- {#if images.length > 1}
			<div class="photo-page-dots">
				{#each images as img, i (img.id)}
					<button
						class="photo-page-dot"
						class:active={i === currentIndex}
						onclick={() => navigateTo(i)}
						aria-label="Go to image {i + 1}"
					/>
				{/each}
			</div>
		{/if} -->
	</div>

	<!-- right: post + replies -->
	<div class="photo-page-sidebar">
		<PostCard {post} author={post.profiles} skipmedia={true} />

		{#if session}
			<div class="photo-page-composer">
				<PostComposer replyToId={post.id} />
			</div>
		{/if}

		<div class="photo-page-replies">
			{#if replies.length}
				{#each replies as reply (reply.id)}
					<PostCard post={reply} author={reply.profiles} />
				{/each}
			{:else}
				<div class="photo-page-empty">
					<p>No replies yet.</p>
				</div>
			{/if}
		</div>
	</div>
</div>
