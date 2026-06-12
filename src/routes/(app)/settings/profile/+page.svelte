<script lang="ts">
	import SettingsProfileForm from '$lib/components/settings/SettingsProfileForm.svelte';
	import SquareIcon from '$lib/components/ui/SquareIcon.svelte';
</script>

<svelte:head>
	<title>Edit Profile</title>
</svelte:head>

<div class="settings-profile-page">
	<div class="settings-profile-header">
		<button class="btn-ghost" onclick={() => history.back()}>
			<SquareIcon name="close" />
		</button>
		<h2>Edit Profile</h2>
	</div>

	<SettingsProfileForm onclose={() => history.back()} />
</div>
