<script lang="ts">
	import { goto } from '$app/navigation';
	import Avatar from '$lib/components/ui/Avatar.svelte';
	import PostActions from '$lib/components/post/PostActions.svelte';
	import PostMedia from '$lib/components/post/PostMedia.svelte';
	import SquareIcon from '$lib/components/ui/SquareIcon.svelte';
	import { timeAgo } from '$lib/utils/timeAgo';
	import PostMenu from './PostMenu.svelte';

	const {
		post,
		author,
		pinned = false,
		onreply
	}: {
		post: any;
		author: any;
		pinned?: boolean;
		onreply?: (postId: string) => void;
	} = $props();

	function handleTextClick() {
		goto(`/${author.username}/${post.id}`);
	}
</script>

<article class="post-card">
	{#if post.is_repost}
		<div class="post-card-reposted-by">
			<span class="icon">
				<SquareIcon name="repost" />
			</span>
			<span>{post.reposted_by} reposted</span>
		</div>
	{/if}
	{#if pinned}
		<div class="post-card-pinned">
			<SquareIcon name="pin" />
			<span>Pinned</span>
		</div>
	{/if}

	<div class="post-card-inner">
		<a href="/{author.username}" class="post-card-avatar" onclick={(e) => e.stopPropagation()}>
			<Avatar
				publicId={author.avatar_public_id}
				alt={author.display_name ?? author.username}
				size={40}
			/>
		</a>

		<div class="post-card-body">
			<div class="post-card-header">
				<a href="/{author.username}" class="post-card-author" onclick={(e) => e.stopPropagation()}>
					<span class="post-card-display-name">{author.display_name ?? author.username}</span>
					<span class="post-card-username">@{author.username}</span>
				</a>
				<a
					href="/{author.username}/{post.id}"
					class="post-card-time"
					onclick={(e) => e.stopPropagation()}
				>
					{timeAgo(post.created_at)}
				</a>
				<PostMenu {post} authorId={post.author_id} />
			</div>

			<!-- clicking text navigates to post -->
			{#if post.content}
				<button class="post-card-content" onclick={handleTextClick}>
					{post.content}
				</button>
			{/if}

			<!-- media -->
			{#if post.post_media?.length}
				<PostMedia media={post.post_media} authorUsername={author.username} postId={post.id} />
			{/if}

			<PostActions {post} onreply={(postId) => onreply?.(postId)} />
		</div>
	</div>
</article>
