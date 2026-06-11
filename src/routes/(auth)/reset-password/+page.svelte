<script lang="ts">
	import Form from '$lib/components/form/Form.svelte';
	import { resetPasswordFormConfig } from '$lib/form/configs/auth/reset-password';
	import { handleTriggerUpdate } from '$lib/form/utils/form-helpers';

	let resetConfig = $state(resetPasswordFormConfig);
	const resetFormHandler = handleTriggerUpdate(resetConfig);
</script>

<h1>Reset your password</h1>
<Form name="reset password form" config={resetConfig} triggerUpdate={resetFormHandler} />
