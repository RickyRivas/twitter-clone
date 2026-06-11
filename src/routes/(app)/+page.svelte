<script lang="ts">
	import { toast } from 'svelte-sonner';
	import type { PageProps } from './$types';
	import PostCard from '$lib/components/post/PostCard.svelte';
	import PostComposer from '$lib/components/post/PostComposer.svelte';
	import { pushState } from '$app/navigation';
	import { page } from '$app/state';
	import Modal from '$lib/components/ui/Modal.svelte';
	import { authPrompt } from '$lib/state/authPrompt.svelte';

	let { data }: PageProps = $props();

	const session = $derived(data.session);
	const forYouPosts = $derived(data.forYouPosts);
	const followingPosts = $derived(data.followingPosts);
	const forYouError = $derived(data.forYouError);
	const followingError = $derived(data.followingError);

	let activeTab = $state<'for-you' | 'following'>('for-you');

	const activePosts = $derived(
		activeTab === 'following' && followingPosts ? followingPosts : forYouPosts
	);

	let composerOpen = $derived(!!page.state.compose);

	$effect(() => {
		if (forYouError) toast.error('Failed to load posts. Please try again.');
	});

	$effect(() => {
		if (followingError) toast.error('Failed to load following feed. Please try again.');
	});

	function openCompose() {
		if (!session) {
			authPrompt.show();
			return;
		}
		pushState('/compose/post', { compose: true, replyToId: null });
	}
</script>

<svelte:head>
	<title>Home</title>
</svelte:head>

<div class="feed-page">
	<h1>feed</h1>
	{#if session && !page.state.compose}
		<PostComposer />
	{/if}

	<div class="feed-tabs">
		<button
			class="feed-tab"
			class:active={activeTab === 'for-you'}
			onclick={() => (activeTab = 'for-you')}
		>
			For You
		</button>
		{#if session}
			<button
				class="feed-tab"
				class:active={activeTab === 'following'}
				onclick={() => (activeTab = 'following')}
			>
				Following
			</button>
		{/if}
	</div>

	<div class="feed-posts">
		{#if activePosts.length}
			{#each activePosts as post (post.is_repost ? `repost-${post.id}` : post.id)}
				<PostCard
					{post}
					author={post.profiles ?? post}
					onreply={(postId) => {
						pushState(`/compose/post?replyTo=${postId}`, { compose: true, replyToId: postId });
					}}
				/>
			{/each}
		{:else if !forYouError}
			<div class="feed-empty">
				{#if activeTab === 'following'}
					<p>Follow some people to see their posts here.</p>
				{:else}
					<p>No posts yet. Be the first to post!</p>
				{/if}
			</div>
		{/if}
	</div>
</div>

{#if page.state.compose}
	<Modal id="compose" open={composerOpen} onclose={() => history.back()}>
		{#snippet children({ close })}
			<PostComposer
				replyToId={page.state.replyToId}
				onclose={() => {
					history.back();
				}}
			/>
		{/snippet}
	</Modal>
{/if}
