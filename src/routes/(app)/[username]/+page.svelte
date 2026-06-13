<script lang="ts">
	import type { PageProps } from './$types';
	import { PUBLIC_CLOUDINARY_CLOUD_NAME } from '$env/static/public';
	import Avatar from '$lib/components/ui/Avatar.svelte';
	import SquareIcon from '$lib/components/ui/SquareIcon.svelte';
	import FollowButton from '$lib/components/profile/FollowButton.svelte';
	import PostCard from '$lib/components/post/PostCard.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import PostComposer from '$lib/components/post/PostComposer.svelte';
	import { page } from '$app/state';
	import { pushState } from '$app/navigation';

	let { data }: PageProps = $props();

	const visitedProfile = $derived(data.visitedProfile);
	const posts = $derived(data.posts);
	const isFollowing = $derived(data.isFollowing);
	const isOwner = $derived(data.isOwner);

	let composerOpen = $derived(!!page.state.compose);

	let settingsOpen = $derived(!!page.state.settingsProfile);
	import SettingsProfileForm from '$lib/components/settings/SettingsProfileForm.svelte';
	import PostCards from '$lib/components/post/PostCards.svelte';
</script>

<svelte:head>
	<title
		>{visitedProfile.display_name ?? visitedProfile.username} (@{visitedProfile.username})</title
	>
	<meta
		name="description"
		content={visitedProfile.bio ?? `${visitedProfile.username} on the app`}
	/>
</svelte:head>

<div class="profile-page">
	<div class="profile-page-header sticky-page-header">
		<button class="btn btn-ghost back-btn" onclick={() => history.back()}>
			<SquareIcon name="chevron-left" />
			<span>Back</span>
		</button>
		<h2>{visitedProfile.display_name ?? visitedProfile.username}</h2>
		<span class="divider"></span>
		<span class="posts-count">{posts.length} Posts</span>
	</div>

	<!-- banner -->
	<div class="profile-banner">
		<img
			src={visitedProfile.banner_public_id
				? 'https://res.cloudinary.com/{PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/w_1500,h_500,c_fill,f_auto,q_auto/{visitedProfile.banner_public_id}'
				: '/images/banner-placeholder.jpg'}
			alt="{visitedProfile.username} banner"
			class="profile-banner-img"
		/>
	</div>

	<!-- profile header -->
	<div class="profile-header">
		<div class="profile-header-top">
			<div class="profile-header-top-avatar">
				<Avatar
					publicId={visitedProfile.avatar_public_id}
					alt={visitedProfile.display_name ?? visitedProfile.username}
					size={80}
				/>
			</div>
			<div class="profile-header-actions">
				{#if isOwner}
					<button
						class="btn"
						onclick={() => pushState('/settings/profile', { settingsProfile: true })}
					>
						Edit Profile
					</button>
				{:else}
					<FollowButton profileId={visitedProfile.id} {isFollowing} />
				{/if}
			</div>
		</div>

		<div class="profile-header-info">
			<div class="profile-name-row">
				<h1 class="profile-display-name">
					{visitedProfile.display_name ?? visitedProfile.username}
				</h1>
				{#if visitedProfile.badge}
					<span class="profile-badge">{visitedProfile.badge}</span>
				{/if}
			</div>
			<span class="profile-username">@{visitedProfile.username}</span>

			{#if visitedProfile.bio}
				<p class="profile-bio">{visitedProfile.bio}</p>
			{/if}

			<div class="profile-meta">
				{#if visitedProfile.location}
					<span class="profile-meta-item">
						<span class="icon">
							<SquareIcon name="location" />
						</span>
						{visitedProfile.location}
					</span>
				{/if}
				{#if visitedProfile.website}
					<a
						href={visitedProfile.website}
						class="profile-meta-item profile-website"
						target="_blank"
						rel="noopener noreferrer"
					>
						<span class="icon">
							<SquareIcon name="link" />
						</span>
						{visitedProfile.website.replace(/^https?:\/\//, '')}
					</a>
				{/if}
				<span class="profile-meta-item">
					<span class="icon">
						<SquareIcon name="calendar" />
					</span>
					Joined {new Date(visitedProfile.created_at).toLocaleDateString('en-US', {
						month: 'long',
						year: 'numeric'
					})}
				</span>
			</div>

			<div class="profile-stats">
				<a href="/{visitedProfile.username}/following" class="profile-stat">
					<span class="profile-stat-count">{visitedProfile.following_count}</span>
					<span class="profile-stat-label">Following</span>
				</a>
				<a href="/{visitedProfile.username}/followers" class="profile-stat">
					<span class="profile-stat-count">{visitedProfile.followers_count}</span>
					<span class="profile-stat-label">Followers</span>
				</a>
			</div>
		</div>
	</div>

	<!-- posts -->
	<PostCards>
		{#if posts.length}
			{#each posts as post (post.is_repost ? `repost-${post.id}` : post.id)}
				<PostCard
					{post}
					author={post.profiles ?? visitedProfile}
					pinned={post.id === visitedProfile.pinned_post_id}
					onreply={(postId) => {
						pushState(`/compose/post?replyTo=${postId}`, { compose: true, replyToId: postId });
					}}
				/>
			{/each}
		{:else}
			<div class="profile-empty">
				<p>No posts yet.</p>
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
				}}
			/>
		{/snippet}
	</Modal>
{/if}

<Modal id="settings-profile" open={settingsOpen} onclose={() => history.back()}>
	<SettingsProfileForm onclose={() => history.back()} />
</Modal>
