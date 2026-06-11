<script lang="ts">
	import type { PageProps } from './$types';
	import { page } from '$app/state';
	import { pushState } from '$app/navigation';
	import PostCard from '$lib/components/post/PostCard.svelte';
	import PostComposer from '$lib/components/post/PostComposer.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import SquareIcon from '$lib/components/ui/SquareIcon.svelte';

	let { data }: PageProps = $props();

	const post = $derived(data.post);
	const replies = $derived(data.replies);
	const session = $derived(data.session);
	const profile = $derived(data.profile);

	let composerOpen = $derived(!!page.state.compose);
</script>

<svelte:head>
	<title>{post.profiles?.display_name ?? post.profiles?.username} on the app</title>
	<meta name="description" content={post.content ?? 'View this post'} />
</svelte:head>

<div class="post-page">
	<div class="post-page-header">
		<button class="btn-ghost back-btn" onclick={() => history.back()}>
			<SquareIcon name="arrow-left" />
			<span>Back</span>
		</button>
	</div>

	<!-- root post -->
	<div class="post-page-root">
		<PostCard
			{post}
			author={post.profiles}
			onreply={(postId) => {
				pushState(`/compose/post?replyTo=${postId}`, { compose: true, replyToId: postId });
			}}
		/>
	</div>

	<!-- inline reply composer -->
	{#if session && !page.state.compose}
		<div class="post-page-composer">
			<PostComposer replyToId={post.id} />
		</div>
	{/if}

	<!-- replies -->
	<div class="post-page-replies">
		{#if replies.length}
			{#each replies as reply (reply.id)}
				<PostCard
					post={reply}
					author={reply.profiles}
					onreply={(postId) => {
						pushState(`/compose/post?replyTo=${postId}`, { compose: true, replyToId: postId });
					}}
				/>
			{/each}
		{:else}
			<div class="post-page-empty">
				<p>No replies yet.</p>
			</div>
		{/if}
	</div>
</div>

{#if page.state.compose}
	<Modal id="compose" open={composerOpen} onclose={() => history.back()}>
		{#snippet children({ close })}
			<PostComposer replyToId={page.state.replyToId} onclose={() => history.back()} />
		{/snippet}
	</Modal>
{/if}
