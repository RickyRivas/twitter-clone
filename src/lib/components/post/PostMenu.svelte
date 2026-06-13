<script lang="ts">
	import { page } from '$app/state';
	import { invalidateAll } from '$app/navigation';
	import { authPrompt } from '$lib/state/authPrompt.svelte';
	import { toast } from 'svelte-sonner';
	import SquareIcon from '$lib/components/ui/SquareIcon.svelte';

	const {
		post,
		authorId,
		ondelete
	}: {
		post: any;
		authorId: string;
		ondelete?: (postId: string) => void;
	} = $props();

	const session = $derived(page.data.session);
	const profile = $derived(page.data.profile);
	const isOwner = $derived(session?.user.id === authorId);
	const isPinned = $derived(profile?.pinned_post_id === post.id);

	let open = $state(false);

	function handleClickOutside(e: MouseEvent) {
		if (!(e.target as HTMLElement).closest('.post-menu')) {
			open = false;
		}
	}

	async function handleDelete() {
		open = false;

		const { error } = await page.data.supabase.from('posts').delete().eq('id', post.id);

		if (error) {
			toast.error('Failed to delete post.');
			return;
		}

		toast.success('Post deleted.');
		await invalidateAll();
		if (ondelete) ondelete(post.id);
	}

	async function handlePin() {
		open = false;

		const { error } = await page.data.supabase
			.from('profiles')
			.update({ pinned_post_id: isPinned ? null : post.id })
			.eq('id', session?.user.id);

		if (error) {
			toast.error(isPinned ? 'Failed to unpin post.' : 'Failed to pin post.');
			return;
		}

		toast.success(isPinned ? 'Post unpinned.' : 'Post pinned to your profile.');
		await invalidateAll();
	}

	function handleReport() {
		open = false;
		if (!session) {
			authPrompt.show();
			return;
		}
		// todo: open report modal
	}
</script>

<svelte:window onclick={handleClickOutside} />

<div class="post-menu">
	<button
		class="btn btn-icon post-menu-toggle btn-round btn-ghost btn--dim-30"
		onclick={(e) => {
			e.stopPropagation();
			open = !open;
		}}
		aria-label="Post options"
		aria-expanded={open}
	>
		<SquareIcon name="meatballs" />
	</button>

	{#if open}
		<div class="post-menu-dropdown">
			<ul>
				{#if isOwner}
					<li>
						<button class="post-menu-item" onclick={handlePin}>
							<span class="icon">
								<SquareIcon name="pin" />
							</span>
							{isPinned ? 'Unpin from profile' : 'Pin to profile'}
						</button>
					</li>
					<li>
						<button class="post-menu-item danger" onclick={handleDelete}>
							<span class="icon">
								<SquareIcon name="trash" />
							</span>
							Delete
						</button>
					</li>
				{:else}
					<li>
						<button class="post-menu-item" onclick={handleReport}>
							<span class="icon">
								<SquareIcon name="flag" />
							</span>
							Report
						</button>
					</li>
				{/if}
			</ul>
		</div>
	{/if}
</div>
