<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/state';
	import { toast } from 'svelte-sonner';
	import Form from '$lib/components/form/Form.svelte';
	import { settingsProfileFormConfig } from '$lib/form/configs/settings/profile';
	import { handleTriggerUpdate } from '$lib/form/utils/form-helpers';

	const { onclose }: { onclose?: () => void } = $props();

	const profile = $derived(page.data.profile);

	let profileConfig = $state(settingsProfileFormConfig(profile));
	const profileFormHandler = handleTriggerUpdate(profileConfig);

	async function onSuccess() {
		toast.success('Profile updated.');
		await invalidateAll();
		onclose?.();
	}
</script>

<Form
	name="settings profile form"
	config={profileConfig}
	triggerUpdate={profileFormHandler}
	{onSuccess}
/>
