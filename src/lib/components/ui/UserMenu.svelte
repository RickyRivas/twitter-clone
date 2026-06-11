<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/state';
	import Avatar from '$lib/components/ui/Avatar.svelte';
	import ThemeToggle from './ThemeToggle.svelte';

	const profile = $derived(page.data.profile);
	const session = $derived(page.data.session);

	let active = $state(false);

	async function handleLogout() {
		await page.data.supabase.auth.signOut();
		await invalidateAll();
		goto('/');
	}

	function handleClickOutside(e: MouseEvent) {
		if (!(e.target as HTMLElement).closest('.user-dropdown')) {
			active = false;
		}
	}
</script>

<svelte:window onclick={handleClickOutside} />

<div class="user-dropdown" class:active>
	<button
		class="user-dropdown-toggle"
		onclick={() => (active = !active)}
		aria-label="click to view options"
		aria-expanded={active}
	>
		<div class="avatar">
			<Avatar
				publicId={profile?.avatar_public_id ?? null}
				alt={profile?.display_name ?? profile?.username ?? ''}
				size={40}
			/>
		</div>
		<div class="info">
			<span class="name">{profile?.display_name ?? profile?.username}</span>
			<span class="email">{session?.user.email}</span>
		</div>
	</button>

	<div class="user-dropdown-list">
		<ul>
			<li>
				<ThemeToggle />
			</li>
			{#if profile}
				<li>
					<a href="/{profile.username}" class="btn">Profile</a>
				</li>
			{/if}
			<li>
				<a href="/settings/profile" class="btn">Edit Profile</a>
			</li>
			<li>
				<a href="/settings/account" class="btn">Account Settings</a>
			</li>
			<li>
				<button class="btn" onclick={handleLogout}>Log Out</button>
			</li>
		</ul>
	</div>
</div>
