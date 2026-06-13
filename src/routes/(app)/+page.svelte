<script lang="ts">
	import { toast } from 'svelte-sonner';
	import type { PageProps } from './$types';
	import PostCard from '$lib/components/post/PostCard.svelte';
	import PostComposer from '$lib/components/post/PostComposer.svelte';
	import { pushState } from '$app/navigation';
	import { page } from '$app/state';
	import Modal from '$lib/components/ui/Modal.svelte';
	import { authPrompt } from '$lib/state/authPrompt.svelte';
	import PostCards from '$lib/components/post/PostCards.svelte';

	let { data }: PageProps = $props();

	const session = $derived(data.session);

	let activeTab = $state<'for-you' | 'following'>('for-you');
	let posts = $state(data.forYouPosts ?? []);
	let loading = $state(false);
	let error = $state<string | null>(null);

	async function fetchPosts(tab: 'for-you' | 'following') {
		loading = true;
		error = null;
		try {
			const res = await fetch(`/api/feed?tab=${tab}`);
			if (!res.ok) throw new Error('Failed to load posts');
			const data = await res.json();
			posts = data.posts;
		} catch (e) {
			error = 'Failed to load posts. Please try again.';
			toast.error(error);
		} finally {
			loading = false;
		}
	}

	async function switchTab(tab: 'for-you' | 'following') {
		if (tab === activeTab) return;
		activeTab = tab;
		await fetchPosts(tab);
	}

	// Refetch current tab — call this after post actions
	export function refresh() {
		fetchPosts(activeTab);
	}

	let composerOpen = $derived(!!page.state.compose);

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
	<h1 class="screenreader">Your feed</h1>

	<div class="feed-tabs">
		<button
			class="btn feed-tab"
			class:active={activeTab === 'for-you'}
			onclick={() => switchTab('for-you')}
		>
			For You
		</button>
		{#if session}
			<button
				class="btn feed-tab"
				class:active={activeTab === 'following'}
				onclick={() => switchTab('following')}
			>
				Following
			</button>
		{/if}
	</div>

	{#if session && !page.state.compose}
		<PostComposer
			onpost={() => fetchPosts(activeTab)}
			onclose={() => {
				fetchPosts(activeTab);
			}}
		/>
	{/if}

	<PostCards>
		{#if loading}
			<div class="feed-loading">Loading...</div>
		{:else if posts.length}
			{#each posts as post (post.is_repost ? `repost-${post.id}` : post.id)}
				<PostCard
					{post}
					author={post.profiles ?? post}
					onaction={() => fetchPosts(activeTab)}
					ondelete={(postId) => {
						posts = posts.filter((p) => p.id !== postId);
					}}
					onreply={(postId) => {
						pushState(`/compose/post?replyTo=${postId}`, { compose: true, replyToId: postId });
					}}
				/>
			{/each}
		{:else if !error}
			<div class="feed-empty">
				{#if activeTab === 'following'}
					<p>Follow some people to see their posts here.</p>
				{:else}
					<p>No posts yet. Be the first to post!</p>
				{/if}
			</div>
		{/if}
	</PostCards>
</div>

{#if page.state.compose}
	<Modal id="compose" open={composerOpen} onclose={() => history.back()}>
		{#snippet children({ close })}
			<PostComposer
				replyToId={page.state.replyToId}
				onclose={() => {
					history.back();
					fetchPosts(activeTab);
				}}
			/>
		{/snippet}
	</Modal>
{/if}
