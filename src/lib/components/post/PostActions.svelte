<script lang="ts">
	import { page } from '$app/state';
	import { authPrompt } from '$lib/state/authPrompt.svelte';
	import SquareIcon from '$lib/components/ui/SquareIcon.svelte';

	const { post, onreply }: { post: any; onreply?: (postId: string) => void } = $props();

	function handleReply() {
		if (!session) {
			authPrompt.show();
			return;
		}
		onreply?.(post.id);
	}

	const session = $derived(page.data.session);

	let liked = $state(post.liked ?? false);
	let reposted = $state(post.reposted ?? false);
	let likeCount = $state(post.likes_count ?? 0);
	let repostCount = $state(post.reposts_count ?? 0);

	async function toggleLike() {
		if (!session) {
			authPrompt.show();
			return;
		}

		const wasLiked = liked;
		liked = !liked;
		likeCount += liked ? 1 : -1;

		const { error } = wasLiked
			? await page.data.supabase
					.from('likes')
					.delete()
					.eq('user_id', session.user.id)
					.eq('post_id', post.id)
			: await page.data.supabase
					.from('likes')
					.insert({ user_id: session.user.id, post_id: post.id });

		if (error) {
			liked = wasLiked;
			likeCount += wasLiked ? 1 : -1;
		}
	}

	async function toggleRepost() {
		if (!session) {
			authPrompt.show();
			return;
		}

		const wasReposted = reposted;
		reposted = !reposted;
		repostCount += reposted ? 1 : -1;

		const { error } = wasReposted
			? await page.data.supabase
					.from('reposts')
					.delete()
					.eq('user_id', session.user.id)
					.eq('post_id', post.id)
			: await page.data.supabase
					.from('reposts')
					.insert({ user_id: session.user.id, post_id: post.id });

		if (error) {
			reposted = wasReposted;
			repostCount += wasReposted ? 1 : -1;
		}
	}

	async function handleShare() {
		const url = `${window.location.origin}/${post.author?.username}/${post.id}`;
		if (navigator.share) {
			await navigator.share({ url });
		} else {
			await navigator.clipboard.writeText(url);
		}
	}
</script>

<div class="post-actions">
	<div class="post-action">
		<button class="reply" onclick={handleReply} aria-label="Reply">
			<SquareIcon name="reply" />
			{#if post.replies_count > 0}
				<span class="post-action-count">{post.replies_count}</span>
			{/if}
		</button>
	</div>

	<div class="post-action">
		<button class="repost" class:active={reposted} onclick={toggleRepost} aria-label="Repost">
			<SquareIcon name="repost" />
			{#if repostCount > 0}
				<span class="post-action-count">{repostCount}</span>
			{/if}
		</button>
	</div>

	<div class="post-action">
		<button class="like" class:active={liked} onclick={toggleLike} aria-label="Like">
			<SquareIcon name="heart" />
			{#if likeCount > 0}
				<span class="post-action-count">{likeCount}</span>
			{/if}
		</button>
	</div>

	<div class="post-action">
		<button class="share" onclick={handleShare} aria-label="Share">
			<SquareIcon name="share" />
		</button>
	</div>
</div>
