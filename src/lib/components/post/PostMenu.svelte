<script lang="ts">
	import { page } from '$app/state';
	import { invalidateAll } from '$app/navigation';
	import { authPrompt } from '$lib/state/authPrompt.svelte';
	import { toast } from 'svelte-sonner';
	import SquareIcon from '$lib/components/ui/SquareIcon.svelte';

	const {
		post,
		authorId
	}: {
		post: any;
		authorId: string;
	} = $props();

	const session = $derived(page.data.session);
	const isOwner = $derived(session?.user.id === authorId);

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
		class="post-menu-toggle btn-ghost"
		onclick={(e) => {
			e.stopPropagation();
			open = !open;
		}}
		aria-label="Post options"
		aria-expanded={open}
	>
		<SquareIcon name="more" />
	</button>

	{#if open}
		<div class="post-menu-dropdown">
			<ul>
				{#if isOwner}
					<li>
						<button class="post-menu-item danger" onclick={handleDelete}>
							<SquareIcon name="trash" />
							Delete
						</button>
					</li>
				{:else}
					<li>
						<button class="post-menu-item" onclick={handleReport}>
							<SquareIcon name="flag" />
							Report
						</button>
					</li>
				{/if}
			</ul>
		</div>
	{/if}
</div>
