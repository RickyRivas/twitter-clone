<script lang="ts">
	import { page } from '$app/state';
	// import { authPrompt } from '$lib/state/authPrompt.svelte';
	import SquareIcon from '$lib/components/ui/SquareIcon.svelte';
	// import NavigationSettingsDropdown from './NavigationSettingsDropdown.svelte';
	import ThemeToggle from '$lib/components/ui/ThemeToggle.svelte';
	import { getNavRoutes } from '$lib/navigation';
	import Logo from '../logo.svelte';

	const navRoutes = getNavRoutes('public', 'protected');

	const session = $derived(page.data.session);
	const profile = $derived(page.data.profile);
	const pathname = $derived(page.url.pathname);

	let isActive = $state(false);
	let minimize = $state(false);

	const toggleNav = () => (isActive = !isActive);
	const logout = async () => await page.data.supabase.auth.signOut();

	function isRoutActive(path: string): boolean {
		if (path === '/') return pathname === '/';
		return pathname.startsWith(path);
	}

	function handleNavClick(e: MouseEvent, path: string) {
		if (!session && path === '/notifications') {
			e.preventDefault();
			// authPrompt.show();
		}
	}

	function handleComposeClick(e: MouseEvent) {
		if (!session) {
			e.preventDefault();
			// authPrompt.show();
		}
	}
</script>

<header id="main-nav" class="protected" class:minimize>
	<div class="container">
		<div class="logo-flag">
			<a id="logo" href="/">
				<Logo />
			</a>
		</div>

		<nav>
			<ul class:active={isActive}>
				{#each navRoutes as route (route.path)}
					<li class:active={isRoutActive(route.path)}>
						<a
							id={route.name.toLowerCase().replaceAll(' ', '-')}
							class:active={isRoutActive(route.path)}
							href={route.path}
							onclick={(e) => handleNavClick(e, route.path)}
						>
							{#if route.icon}
								<SquareIcon name={route.icon} />
							{/if}
							<span class="cta">{route.name}</span>
						</a>
					</li>
				{/each}

				{#if profile?.role === 'moderator' || profile?.role === 'admin'}
					<li class:active={isRoutActive('/admin')}>
						<a id="admin" class:active={isRoutActive('/admin')} href="/admin">
							<SquareIcon name="shield" />
							<span class="cta">Admin</span>
						</a>
					</li>
				{/if}
			</ul>
		</nav>

		<div class="mod">
			<!-- compose -->
			{#if session && profile}
				<a href="/compose/post" class="btn compose-btn" onclick={handleComposeClick}>
					<SquareIcon name="compose" />
					<span class="cta">Post</span>
				</a>
			{/if}

			<button
				class="collapse-toggle btn"
				aria-label="collapse/expand menu"
				class:minimize
				onclick={() => (minimize = !minimize)}
			>
			</button>

			{#if session && profile}
				<!-- <NavigationSettingsDropdown
					name={profile.display_name ?? profile.username}
					email={session.user.email}
					avatarPublicId={profile.avatar_public_id}
					onlogout={logout}
				/> -->
				<!-- dropdown -->
			{:else}
				<nav class="actions">
					<ul class:active={isActive}>
						<li><a href="/login" class="btn">Log In</a></li>
						<li><a href="/register" class="btn">Register</a></li>
					</ul>
				</nav>
				<ThemeToggle />
			{/if}

			<button
				id="nav-toggle"
				aria-label="Toggle"
				class:active={isActive}
				aria-expanded={isActive}
				onclick={toggleNav}
			>
				<span />
				<span />
				<span />
			</button>
		</div>
	</div>
</header>
