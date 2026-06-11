<script lang="ts">
	import { page } from '$app/state';
	import { authPrompt } from '$lib/state/authPrompt.svelte';
	import { invalidateAll } from '$app/navigation';

	const {
		profileId,
		isFollowing: initialIsFollowing
	}: {
		profileId: string;
		isFollowing: boolean;
	} = $props();

	const session = $derived(page.data.session);

	let isFollowing = $state(initialIsFollowing);
	let isLoading = $state(false);

	async function toggleFollow() {
		if (!session) {
			authPrompt.show();
			return;
		}

		isLoading = true;

		// optimistic update
		isFollowing = !isFollowing;

		const { error } = isFollowing
			? await page.data.supabase
					.from('follows')
					.insert({ follower_id: session.user.id, following_id: profileId })
			: await page.data.supabase
					.from('follows')
					.delete()
					.eq('follower_id', session.user.id)
					.eq('following_id', profileId);

		if (error) {
			// revert on failure
			isFollowing = !isFollowing;
			console.error('Follow error:', error);
		} else {
			// revalidate profile counts
			await invalidateAll();
		}

		isLoading = false;
	}
</script>

<button
	class="btn follow-btn"
	class:following={isFollowing}
	class:loading={isLoading}
	onclick={toggleFollow}
	disabled={isLoading}
>
	{isFollowing ? 'Following' : 'Follow'}
</button>
